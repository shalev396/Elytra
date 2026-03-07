# E2E Test Catalog

Overview of all pages, test categories, what each category tests, and what each flow covers.

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

## Test Categories Explained

### Smoke

Page loads and critical elements are visible. Covers:

- Redirects for protected pages (e.g. unauthenticated → login)
- Key headings, main CTAs, core form fields
- App shell (navigation, footer, main) where applicable
- Hero section, navbar, footer links on landing

### Accessibility

- **axe-core** scans for WCAG violations; some rules may be disabled per page (e.g. landmark rules on landing)
- **Form labels** — all inputs have associated labels
- **Heading hierarchy** — visible h1 where expected
- **Modal focus** — Delete Account opens an alertdialog with Yes/Cancel, focus managed

### Visual

Page loads at the desktop viewport (1440×900). Verifies URL after load; screenshots on failure. Does not do pixel-perfect comparison.

### Responsive

Key content visible at 7 viewports (320 → 2560):

- mobile_small (320×568)
- mobile_mid (375×667)
- mobile_large (425×844)
- tablet (768×1024)
- laptop (1024×768)
- laptop_large (1440×900)
- desktop (2560×1440)

Tests fail if horizontal scrollbar/overflow is detected at any viewport.

### Security

- **Protected routes** — unauthenticated users redirected to login
- **Guest routes** — authenticated users visiting login redirected to dashboard
- **Token leakage** — no `idToken` or `refreshToken` in visible DOM text on public/protected pages

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
