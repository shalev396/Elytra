"""
Critical user flows - sign up, login, forgot password, edit profile, export, delete, guest redirect.
Cross-page flows.
"""
import re
import time

import pytest
from playwright.sync_api import Download, Page, expect

from tests.config import (
    EXPORT_TIMEOUT,
    FORGOT_PASSWORD_TIMEOUT,
    LONG_TIMEOUT,
    NORMAL_TIMEOUT,
    SHORT_TIMEOUT,
)
from tests.helpers.mailtm import (
    create_test_user,
    create_test_user_and_login,
    login_page_with_user,
    navigate_to_profile_via_ui,
)


def test_signup_flow(page: Page, app_url: str, api_base_url: str):
    """Full signup: create temp email -> sign up -> confirm -> tokens."""
    user = create_test_user(api_base_url)
    assert user.email
    assert user.id_token


def test_login_flow(page: Page, app_url: str, shared_test_user):
    """Shared user, then verify dashboard reachable."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=SHORT_TIMEOUT)


def test_forgot_password_form_submits(page: Page, app_url: str, shared_test_user):
    """Forgot password form loads, accepts email, and submits. Always runs."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_role("link", name="Forgot your password?").click(timeout=SHORT_TIMEOUT)
    expect(page).to_have_url(f"{app_url}/auth/forgot-password", timeout=SHORT_TIMEOUT)

    # Wait for ForgotPasswordForm to mount (LoginPage's #email shares the same ID)
    expect(page.get_by_role("button", name="Send Reset Link")).to_be_visible(timeout=SHORT_TIMEOUT)

    email_input = page.locator("#email")
    email_input.fill(shared_test_user.email, timeout=SHORT_TIMEOUT)
    expect(email_input).to_have_value(shared_test_user.email, timeout=SHORT_TIMEOUT)

    page.get_by_role("button", name="Send Reset Link").click(timeout=SHORT_TIMEOUT)
    page.wait_for_load_state("networkidle")
    # Form submitted; redirect may or may not occur depending on Cognito config
    expect(page).to_have_url(
        re.compile(rf".*auth/(forgot-password|reset-password).*"),
        timeout=SHORT_TIMEOUT,
    )


def test_forgot_password_redirects_to_reset(page: Page, app_url: str, shared_test_user):
    """Forgot password -> submit -> redirect to reset page. Fails when the redirect does not occur."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_role("link", name="Forgot your password?").click(timeout=SHORT_TIMEOUT)
    expect(page).to_have_url(f"{app_url}/auth/forgot-password", timeout=SHORT_TIMEOUT)

    # Wait for ForgotPasswordForm to mount (LoginPage's #email shares the same ID)
    expect(page.get_by_role("button", name="Send Reset Link")).to_be_visible(timeout=SHORT_TIMEOUT)

    email_input = page.locator("#email")
    email_input.fill(shared_test_user.email, timeout=SHORT_TIMEOUT)
    expect(email_input).to_have_value(shared_test_user.email, timeout=SHORT_TIMEOUT)

    page.get_by_role("button", name="Send Reset Link").click(timeout=SHORT_TIMEOUT)

    try:
        page.wait_for_url(
            re.compile(r".*auth/reset-password.*email=.*"),
            timeout=FORGOT_PASSWORD_TIMEOUT,
        )
    except Exception:
        error_el = page.locator(".bg-destructive\\/10")
        if error_el.is_visible():
            actual_error = error_el.text_content() or "unknown"
            pytest.fail(f"Forgot-password API returned an error: {actual_error}")
        pytest.fail(
            "Forgot-password redirect did not occur (no error visible on page); "
            f"current URL: {page.url}"
        )
    expect(page.get_by_label("Email")).to_have_value(shared_test_user.email, timeout=SHORT_TIMEOUT)


def test_edit_profile_flow(page: Page, app_url: str, shared_test_user):
    """Login -> profile -> edit -> change name -> save -> redirect to profile."""
    login_page_with_user(page, app_url, shared_test_user)
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    page.get_by_role("link", name="Edit Profile").click(timeout=NORMAL_TIMEOUT)
    page.wait_for_load_state("networkidle")
    name_input = page.get_by_label("Name")
    unique_name = f"Updated Name {int(time.time())}"
    name_input.fill(unique_name)
    page.get_by_role("button", name="Save Changes").click(timeout=NORMAL_TIMEOUT)
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/profile", timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text(unique_name)).to_be_visible(timeout=NORMAL_TIMEOUT)


def test_export_data_flow(page: Page, app_url: str, shared_test_user):
    """Login -> profile -> Export -> toast success and the ZIP download starts."""
    login_page_with_user(page, app_url, shared_test_user)
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    # The API answers with a presigned S3 URL and the app opens it through a temporary <a>. The
    # link may open a new tab, so collect downloads from this page and from any popup it opens.
    downloads: list[Download] = []
    page.on("download", lambda download: downloads.append(download))
    page.context.on("page", lambda popup: popup.on("download", lambda download: downloads.append(download)))

    page.get_by_role("button", name="Export my data").click(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("ready", exact=False)).to_be_visible(timeout=EXPORT_TIMEOUT)

    deadline = time.monotonic() + EXPORT_TIMEOUT / 1000
    while not downloads and time.monotonic() < deadline:
        page.wait_for_timeout(250)
    assert downloads, "Export finished but no download started"
    assert downloads[0].suggested_filename.endswith(".zip"), (
        f"Unexpected export file: {downloads[0].suggested_filename}"
    )


def test_guest_redirects_to_dashboard_when_authenticated(page: Page, app_url: str, shared_test_user):
    """Authenticated user visiting login -> redirect to dashboard."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/dashboard")


def test_delete_account_flow(page: Page, app_url: str, api_base_url: str):
    """Login -> profile -> Delete -> confirm -> redirect home, logged out."""
    create_test_user_and_login(page, app_url, api_base_url)
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    page.get_by_role("button", name="Delete Account").click(timeout=NORMAL_TIMEOUT)
    page.get_by_role("button", name="Yes, delete my account").click()
    # The dialog stays open until the request finishes; then the app logs out and goes home.
    page.wait_for_url(lambda url: "/profile" not in url, timeout=LONG_TIMEOUT)
    expect(page).to_have_url(re.compile(rf"^{re.escape(app_url)}/?$"), timeout=NORMAL_TIMEOUT)
    id_token = page.evaluate("() => sessionStorage.getItem('idToken')")
    refresh_token = page.evaluate("() => localStorage.getItem('refreshToken')")
    assert id_token is None and refresh_token is None, "Tokens still stored after account deletion"
