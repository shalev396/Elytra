"""
Pricing page visual regression tests.
"""
from pathlib import Path

from playwright.sync_api import Page


ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "artifacts"


def test_pricing_visual(page: Page, app_url: str):
    """Captures a screenshot of the pricing page at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{app_url}/pricing", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    path = ARTIFACTS_DIR / "pricing.png"
    page.screenshot(path=path)
    assert path.exists()
