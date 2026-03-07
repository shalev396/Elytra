# Elytra

**[Live Preview](https://elytra.shalev396.com)** | [Getting Started](#getting-started) | [Tests](#tests) | [Customize](#customizing-the-app)

---

Full-stack serverless template built on AWS. React web app, Lambda backend, Cognito authentication, frontend E2E tests (Playwright), backend API tests (Postman), and CICD on push to `dev` / `qa` / `main`. Clone it, configure it, push it—you have a deployed app.

**Frontend** — React 19, TypeScript, Vite, Tailwind, shadcn/ui, Redux Toolkit, React Query, React Router.

**Backend** — Node.js 22, Express, Serverless Framework, AWS Lambda, API Gateway, Cognito, S3, CloudFront, Route 53.

**Database** — Multi-provider support via swappable adapters:

| ORM / ODM | Supported Databases                                                                             |
| --------- | ----------------------------------------------------------------------------------------------- |
| Sequelize | PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, Snowflake, DB2 for LUW, DB2 for IBM i |
| Mongoose  | MongoDB, Amazon DocumentDB                                                                      |

---

## Requirements

- **Node.js** 22+
- **Python** 3.x (for frontend E2E tests)
- **AWS account** — The template uses: Lambda, API Gateway, Cognito, S3, CloudFront, Route 53, ACM, SES, IAM, CloudFormation
- **Serverless Framework** — access key
- **Database** — Database from the Supported Databases list
- **Domain** — Route 53 hosted zone and ACM certificate in `us-east-1`

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shalev396/Elytra.git
cd Elytra
```

Or use GitHub's **"Use this template"** button to create your own copy.

### 2. Environment Variables

Create environment files from [`server/.env.example`](server/.env.example):

```bash
cp server/.env.example server/.env.dev
```

Copy to `server/.env.qa` and `server/.env.prod` for other stages. Fill all required values:

| Variable                | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `AWS_ACCOUNT_ID`        | Your AWS account ID                                         |
| `HOSTED_ZONE_ID`        | Route 53 hosted zone ID                                     |
| `CERTIFICATE_ARN`       | ACM certificate ARN (must be in `us-east-1`)                |
| `SERVERLESS_ACCESS_KEY` | Serverless Framework dashboard access key                   |
| `AWS_REGION`            | AWS region (e.g. `us-east-1`)                               |
| `DOMAIN_NAME`           | Your domain (e.g. `app.example.com`)                        |
| `DATABASE_URL`          | Database connection string                                  |
| `ENV`                   | Environment: `dev` \| `qa` \| `prod`                        |
| `DATABASE_PROVIDER`     | `mongoose` \| `sequelize`                                   |
| `COGNITO_CLIENT_ID`     | Cognito app client ID (from AWS Console after first deploy) |
| `COGNITO_USER_POOL_ID`  | Cognito user pool ID (from AWS Console after first deploy)  |
| `COGNITO_ISSUER`        | Cognito issuer URL (from AWS Console after first deploy)    |

**Note:** Cognito values are created on first deploy. After deploying, copy them from AWS Console into `.env.dev` for local development.

S3 bucket names are derived from `DOMAIN_NAME` — no separate config needed.

### 3. Run Locally

**Backend** (port 3000):

```bash
cd server
npm install
npm run dev
```

**Frontend** (port 5173):

```bash
cd client
npm install
npm run dev
```

### 4. Deploy (Optional)

CICD deploys automatically on push. To deploy manually:

```bash
cd server
npm run deploy:dev   # or deploy:qa, deploy:prod
```

This deploys backend (Lambda, API Gateway, Cognito, S3, CloudFront, Route 53), then frontend is uploaded to S3 and CloudFront invalidated. CICD performs both steps on push—no manual deploy needed once configured.

### 5. CICD

Push to `dev` / `qa` / `main` triggers full deploy. Set up once (see [CICD Setup](#cicd-setup)) and you're done.

---

## Customizing the App

The template uses a single source of truth for branding. Change these files and names propagate everywhere.

### Frontend

**[`client/src/data/app.ts`](client/src/data/app.ts)** — App identity:

- `name`, `repoUrl`, `baseUrl`, `contactEmail`, `supportEmail`, `privacyEmail`, `socialLinks`

**Favicon** — Replace `client/public/favicon-light.svg` and `favicon-dark.svg` (paths in [`client/src/data/favicon.ts`](client/src/data/favicon.ts)).

**Logo / assets** — [`client/src/data/assets.ts`](client/src/data/assets.ts).

**Metadata** (title, description) — [`client/src/data/defaultMetadata.ts`](client/src/data/defaultMetadata.ts).

### Backend

**[`server/serverless.yml`](server/serverless.yml)**:

- `org` (line ~35) — Serverless Framework org
- `custom.appName` (line ~140) — Service name, stack name, Cognito pool name
- `custom.appDisplayName` (line ~141) — Human-readable name in emails and descriptions

### Sync

When changing `appName` in `serverless.yml`, also set GitHub variable `APP_NAME` to the same value (CICD uses it for CloudFormation stack lookup). Keep `app.name` in `app.ts` aligned for consistent branding and translations.

---

## Tests

Out of the box:

- **Frontend E2E** — Playwright + Python (smoke, accessibility, visual, responsive, security, flows)
- **Backend API** — Postman (auth, user, dashboard, flows)

| Doc                                      | Description                         |
| ---------------------------------------- | ----------------------------------- |
| [Frontend tests](client/tests/README.md) | Run commands, structure, categories |
| [Backend tests](postman/README.md)       | Postman collection, CLI commands    |

PRs to `qa` run local tests (serverless offline + Vite). PRs to `main` run tests against live QA.

---

## API Documentation

Full API spec: [`server/openapi.yaml`](server/openapi.yaml) (OpenAPI 3.0). Use it with [Swagger Editor](https://editor.swagger.io), Postman, or [OpenAPI Generator](https://openapi-generator.tech).

---

## CICD Setup

### 1. AWS OIDC for GitHub Actions

[Configure OpenID Connect in AWS](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services). Create an IAM role and attach one of:

- **AdministratorAccess** — Easiest; works for all services below.
- **Least-privilege policy** — Create a custom policy with permissions for these services used by the template:
  - **CloudFormation** (create/update/describe stacks)
  - **Lambda** (create, update, invoke)
  - **API Gateway** (HTTP APIs)
  - **S3** (buckets, objects — deploy and runtime)
  - **CloudFront** (distributions, invalidations)
  - **Cognito** (User Pools, App Clients)
  - **Route 53** (hosted zones, record sets)
  - **ACM** (certificates)
  - **SES** (send email for Cognito verification)
  - **IAM** (roles, policies for Lambda execution)

Update `role-to-assume` in [`.github/workflows/_deploy.yml`](.github/workflows/_deploy.yml) to match your role name.

### 2. GitHub Secrets and Variables

**Settings > Secrets and variables > Actions**.

**Repository secrets:**

| Secret                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `AWS_ACCOUNT_ID`        | Your AWS account ID                          |
| `HOSTED_ZONE_ID`        | Route 53 hosted zone ID                      |
| `CERTIFICATE_ARN`       | ACM certificate ARN (must be in `us-east-1`) |
| `SERVERLESS_ACCESS_KEY` | Serverless Framework dashboard access key    |

**Repository variables:**

| Variable            | Description                                   |
| ------------------- | --------------------------------------------- |
| `AWS_REGION`        | AWS region (e.g. `us-east-1`)                 |
| `APP_NAME`          | Must match `custom.appName` in serverless.yml |
| `ENV`               | Default env: `dev` \| `qa` \| `prod`          |
| `DATABASE_PROVIDER` | `mongoose` \| `sequelize`                     |

**Per-environment secrets** (set under each GitHub environment: `dev`, `qa`, `prod`):

| Secret                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `DOMAIN_NAME`          | Domain for this environment (e.g. `dev.example.com`) |
| `DATABASE_URL`         | Database connection string                           |
| `COGNITO_CLIENT_ID`    | Cognito app client ID                                |
| `COGNITO_USER_POOL_ID` | Cognito user pool ID                                 |
| `COGNITO_ISSUER`       | Cognito issuer URL                                   |
