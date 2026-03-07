"""
404 page smoke tests.
"""
from playwright.sync_api import Page, expect


def test_404_loads(page: Page, app_url: str):
    """Asserts the 404 page shows a 404 heading and Go back home link for invalid routes."""
    page.goto(f"{app_url}/invalid-route-xyz", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", name="404")).to_be_visible()
    expect(page.get_by_role("link", name="Go back home")).to_be_visible()


def test_404_message(page: Page, app_url: str):
    """Asserts the 404 page displays the 'doesn't exist' error message."""
    page.goto(f"{app_url}/invalid-route-xyz", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text("doesn't exist")).to_be_visible()


def test_404_back_home_button(page: Page, app_url: str):
    """Asserts the Go back home link is visible and has correct href to /en."""
    page.goto(f"{app_url}/invalid-route-xyz", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    link = page.get_by_role("link", name="Go back home")
    expect(link).to_be_visible()
    expect(link).to_have_attribute("href", "/en")
