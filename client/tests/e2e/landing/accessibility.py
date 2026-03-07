"""
Landing page (HOME) accessibility tests — axe scans and heading hierarchy.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect


def test_landing_accessibility(page: Page, app_url: str):
    """Runs axe-core on the landing page; asserts no accessibility violations (some landmark rules disabled)."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    axe = Axe()
    results = axe.run(
        page,
        options={
            "rules": {
                "landmark-main-is-top-level": {"enabled": False},
                "landmark-no-duplicate-main": {"enabled": False},
                "landmark-unique": {"enabled": False},
            }
        },
    )
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"


def test_heading_hierarchy(page: Page, app_url: str):
    """Asserts the page has a visible h1 heading for proper heading hierarchy."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", level=1)).to_be_visible()
