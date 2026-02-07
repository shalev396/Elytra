# Elytra

Full-stack template: React frontend, serverless backend, and database connectivity. Supported databases:

- PostgreSQL · MySQL · MariaDB · SQLite · Microsoft SQL Server · DB2 for LUW · DB2 for IBM i · Snowflake

---

<!-- Optional: add splash/hero image here -->

## Overview

Elytra is a **full-stack template rebuilt on AWS**. Use it as a starting point for web apps with a React frontend and a serverless backend.

- **Frontend** — React (Vite, TypeScript). For setup, scripts, and customization, see **[client/README.md](client/README.md)**.
- **Backend** — Serverless on AWS: **Cognito** for authentication, **API Gateway** for the API, Lambda for runtime. For backend setup and deployment, see **backend/README.md** (when available).

---

## Architecture

<!-- Add your Draw.io architecture diagram here -->

_Placeholder: architecture diagram (e.g. from Draw.io) can be added here._

---

## Getting started

1. **Use the template**  
   Copy this repository to your own (e.g. "Use this template" on GitHub or clone and push to a new repo).

2. **CI/CD**  
   After your first push, the included CI/CD (e.g. GitHub Actions) will run. Configure your **AWS role for GitHub** so the workflow can deploy to your account:  
   [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).

3. **Make it functional**
   - **Backend**: Fill in the `.env` (or equivalent) with your values and add those as **GitHub Secrets**. The workflow will use these to deploy (e.g. Serverless Framework) to AWS.
   - **Database / other services**: Add any connection strings or keys to the backend env and to GitHub Secrets so the deployed backend can use them.

Once the template is in your repo and secrets (and AWS OIDC role) are set, the pipeline should deploy the backend (and optionally frontend) to your AWS account on the next run.

For more detail, see **[client/README.md](client/README.md)** and **backend/README.md** (when added).
