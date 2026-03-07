# Elytra E2E Tests (Playwright + Python)

## Run Locally

**One-time setup** (from `client/`):

```bash
npm run test:install
```

This creates `.venv`, installs dependencies, and Playwright Chromium. Cross-platform (Windows, Mac, Linux).

**Before every test run**, in separate terminals:

1. **Server** (from `server/`): `npm run dev`
2. **Client** (from `client/`): `npm run dev`

**Run tests** (from `client/`):

```bash
npm run test
```

Runs pytest via `.venv` with `BASE_URL=http://localhost:5173`, `API_BASE_URL=http://localhost:3000/api`. Translations are exported automatically before tests (conftest fixture).

## Scripts

| Script                 | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run test:install` | Create .venv, install deps, playwright chromium |
| `npm run test`         | Run all E2E tests (local)                       |
| `npm run test:qa`      | Run tests against QA URLs                       |

## Folder Structure (One Folder Per Page)

Aligned with [routes.ts](../src/router/routes.ts). Each route/page has its own folder; no merged pages.

```
tests/
  e2e/
    landing/           HOME (/)
    dashboard/         /dashboard
    pricing/           /pricing
    profile/           /profile
    profile_edit/      /profile/edit
    auth_login/        /auth/login
    auth_signup/       /auth/signup
    auth_forgot_password/   /auth/forgot-password
    auth_reset_password/    /auth/reset-password
    auth_confirm_signup/    /auth/confirm-signup
    legal_privacy/      /legal/privacy
    legal_terms/        /legal/terms
    page_404/           invalid routes
    flows/              critical.py (cross-page: signup, login, edit-profile, delete, etc.)
    app/                translations.py (JSON key parity), translation_pages.py (E2E per-page)
  scripts/
    run-tests.ts        cross-platform install/run script
    export-translations.ts
  helpers/
  fixtures/
```

Each page folder contains: `smoke.py`, `accessibility.py`, `visual.py`, `responsive.py`, `security.py` (as applicable).

## Test Categories

- **Smoke**: Page loads, critical elements visible
- **Accessibility**: axe-core scans, form labels, heading hierarchy
- **Visual**: Screenshot baselines (`artifacts/`)
- **Responsive**: Mobile, tablet, desktop viewports
- **Security**: Protected-route redirects, token leakage checks
- **Flows/critical**: Sign up, login, forgot password, edit profile, export, delete
- **Translation (E2E)**: Visit each page in en and he; assert no i18n keys visible and text differs

## Translation E2E Tests

`tests/e2e/app/translation_pages.py` visits each page in English and Hebrew, collects visible text, and verifies:

1. **No untranslated keys** — i18next shows keys (e.g. `landing.hero.title`) when translations are missing. Tests assert no such keys appear.
2. **Text differs between languages** — Catches pages that don't switch language correctly.

Protected pages (dashboard, profile, profile/edit) use `authenticated_page`; public pages use `page`.

## Mail.tm and Auth-Dependent Tests

Tests that create users (sign up, login flow, profile flows) use [Mail.tm](https://mail.tm) for temporary email. These tests require:

- Backend API running
- Network access to api.mail.tm
- Initial 12s wait for email delivery (first poll)

Optionally set `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_TEST_ID_TOKEN`, `E2E_TEST_REFRESH_TOKEN` to use an existing account and skip user creation.
