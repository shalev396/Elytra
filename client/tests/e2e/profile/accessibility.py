"""
Profile page (profile) accessibility tests.
"""
import pytest
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.mailtm import navigate_to_profile_via_ui


def test_profile_accessibility(page: Page, app_url: str, authenticated_page: Page):
    """Runs axe-core on the profile page when authenticated; asserts no accessibility violations."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"


def test_modal_focus_delete_dialog(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the Delete Account button opens a dialog with Yes/Cancel buttons (modal focus/visibility)."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    if "/auth/login" in page.url:
        pytest.skip("Auth fixture not available")
    page.get_by_role("button", name="Delete Account").click(timeout=NORMAL_TIMEOUT)
    modal = page.get_by_role("alertdialog")
    expect(modal).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("button", name="Yes, delete my account")).to_be_visible()
    expect(page.get_by_role("button", name="Cancel")).to_be_visible()
