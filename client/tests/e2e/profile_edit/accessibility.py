"""
Edit Profile page (profile/edit) accessibility tests.
"""
import pytest
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page


def test_edit_profile_accessibility(page: Page, app_url: str, authenticated_page: Page):
    """Runs axe-core on the edit profile page when authenticated; asserts no accessibility violations."""
    page.goto(f"{app_url}/profile/edit", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
