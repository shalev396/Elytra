# Locking dev and qa behind a login

[← Back to main README](../README.md) · [Infrastructure](infrastructure.md) · [Deployment](deployment.md)

**Goal:** visiting a dev or qa URL asks for credentials before anything loads, so strangers can't sign up and poke at unreleased code.
**Constraints:** zero app code changes, a managed service (no Lambda@Edge / CloudFront Function auth code of our own), minimal infrastructure, prod untouched.

## Current setup

dev and qa use [option A](#a-aws-waf--basic-auth-rule-recommended-aws-native) with `/api/*` exempt. The web ACL is shared with other projects and managed outside this stack: `shalev396-shared-acl` (CloudFront scope, `us-east-1`). The stack only attaches it through `WAF_WEB_ACL_ARN`; it never creates or edits the ACL.

Its `nonprod-gate` rule answers **401** with `WWW-Authenticate: Basic realm="Restricted"` when either is true:

1. The `Host` header is not `shalev396.com` and does not end with `.shalev396.com`.
2. The path does not start with `/api/`, the host is one of the gated hosts listed in the rule (each project's `dev.` and `qa.` host), and `Authorization` is not exactly `Basic base64("<host>:<password>")` for that host.

What that means here:

- Pages, JS, CSS, images, `/media/*` and `/manifest.webmanifest` on dev and qa ask for a login. The username is the stage's `DOMAIN_NAME`, the bare host (`qa.example.com`, not `https://qa.example.com`). The password is the one the rule already holds for that host.
- `/api/*` is never gated. Postman and other API clients need no extra header, and the client's `Authorization: Bearer` calls don't clash with the gate. The trade-off from option A stays: anyone who knows the API can still call it.
- Prod is not asked for a password, but it gets the same ACL: `WAF_WEB_ACL_ARN` is one repository secret for every stage.
- Attaching the ACL does not gate a new host. A host is gated only once the rule lists it, and the rule is shared, so that change happens in the WAF console, not in this repo.
- Chrome fetches `/manifest.webmanifest` without the basic-auth header, so after signing in the console still shows a 401 for that one file. That is expected: the page itself loaded.
- The local client (`npm run dev`) against dev or qa calls `/api/` without a login, but profile images come from the gated `https://<DOMAIN_NAME>/media/…`, so they can show as broken until the browser has signed in to that host.

### Configuration

| Where                                 | Name                  | Value                                                                                                                             |
| ------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Repository secret                     | `WAF_WEB_ACL_ARN`     | ARN of `shalev396-shared-acl`. Same for every stage                                                                               |
| Environment secret (`dev`, `qa` only) | `BASIC_AUTH_PASSWORD` | Password for that host. Username is that stage's `DOMAIN_NAME`. Browser tests on the deployed site send it. `/api/` is not gated. |
| Environment variable (already exists) | `DOMAIN_NAME`         | The host. This is the basic-auth username: there is no separate username variable                                                 |

Locally the same keys go in the gitignored `server/.env.<stage>` files: `WAF_WEB_ACL_ARN` in all three, `BASIC_AUTH_PASSWORD` in `.env.dev` and `.env.qa` only. Prod has no password. Never commit the password.

### Tests

- **Postman** only calls `/api/`, so neither the local nor the QA run needs the password.
- **Playwright against the deployed qa site** (`npm run test:qa` in `client/`, the frontend job in [`_test-qa.yml`](../.github/workflows/_test-qa.yml)) requires `BASIC_AUTH_PASSWORD` and exits without it. Every browser context answers the gate's 401 with `http_credentials` limited to the site's origin and sent only on a challenge ([`tests/helpers/basic_auth.py`](../client/tests/helpers/basic_auth.py)), so Bearer calls to `/api/` and presigned S3 uploads are left alone.
- **Local runs** (`npm run test`, [`_test-local.yml`](../.github/workflows/_test-local.yml)) hit localhost and never need the password.

## What other products do

Hosting platforms ship this as a switch: Vercel **Deployment Protection**, Netlify **password protection**, and **AWS Amplify Hosting access control** (username + password per branch). Teams on their own CDN usually put **Cloudflare Access** in front, or restrict by **IP allowlist**.

## Options for this stack

### A. AWS WAF — Basic auth rule (recommended AWS-native)

One WAF web ACL (CloudFront scope, `us-east-1`) associated with the dev **and** qa distributions. A rule blocks any request whose `authorization` header is not exactly `Basic base64(user:password)`, answering with a custom **401** and header `WWW-Authenticate: Basic realm="Elytra staging"` — which makes the browser show its native login prompt. Fully declarative (`wafv2.CfnWebACL` + `webAclId` on the distribution), no code.

- **Cost:** about $5/month per web ACL + $1/rule + $0.60 per million requests; one ACL can serve both stages.
- **The catch — header conflict:** after login the client sends `Authorization: Bearer <idToken>` on API calls ([`client/src/api/instance.ts`](../client/src/api/instance.ts)), and an explicit header replaces the browser's Basic credentials. The rule needs an exception, and neither choice is airtight:
  - exempt `/api/*` → the UI is locked, but anyone who knows the API can still call `/api/public/auth/signup` directly;
  - exempt only `/api/private/*` (the API Gateway JWT authorizer already rejects fake tokens) → token refresh on `/api/public/auth/refresh` breaks for logged-in users.
- Also: the credential lives in plaintext in the rule; browsers have no "log out" of Basic auth.
- Tests stay code-free: Postman collection-level Basic auth and Playwright `httpCredentials`, fed from a new CI secret.

### B. AWS WAF — IP allowlist

Same web ACL with one `IPSet` rule instead. No header conflict, so it locks the UI **and** the API completely — the strongest option. The trade-off is maintaining addresses; pair it with a VPN that has a stable egress IP. A and B combine well: allow when the IP matches **or** Basic auth matches.

### C. Cloudflare Access

Best experience (real SSO login page, per-user audit, free up to 50 users) and no AWS cost, but it expects the DNS zone on Cloudflare. That collides with the Route 53 records, ACM DNS validation and SES DKIM this stack manages, and subdomain-only delegation is an Enterprise feature. Not worth it just for staging.

### Ruled out

- **Lambda@Edge / CloudFront Functions / Cognito-at-edge** ([`aws-samples/cloudfront-authorization-at-edge`](https://github.com/aws-samples/cloudfront-authorization-at-edge)) — custom auth code, excluded by the constraints.
- **AWS Verified Access** — built for ALB/network endpoints, roughly $195/month per app.
- **Moving the client to Amplify Hosting** for its access control — re-platforms the frontend for one feature.

Sources: [AWS WAF only Basic auth (DevelopersIO)](https://dev.classmethod.jp/articles/aws-waf-basic-auth/), [WAF IP + Basic auth rule design (DEV)](https://dev.to/snaka/implementing-secure-access-control-using-aws-waf-with-ip-address-and-basic-authentication-45hn), [WAF custom responses in CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-wafv2-webacl-customrequesthandling.html).
