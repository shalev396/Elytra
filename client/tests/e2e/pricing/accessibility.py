"""
Pricing page accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page


def test_pricing_accessibility(page: Page, app_url: str):
    """Runs axe-core on the pricing page; asserts no accessibility violations."""
    page.goto(f"{app_url}/pricing", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
