"""
Dashboard page accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page
from tests.helpers.animations import wait_for_fade_in


def test_dashboard_accessibility(page: Page, app_url: str, authenticated_page: Page):
    """Runs axe-core on the dashboard when authenticated; asserts no accessibility violations."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    wait_for_fade_in(page)
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
