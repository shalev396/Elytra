"""
E2E translation tests: visit each page in two languages and verify all text is translated.

Flow:
  1. Visit page in language A (en), collect all visible text
  2. Visit same page in language B (he), collect all visible text
  3. Assert no i18n keys (e.g. landing.hero.title) are visible on either page
  4. Assert the two pages differ where translations exist (catches pages stuck in one language)

Pages that need auth use authenticated_page.
"""
import pytest
from playwright.sync_api import Page

from tests.helpers.translation_utils import (
    TRANSLATION_PAGES,
    PageTranslationCheck,
    get_visible_text,
    get_visible_translation_keys,
)


def _get_page(page: Page, request: pytest.FixtureRequest, needs_auth: bool) -> Page:
    """Use authenticated_page for protected routes, else page."""
    if needs_auth:
        return request.getfixturevalue("authenticated_page")
    return page


def _build_url(base_url: str, lng: str, path: str) -> str:
    """Build full URL: base_url/lng/path (e.g. http://localhost:5173/en/pricing)."""
    base = base_url.rstrip("/")
    path = path.strip("/")
    return f"{base}/{lng}/{path}" if path else f"{base}/{lng}"


@pytest.mark.parametrize("page_check", TRANSLATION_PAGES, ids=lambda p: p.path or "home")
def test_page_has_no_untranslated_keys(
    page: Page,
    request: pytest.FixtureRequest,
    base_url: str,
    page_check: PageTranslationCheck,
):
    """
    Visit page in en and he; assert no translation keys are visible.
    Missing translations cause i18next to show the key (e.g. landing.hero.title).
    """
    active_page = _get_page(page, request, page_check.needs_auth)
    url_en = _build_url(base_url, "en", page_check.path)
    url_he = _build_url(base_url, "he", page_check.path)

    # Visit English version
    active_page.goto(url_en, wait_until="domcontentloaded")
    active_page.wait_for_load_state("networkidle")
    text_en = get_visible_text(active_page)
    keys_en = get_visible_translation_keys(text_en)
    assert not keys_en, (
        f"Page {page_check.path} (en): found untranslated keys: {keys_en[:10]}"
    )

    # Visit Hebrew version
    active_page.goto(url_he, wait_until="domcontentloaded")
    active_page.wait_for_load_state("networkidle")
    text_he = get_visible_text(active_page)
    keys_he = get_visible_translation_keys(text_he)
    assert not keys_he, (
        f"Page {page_check.path} (he): found untranslated keys: {keys_he[:10]}"
    )


@pytest.mark.parametrize("page_check", TRANSLATION_PAGES, ids=lambda p: p.path or "home")
def test_page_text_differs_between_languages(
    page: Page,
    request: pytest.FixtureRequest,
    base_url: str,
    page_check: PageTranslationCheck,
):
    """
    Visit page in en and he; assert visible text differs.
    If both pages show identical English text, translations may not be applied.
    """
    active_page = _get_page(page, request, page_check.needs_auth)
    url_en = _build_url(base_url, "en", page_check.path)
    url_he = _build_url(base_url, "he", page_check.path)

    active_page.goto(url_en, wait_until="domcontentloaded")
    active_page.wait_for_load_state("networkidle")
    text_en = get_visible_text(active_page)

    active_page.goto(url_he, wait_until="domcontentloaded")
    active_page.wait_for_load_state("networkidle")
    text_he = get_visible_text(active_page)

    # Normalize whitespace for comparison
    norm_en = " ".join(text_en.split())
    norm_he = " ".join(text_he.split())

    assert norm_en != norm_he, (
        f"Page {page_check.path}: en and he show identical text — translations may not be applied"
    )
