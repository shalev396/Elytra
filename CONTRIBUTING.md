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
6. Before opening a PR: `cd server && npm run lint && npm run build && npm run test:unit && npm run test:infra && npm run test:local` / `cd client && npm run lint && npm run test`
   - To start the tests from an empty stage, run `cd server && npm run reset:db -- dev` first. **It deletes the database, S3 uploads and Cognito users of that stage** (refused for prod). See [client/tests/README.md](client/tests/README.md).
7. The pre-commit hook formats (Prettier) and lints (ESLint) only the staged files; it does not type-check or build, so run the commands above before pushing
8. Infrastructure changes: see [docs/infrastructure.md](docs/infrastructure.md). When a staged file is under `server/infra/`, the pre-commit hook regenerates and stages the Infrastructure Composer drawing (`server/infra/composer/template.json`); open it in VS Code with **Open with Infrastructure Composer**

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
