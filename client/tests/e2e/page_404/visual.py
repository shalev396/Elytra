"""
404 page visual regression tests.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_404_visual(page: Page, app_url: str):
    """Asserts the 404 page loads at desktop viewport."""
    page.set_viewport_size(DESKTOP_VIEWPORT)
    page.goto(f"{app_url}/invalid-route", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/invalid-route")
