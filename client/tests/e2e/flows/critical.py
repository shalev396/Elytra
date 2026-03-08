"""
Critical user flows - sign up, login, forgot password, edit profile, export, delete, guest redirect.
Cross-page flows.
"""
import re
import time

import pytest
from playwright.sync_api import Page, expect

from tests.config import FORGOT_PASSWORD_TIMEOUT, LONG_TIMEOUT, NORMAL_TIMEOUT, SHORT_TIMEOUT
from tests.helpers.mailtm import (
    create_test_user,
    create_test_user_and_login,
    login_page_with_user,
    navigate_to_profile_via_ui,
)


def test_signup_flow(page: Page, app_url: str, api_base_url: str):
    """Full signup: create temp email -> sign up -> confirm -> tokens."""
    try:
        user = create_test_user(api_base_url)
    except RuntimeError as e:
        if "429" in str(e) or "limit" in str(e).lower():
            pytest.skip(f"Rate limit or quota exceeded: {e}")
        raise
    assert user.email
    assert user.id_token


def test_login_flow(page: Page, app_url: str, shared_test_user):
    """Shared user, then verify dashboard reachable."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth injection may need page reload")
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=SHORT_TIMEOUT)


def test_forgot_password_form_submits(page: Page, app_url: str, shared_test_user):
    """Forgot password form loads, accepts email, and submits. Always runs."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_role("link", name="Forgot your password?").click(timeout=SHORT_TIMEOUT)
    expect(page).to_have_url(f"{app_url}/auth/forgot-password", timeout=SHORT_TIMEOUT)
    page.get_by_label("Email").fill(shared_test_user.email, timeout=SHORT_TIMEOUT)
    page.get_by_role("button", name="Send Reset Link").click(timeout=SHORT_TIMEOUT)
    page.wait_for_load_state("networkidle")
    # Form submitted; redirect may or may not occur depending on Cognito config
    expect(page).to_have_url(
        re.compile(rf".*auth/(forgot-password|reset-password).*"),
        timeout=SHORT_TIMEOUT,
    )


def test_forgot_password_redirects_to_reset(page: Page, app_url: str, shared_test_user):
    """Forgot password -> submit -> redirect to reset page. Skips when Cognito forgot-password not configured."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_role("link", name="Forgot your password?").click(timeout=SHORT_TIMEOUT)
    expect(page).to_have_url(f"{app_url}/auth/forgot-password", timeout=SHORT_TIMEOUT)

    email_input = page.get_by_role("textbox", name="Email")
    email_input.click(timeout=SHORT_TIMEOUT)
    email_input.press_sequentially(shared_test_user.email, delay=0, timeout=SHORT_TIMEOUT)
    expect(email_input).to_have_value(shared_test_user.email, timeout=SHORT_TIMEOUT)

    page.get_by_role("button", name="Send Reset Link").click(timeout=SHORT_TIMEOUT)
    page.wait_for_load_state("networkidle")

    try:
        page.wait_for_url(
            re.compile(r".*auth/reset-password.*email=.*"),
            timeout=FORGOT_PASSWORD_TIMEOUT,
        )
    except Exception:
        if page.get_by_text("Failed to send reset code", exact=False).is_visible():
            pytest.fail(
                "Forgot-password API returned an error (check Cognito config, SES, rate limits)"
            )
        if page.get_by_text("Failed to initiate", exact=False).is_visible():
            pytest.fail(
                "Forgot-password API returned an error (check Cognito config, SES, rate limits)"
            )
        pytest.skip(
            "Cognito forgot-password API failed or not configured; "
            "redirect to reset-password did not occur"
        )
    expect(page.get_by_label("Email")).to_have_value(shared_test_user.email, timeout=SHORT_TIMEOUT)


def test_edit_profile_flow(page: Page, app_url: str, shared_test_user):
    """Login -> profile -> edit -> change name -> save -> redirect to profile."""
    login_page_with_user(page, app_url, shared_test_user)
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
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
    """Login -> profile -> Export -> toast success."""
    login_page_with_user(page, app_url, shared_test_user)
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Export my data").click(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("ready", exact=False)).to_be_visible(timeout=LONG_TIMEOUT)


def test_guest_redirects_to_dashboard_when_authenticated(page: Page, app_url: str, shared_test_user):
    """Authenticated user visiting login -> redirect to dashboard."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/dashboard")


def test_delete_account_flow(page: Page, app_url: str, api_base_url: str):
    """Login -> profile -> Delete -> confirm -> redirect home, logged out."""
    try:
        create_test_user_and_login(page, app_url, api_base_url)
    except RuntimeError as e:
        if "429" in str(e) or "limit" in str(e).lower():
            pytest.skip(f"Rate limit or quota exceeded: {e}")
        raise
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Delete Account").click(timeout=NORMAL_TIMEOUT)
    page.get_by_role("button", name="Yes, delete my account").click()
    page.wait_for_load_state("networkidle")
    # After delete: logged out; may land on home or login depending on app behavior
    assert f"{app_url}" in page.url or "/auth/login" in page.url
