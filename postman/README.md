# Elytra API Tests (Postman)

API tests run with the **Postman CLI** or **Postman desktop app**.

## Import

1. **Collection**: Import `postman/collections/Elytra API` (V3 folder format).
2. **Environments**: Import `postman/environments/Elytra Local.environment.yaml` and `postman/environments/Elytra QA.environment.yaml`.

## What to Change Before Running

### 1. Environment -- Base URL

In your active environment, set `baseUrl`:

- **Local**: `http://localhost:3000/api` (run `npm run dev` from `server/` first)
- **QA**: Your QA API URL, e.g. `https://qa.elytra.example.com/api`

### 2. Authentication -- Tokens

Tokens are set automatically when you run the collection (Login and Mail.tm flows save them). If you run individual requests or your environment resets:

- `idToken` -- From login; used for Elytra API (`/user/me`, `/user/dashboard`)
- `mailTmToken` -- From Mail.tm Get Token; used for `api.mail.tm` (Poll Inbox, Read Message)

Paste values into the environment if needed. The collection uses beforeRequest scripts to add `Authorization: Bearer <token>` from these variables.

## CLI Commands

From `server/`:

```bash
npm run test        # Same as test:local
npm run test:local  # Against http://localhost:3000/api
npm run test:qa     # Against QA (baseUrl from Elytra QA.environment.yaml)
```

Configure `baseUrl` in each environment file if needed (Local: `postman/environments/Elytra Local.environment.yaml`, QA: `postman/environments/Elytra QA.environment.yaml`).

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

### 3. User (10 requests)

Endpoint coverage for user routes (all require `Authorization: Bearer <idToken>`):

| Folder              | Endpoint                   | Requests                                            |
| ------------------- | -------------------------- | --------------------------------------------------- |
| **Get Me**          | `GET /user/me`             | 3 (valid token, no token, invalid token)            |
| **Update Me**       | `PUT /user/me`             | 4 (change name, restore name, no token, no changes) |
| **Send Test Email** | `POST /user/me/test-email` | 2 (valid token, no token)                           |
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

| Flow               | Requests | Journey                               |
| ------------------ | -------- | ------------------------------------- |
| **Delete Account** | 3        | Login -> Get Me -> Delete Account     |
| **Export Data**    | --       | Placeholder for future implementation |

## Auth Middleware Testing

All `/user/*` endpoints use the same `expressAuth` middleware. No-token and invalid-token edge cases are tested comprehensively on `GET /user/me`. Other authenticated endpoints include a single no-token sanity check each.

## Total: 60 requests

- Setup: 9
- Auth: 27
- User: 10
- Dashboard: 2
- Flows: 21 (Auth: 18 + User: 3)

Note: The Setup account is not explicitly deleted -- it is cleaned up by the "Reset Database" step at the start of the next run. The Signup flow creates a separate account for flow testing, which is deleted by the Delete Account flow at the end.
