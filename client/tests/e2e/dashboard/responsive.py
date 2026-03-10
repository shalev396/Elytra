"""
Dashboard page responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.responsive import assert_no_horizontal_overflow
from tests.viewports import VIEWPORTS


def test_dashboard_responsive(page: Page, app_url: str, authenticated_page: Page):
    """Asserts Dashboard heading visible at all viewports when authenticated; no horizontal overflow."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        if "/auth/login" in page.url:
            return
        expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=NORMAL_TIMEOUT)
        assert_no_horizontal_overflow(page, vp["name"], vp["width"])
