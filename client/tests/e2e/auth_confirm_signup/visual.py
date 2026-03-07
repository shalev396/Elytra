"""
Confirm Signup page (auth/confirm-signup) visual regression tests.
Without signup state, confirm-signup redirects to signup; we verify the redirect and signup loads at desktop viewport.
"""
from playwright.sync_api import Page, expect

from tests.viewports import DESKTOP_VIEWPORT


def test_confirm_signup_visual(page: Page, app_url: str):
    """Asserts confirm-signup redirects to signup and signup loads at desktop viewport."""
    page.set_viewport_size(DESKTOP_VIEWPORT)
    page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/signup")
    expect(page.get_by_label("Full Name")).to_be_visible()
