# Elytra Backend API Tests (Postman)

[← Back to main README](../README.md)

Run these against a live API or the local API (`cd server && npm run dev`). For the full list of hardcoded URLs to change, see [Getting Started → Change Hardcoded URLs](../README.md#2-change-hardcoded-urls-and-branding) in the main README. API tests use the **Postman CLI** or **Postman desktop app**. For frontend E2E tests (Playwright), see [client/tests/README.md](../client/tests/README.md).

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

- `idToken` -- From login; used for Elytra API (`/private/me`, `/private/me/export`, `/private/dashboard`)
- `mailTmToken` -- From Mail.tm Get Token; used for `api.mail.tm` (Poll Inbox, Read Message)

Paste values into the environment if needed. The collection uses beforeRequest scripts to add `Authorization: Bearer <token>` from these variables.

## CLI Commands

From `server/`:

```bash
npm run test:local  # Against http://localhost:3000/api
npm run test:qa     # Against QA (baseUrl from Elytra QA.environment.yaml)
```

Both scripts `cd ..` and run the collection from the repo root with `--working-dir .`, because the "Upload to S3" request reads its file body from `postman/fixtures/test-image.png`. When running the Postman CLI yourself, do the same from the repo root:

```bash
postman collection run "postman/collections/Elytra API" --environment "postman/environments/Elytra Local.environment.yaml" --working-dir .
```

`.postman/resources.yaml` also links the OpenAPI spec (`server/openapi.yaml`) into the Postman workspace.

Configure `baseUrl` in each environment file (Local: `postman/environments/Elytra Local.environment.yaml`, QA: `postman/environments/Elytra QA.environment.yaml`). The collection `postman/collections/Elytra API/.resources/definition.yaml` also has a `baseUrl` variable — keep it in sync with your QA environment.

## Collection Structure

The collection runs sequentially in this order:

### 1. Setup (9 requests)

Provisions a test account: resets the database, creates a temporary email via Mail.tm, signs up, polls for the verification code, confirms, and logs in. Saves `idToken`, `refreshToken`, and other variables for all subsequent tests.

### 2. Auth (27 requests)

Endpoint coverage for all authentication routes:

| Folder              | Endpoint                            | Requests                                                                                                                     |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Login**           | `POST /public/auth/login`           | 7 (valid credentials, wrong password, unregistered email, wrong email+password, missing email, missing password, empty body) |
| **Signup**          | `POST /public/auth/signup`          | 5 (missing email, missing password, missing name, duplicate email, weak password)                                            |
| **Confirm**         | `POST /public/auth/confirm`         | 3 (missing email, missing code, invalid code)                                                                                |
| **Token Refresh**   | `POST /public/auth/refresh`         | 3 (valid token, invalid token, missing token)                                                                                |
| **Forgot Password** | `POST /public/auth/forgot-password` | 4 (valid email, nonexistent email, missing email, invalid email format)                                                      |
| **Reset Password**  | `POST /public/auth/reset-password`  | 5 (invalid code, missing fields, missing email, missing code, missing password)                                              |

### 3. User (13 requests)

Endpoint coverage for private account routes (all require `Authorization: Bearer <idToken>`):

| Folder              | Endpoint                      | Requests                                                                       |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| **Get Me**          | `GET /private/me`             | 3 (valid token, no token, invalid token)                                       |
| **Update Me**       | `PUT /private/me` (JSON)      | 5 (change name, restore name, no token, no changes, non-boolean `removePhoto`) |
| **Send Test Email** | `POST /private/me/test-email` | 2 (valid token, no token)                                                      |
| **Export Me**       | `GET /private/me/export`      | 2 (valid token: JSON `downloadUrl`, no token)                                  |
| **Delete Account**  | `DELETE /private/delete`      | 1 (no token -- expects 401)                                                    |

### 4. Uploads (9 requests)

Presigned browser uploads, end to end. Files never pass through the API: the presign response is a presigned S3 POST, the file goes straight to the assets bucket, and `PUT /private/me` consumes it by `stagingKey`.

| Request                          | Checks                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Presign - valid                  | `POST /private/uploads/presign` → 200; saves `stagingKey`, `uploadUrl`, `uploadFields`            |
| Presign - disallowed MIME type   | `image/svg+xml` → 400                                                                             |
| Presign - missing file name      | → 400                                                                                             |
| Presign - no token               | → 401                                                                                             |
| Upload to S3                     | `POST {{uploadUrl}}`, `auth: noauth`, form fields then `file` (`postman/fixtures/test-image.png`) |
| Update Me - with photo           | `{ photo: { stagingKey, fileName } }` → 200, `photoUrl` under `/media/users/`                     |
| Update Me - replayed staging key | Same key again → 404 (a staged upload is consumed once)                                           |
| Update Me - foreign staging key  | Another user's staging folder → 400                                                               |
| Update Me - remove photo         | `{ removePhoto: true }` → 200, `photoUrl` is `null`                                               |

The S3 request has no preflight, so it passes even when the bucket's CORS rules would block a browser.

### 5. Dashboard (2 requests)

| Endpoint                 | Requests                  |
| ------------------------ | ------------------------- |
| `GET /private/dashboard` | 2 (valid token, no token) |

### 6. Flows (24 requests)

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

All `/private/*` endpoints use the same `expressAuth` middleware. No-token and invalid-token edge cases are tested comprehensively on `GET /private/me`. Other authenticated endpoints include a single no-token sanity check each.

### Response shape and status codes

Successful responses use `{ data: T }` (no `success` field). Error responses use `{ message: string }`. Success vs failure is determined by the HTTP status code, not a boolean in the JSON body.

### 401 Response Format: Local vs QA/Prod

Protected routes (`/private/*`, `/private/dashboard`) use the **API Gateway Cognito JWT authorizer** when deployed. The "Response indicates failure" assertion in no-token and invalid-token tests checks for a non-2xx status and an error-style body (typically `{ message: ... }`).

| Environment               | Who responds                                   | Body (typical)                |
| ------------------------- | ---------------------------------------------- | ----------------------------- |
| **Local** (`npm run dev`) | Express app + `expressAuth`                    | `{ message: string }`         |
| **QA/Prod** (deployed)    | API Gateway Cognito authorizer (before Lambda) | `{ message: "Unauthorized" }` |

Local tests hit the Express app directly (there is no API Gateway locally), so `expressAuth` answers. In QA/prod, the authorizer rejects invalid/missing tokens before the Lambda is invoked, so the response comes from API Gateway, not our app.

## Total: 84 requests

- Setup: 9
- Auth: 27
- User: 13
- Uploads: 9
- Dashboard: 2
- Flows: 24 (Auth: 18 + User: 6)

Note: The Setup account is not explicitly deleted -- it is cleaned up by the "Reset Database" step at the start of the next run. The Signup flow creates a separate account for flow testing, which is deleted by the Delete Account flow at the end.
