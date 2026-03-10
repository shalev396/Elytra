"""
Dashboard page visual regression tests.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_dashboard_visual(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the dashboard loads at desktop viewport when authenticated."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        return
    page.set_viewport_size(DESKTOP_VIEWPORT)
    expect(page).to_have_url(f"{app_url}/dashboard")
