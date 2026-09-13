# Deployment

[← Back to main README](../README.md) · [Infrastructure](infrastructure.md)

## Branch → stage

| Push to | Deploys       | PR gate into the branch                      |
| ------- | ------------- | -------------------------------------------- |
| `dev`   | `elytra-dev`  | lint + build + infra tests on push           |
| `qa`    | `elytra-qa`   | PR: lint/build/infra tests, local API tests  |
| `main`  | `elytra-prod` | PR: lint/build/infra tests, tests against qa |

All deploy logic is in Node scripts under [`server/scripts`](../server/scripts); the workflows only install dependencies and run them. Every deploy ([`_deploy.yml`](../.github/workflows/_deploy.yml)) runs two jobs in order, never two deploys at once per stage:

1. **Backend** — `npm run deploy:backend -- <stage>` ([`deploy-backend.ts`](../server/scripts/deploy-backend.ts)): refuse a stack that is not this app's (no `Project`/`Stage` tags), find the hosted zone, build + verify the layers, `cdk deploy`, sync the database schema by invoking `ApiFunctionName` with `{"action":"sync-db"}` (fails on a function error or non-200), then activate the `Project` and `Stage` cost allocation tags for billing (never fails the deploy).
2. **Frontend** — `npm run deploy:frontend -- <stage>` ([`deploy-frontend.ts`](../server/scripts/deploy-frontend.ts)): build the client, upload changed files to `S3ClientBucketName` (hashed `assets/` cached for a year, `index.html` last and never cached), delete files no longer in the build, invalidate `CloudFrontDistributionId`.

## One-time setup (per AWS account)

### 1. Prerequisites

- If the stack region is not `us-east-1`: an ACM certificate for each stage domain **in `us-east-1`** (`CERTIFICATE_ARN`). In `us-east-1` the stack creates it.
- A Route 53 **public hosted zone** containing each stage's `DOMAIN_NAME` (e.g. zone `example.com` for `dev.example.com`, or a delegated `app.example.co.uk`). Deploys find it by name at run time — no zone id to configure.
- `DOMAIN_NAME` and `DOMAIN_NAME-assets` must be free S3 bucket names: the stack names its buckets after the domain.
- A database per stage and its connection string (`postgres://…` or `mongodb+srv://…`).
- If SES is in sandbox, verification and app emails only reach verified recipients.

### 2. Bootstrap CDK

With admin credentials for the account:

```bash
cd server
npx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>   # the stack region; us-east-1 by default
```

### 3. GitHub OIDC role

[Configure OpenID Connect in AWS](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) and create a role with any name; put that name in the `AWS_ROLE_NAME` repository variable. CDK deploys through its bootstrap roles, so the GitHub role only needs to assume them, find the hosted zone, and what the post-deploy steps and local API tests touch:

