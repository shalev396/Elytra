"""
Confirm Signup page (auth/confirm-signup) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect


def test_confirm_signup_accessibility(page: Page, app_url: str):
    """Asserts confirm-signup redirects to signup when no signup state, then runs axe on signup page."""
    page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/signup")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
