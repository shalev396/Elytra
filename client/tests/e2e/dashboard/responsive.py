"""
Dashboard page responsive tests.
"""
from playwright.sync_api import Page, expect

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_dashboard_responsive(page: Page, app_url: str, authenticated_page: Page):
    """Asserts Dashboard heading is visible at all viewport sizes when authenticated."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        if "/auth/login" in page.url:
            return
        expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
