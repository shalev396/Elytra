# Deployment

[← Back to main README](../README.md) · [Infrastructure](infrastructure.md)

## Branch → stage

| Push to | Deploys       | PR gate into the branch                      |
| ------- | ------------- | -------------------------------------------- |
| `dev`   | `elytra-dev`  | lint + build + infra tests on push           |
| `qa`    | `elytra-qa`   | PR: lint/build/infra tests, local API tests  |
| `main`  | `elytra-prod` | PR: lint/build/infra tests, tests against qa |

All deploy logic is in Node scripts under [`server/scripts`](../server/scripts); the workflows only install dependencies and run them. Every deploy ([`_deploy.yml`](../.github/workflows/_deploy.yml)) runs two jobs in order, never two deploys at once per stage:

1. **Backend** — `npm run deploy:backend -- <stage>` ([`deploy-backend.ts`](../server/scripts/deploy-backend.ts)): find the hosted zone, build + verify the layers, `cdk deploy`, sync the database schema by invoking `ApiFunctionName` with `{"action":"sync-db"}` (fails on a function error or non-200), then activate the `Project` and `Stage` cost allocation tags for billing (never fails the deploy).
2. **Frontend** — `npm run deploy:frontend -- <stage>` ([`deploy-frontend.ts`](../server/scripts/deploy-frontend.ts)): build the client, upload changed files to `S3ClientBucketName` (hashed `assets/` cached for a year, `index.html` last and never cached), delete files no longer in the build, invalidate `CloudFrontDistributionId` and wait (up to 10 minutes) until the invalidation has completed, so whatever runs next sees the new build.

### QA deploy and QA tests

A push to `qa` starts the QA deploy ([`push-qa.yml`](../.github/workflows/push-qa.yml)) and, through the open `qa` → `main` PR, the QA test suite ([`_test-qa.yml`](../.github/workflows/_test-qa.yml)) seconds apart. The test workflow uses the concurrency group `deploy-qa`, the same group `_deploy.yml` uses for qa (`deploy-${{ inputs.stage }}`), so the tests wait for a running QA deploy instead of hitting a half-deployed stage. The two names must stay equal, or the wait silently stops working.

GitHub keeps only **one pending run per concurrency group**: a newly queued run replaces an older pending one, even with `cancel-in-progress: false`. Rapid pushes to `qa` can therefore drop a pending deploy or test run; re-run it from the Actions tab.

Don't solve ordering by moving the QA tests into `push-qa.yml` behind the deploy job: they are the gate in front of prod, and a test job inside a deploy workflow can never gate its own deploy. `workflow_run` doesn't fit either (the triggered run uses the default branch's ref).

## One-time setup (per AWS account)

### 1. Prerequisites

- If the stack region is not `us-east-1`: one ACM certificate **in `us-east-1`** covering every stage domain, e.g. `example.com` + `*.example.com` (`CERTIFICATE_ARN`). In `us-east-1` the stack creates one per stage.
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
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
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
        "arn:aws:s3:::<DOMAIN_NAME>-assets/tmp/*",
        "arn:aws:ses:<REGION>:<ACCOUNT_ID>:identity/*"
      ]
    }
  ]
}
```

</details>

`SyncDatabase` also covers `npm run reset:db -- <stage>`, which the test workflows run before each suite: it invokes the same function with `{"action":"reset-db"}` to empty the stage (refused on prod). The reset has no HTTP route, so only credentials with this permission can run it.

`cloudfront:GetInvalidation` is what the frontend deploy's wait polls. The SDK waiter retries on every error, `AccessDenied` included, so without it the deploy looks like a 10-minute hang that ends in a `TimeoutError`.

### 4. GitHub configuration

**Settings → Secrets and variables → Actions.** The same list, ready to copy, is [`server/.env.example`](../server/.env.example).

| Where                                           | Name              | Value                                                                                                                                   |
| ----------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Repository secret                               | `AWS_ACCOUNT_ID`  | Account id — only builds the OIDC role ARN                                                                                              |
| Repository variable                             | `AWS_ROLE_NAME`   | Name of the GitHub OIDC role from step 3                                                                                                |
| Environment variable (`dev`, `qa`, `prod` each) | `DOMAIN_NAME`     | e.g. `dev.example.com`                                                                                                                  |
| Environment secret (`dev`, `qa`, `prod` each)   | `DATABASE_URL`    | That stage's connection string                                                                                                          |
| Repository secret (optional)                    | `CERTIFICATE_ARN` | `us-east-1` ACM certificate covering every stage domain. Required when `AWS_REGION` is not `us-east-1`; otherwise the stack creates one |
| Repository secret (optional)                    | `WAF_WEB_ACL_ARN` | Global web ACL to attach to every stage                                                                                                 |
| Repository variable (optional)                  | `AWS_REGION`      | Stack region; `us-east-1` when unset                                                                                                    |
| Environment variable (optional)                 | `WWW_ALIAS`       | `true` also serves `www.DOMAIN_NAME` (see below)                                                                                        |

That is the whole configuration. A stage that needs its own certificate or web ACL can override the repository secret with an environment secret of the same name; GitHub gives the environment value precedence.

**Optional `www.` alias.** With `WWW_ALIAS=true` (GitHub environment variable, or `server/.env.<stage>` locally) the stage also answers on `www.DOMAIN_NAME`, from the same distribution: a second CloudFront alias, a `www` alias record, and `https://www.DOMAIN_NAME` added to the HTTP API and assets bucket CORS origins. No redirect: the canonical link (`app.baseUrl`) should stay the bare domain. It is opt-in rather than tied to prod because a domain like `app.example.com` would otherwise get `www.app.example.com`. A certificate the stack creates gets `www` as a second name; a `CERTIFICATE_ARN` you supply must already cover it. An existing `www` record in the hosted zone makes the deploy fail, so remove it first.

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

The first deploy takes longest: certificate validation, the CloudFront rollout, and SES verifying the new domain before Cognito is created. SES domain verification typically takes about 1–2 minutes (it can take much longer). The stack waits for SES itself ([Infrastructure → Waiting for SES before Cognito](infrastructure.md#waiting-for-ses-before-cognito)), so the first deploy needs nothing by hand.

## Troubleshooting

| Symptom                                                        | Fix                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Lambda layers are not built`                                  | `npm run build:layers` (the backend deploy does this for you).                                             |
| `No AWS account resolved from credentials`                     | Log in (`aws sso login`) or export credentials, then retry.                                                |
| `No public Route 53 hosted zone contains …`                    | Create a public hosted zone for `DOMAIN_NAME` or one of its parents in the account you deploy to.          |
| `No hosted zone for stage …` from a plain `cdk` command        | Run `npm run deploy:backend -- <stage>`; it resolves the zone and passes it to CDK.                        |
| Bucket `… already exists`                                      | Bucket names are `DOMAIN_NAME` and `DOMAIN_NAME-assets` and are global: delete the old buckets using them. |
| Prod stack deleted and re-created fails on bucket or user pool | Prod retains its assets bucket and user pool by design. Delete (or import) the retained resources first.   |
| Deleting a dev/qa stack fails on a bucket                      | Buckets are not auto-emptied. Empty both (all versions for assets) and retry.                              |
| Frontend deploy hangs ~10 minutes, then `TimeoutError`         | The CI role lacks `cloudfront:GetInvalidation` (step 3); the waiter retries on `AccessDenied`.             |
| `WwwAliasRecord` fails: record already exists                  | `WWW_ALIAS=true` and the zone already has a `www` record. Delete it (or unset `WWW_ALIAS`) and redeploy.   |
