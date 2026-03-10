"""
Profile page (profile) smoke tests.
"""
import pytest
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui


def test_profile_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /profile are redirected to /auth/login."""
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")


def test_profile_elements_authenticated(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the profile page shows Profile heading, Edit Profile link, Send Test Email, Export, Delete Account when logged in."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Authentication fixture not available")
    expect(page.get_by_role("heading", name="Profile")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("link", name="Edit Profile")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("Send Test Email")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("Export my data")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("Delete Account")).to_be_visible(timeout=NORMAL_TIMEOUT)
