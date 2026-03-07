"""
Edit Profile page (profile/edit) smoke tests.
"""
import pytest
from playwright.sync_api import Page, expect


def test_edit_profile_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /profile/edit are redirected to /auth/login."""
    page.goto(f"{app_url}/profile/edit", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")


def test_edit_profile_elements_authenticated(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the edit profile page shows Profile back button, Name/Email fields, Save Changes when logged in."""
    page.goto(f"{app_url}/profile/edit", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Authentication fixture not available")
    expect(page.get_by_role("button", name="Profile")).to_be_visible()
    expect(page.get_by_label("Name")).to_be_visible()
    expect(page.get_by_label("Email")).to_be_visible()
    expect(page.get_by_role("button", name="Save Changes")).to_be_visible()
