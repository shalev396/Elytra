"""
Confirm Signup page (auth/confirm-signup) smoke tests.
"""
from playwright.sync_api import Page, expect


def test_confirm_signup_redirects_without_signup_state(page: Page, app_url: str):
    """Asserts that visiting confirm-signup without signup state redirects to /auth/signup."""
    page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/signup")
