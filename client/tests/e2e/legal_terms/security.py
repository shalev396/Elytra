"""
Terms of Service page (legal/terms) security checks.
"""
from playwright.sync_api import Page


def test_terms_no_tokens_in_visible_content(page: Page, app_url: str):
    """Asserts the terms page does not expose idToken or refreshToken in visible text."""
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
