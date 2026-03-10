"""
Terms of Service page (legal/terms) responsive tests.
"""
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT
from tests.helpers.responsive import assert_no_horizontal_overflow
from tests.viewports import VIEWPORTS


def test_terms_responsive(page: Page, app_url: str):
    """Asserts Terms of Service heading visible at all viewports; no horizontal overflow."""
    for vp in VIEWPORTS:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("Terms of Service", exact=True).first).to_be_visible(timeout=NORMAL_TIMEOUT)
        assert_no_horizontal_overflow(page, vp["name"], vp["width"])
