# Locking dev and qa behind a login (research, not implemented)

[← Back to main README](../README.md) · [Infrastructure](infrastructure.md)

**Goal:** visiting a dev or qa URL asks for credentials before anything loads, so strangers can't sign up and poke at unreleased code.
**Constraints:** zero app code changes, a managed service (no Lambda@Edge / CloudFront Function auth code of our own), minimal infrastructure, prod untouched.

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

## Status

The stack already attaches an existing global web ACL when `WAF_WEB_ACL_ARN` is set for a stage, so option A or B can be built once in the WAF console and attached to dev and qa without code changes. Creating the web ACL inside the stack when the variable is unset is planned, not implemented.

Sources: [AWS WAF only Basic auth (DevelopersIO)](https://dev.classmethod.jp/articles/aws-waf-basic-auth/), [WAF IP + Basic auth rule design (DEV)](https://dev.to/snaka/implementing-secure-access-control-using-aws-waf-with-ip-address-and-basic-authentication-45hn), [WAF custom responses in CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-wafv2-webacl-customrequesthandling.html).
