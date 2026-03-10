"""
Privacy Policy page (legal/privacy) smoke tests.
"""
import re

from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT


def test_privacy_loads(page: Page, app_url: str):
    """Asserts the privacy policy page loads with a non-empty title and Privacy Policy heading."""
    page.goto(f"{app_url}/legal/privacy", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(re.compile(r".+"))
    expect(page.get_by_text("Privacy Policy", exact=True).first).to_be_visible(timeout=NORMAL_TIMEOUT)


def test_privacy_links_to_terms(page: Page, app_url: str):
    """Asserts the privacy page contains a link to Terms of Service with correct href."""
    page.goto(f"{app_url}/legal/privacy", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    link = page.get_by_role("link", name="Terms of Service").first
    expect(link).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(link).to_have_attribute("href", "/en/legal/terms")
