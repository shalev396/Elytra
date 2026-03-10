"""
Confirm Signup page (auth/confirm-signup) responsive tests.
Without signup state, confirm-signup redirects to signup; we verify signup page renders at all viewports.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.responsive import assert_no_horizontal_overflow
from tests.viewports import VIEWPORTS


def test_confirm_signup_responsive(page: Page, app_url: str):
    """Asserts confirm-signup redirects to signup; signup content visible at all viewports; no horizontal overflow."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(f"{app_url}/auth/signup", timeout=NORMAL_TIMEOUT)
        expect(page.get_by_label("Full Name")).to_be_visible(timeout=NORMAL_TIMEOUT)
        expect(page.get_by_role("button", name="Create Account")).to_be_visible(timeout=NORMAL_TIMEOUT)
        assert_no_horizontal_overflow(page, vp["name"], vp["width"])
