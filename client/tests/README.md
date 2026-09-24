# Elytra Frontend E2E Tests (Playwright + Python)

[← Back to main README](../../README.md)

Run these against a live backend or the local API (`cd server && npm run dev`) + Vite. For the full list of hardcoded URLs to change, see [Getting Started → Change Hardcoded URLs](../../README.md#2-change-hardcoded-urls-and-branding) in the main README.

> [!WARNING]
> **Every test run wipes the stage the API is bound to.** Before any test starts, the autouse `reset_database` fixture in [`conftest.py`](../conftest.py) calls `POST {API_BASE_URL}/dev/reset`, which deletes **the database, all S3 user uploads and every Cognito user** of that stage.
>
> - `npm run test` against `npm run dev` wipes **dev**.
> - `npm run test` against `npm run start:local -- --stage qa` wipes **qa**. CI's `_test-local.yml` does exactly this on every PR into qa.
> - `npm run test:qa` (and CI's `_test-qa.yml`) calls the deployed QA API and wipes **qa**.
> - Prod has no `/dev` routes, so a run against prod fails at the reset instead of wiping it.
>
> Only when `E2E_TEST_EMAIL` is set (pre-existing user mode, see [Mail.tm](#mailtm-and-auth-dependent-tests)) is the reset skipped, because it would delete that user.

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

Runs pytest via `.venv` with `BASE_URL=http://localhost:5173`, `API_BASE_URL=http://localhost:3000/api`. Translations are exported automatically before tests (conftest fixture). The local API turns off rate limiting, so a full run never hits a 429 from the app itself.

### Parallel workers

Tests run in parallel on pytest-xdist workers, one per CPU up to 4 (`E2E_WORKERS=2 npm run test` to change, `E2E_WORKERS=0` for a single process). Each worker drives its own Chromium: private-repo GitHub runners have only 2 vCPUs, and more workers than CPUs (plus Vite and the local API) left pages stuck on the route spinner. `--headed` with 4 workers opens 4 browsers.

The DB reset, the shared test user and the translations export still happen once per run (`_run_once` in `conftest.py`, guarded by a file lock). Tests that change state other tests read (accounts, profile data) are listed in `SHARED_STATE_TESTS` in `conftest.py`; with `--dist loadgroup` they run on one worker, in order. Add a test there when it changes such state.

### Reduced motion

Every test browser prefers reduced motion (`browser_context_args` in `conftest.py`), so animations such as `FadeContent` render in their final state. CI browsers have no GPU and little CPU; animations there slow pages down and make axe contrast checks flaky. A test of an animation opts back in with:

```python
@pytest.mark.browser_context_args(reduced_motion="no-preference")
def test_fade_in(page): ...
```

Accessibility tests also call `wait_for_fade_in(page)` from `tests/helpers/animations.py` right before `Axe().run`, so axe never measures contrast mid-fade or scans a route that is still showing its loading spinner.

### Rules for writing tests

- **Never add `--browser` to `pytest.ini`.** `run-tests.ts` already passes `--browser chromium`; pytest-playwright parameterizes each test once per occurrence, so a second copy runs the whole suite twice.
- **Never set context-wide extra HTTP headers** (`browser_context_args` `extra_http_headers`, `context.set_extra_http_headers`). They are sent to every origin, including S3: the browser then preflights the presigned upload with headers the bucket's CORS rules don't allow, and every UI upload fails. Add a header to the requests that need it through `page.route` / `context.route`.
- **Prefer `wait_until="load"` plus a content selector over `networkidle`.** Long-lived requests and request storms keep `networkidle` from ever firing, and on a busy CPU it can fire before a lazy route chunk is even requested.
- **Fail, don't skip, on auth problems.** Use `assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"` so a broken login shows up red, not as green skips.

## Scripts

| Script                 | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run test:install` | Create .venv, install deps, playwright chromium |
| `npm run test`         | Run all E2E tests (local)                       |
| `npm run test:qa`      | Run tests against QA URLs                       |

### URLs and Environment Variables

Tests use `BASE_URL` (frontend) and `API_BASE_URL` (backend). Defaults:

- **Local** (`npm run test`): `BASE_URL=http://localhost:5173`, `API_BASE_URL=http://localhost:3000/api`
- **QA** (`npm run test:qa`): Set `BASE_URL` and `API_BASE_URL` in your environment. The template documents `https://qa.elytra.shalev396.com` in [`client/conftest.py`](../conftest.py) (comment only); replace with your QA domain.

For QA runs, set `BASE_URL=https://qa.yourdomain.com` and `API_BASE_URL=https://qa.yourdomain.com/api` (or use your QA domain). In CI, the workflow sets these from `secrets.DOMAIN_NAME`.

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
| App             | —                       | ✓     | —             | —      | —          | —        |

_(App: translations, translation_pages, and `smoke.py`: Home Screen meta tags, manifest and icons, the failing-logo request loop, `theme-color` following the theme.)_

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
| `test_forgot_password_redirects_to_reset`              | Forgot → reset page with email prefilled; fails if the redirect never occurs |
| `test_edit_profile_flow`                               | Login → Profile → Edit Profile → change name → save → back to Profile        |
| `test_export_data_flow`                                | Login → Profile → Export data → success toast and a `.zip` download starts   |
| `test_guest_redirects_to_dashboard_when_authenticated` | Logged-in user visits login → redirected to Dashboard                        |
| `test_delete_account_flow`                             | Login → Profile → Delete Account → confirm → home page, tokens cleared       |

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
    app/                smoke.py, translations.py, translation_pages.py
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

Optionally set `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_TEST_ID_TOKEN`, `E2E_TEST_REFRESH_TOKEN` to use an existing account and skip user creation. Setting `E2E_TEST_EMAIL` also **skips the database reset** (it would delete that account), so the run uses whatever data the stage already has.

Otherwise each run creates one fresh Mail.tm user for the whole run (all workers) and sends one SES confirmation email; `test_signup_flow` and `test_delete_account_flow` each create one more. If SES or Mail.tm rejects the request (quota, 429), `shared_test_user` **fails** the run instead of skipping: a skip would turn every auth-dependent test into a green skip and hide a broken login. The trade-off is that, together with the reset on every run, each run spends SES quota; on a tight quota, use the `E2E_TEST_*` variables.
