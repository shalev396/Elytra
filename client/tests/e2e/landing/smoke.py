"""
Landing page (HOME) smoke tests — page loads and critical elements visible.
"""
import re

from playwright.sync_api import Page, expect

from tests.config import NORMAL_TIMEOUT, SHORT_TIMEOUT


def test_landing_loads(page: Page, app_url: str):
    """Asserts the landing page loads with a non-empty title and visible heading/nav."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title(re.compile(r".+"))
    expect(page.get_by_role("heading").first).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("navigation").first).to_be_visible(timeout=NORMAL_TIMEOUT)


def test_app_shell_renders(page: Page, app_url: str):
    """Asserts the app shell (navigation, footer, main) renders on the landing page."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("navigation").first).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("contentinfo")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("main").first).to_be_visible(timeout=NORMAL_TIMEOUT)


def test_hero_section(page: Page, app_url: str):
    """Asserts the hero section shows template title, CTA text, and Try It Now link to signup."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text("Open Source Full-Stack Template")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_text("Build Serverless Apps")).to_be_visible(timeout=NORMAL_TIMEOUT)
    link = page.get_by_role("link", name="Try It Now")
    expect(link).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(link).to_have_attribute("href", "/en/auth/signup")


def test_navbar_and_footer(page: Page, app_url: str):
    """Asserts navbar (home, Get Started) and footer (Terms, Privacy, Pricing) are visible."""
    page.goto(app_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    nav = page.get_by_role("navigation").first
    expect(nav).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("link", name="Go to home").first).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(page.get_by_role("link", name="Get Started")).to_be_visible(timeout=NORMAL_TIMEOUT)
    footer = page.get_by_role("contentinfo")
    footer.scroll_into_view_if_needed(timeout=SHORT_TIMEOUT)
    expect(footer.get_by_role("link", name="Terms of Service")).to_be_visible(timeout=NORMAL_TIMEOUT)
    expect(footer.get_by_role("link", name="Privacy Policy")).to_be_visible(timeout=NORMAL_TIMEOUT)
