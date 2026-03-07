"""
Signup page (auth/signup) responsive tests.
"""
from playwright.sync_api import Page, expect

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_signup_responsive(page: Page, app_url: str):
    """Asserts Full Name and Create Account button are visible at all viewport sizes."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/auth/signup", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_label("Full Name")).to_be_visible()
        expect(page.get_by_role("button", name="Create Account")).to_be_visible()
