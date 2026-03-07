# Elytra Frontend E2E Tests (Playwright + Python)

[← Back to main README](../../README.md)

---

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

---

## Page × Test Category Matrix

| Page            | Route                   | Smoke | Accessibility | Visual | Responsive | Security |
| --------------- | ----------------------- | ----- | ------------- | ------ | ---------- | -------- |
| Landing         | `/`                     | ✓     | ✓             | ✓      | ✓          | ✓        |
| Dashboard       | `/dashboard`            | ✓     | ✓             | ✓      | ✓          | ✓        |
| Pricing         | `/pricing`              | ✓     | ✓             | ✓      | ✓          | ✓        |
| Profile         | `/profile`              | ✓     | ✓             | ✓      | ✓          | ✓        |
| Profile Edit    | `/profile/edit`         | ✓     | ✓             | ✓      | ✓          | ✓        |
| Login           | `/auth/login`           | ✓     | ✓             | ✓      | ✓          | ✓        |
| Signup          | `/auth/signup`          | ✓     | ✓             | ✓      | ✓          | ✓        |
| Forgot Password | `/auth/forgot-password` | ✓     | ✓             | ✓      | ✓          | ✓        |
| Reset Password  | `/auth/reset-password`  | ✓     | ✓             | ✓      | ✓          | ✓        |
| Confirm Signup  | `/auth/confirm-signup`  | ✓     | ✓             | ✓      | ✓          | ✓        |
| Privacy         | `/legal/privacy`        | ✓     | ✓             | ✓      | ✓          | ✓        |
| Terms           | `/legal/terms`          | ✓     | ✓             | ✓      | ✓          | ✓        |
| 404             | invalid routes          | ✓     | ✓             | ✓      | ✓          | ✓        |
| App             | —                       | —     | —             | —      | —          | —        |

_(App: translations, translation_pages; no page-specific tests.)_

---

## Test Categories

- **Smoke**: Page loads, critical elements visible
- **Accessibility**: axe-core scans, form labels, heading hierarchy
- **Visual**: Screenshot baselines (`artifacts/`)
- **Responsive**: Mobile, tablet, desktop viewports
- **Security**: Protected-route redirects, token leakage checks
- **Flows/critical**: Sign up, login, forgot password, edit profile, export, delete
- **Translation (E2E)**: Visit each page in en and he; assert no i18n keys visible and text differs

### Test Categories Explained

**Smoke** — Page loads and critical elements are visible. Covers redirects for protected pages (e.g. unauthenticated → login), key headings, main CTAs, core form fields, app shell (navigation, footer, main), hero section, navbar, footer links on landing.

**Accessibility** — axe-core scans for WCAG violations (some rules may be disabled per page); all inputs have associated labels; heading hierarchy with visible h1; Delete Account modal uses alertdialog with focus management.

**Visual** — Page loads at 1440×900 viewport. Verifies URL after load; screenshots on failure. No pixel-perfect comparison.

**Responsive** — Key content visible at 7 viewports (320→2560): mobile_small, mobile_mid, mobile_large, tablet, laptop, laptop_large, desktop. Tests fail if horizontal scrollbar/overflow is detected.

**Security** — Protected routes redirect unauthenticated users to login; guest routes redirect authenticated users (e.g. login → dashboard); no `idToken` or `refreshToken` leakage in visible DOM.

---

## Flows (critical.py)

| Flow                                                   | What it tests                                                                |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `test_signup_flow`                                     | Create temp email → sign up via API → confirm → tokens obtained              |
| `test_login_flow`                                      | Shared user logs in → Dashboard loads                                        |
| `test_forgot_password_form_submits`                    | Forgot-password form accepts email and submits (redirect to forgot or reset) |
| `test_forgot_password_redirects_to_reset`              | Forgot → reset page with email prefilled; skips if Cognito not configured    |
| `test_edit_profile_flow`                               | Login → Profile → Edit Profile → change name → save → back to Profile        |
| `test_export_data_flow`                                | Login → Profile → Export data → success toast                                |
| `test_guest_redirects_to_dashboard_when_authenticated` | Logged-in user visits login → redirected to Dashboard                        |
| `test_delete_account_flow`                             | Login → Profile → Delete Account → confirm → logged out                      |

---

## Folder Structure

Aligned with [routes.ts](../src/router/routes.ts). Each route/page has its own folder.

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
    app/                translations.py, translation_pages.py
  scripts/
  helpers/
  fixtures/
```

Each page folder contains: `smoke.py`, `accessibility.py`, `visual.py`, `responsive.py`, `security.py` (as applicable).

---

## Translation E2E Tests

`tests/e2e/app/translation_pages.py` visits each page in English and Hebrew and verifies:

1. **No untranslated keys** — i18next shows keys when translations are missing; tests assert none appear
2. **Text differs between languages** — Catches pages that don't switch language correctly

Protected pages use `authenticated_page`; public pages use `page`.

---

## Mail.tm and Auth-Dependent Tests

Tests that create users (sign up, login flow, profile flows) use [Mail.tm](https://mail.tm) for temporary email. These require:

- Backend API running
- Network access to api.mail.tm
- Initial 12s wait for email delivery (first poll)

Optionally set `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_TEST_ID_TOKEN`, `E2E_TEST_REFRESH_TOKEN` to use an existing account and skip user creation.
