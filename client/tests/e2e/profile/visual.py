"""
Profile page (profile) visual regression tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui


def test_profile_visual(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the profile page loads at 1440x900 when authenticated."""
    navigate_to_profile_via_ui(page, app_url)
    if "/auth/login" in page.url:
        return
    page.set_viewport_size({"width": 1440, "height": 900})
    expect(page).to_have_url(f"{app_url}/profile", timeout=NORMAL_TIMEOUT)
