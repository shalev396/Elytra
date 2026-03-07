"""
Landing page (HOME) responsive tests — mobile, tablet, desktop viewports.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_landing_responsive(page: Page, app_url: str):
    """Asserts navigation and main content are visible at mobile, tablet, and desktop viewports."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(app_url, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        nav = page.get_by_role("navigation").first
        expect(nav).to_be_visible(timeout=NORMAL_TIMEOUT)
        main = page.get_by_role("main").first
        expect(main).to_be_visible(timeout=NORMAL_TIMEOUT)
