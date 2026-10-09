"""Basic-auth credentials for the WAF gate in front of the deployed dev and qa sites.

The gate (docs/staging-access.md) answers every dev/qa page with 401 + `WWW-Authenticate: Basic`
until the request carries `Basic base64(<host>:<password>)`. Paths under /api/ are not gated.

`send: "unauthorized"` only answers that 401 challenge, so API calls that already succeed keep
their `Authorization: Bearer ...` header. `origin` keeps the credentials off every other host
(S3 presigned uploads, Mail.tm).

Every browser context gets these through `browser_context_args` in conftest.py. A test that calls
`browser.new_context` itself must pass `http_credentials=gate_http_credentials()` when it is set."""

import os
from urllib.parse import urlparse


def gate_http_credentials() -> dict[str, str] | None:
    """Playwright `http_credentials` for BASE_URL, or None (no password, or a localhost run)."""
    password = os.getenv("BASIC_AUTH_PASSWORD", "").strip()
    base = os.getenv("BASE_URL", "").strip()
    if not password or not base:
        return None
    parsed = urlparse(base)
    host = parsed.hostname
    if not host or host in {"localhost", "127.0.0.1"}:
        return None
    return {
        "username": host,
        "password": password,
        "origin": f"{parsed.scheme}://{parsed.netloc}",
        "send": "unauthorized",
    }
