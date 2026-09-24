"""
Forgot Password page (auth/forgot-password) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page
from tests.helpers.animations import wait_for_fade_in


def test_forgot_password_accessibility(page: Page, app_url: str):
    """Runs axe-core on the forgot password page; asserts no accessibility violations."""
    page.goto(f"{app_url}/auth/forgot-password", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    wait_for_fade_in(page)
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
