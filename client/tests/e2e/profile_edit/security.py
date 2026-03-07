"""
Edit Profile page (profile/edit) security checks — protected route redirect.
"""
from playwright.sync_api import Page, expect


def test_protected_edit_profile_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /profile/edit are redirected to /auth/login."""
    page.goto(f"{app_url}/profile/edit", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")
