# Elytra

[![Live Preview](https://img.shields.io/badge/Live_Preview-elytra.shalev396.com-blue?style=for-the-badge)](https://elytra.shalev396.com)

Full-stack serverless template built on AWS. React frontend, Lambda backend, Cognito authentication -- clone it, configure it, push it, and you have a deployed app.

**Frontend** -- React 19, TypeScript, Vite, Tailwind, shadcn/ui, Redux Toolkit, React Query, React Router.
**Backend** -- Node.js 22, Express, Serverless Framework, AWS Lambda, API Gateway, Cognito, S3, CloudFront, Route 53.
**Database** -- Multi-provider support via swappable adapters:

| ORM / ODM | Supported Databases                                                                             |
| --------- | ----------------------------------------------------------------------------------------------- |
| Sequelize | PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, Snowflake, DB2 for LUW, DB2 for IBM i |
| Mongoose  | MongoDB, Amazon DocumentDB                                                                      |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shalev396/Elytra.git
cd Elytra
```

Or use GitHub's **"Use this template"** button to create your own copy.

### 2. Customize the Client

Edit `client/src/data/app.ts` with your app name, repository URL, contact emails, and social links:

```typescript
export const app = {
  name: 'YourAppName',
  repoUrl: 'https://github.com/your-username/your-repo',
  contactEmail: 'you@example.com',
  supportEmail: 'you@example.com',
  privacyEmail: 'you@example.com',
  socialLinks: {
    github: 'https://github.com/your-username/your-repo',
    linkedin: 'https://www.linkedin.com/in/your-profile',
  },
} as const;
```

You can also update the favicon and logo in `client/src/data/assets.ts` and `client/src/data/favicon.ts`.

### 3. Customize the Server

Open `server/serverless.yml` and update these fields to match your app:

```yaml
org: your-serverless-org # line 35 — your Serverless Framework org
# ...
custom:
  appName: your-app-name # line 131 — used for service name, stack name, Cognito pool name
  appDisplayName: Your App Name # line 132 — human-readable name shown in emails and descriptions
```

For **local development**, create environment files (e.g. `server/.env.dev`) based on `server/.env.example`:

| Variable          | Description                          |
| ----------------- | ------------------------------------ |
| `AWS_REGION`      | AWS region (e.g. `us-east-1`)        |
| `DOMAIN_NAME`     | Your domain (e.g. `app.example.com`) |
| `DATABASE_URL`    | Database connection string           |
| `HOSTED_ZONE_ID`  | Route 53 hosted zone ID              |
| `CERTIFICATE_ARN` | ACM certificate ARN (us-east-1)      |
| `AWS_ACCOUNT_ID`  | Your AWS account ID                  |

S3 bucket names are derived automatically from your domain -- the client bucket is named after `DOMAIN_NAME` and the assets bucket is `DOMAIN_NAME-assets`. No need to configure them separately.

Then run:

```bash
cd server
npm install
npm run dev
```

### 4. Set Up AWS OIDC for GitHub Actions

GitHub Actions needs permission to deploy to your AWS account. Set up OpenID Connect (OIDC) so the workflows can assume an IAM role without storing long-lived credentials:

1. Follow the official guide: [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).
2. Create an IAM role and attach permissions for S3, CloudFront, CloudFormation, Lambda, API Gateway, Cognito, Route 53, and IAM (as needed by the Serverless Framework).
3. Update the `role-to-assume` in both workflow files (`.github/workflows/Backend-CICD.yml` and `Frontend-CICD.yml`) to match your role name:

```yaml
role-to-assume: arn:aws:iam::${{ env.AWS_ACCOUNT_ID }}:role/your-role-name
```

### 5. Configure GitHub Secrets and Variables

Add these in your GitHub repository settings under **Settings > Secrets and variables > Actions**.

**Repository secrets** (same across all environments):

| Secret                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `AWS_ACCOUNT_ID`        | Your AWS account ID                          |
| `HOSTED_ZONE_ID`        | Route 53 hosted zone ID                      |
| `CERTIFICATE_ARN`       | ACM certificate ARN (must be in `us-east-1`) |
| `SERVERLESS_ACCESS_KEY` | Serverless Framework dashboard access key    |

**Repository variables** (same across all environments):

| Variable     | Description                   |
| ------------ | ----------------------------- |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |

**Per-environment secrets** (set under each GitHub environment: `dev`, `qa`, `prod`):

| Secret         | Description                |
| -------------- | -------------------------- |
| `DATABASE_URL` | Database connection string |

**Per-environment variables** (set under each GitHub environment: `dev`, `qa`, `prod`):

| Variable      | Description                                          |
| ------------- | ---------------------------------------------------- |
| `DOMAIN_NAME` | Domain for this environment (e.g. `dev.example.com`) |

### 6. Deploy

Once everything is configured, just push to a branch and CI/CD takes care of the rest:

- Push to `dev` -- deploys to the development environment
- Push to `qa` -- deploys to QA
- Push to `main` -- deploys to production

**On your first deploy, push server changes first.** The backend deployment creates the S3 bucket and CloudFront distribution that the frontend deployment depends on. After the initial setup, both can deploy independently.

The backend workflow triggers on changes under `server/`, and the frontend workflow triggers on changes under `client/`. Just commit and push your changes -- the appropriate pipeline runs automatically.

---

## API Documentation

The full API specification lives in [`server/openapi.yaml`](server/openapi.yaml) (OpenAPI 3.0). You can use it to:

- **Browse interactively** -- paste the file into [Swagger Editor](https://editor.swagger.io) or [Swagger UI](https://petstore.swagger.io).
- **Import into Postman** -- use **File > Import** and select the YAML file to generate a complete collection.
- **Generate clients** -- feed the spec to [OpenAPI Generator](https://openapi-generator.tech) for typed SDKs in any language.

---

## Local Development

**Client:**

```bash
cd client
npm install
npm run dev
```

**Server:**

```bash
cd server
npm install
npm run dev
```

The client dev server runs on `http://localhost:5173` and the server runs on `http://localhost:3000`.
