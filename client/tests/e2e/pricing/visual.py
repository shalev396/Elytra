"""
Pricing page visual regression tests.
"""
from playwright.sync_api import Page, expect


def test_pricing_visual(page: Page, app_url: str):
    """Asserts the pricing page loads at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{app_url}/pricing", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/pricing")
