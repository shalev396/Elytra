"""Take screenshot on test failure and return path for pytest-html."""
import re
from pathlib import Path

ERRORS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts" / "errors"


def take_screenshot_on_failure(page, item) -> Path | None:
    """Capture screenshot, save to artifacts/errors/, return absolute path. Returns None if page unavailable."""
    ERRORS_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = re.sub(r"[^\w\-]", "_", item.nodeid)[:120]
    path = (ERRORS_DIR / f"{safe_id}.png").resolve()
    page.screenshot(path=str(path))
    return path
