# Security Policy

## Supported Versions

Elytra is actively maintained on the `main` branch.

| Version / Branch      | Supported |
| --------------------- | --------- |
| `main`                | ✅        |
| Older commits / forks | ❌        |

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Use GitHub's private vulnerability reporting for this repository.

Include:

- affected area (`client`, `server`, deployment, auth, storage, email, etc.)
- reproduction steps
- impact assessment
- proof of concept if available
- suggested fix if you have one

## Response Expectations

I will try to:

- acknowledge reports within 7 days
- validate and triage as soon as possible
- coordinate disclosure after a fix is ready

## Scope

Examples of in-scope areas:

- authentication / authorization
- token handling
- file upload validation
- email-related abuse vectors
- insecure default cloud configuration
- secret exposure
- privilege escalation in template defaults

Out of scope:

- issues only affecting modified downstream forks
- missing hardening in a user’s custom deployment that is outside Elytra defaults
