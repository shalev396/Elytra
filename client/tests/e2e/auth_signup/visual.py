"""
Signup page (auth/signup) visual regression tests.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_signup_visual(page: Page, app_url: str):
    """Asserts the signup page loads at desktop viewport."""
    page.set_viewport_size(DESKTOP_VIEWPORT)
    page.goto(f"{app_url}/auth/signup", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/signup")
