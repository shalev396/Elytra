"""
Landing page (HOME) visual regression tests — page load verification.
"""
from playwright.sync_api import Page, expect


def test_landing_visual(page: Page, app_url: str):
    """Asserts the landing page loads at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(app_url)
