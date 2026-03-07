"""
Forgot Password page (auth/forgot-password) smoke tests.
"""
from playwright.sync_api import Page, expect


def test_forgot_password_loads(page: Page, app_url: str):
    """Asserts the forgot password page loads with Reset your password text and Email field visible."""
    page.goto(f"{app_url}/auth/forgot-password", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text("Reset your password")).to_be_visible()
    expect(page.get_by_label("Email")).to_be_visible()
