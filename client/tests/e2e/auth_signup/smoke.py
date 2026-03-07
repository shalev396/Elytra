"""
Signup page (auth/signup) smoke tests.
"""
from playwright.sync_api import Page, expect

from tests.config import SHORT_TIMEOUT


def test_signup_loads(page: Page, app_url: str):
    """Asserts the signup page loads with Full Name, Email fields and Create Account button visible."""
    page.goto(f"{app_url}/auth/signup", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_label("Full Name")).to_be_visible()
    expect(page.get_by_label("Email")).to_be_visible()
    expect(page.get_by_role("button", name="Create Account")).to_be_visible()


def test_signup_password_mismatch_error(page: Page, app_url: str):
    """Asserts that submitting mismatched passwords shows a 'Passwords do not match' error."""
    page.goto(f"{app_url}/auth/signup", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.get_by_label("Full Name").fill("Test User", timeout=SHORT_TIMEOUT)
    page.get_by_label("Email").fill("test@example.com", timeout=SHORT_TIMEOUT)
    page.locator("#password").fill("Password123!", timeout=SHORT_TIMEOUT)
    page.get_by_label("Confirm Password").fill("DifferentPass123!", timeout=SHORT_TIMEOUT)
    page.get_by_role("button", name="Create Account").click(timeout=SHORT_TIMEOUT)
    expect(page.get_by_text("Passwords do not match", exact=False)).to_be_visible(timeout=SHORT_TIMEOUT)
