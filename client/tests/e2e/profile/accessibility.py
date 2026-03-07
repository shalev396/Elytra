"""
Profile page (profile) accessibility tests.
"""
import pytest
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect


def test_profile_accessibility(page: Page, app_url: str, authenticated_page: Page):
    """Runs axe-core on the profile page when authenticated; asserts no accessibility violations."""
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"


def test_modal_focus_delete_dialog(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the Delete Account button opens a dialog with Yes/Cancel buttons (modal focus/visibility)."""
    page.goto(f"{app_url}/profile", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Delete Account").click(timeout=15000)
    modal = page.get_by_role("dialog")
    expect(modal).to_be_visible()
    expect(page.get_by_role("button", name="Yes, delete my account")).to_be_visible()
    expect(page.get_by_role("button", name="Cancel")).to_be_visible()
