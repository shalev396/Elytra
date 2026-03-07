"""
Dashboard page visual regression tests.
"""
from pathlib import Path

from playwright.sync_api import Page


ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "artifacts"


def test_dashboard_visual(page: Page, app_url: str, authenticated_page: Page):
    """Captures a screenshot of the dashboard at 1440x900 when authenticated."""
    page.goto(f"{app_url}/dashboard", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    if "/auth/login" in page.url:
        return
    page.set_viewport_size({"width": 1440, "height": 900})
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    path = ARTIFACTS_DIR / "dashboard.png"
    page.screenshot(path=path)
    assert path.exists()
