"""
Confirm Signup page (auth/confirm-signup) visual regression tests.
Without state, confirm-signup redirects to login; we verify the redirect and login loads at desktop viewport.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_confirm_signup_visual(page: Page, app_url: str):
    """Asserts confirm-signup redirects to login and login loads at desktop viewport."""
    page.set_viewport_size(DESKTOP_VIEWPORT)
    page.goto(f"{app_url}/auth/confirm-signup", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")
    expect(page.get_by_label("Email")).to_be_visible()
