"""
Helpers for responsive E2E tests.
"""
from playwright.sync_api import Page


def assert_no_horizontal_overflow(page: Page, viewport_name: str, viewport_width: int) -> None:
    """Fails the test if horizontal scrollbar/overflow is detected.
    Call after loading the page at a given viewport.
    """
    scroll_width = page.evaluate(
        """() => Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth
    )"""
    )
    inner_width = page.evaluate("() => window.innerWidth")
    if scroll_width > inner_width:
        raise AssertionError(
            f"Horizontal overflow detected at viewport '{viewport_name}': "
            f"scrollWidth={scroll_width} > viewport width={viewport_width} (innerWidth={inner_width})"
        )
