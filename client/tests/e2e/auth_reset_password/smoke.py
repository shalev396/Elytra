"""
Reset Password page (auth/reset-password) smoke tests.
"""
from playwright.sync_api import Page, expect


def test_reset_password_loads(page: Page, app_url: str):
    """Asserts the reset password page loads with Create new password text and Verification Code field visible."""
    page.goto(f"{app_url}/auth/reset-password?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text("Create new password")).to_be_visible()
    expect(page.get_by_label("Verification Code")).to_be_visible()
