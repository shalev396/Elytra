"""
404 page security checks.
"""
from playwright.sync_api import Page


def test_404_no_tokens_in_visible_content(page: Page, app_url: str):
    """Asserts the 404 page does not expose idToken or refreshToken in visible text."""
    page.goto(f"{app_url}/invalid-route-xyz", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
