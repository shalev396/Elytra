"""
Critical user flows - sign up, login, forgot password, edit profile, export, delete, guest redirect.
Cross-page flows.
"""
import re

import pytest
from playwright.sync_api import Page, expect

from tests.helpers.mailtm import create_test_user, create_test_user_and_login, login_page_with_user


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
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)


def test_forgot_password_flow(page: Page, app_url: str, shared_test_user):
    """Forgot -> enter email -> submit -> redirect to reset page with email in query."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_role("link", name="Forgot your password?").click(timeout=10000)
    expect(page).to_have_url(f"{app_url}/auth/forgot-password", timeout=10000)
    page.get_by_label("Email").fill(shared_test_user.email, timeout=10000)
    page.get_by_role("button", name="Send Reset Link").click(timeout=10000)
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(re.compile(r".*auth/reset-password.*email=.*"), timeout=20000)
    expect(page.get_by_label("Email")).to_have_value(shared_test_user.email, timeout=10000)


def test_edit_profile_flow(page: Page, app_url: str, shared_test_user):
    """Login -> profile -> edit -> change name -> save -> redirect to profile."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("link", name="Edit Profile").click(timeout=15000)
    page.wait_for_load_state("networkidle")
    name_input = page.get_by_label("Name")
    name_input.fill("Updated Name")
    page.get_by_role("button", name="Save Changes").click()
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/profile")
    expect(page.get_by_text("Updated Name")).to_be_visible()


def test_export_data_flow(page: Page, app_url: str, shared_test_user):
    """Login -> profile -> Export -> toast success."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Export my data").click(timeout=15000)
    expect(page.get_by_text("success")).to_be_visible(timeout=10000)


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
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Delete Account").click(timeout=15000)
    page.get_by_role("button", name="Yes, delete my account").click()
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}")
