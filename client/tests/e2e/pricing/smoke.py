"""
Pricing page smoke tests.
"""
import re

from playwright.sync_api import Page, expect


def test_pricing_loads(page: Page, app_url: str):
    """Asserts the pricing page loads with a non-empty title and 'transparent pricing' text visible."""
    page.goto(f"{app_url}/pricing", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(re.compile(r".+"))
    expect(page.get_by_text("transparent pricing")).to_be_visible(timeout=10000)


def test_pricing_plans_and_cta(page: Page, app_url: str):
    """Asserts the pricing page shows Free plan, Monthly/Yearly toggles, and FAQ heading."""
    page.goto(f"{app_url}/pricing", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", name="Free")).to_be_visible()
    expect(page.get_by_role("button", name="Monthly")).to_be_visible()
    expect(page.get_by_role("button", name="Yearly")).to_be_visible()
    expect(page.get_by_role("heading", name="Frequently Asked Questions")).to_be_visible()
