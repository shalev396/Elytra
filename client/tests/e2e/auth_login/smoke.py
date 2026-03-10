"""
Login page (auth/login) smoke tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT


def test_login_loads(page: Page, app_url: str):
    """Asserts the login page loads with Email, Password fields and Login button visible."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_label("Email")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_label("Password")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("button", name="Login", exact=True)).to_be_visible(timeout=NORMAL_TIMEOUT)


def test_login_form_elements(page: Page, app_url: str):
    """Asserts login page shows Welcome back, Forgot password link, and Sign up link."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text("Welcome back")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("link", name="Forgot your password?")).to_be_visible()
    expect(page.get_by_role("link", name="Sign up")).to_be_visible()
