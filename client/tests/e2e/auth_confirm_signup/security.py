"""
Confirm Signup page (auth/confirm-signup) security checks.
Without state, confirm-signup redirects to login; we assert no token leakage on the resulting page.
"""
import pytest
from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT


@pytest.mark.security
def test_confirm_signup_no_tokens_in_visible_content(page: Page, app_url: str):
    """Asserts the page (login after redirect) does not expose idToken or refreshToken in visible text."""
    page.goto(f"{app_url}/auth/confirm-signup", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login", timeout=NORMAL_TIMEOUT)
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text


@pytest.mark.security
def test_confirm_signup_query_string_does_not_bypass_state(page: Page, app_url: str):
    """Asserts ?email= in the URL does not replace the signup router state: the page still
    redirects to login and exposes no tokens."""
    page.goto(f"{app_url}/auth/confirm-signup?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login", timeout=NORMAL_TIMEOUT)
    visible_text = page.locator("body").inner_text()
    assert "idToken" not in visible_text
    assert "refreshToken" not in visible_text
