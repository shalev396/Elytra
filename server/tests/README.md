# Elytra API Tests

This directory contains Postman collections and a Node.js test runner for automated API testing with real email verification using Mail.tm.

## Quick Start

### Prerequisites

1. **Environment Variables**: Set these before running tests via `.env.qa`:
   ```
   DOMAIN_NAME=qa.elytra.shalev396.com
   DATABASE_URL=your-mongodb-url
   DATABASE_PROVIDER=mongoose
   ENV=qa
   ```

### Running Tests

```bash
# Run all tests (auth + user collections)
npm test

# Run only auth tests
npm run test:auth

# Run only user tests
npm run test:user
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Runner                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Clear Database (MongoDB/PostgreSQL)                         │
│  2. Run Auth Collection → Exports tokens                        │
│  3. Run User Collection ← Uses exported tokens                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Auth Collection                              │
├─────────────────────────────────────────────────────────────────┤
│  Signup Flow (Mail.tm):                                         │
│    1. Get Mail.tm domains                                       │
│    2. Create temporary email account                            │
│    3. Get Mail.tm auth token                                    │
│    4. Call /auth/signup with temp email                         │
│    5. Poll Mail.tm inbox for verification email                 │
│    6. Read email and extract 6-digit code                       │
│    7. Call /auth/confirm with code                              │
│    8. Call /auth/login and save tokens                          │
│                                                                  │
│  Additional Tests:                                               │
│    - Login validation tests                                      │
│    - Token refresh tests                                         │
│    - Password reset tests                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Mail.tm Integration

The test suite uses [Mail.tm](https://mail.tm) as a free temporary email provider:

- **No API key required** - Mail.tm is completely free
- **Real email verification** - Tests the actual Cognito email flow
- **Automatic cleanup** - Each test run creates a unique email address
- **Polling with retry** - Waits for verification email with automatic retries

### Token Passing Between Collections

1. Auth collection creates a user and logs in, saving `idToken` and `refreshToken`
2. Runner extracts these from Newman's exported environment
3. User collection receives tokens as environment variables
4. All authenticated requests use the passed tokens

## Using with Postman App

You can import these collections into the Postman desktop app for manual testing and debugging.

### Import Collections

1. Open Postman
2. Click **Import** (top-left)
3. Select **File** tab
4. Navigate to `server/tests/collections/`
5. Select the collection file(s) you want to import:
   - `auth.postman_collection.json` - Authentication tests (includes signup flow)
   - `user.postman_collection.json` - User endpoint tests
6. Click **Import**

### Import Environment

1. Click **Import** again
2. Navigate to `server/tests/environments/`
3. Select `qa.postman_environment.json`
4. Click **Import**

### Manual Testing Workflow

For manual testing in Postman:

1. **Set the base URL**:
   - Click the **Environment** dropdown (top-right corner)
   - Select **Elytra QA**
   - Set `baseUrl` to your API URL

2. **Run the signup flow**:
   - Open the Auth collection
   - Run requests 1-8 in the "Signup Flow (Mail.tm)" folder in order
   - Tokens will be automatically saved to collection variables

3. **Run authenticated requests**:
   - User collection requests will use the saved tokens

## Directory Structure

```
tests/
├── runner.ts                    # Main test runner (TypeScript)
├── collections/
│   ├── auth.postman_collection.json   # Auth tests with signup flow
│   └── user.postman_collection.json   # User endpoint tests
├── environments/
│   └── qa.postman_environment.json    # QA environment variables
└── README.md                    # This file
```

## Collection Details

### Auth Collection

Tests for authentication endpoints with Mail.tm email verification.

#### Signup Flow (Mail.tm Integration)

| Step | Request                       | What We Test                                                             |
| ---- | ----------------------------- | ------------------------------------------------------------------------ |
| 1    | GET api.mail.tm/domains       | Mail.tm API is available, at least one domain exists                     |
| 2    | POST api.mail.tm/accounts     | Can create temporary email account                                       |
| 3    | POST api.mail.tm/token        | Can authenticate with Mail.tm                                            |
| 4    | POST /auth/signup             | User is created in Cognito, returns `userSub` and `userConfirmed: false` |
| 5    | GET api.mail.tm/messages      | Cognito sends verification email within timeout                          |
| 6    | GET api.mail.tm/messages/{id} | Email contains 6-digit confirmation code                                 |
| 7    | POST /auth/confirm            | Cognito accepts the code, user is confirmed                              |
| 8    | POST /auth/login              | Returns `idToken`, `refreshToken`, and user data                         |

#### Login Tests

| Test                   | Status | What We Validate                                                                                           |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Valid credentials      | 200    | `success: true`, user object has `id`, `email`, `name`, tokens have `idToken`, `refreshToken`, `expiresIn` |
| Wrong password         | 401    | `success: false`, request rejected for invalid credentials                                                 |
| Wrong email            | 401    | `success: false`, unregistered email is rejected                                                           |
| Wrong email + password | 401    | `success: false`, completely invalid credentials rejected                                                  |
| Missing email          | 400    | `success: false`, validation rejects missing field                                                         |
| Missing password       | 400    | `success: false`, validation rejects missing field                                                         |

#### Token Refresh Tests

| Test          | Status | What We Validate                                       |
| ------------- | ------ | ------------------------------------------------------ |
| Valid token   | 200    | `success: true`, returns new `idToken` and `expiresIn` |
| Invalid token | 401    | `success: false`, invalid refresh token rejected       |
| Missing token | 400    | `success: false`, validation rejects missing field     |

#### Forgot Password Tests

| Test              | Status | What We Validate                                          |
| ----------------- | ------ | --------------------------------------------------------- |
| Valid email       | 200    | `success: true`, password reset initiated                 |
| Nonexistent email | 200    | `success: true`, returns 200 to prevent email enumeration |
| Missing email     | 400    | `success: false`, validation rejects missing field        |

#### Reset Password Tests

| Test           | Status | What We Validate                                    |
| -------------- | ------ | --------------------------------------------------- |
| Invalid code   | 400    | `success: false`, wrong verification code rejected  |
| Missing fields | 400    | `success: false`, validation rejects missing fields |

---

### User Collection

Tests for user endpoints. All authenticated requests require a valid `idToken` from the auth collection.

#### GET /user/me

| Test          | Status | What We Validate                                                                                                                             |
| ------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid token   | 200    | `success: true`, user data includes `id`, `cognitoSub`, `email`, `name`, `createdAt`, `updatedAt`. Email matches the test email from signup. |
| No token      | 401    | Request rejected, not a success response                                                                                                     |
| Invalid token | 401    | Request rejected, not a success response                                                                                                     |

#### PUT /user/me

| Test         | Status | What We Validate                                        |
| ------------ | ------ | ------------------------------------------------------- |
| Change name  | 200    | `success: true`, returned user has updated `name` field |
| Restore name | 200    | `success: true`, name reverted to original value        |
| No token     | 401    | Request rejected, not a success response                |

#### GET /user/dashboard

| Test        | Status | What We Validate                                     |
| ----------- | ------ | ---------------------------------------------------- |
| Valid token | 200    | `success: true`, response has `userId` and `message` |
| No token    | 401    | Request rejected, not a success response             |

## Troubleshooting

### "clearDB can only run on QA environment"

The `ENV` variable must be set to `qa`:

```
ENV=qa
```

### "No email received after X attempts"

Mail.tm may be slow or temporarily unavailable. Try:

- Running the test again
- Checking if Mail.tm API is responsive at https://api.mail.tm/domains
- Increasing the poll timeout in the collection

### Tests fail with 401 Unauthorized

The idToken might have expired (tokens expire after 1 hour). Run the full auth collection again to get fresh tokens.

## Notes

- **Email verification is real** - Each test run sends an actual Cognito verification email
- **Tests are self-contained** - No manual setup required
- **State is cleared** - Database is cleared before each run
- **No cleanup after tests** - User remains in DB for inspection
