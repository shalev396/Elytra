"""
Login page (auth/login) responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_login_responsive(page: Page, app_url: str):
    """Asserts Email and Login button are visible at mobile, tablet, and desktop viewports."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_label("Email")).to_be_visible(timeout=NORMAL_TIMEOUT)
        expect(page.get_by_role("button", name="Login", exact=True)).to_be_visible(timeout=NORMAL_TIMEOUT)
