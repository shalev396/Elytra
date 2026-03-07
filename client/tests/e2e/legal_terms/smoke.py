"""
Terms of Service page (legal/terms) smoke tests.
"""
import re

from playwright.sync_api import Page, expect


def test_terms_loads(page: Page, app_url: str):
    """Asserts the terms page loads with a non-empty title and Terms of Service heading."""
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(re.compile(r".+"))
    expect(page.get_by_role("heading", name="Terms of Service")).to_be_visible(timeout=15000)


def test_terms_links_to_privacy(page: Page, app_url: str):
    """Asserts the terms page contains a link to Privacy Policy with correct href."""
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    link = page.get_by_role("link", name="Privacy Policy").first
    expect(link).to_be_visible(timeout=15000)
    expect(link).to_have_attribute("href", "/en/legal/privacy")
