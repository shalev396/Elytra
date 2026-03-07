"""
Reset Password page (auth/reset-password) visual regression tests.
"""
import re

from playwright.sync_api import Page, expect


def test_reset_password_visual(page: Page, app_url: str):
    """Asserts the reset password page loads at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{app_url}/auth/reset-password?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(re.compile(rf".*{re.escape(app_url)}/auth/reset-password(\?.*)?"))
