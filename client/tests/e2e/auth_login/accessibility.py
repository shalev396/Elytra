"""
Login page (auth/login) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect


def test_login_accessibility(page: Page, app_url: str):
    """Runs axe-core on the login page; asserts no accessibility violations."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"


def test_login_form_labels(page: Page, app_url: str):
    """Asserts Email and Password form fields have associated labels (a11y)."""
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_label("Email")).to_be_visible()
    expect(page.get_by_label("Password")).to_be_visible()
