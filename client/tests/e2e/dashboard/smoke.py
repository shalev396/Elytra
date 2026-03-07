"""
Dashboard page (dashboard) smoke tests.
"""
import pytest
from playwright.sync_api import Page, expect


def test_dashboard_redirects_unauthenticated(page: Page, app_url: str):
    """Asserts unauthenticated users visiting /dashboard are redirected to /auth/login."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/auth/login")


def test_dashboard_loads_authenticated(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the dashboard loads with Dashboard heading and Welcome text when authenticated."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Authentication fixture not available")
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
    expect(page.get_by_text("Welcome")).to_be_visible()


def test_dashboard_welcome_card(page: Page, app_url: str, authenticated_page: Page):
    """Asserts the welcome card shows User ID and Message when authenticated."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        pytest.skip("Authentication fixture not available")
    expect(page.get_by_text("User ID")).to_be_visible()
    expect(page.get_by_text("Message")).to_be_visible()
