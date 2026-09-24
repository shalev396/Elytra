"""
Edit Profile page (profile/edit) accessibility tests.
"""
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.animations import wait_for_fade_in
from tests.helpers.mailtm import navigate_to_profile_via_ui


def test_edit_profile_accessibility(page: Page, app_url: str, authenticated_page: Page):
    """Runs axe-core on the edit profile page when authenticated; asserts no accessibility violations."""
    navigate_to_profile_via_ui(page, app_url, timeout_ms=NORMAL_TIMEOUT)
    assert "/auth/login" not in page.url, "Authentication failed: redirected to login page"
    page.get_by_role("link", name="Edit Profile").click(timeout=NORMAL_TIMEOUT)
    page.wait_for_load_state("networkidle")
    # Client-side navigation keeps the profile page (and its h1) on screen until the edit page's
    # chunk loads, so wait for the edit page itself before waiting for its fade-in.
    expect(page.get_by_role("heading", level=1, name="Edit Profile")).to_be_visible(
        timeout=NORMAL_TIMEOUT
    )
    wait_for_fade_in(page)
    axe = Axe()
    results = axe.run(page)
    violations = results.response.get("violations", [])
    assert violations == [], f"Accessibility violations: {violations}"
