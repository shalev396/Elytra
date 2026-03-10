"""
Helpers for E2E translation tests.
Collects visible text from pages and detects untranslated i18n keys.
"""
import re
from typing import NamedTuple

# i18next shows the key when a translation is missing. Keys follow namespace.subkey.rest
KNOWN_NAMESPACES = (
    "app",
    "aria",
    "auth",
    "common",
    "dashboard",
    "featuresPage",
    "footer",
    "landing",
    "legal",
    "nav",
    "notFound",
    "pricing",
    "profile",
    "theme",
)

# Pattern: namespace.subkey or namespace.subkey.more (catches keys like landing.hero.title)
KEY_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(n) for n in KNOWN_NAMESPACES) + r")\.[a-zA-Z0-9_.]+\b"
)


def get_visible_text(page) -> str:
    """Get all visible text from the page body."""
    return page.evaluate("() => document.body.innerText") or ""


def get_visible_translation_keys(text: str) -> list[str]:
    """
    Find substrings in visible text that look like untranslated i18n keys.
    Returns the list of key-like strings (e.g. 'landing.hero.title').
    """
    return KEY_PATTERN.findall(text)


class PageTranslationCheck(NamedTuple):
    """Page path and whether it requires auth."""

    path: str
    needs_auth: bool


# All pages to check. Path is relative to /:lng
TRANSLATION_PAGES: list[PageTranslationCheck] = [
    PageTranslationCheck("", False),
    PageTranslationCheck("pricing", False),
    PageTranslationCheck("auth/login", False),
    PageTranslationCheck("auth/signup", False),
    PageTranslationCheck("auth/forgot-password", False),
    PageTranslationCheck("auth/reset-password?email=test@example.com", False),
    PageTranslationCheck("auth/confirm-signup?email=test@example.com", False),
    PageTranslationCheck("legal/privacy", False),
    PageTranslationCheck("legal/terms", False),
    PageTranslationCheck("dashboard", True),
    PageTranslationCheck("profile", True),
    PageTranslationCheck("profile/edit", True),
    PageTranslationCheck("nonexistent-404-test", False),  # 404 page
]
