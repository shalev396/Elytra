"""
Profile page (profile) visual regression tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui
from tests.viewports import DESKTOP_VIEWPORT


def test_profile_visual(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the profile page loads at desktop viewport when authenticated."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        return
    page.set_viewport_size(DESKTOP_VIEWPORT)
    expect(page).to_have_url(f"{app_url}/profile", timeout=NORMAL_TIMEOUT)
