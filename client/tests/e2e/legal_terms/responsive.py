"""
Terms of Service page (legal/terms) responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_terms_responsive(page: Page, app_url: str):
    """Asserts Terms of Service heading is visible at all viewport sizes."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("Terms of Service", exact=True).first).to_be_visible(timeout=NORMAL_TIMEOUT)
