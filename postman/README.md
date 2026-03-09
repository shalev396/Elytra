# Elytra Backend API Tests (Postman)

[← Back to main README](../README.md)

Run these against a live API or serverless offline. For the full list of hardcoded URLs to change, see [Getting Started → Change Hardcoded URLs](../README.md#2-change-hardcoded-urls-and-branding) in the main README. API tests use the **Postman CLI** or **Postman desktop app**. For frontend E2E tests (Playwright), see [client/tests/README.md](../client/tests/README.md).

## Import

1. **Collection**: Import `postman/collections/Elytra API` (V3 folder format).
2. **Environments**: Import `postman/environments/Elytra Local.environment.yaml` and `postman/environments/Elytra QA.environment.yaml`.

## What to Change Before Running

### 1. Environment -- Base URL

The template ships with hardcoded URLs. Replace them with your own:

| File                                                        | Variable  | Template value                        | Change to                       |
| ----------------------------------------------------------- | --------- | ------------------------------------- | ------------------------------- |
| `postman/environments/Elytra QA.environment.yaml`           | `baseUrl` | `https://qa.elytra.shalev396.com/api` | `https://qa.yourdomain.com/api` |
| `postman/collections/Elytra API/.resources/definition.yaml` | `baseUrl` | `https://qa.elytra.shalev396.com/api` | Same as QA environment above    |

In your active environment, set `baseUrl`:

- **Local**: `http://localhost:3000/api` (run `npm run dev` from `server/` first)
- **QA**: Your QA API URL, e.g. `https://qa.yourdomain.com/api`

### 2. Authentication -- Tokens

Tokens are set automatically when you run the collection (Login and Mail.tm flows save them). If you run individual requests or your environment resets:

- `idToken` -- From login; used for Elytra API (`/user/me`, `/user/me/export`, `/user/dashboard`)
- `mailTmToken` -- From Mail.tm Get Token; used for `api.mail.tm` (Poll Inbox, Read Message)

Paste values into the environment if needed. The collection uses beforeRequest scripts to add `Authorization: Bearer <token>` from these variables.

## CLI Commands

From `server/`:

```bash
npm run test:local  # Against http://localhost:3000/api
npm run test:qa     # Against QA (baseUrl from Elytra QA.environment.yaml)
```

Configure `baseUrl` in each environment file (Local: `postman/environments/Elytra Local.environment.yaml`, QA: `postman/environments/Elytra QA.environment.yaml`). The collection `postman/collections/Elytra API/.resources/definition.yaml` also has a `baseUrl` variable — keep it in sync with your QA environment.

## Collection Structure

The collection runs sequentially in this order:

### 1. Setup (9 requests)

Provisions a test account: resets the database, creates a temporary email via Mail.tm, signs up, polls for the verification code, confirms, and logs in. Saves `idToken`, `refreshToken`, and other variables for all subsequent tests.

### 2. Auth (27 requests)

Endpoint coverage for all authentication routes:

| Folder              | Endpoint                     | Requests                                                                                                                     |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Login**           | `POST /auth/login`           | 7 (valid credentials, wrong password, unregistered email, wrong email+password, missing email, missing password, empty body) |
| **Signup**          | `POST /auth/signup`          | 5 (missing email, missing password, missing name, duplicate email, weak password)                                            |
| **Confirm**         | `POST /auth/confirm`         | 3 (missing email, missing code, invalid code)                                                                                |
| **Token Refresh**   | `POST /auth/refresh`         | 3 (valid token, invalid token, missing token)                                                                                |
| **Forgot Password** | `POST /auth/forgot-password` | 4 (valid email, nonexistent email, missing email, invalid email format)                                                      |
| **Reset Password**  | `POST /auth/reset-password`  | 5 (invalid code, missing fields, missing email, missing code, missing password)                                              |

### 3. User (12 requests)

Endpoint coverage for user routes (all require `Authorization: Bearer <idToken>`):

| Folder              | Endpoint                   | Requests                                            |
| ------------------- | -------------------------- | --------------------------------------------------- |
| **Get Me**          | `GET /user/me`             | 3 (valid token, no token, invalid token)            |
| **Update Me**       | `PUT /user/me`             | 4 (change name, restore name, no token, no changes) |
| **Send Test Email** | `POST /user/me/test-email` | 2 (valid token, no token)                           |
| **Export Me**       | `GET /user/me/export`      | 2 (valid token, no token)                           |
| **Delete Account**  | `DELETE /user/delete`      | 1 (no token -- expects 401)                         |

### 4. Dashboard (2 requests)

| Endpoint              | Requests                  |
| --------------------- | ------------------------- |
| `GET /user/dashboard` | 2 (valid token, no token) |

### 5. Flows (21 requests)

User interaction flows that mimic real user journeys, organized by topic:

#### Auth Flows

| Flow                  | Requests | Journey                                                                                                                                |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Signup**            | 8        | Get Mail.tm Domains -> Create Mail.tm Account -> Get Mail.tm Token -> Sign Up -> Poll Inbox -> Read Message -> Confirm Signup -> Login |
| **Login and Refresh** | 4        | Login -> Get Me -> Refresh Token -> Get Me with New Token                                                                              |
| **Forgot Password**   | 6        | Re-auth Mail.tm -> Request Reset -> Poll Inbox -> Read Reset Email -> Reset Password -> Login with New Password                        |

#### User Flows

| Flow               | Requests | Journey                                                   |
| ------------------ | -------- | --------------------------------------------------------- |
| **Export Data**    | 3        | Login -> Get Me -> Export Me (runs before Delete Account) |
| **Delete Account** | 3        | Login -> Get Me -> Delete Account                         |

## Auth Middleware Testing

All `/user/*` endpoints use the same `expressAuth` middleware. No-token and invalid-token edge cases are tested comprehensively on `GET /user/me`. Other authenticated endpoints include a single no-token sanity check each.

### 401 Response Format: Local vs QA/Prod

Protected routes (`/user/*`, `/user/dashboard`) use the **API Gateway Cognito JWT authorizer** when deployed. The "Response indicates failure" assertion in no-token and invalid-token tests accepts both formats:

| Environment                    | Who responds                                   | Body                                               |
| ------------------------------ | ---------------------------------------------- | -------------------------------------------------- |
| **Local** (serverless-offline) | Lambda + `expressAuth`                         | `{ success: false, message }`                      |
| **QA/Prod** (deployed)         | API Gateway Cognito authorizer (before Lambda) | `{ message: "Unauthorized" }` (no `success` field) |

Local tests hit the Lambda because serverless-offline bypasses the authorizer (`noAuth: true`). In QA/prod, the authorizer rejects invalid/missing tokens before the Lambda is invoked, so the response comes from API Gateway, not our app.

## Total: 62 requests

- Setup: 9
- Auth: 27
- User: 12
- Dashboard: 2
- Flows: 22 (Auth: 18 + User: 4)

Note: The Setup account is not explicitly deleted -- it is cleaned up by the "Reset Database" step at the start of the next run. The Signup flow creates a separate account for flow testing, which is deleted by the Delete Account flow at the end.
