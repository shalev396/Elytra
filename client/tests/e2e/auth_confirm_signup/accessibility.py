"""
Confirm Signup page (auth/confirm-signup) accessibility tests.
"""
import pytest
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page


def test_confirm_signup_accessibility(page: Page, app_url: str):
    """Runs axe-core on the confirm signup page; skips if redirected to signup (no signup state)."""
    page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/signup" in page.url:
        pytest.skip("Confirm page redirects without signup state")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
