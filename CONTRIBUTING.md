# Contributing to Elytra

## Before you start

- Search existing Issues and Discussions
- Use Discussions for questions and open-ended proposals
- Use Issues for confirmed bugs and scoped enhancements

## Local development

1. Clone the repo
2. `cd server && npm install` / `cd client && npm install`
3. Copy `server/.env.example` to `server/.env.dev` and fill in values
4. `cd server && npm run dev` (port 3000) / `cd client && npm run dev` (port 5173)
5. Run tests before opening a PR: `cd server && npm run test:local` / `cd client && npm run test`

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
