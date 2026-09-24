"""Take screenshot on test failure and return path for pytest-html."""
import re
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError

from tests.config import SHORT_TIMEOUT

ERRORS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts" / "errors"


def take_screenshot_on_failure(page, item) -> Path | None:
    """Capture screenshot, save to artifacts/errors/, return absolute path. Returns None if page unavailable."""
    ERRORS_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = re.sub(r"[^\w\-]", "_", item.nodeid)[:120]
    path = (ERRORS_DIR / f"{safe_id}.png").resolve()
    try:
        page.screenshot(path=str(path), timeout=SHORT_TIMEOUT)
    except PlaywrightError:
        # A hung or closed page (e.g. fonts that never finish loading) must not raise here: this
        # runs inside pytest_runtest_makereport, where an exception crashes the xdist worker and
        # aborts the whole run with INTERNALERROR instead of reporting one failed test.
        return None
    return path
