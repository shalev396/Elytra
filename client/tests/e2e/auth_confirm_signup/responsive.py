"""
Confirm Signup page (auth/confirm-signup) responsive tests.
Without state, confirm-signup redirects to login; we verify login page renders at all viewports.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.responsive import assert_no_horizontal_overflow
from tests.viewports import VIEWPORTS


def test_confirm_signup_responsive(page: Page, app_url: str):
    """Asserts confirm-signup redirects to login; login content visible at all viewports; no horizontal overflow."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/auth/confirm-signup", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(f"{app_url}/auth/login", timeout=NORMAL_TIMEOUT)
        expect(page.get_by_label("Email")).to_be_visible(timeout=NORMAL_TIMEOUT)
        expect(page.get_by_role("button", name="Login", exact=True)).to_be_visible(timeout=NORMAL_TIMEOUT)
        assert_no_horizontal_overflow(page, vp["name"], vp["width"])
