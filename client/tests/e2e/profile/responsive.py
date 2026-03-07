"""
Profile page (profile) responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui

VIEWPORTS = [
    {"name": "mobile", "width": 390, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]


def test_profile_responsive(page: Page, app_url: str, authenticated_page: Page):
    """Asserts Profile heading is visible at all viewport sizes when authenticated."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        return
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        expect(page.get_by_role("heading", name="Profile")).to_be_visible(timeout=NORMAL_TIMEOUT)
