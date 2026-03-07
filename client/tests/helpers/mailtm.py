"""
Mail.tm helper for E2E tests - creates temp email, signup, confirms, and returns credentials.
Reuses the Postman flow logic.
"""
import os
import re
import time
from typing import NamedTuple, Optional
from urllib.parse import urlparse

import requests


MAILTM_BASE = "https://api.mail.tm"
POLL_INITIAL_DELAY = 12
POLL_RETRY_DELAY = 5
POLL_MAX_RETRIES = 6


class TestUser(NamedTuple):
    email: str
    password: str
    id_token: str
    refresh_token: str


def get_mailtm_domain() -> str:
    r = requests.get(f"{MAILTM_BASE}/domains", timeout=10)
    r.raise_for_status()
    data = r.json()
    domains = data.get("hydra:member", [])
    active = next((d for d in domains if d.get("isActive")), domains[0] if domains else None)
    if not active:
        raise RuntimeError("No Mail.tm domain available")
    return active["domain"]


def create_mailtm_account(domain: str) -> tuple[str, str, str]:
    """Create Mail.tm account. Returns (email, mailtm_password, app_password)."""
    import secrets

    r1 = secrets.token_hex(4)
    r2 = secrets.token_hex(3)
    email = f"qatest{r1}{r2}@{domain}"
    mailtm_password = f"Password{r1}!"
    app_password = f"Test@{r1}Aa1!"

    for attempt in range(3):
        r = requests.post(
            f"{MAILTM_BASE}/accounts",
            json={"address": email, "password": mailtm_password},
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        if r.status_code == 201:
            return email, mailtm_password, app_password
        if r.status_code == 429 and attempt < 2:
            time.sleep(2 ** (attempt + 1))
            continue
        raise RuntimeError(f"Mail.tm account creation failed: {r.status_code} {r.text}")


def get_mailtm_token(email: str, mailtm_password: str) -> str:
    r = requests.post(
        f"{MAILTM_BASE}/token",
        json={"address": email, "password": mailtm_password},
        headers={"Content-Type": "application/json"},
        timeout=10,
    )
    r.raise_for_status()
    data = r.json()
    token = data.get("token")
    if not token:
        raise RuntimeError("No Mail.tm token in response")
    return token


def signup_elytra(api_base_url: str, email: str, password: str, name: str = "Test User") -> None:
    r = requests.post(
        f"{api_base_url}/auth/signup",
        json={"email": email, "password": password, "name": name},
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if r.status_code != 200:
        raise RuntimeError(f"Elytra signup failed: {r.status_code} {r.text}")
    data = r.json()
    if not data.get("success"):
        raise RuntimeError(f"Elytra signup failed: {data}")


def poll_inbox_and_get_code(mailtm_token: str) -> str:
    time.sleep(POLL_INITIAL_DELAY)
    for attempt in range(POLL_MAX_RETRIES):
        r = requests.get(
            f"{MAILTM_BASE}/messages",
            headers={"Authorization": f"Bearer {mailtm_token}"},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        messages = data.get("hydra:member", [])
        if messages:
            msg_id = messages[0]["id"]
            rr = requests.get(
                f"{MAILTM_BASE}/messages/{msg_id}",
                headers={"Authorization": f"Bearer {mailtm_token}"},
                timeout=10,
            )
            rr.raise_for_status()
            msg = rr.json()
            text = msg.get("text", "") + " " + " ".join(msg.get("html", []))
            match = re.search(r"\b(\d{6})\b", text)
            if match:
                return match.group(1)
        if attempt < POLL_MAX_RETRIES - 1:
            time.sleep(POLL_RETRY_DELAY)
    raise RuntimeError(f"No confirmation code received after {POLL_MAX_RETRIES} retries")


def confirm_signup_elytra(api_base_url: str, email: str, code: str) -> None:
    r = requests.post(
        f"{api_base_url}/auth/confirm",
        json={"email": email, "code": code},
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if r.status_code != 200:
        raise RuntimeError(f"Elytra confirm failed: {r.status_code} {r.text}")
    data = r.json()
    if not data.get("success"):
        raise RuntimeError(f"Elytra confirm failed: {data}")


def login_elytra(api_base_url: str, email: str, password: str) -> tuple[str, str]:
    r = requests.post(
        f"{api_base_url}/auth/login",
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if r.status_code != 200:
        raise RuntimeError(f"Elytra login failed: {r.status_code} {r.text}")
    data = r.json()
    if not data.get("success") or "data" not in data:
        raise RuntimeError(f"Elytra login failed: {data}")
    tokens = data["data"].get("tokens", {})
    id_token = tokens.get("idToken")
    refresh_token = tokens.get("refreshToken")
    if not id_token or not refresh_token:
        raise RuntimeError("No tokens in login response")
    return id_token, refresh_token


def create_test_user(api_base_url: str) -> TestUser:
    """Create a full test user: Mail.tm -> signup -> confirm -> login."""
    domain = get_mailtm_domain()
    email, mailtm_password, app_password = create_mailtm_account(domain)
    mailtm_token = get_mailtm_token(email, mailtm_password)
    signup_elytra(api_base_url, email, app_password)
    code = poll_inbox_and_get_code(mailtm_token)
    confirm_signup_elytra(api_base_url, email, code)
    id_token, refresh_token = login_elytra(api_base_url, email, app_password)
    return TestUser(email, app_password, id_token, refresh_token)


def get_test_user_from_env() -> Optional[TestUser]:
    """Build TestUser from env vars if all are set. Uses 0 SES emails."""
    email = os.getenv("E2E_TEST_EMAIL")
    password = os.getenv("E2E_TEST_PASSWORD")
    id_token = os.getenv("E2E_TEST_ID_TOKEN")
    refresh_token = os.getenv("E2E_TEST_REFRESH_TOKEN")
    if email and password and id_token and refresh_token:
        return TestUser(email=email, password=password, id_token=id_token, refresh_token=refresh_token)
    return None


def login_page_with_user(page, app_url: str, user: TestUser) -> None:
    """Inject tokens into page; does not create a new user."""
    parsed = urlparse(app_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    page.goto(f"{origin}/en", wait_until="domcontentloaded")
    page.evaluate(
        """([{ idToken, refreshToken }]) => {
        sessionStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
    }""",
        [{"idToken": user.id_token, "refreshToken": user.refresh_token}],
    )


def create_test_user_and_login(page, app_url: str, api_base_url: str) -> None:
    """
    Create test user and inject auth into the Playwright page.
    Elytra stores idToken in sessionStorage, refreshToken in localStorage.
    """
    user = create_test_user(api_base_url)
    login_page_with_user(page, app_url, user)
