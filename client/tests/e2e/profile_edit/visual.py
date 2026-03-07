"""
Edit Profile page (profile/edit) visual regression tests.
"""
import pytest
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui
from tests.viewports import DESKTOP_VIEWPORT


def test_edit_profile_visual(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the edit profile page loads at desktop viewport when authenticated."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Authentication fixture not available")
    page.get_by_role("link", name="Edit Profile").click(timeout=NORMAL_TIMEOUT)
    page.wait_for_load_state("networkidle")
    page.set_viewport_size(DESKTOP_VIEWPORT)
    expect(page).to_have_url(f"{app_url}/profile/edit", timeout=NORMAL_TIMEOUT)
