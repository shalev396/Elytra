"""
Reset Password page (auth/reset-password) visual regression tests.
"""
from pathlib import Path

from playwright.sync_api import Page

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "artifacts"


def test_reset_password_visual(page: Page, app_url: str):
    """Captures a screenshot of the reset password page at 1440x900."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{app_url}/auth/reset-password?email=test@example.com", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    path = ARTIFACTS_DIR / "reset-password.png"
    page.screenshot(path=path)
    assert path.exists()
