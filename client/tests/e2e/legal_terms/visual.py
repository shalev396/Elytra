"""
Terms of Service page (legal/terms) visual regression tests.
"""
from pathlib import Path

from playwright.sync_api import Page

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "artifacts"


def test_terms_visual(page: Page, app_url: str):
    """Captures a screenshot of the terms page at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    path = ARTIFACTS_DIR / "terms.png"
    page.screenshot(path=path)
    assert path.exists()
