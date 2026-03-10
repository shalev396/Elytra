"""
Login page (auth/login) security checks — guest route redirect when authenticated.
"""
from playwright.sync_api import Page, expect

from tests.helpers.mailtm import login_page_with_user


def test_guest_route_redirects_authenticated(page: Page, app_url: str, shared_test_user):
    """Asserts an authenticated user visiting /auth/login is redirected to /dashboard."""
    login_page_with_user(page, app_url, shared_test_user)
    page.goto(f"{app_url}/auth/login", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(f"{app_url}/dashboard")
