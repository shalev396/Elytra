"""
Forgot Password page (auth/forgot-password) security checks — no token leakage.
"""
import pytest
from playwright.sync_api import Page


@pytest.mark.security
def test_forgot_password_no_tokens_in_visible_content(page: Page, app_url: str):
    """Asserts the forgot password page does not expose idToken or refreshToken in visible text."""
    page.goto(f"{app_url}/auth/forgot-password", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
