"""
Profile page (profile) responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui
from tests.helpers.responsive import assert_no_horizontal_overflow
from tests.viewports import VIEWPORTS


def test_profile_responsive(page: Page, app_url: str, authenticated_page: Page):
    """Asserts Profile heading visible at all viewports when authenticated; no horizontal overflow."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        return
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        expect(page.get_by_role("heading", name="Profile")).to_be_visible(timeout=NORMAL_TIMEOUT)
        assert_no_horizontal_overflow(page, vp["name"], vp["width"])
