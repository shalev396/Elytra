"""
Profile page (profile) security checks — protected route and token leakage.
"""
from playwright.sync_api import Page, expect

from tests.helpers.mailtm import login_page_with_user


def test_protected_profile_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /profile are redirected to /auth/login."""
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")


def test_no_tokens_in_visible_content(page: Page, app_url: str, shared_test_user):
    """Asserts auth tokens (idToken, refreshToken) are not exposed in visible page text on the profile page."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        return
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
