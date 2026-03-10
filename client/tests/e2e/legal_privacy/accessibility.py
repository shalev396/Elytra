"""
Privacy Policy page (legal/privacy) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page


def test_privacy_accessibility(page: Page, app_url: str):
    """Runs axe-core on the privacy page; asserts no violations (some landmark/heading rules disabled for legal content)."""
    page.goto(f"{app_url}/legal/privacy", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    axe = Axe()
    results = axe.run(
        page,
        options={
            "rules": {
                "landmark-one-main": {"enabled": False},
                "page-has-heading-one": {"enabled": False},
                "region": {"enabled": False},
            }
        },
    )
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