<details>
<summary>Role policy (replace <code>&lt;ACCOUNT_ID&gt;</code>, <code>&lt;REGION&gt;</code>, <code>&lt;APP_NAME&gt;</code> and each stage's <code>&lt;DOMAIN_NAME&gt;</code>)</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UseCdkBootstrapRoles",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/cdk-hnb659fds-*"
    },
    {
      "Sid": "FindHostedZone",
      "Effect": "Allow",
      "Action": "route53:ListHostedZonesByName",
      "Resource": "*"
    },
    {
      "Sid": "ActivateCostAllocationTags",
      "Effect": "Allow",
      "Action": ["ce:ListCostAllocationTags", "ce:UpdateCostAllocationTagsStatus"],
      "Resource": "*"
    },
    {
      "Sid": "ReadStackOutputs",
      "Effect": "Allow",
      "Action": "cloudformation:DescribeStacks",
      "Resource": "arn:aws:cloudformation:<REGION>:<ACCOUNT_ID>:stack/<APP_NAME>-*/*"
    },
    {
      "Sid": "SyncDatabase",
      "Effect": "Allow",
      "Action": ["lambda:GetFunction", "lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:<APP_NAME>-*-api"
    },
    {
      "Sid": "PublishClient",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::<DOMAIN_NAME>", "arn:aws:s3:::<DOMAIN_NAME>/*"]
    },
    {
      "Sid": "InvalidateCdn",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/*"
    },
    {
      "Sid": "LocalApiTestsRuntime",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:ListUsers",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "ses:SendEmail"
      ],
      "Resource": [
        "arn:aws:cognito-idp:<REGION>:<ACCOUNT_ID>:userpool/*",
        "arn:aws:s3:::<DOMAIN_NAME>-assets",
        "arn:aws:s3:::<DOMAIN_NAME>-assets/media/*",
        "arn:aws:ses:<REGION>:<ACCOUNT_ID>:identity/*"
      ]
    }
  ]
}
```

</details>

### 4. GitHub configuration

**Settings → Secrets and variables → Actions.** The same list, ready to copy, is [`server/.env.example`](../server/.env.example).

| Where                                         | Name              | Value                                                                                                                            |
| --------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Repository secret                             | `AWS_ACCOUNT_ID`  | Account id — only builds the OIDC role ARN                                                                                       |
| Repository variable                           | `AWS_ROLE_NAME`   | Name of the GitHub OIDC role from step 3                                                                                         |
| Environment secret (`dev`, `qa`, `prod` each) | `DOMAIN_NAME`     | e.g. `dev.example.com`                                                                                                           |
| Environment secret (`dev`, `qa`, `prod` each) | `DATABASE_URL`    | That stage's connection string                                                                                                   |
| Environment secret (optional)                 | `CERTIFICATE_ARN` | `us-east-1` ACM certificate for the stage domain. Required when `AWS_REGION` is not `us-east-1`; otherwise the stack creates one |
| Environment or repository secret (optional)   | `WAF_WEB_ACL_ARN` | Global web ACL to attach (a repository-level value applies to every stage)                                                       |
| Repository variable (optional)                | `AWS_REGION`      | Stack region; `us-east-1` when unset                                                                                             |

That is the whole configuration.

## Deploying from your machine

```bash
aws sso login                       # or any credentials for the account
cd server
cp .env.example .env.dev            # DOMAIN_NAME, DATABASE_URL (+ optional region/certificate/WAF)
npm run deploy:backend -- dev       # stack + database schema
npm run deploy:frontend -- dev      # client (needs `npm install` in client/ too)
```

These are exactly the commands CI runs.

## First deploy of a stage

Expect **30–60 minutes**: certificate validation, CloudFront rollout, and SES verifying the new domain before Cognito is created. The stack waits for SES itself ([Infrastructure → Waiting for SES before Cognito](infrastructure.md#waiting-for-ses-before-cognito)), so the first deploy needs nothing by hand.

## Troubleshooting

| Symptom                                                         | Fix                                                                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `elytra-<stage> exists but is not tagged as elytra's CDK stack` | A stack with that name was not created by this app. Empty its buckets, delete it, then deploy again.       |
| `is ROLLBACK_COMPLETE and cannot be updated`                    | Empty the stack's buckets, delete the stack in the CloudFormation console, deploy again.                   |
| `Lambda layers are not built`                                   | `npm run build:layers` (the backend deploy does this for you).                                             |
| `No AWS account resolved from credentials`                      | Log in (`aws sso login`) or export credentials, then retry.                                                |
| `No public Route 53 hosted zone contains …`                     | Create a public hosted zone for `DOMAIN_NAME` or one of its parents in the account you deploy to.          |
| `No hosted zone for stage …` from a plain `cdk` command         | Run `npm run deploy:backend -- <stage>`; it resolves the zone and passes it to CDK.                        |
| Bucket `… already exists`                                       | Bucket names are `DOMAIN_NAME` and `DOMAIN_NAME-assets` and are global: delete the old buckets using them. |
| Prod stack deleted and re-created fails on bucket or user pool  | Prod retains its assets bucket and user pool by design. Delete (or import) the retained resources first.   |
| Deleting a dev/qa stack fails on a bucket                       | Buckets are not auto-emptied. Empty both (all versions for assets) and retry.                              |
