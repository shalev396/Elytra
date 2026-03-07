"""
Dashboard page security-adjacent checks - protected route redirects.
"""
from playwright.sync_api import Page, expect


def test_protected_route_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /dashboard are redirected to /auth/login."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")
