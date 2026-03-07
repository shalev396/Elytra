"""
Signup page (auth/signup) smoke tests.
"""
from playwright.sync_api import Page, expect


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
    page.get_by_label("Full Name").fill("Test User", timeout=10000)
    page.get_by_label("Email").fill("test@example.com", timeout=10000)
    page.get_by_label("Password").fill("Password123!", timeout=10000)
    page.get_by_label("Confirm Password").fill("DifferentPass123!", timeout=10000)
    page.get_by_role("button", name="Create Account").click(timeout=10000)
    expect(page.get_by_text("Passwords do not match", exact=False)).to_be_visible(timeout=10000)
