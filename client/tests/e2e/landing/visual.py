"""
Landing page (HOME) visual regression tests — page load verification.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_landing_visual(page: Page, app_url: str):
    """Asserts the landing page loads at desktop viewport."""
    page.set_viewport_size(DESKTOP_VIEWPORT)
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(app_url)
