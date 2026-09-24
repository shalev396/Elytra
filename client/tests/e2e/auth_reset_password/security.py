"""
Reset Password page (auth/reset-password) security checks — no token leakage.
"""
import pytest
from playwright.sync_api import Page


@pytest.mark.security
def test_reset_password_no_tokens_in_visible_content(page: Page, app_url: str):
    """Asserts the reset password page does not expose idToken or refreshToken in visible text."""
    page.goto(f"{app_url}/auth/reset-password?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
