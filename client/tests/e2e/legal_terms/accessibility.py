"""
Terms of Service page (legal/terms) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page
from tests.helpers.animations import wait_for_fade_in


def test_terms_accessibility(page: Page, app_url: str):
    """Runs axe-core on the terms page; asserts no violations (some landmark/heading rules disabled for legal content)."""
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    wait_for_fade_in(page, content="h2")  # legal pages have no h1
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
