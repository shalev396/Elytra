# Contributing to Elytra

## Before you start

- Search existing Issues and Discussions
- Use Discussions for questions and open-ended proposals
- Use Issues for confirmed bugs and scoped enhancements

## Local development

1. Clone the repo
2. `cd server && npm install` / `cd client && npm install`
3. Copy `server/.env.example` to `server/.env.dev` and set `DOMAIN_NAME` + `DATABASE_URL`
4. Log in to AWS (`aws sso login`) — the local API reads Cognito and S3 wiring from the deployed `elytra-dev` stack
5. `cd server && npm run dev` (port 3000) / `cd client && npm run dev` (port 5173)
6. Before opening a PR: `cd server && npm run lint && npm run build && npm run test:infra && npm run test:local` / `cd client && npm run test`
7. Infrastructure changes: see [docs/infrastructure.md](docs/infrastructure.md). The pre-commit hook regenerates and stages the Infrastructure Composer drawing (`server/infra/composer/template.json`); open it in VS Code with **Open with Infrastructure Composer**

## Pull request rules

- Keep PRs focused and small
- Include screenshots for UI changes
- Include reproduction steps for bug fixes
- Update docs when behavior or setup changes
- Never commit secrets or real credentials

## Areas of contribution

- docs
- AWS deployment experience
- auth flows
- DX improvements
- test coverage
- template modularization

## Good first contributions

- documentation clarifications
- issue form improvements
- test reliability fixes
- setup validation improvements
