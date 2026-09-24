"""
App-wide smoke tests. Needs only the client; no backend calls.

- Home Screen web app: the metadata, manifest and icons iOS "Add to Home Screen" (and Android
  install) read.
- Logo: a failing logo image must not reload itself forever (such a request storm keeps
  networkidle from ever firing).
- theme-color: the browser UI color follows the app theme.
"""
import re
import struct

import pytest
from playwright.sync_api import Page, Route, expect

from tests.config import NORMAL_TIMEOUT


APP_NAME = "Elytra"
THEME_STORAGE_KEY = "elytra-ui-theme"
# Hex of --background in index.css (light: oklch(0.99 0.005 270), dark: oklch(0.12 0.02 270))
THEME_COLORS = {"light": "#fafcff", "dark": "#04050d"}


def _png_size(body: bytes) -> tuple[int, int]:
    """Width and height from a PNG's IHDR chunk."""
    assert body[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    assert body[12:16] == b"IHDR", "PNG does not start with an IHDR chunk"
    return struct.unpack(">II", body[16:24])


def _corner_alphas(page: Page, url: str) -> list[int]:
    """Alpha of the four corner pixels. iOS paints transparent icon pixels black."""
    return page.evaluate(
        """async (url) => {
            const img = new Image();
            img.src = url;
            await img.decode();
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const w = canvas.width - 1;
            const h = canvas.height - 1;
            return [[0, 0], [w, 0], [0, h], [w, h]].map(
                ([x, y]) => ctx.getImageData(x, y, 1, 1).data[3]
            );
        }""",
        url,
    )


@pytest.mark.smoke
def test_home_screen_meta_tags(page: Page, app_url: str):
    """Asserts index.html links the manifest and carries the iOS web app tags."""
    page.goto(app_url, wait_until="domcontentloaded")
    expect(page.locator('link[rel="manifest"]')).to_have_attribute("href", "/manifest.webmanifest")
    expect(page.locator('link[rel="apple-touch-icon"]')).to_have_attribute(
        "href", "/apple-touch-icon.png"
    )
    expect(page.locator('meta[name="apple-mobile-web-app-title"]')).to_have_attribute(
        "content", APP_NAME
    )
    expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).to_have_attribute(
        "content", "black-translucent"
    )
    expect(page.locator('meta[name="viewport"]')).to_have_attribute(
        "content", re.compile(r"viewport-fit=cover")
    )


@pytest.mark.smoke
def test_manifest_and_icons(page: Page, base_url: str):
    """Asserts the manifest opens standalone at / and every icon is an opaque PNG of its size."""
    res = page.request.get(f"{base_url}/manifest.webmanifest")
    assert res.ok, f"manifest: {res.status}"
    manifest = res.json()
    assert manifest["name"] == APP_NAME
    assert manifest["short_name"] == APP_NAME
    assert manifest["id"] == "/"
    assert manifest["start_url"] == "/"
    assert manifest["scope"] == "/"
    assert manifest["display"] == "standalone"
    assert manifest["background_color"] == THEME_COLORS["dark"]
    assert manifest["theme_color"] == THEME_COLORS["dark"]

    page.goto(base_url, wait_until="domcontentloaded")
    purposes = set()
    for icon in manifest["icons"]:
        icon_res = page.request.get(f"{base_url}{icon['src']}")
        assert icon_res.ok, f"{icon['src']}: {icon_res.status}"
        assert icon_res.headers["content-type"].startswith("image/png"), icon["src"]
        width, height = _png_size(icon_res.body())
        assert f"{width}x{height}" == icon["sizes"], icon["src"]
        assert _corner_alphas(page, icon["src"]) == [255] * 4, f"{icon['src']} has transparent corners"
        purposes.add(icon.get("purpose", "any"))
    assert {"any", "maskable"} <= purposes


@pytest.mark.smoke
def test_apple_touch_icon(page: Page, base_url: str):
    """Asserts the iOS home screen icon is an opaque 180x180 PNG."""
    res = page.request.get(f"{base_url}/apple-touch-icon.png")
    assert res.ok, f"apple-touch-icon: {res.status}"
    assert _png_size(res.body()) == (180, 180)
    page.goto(base_url, wait_until="domcontentloaded")
    assert _corner_alphas(page, "/apple-touch-icon.png") == [255] * 4


@pytest.mark.smoke
def test_failing_logo_is_not_reloaded_forever(page: Page, app_url: str):
    """Asserts a logo that fails to load is not requested again and again."""
    logo_requests: list[str] = []

    def fail_logo(route: Route) -> None:
        logo_requests.append(route.request.url)
        route.fulfill(status=404, body="")

    # Playwright defaults to a light color scheme, so the app shows the light logo.
    page.route("**/favicon-light.svg", fail_logo)
    page.goto(f"{app_url}/legal/terms", wait_until="domcontentloaded")
    expect(page.get_by_role("contentinfo")).to_be_visible(timeout=NORMAL_TIMEOUT)
    # A reload loop issues hundreds of requests per second: the count keeps growing.
    page.wait_for_timeout(1_000)
    settled = len(logo_requests)
    page.wait_for_timeout(1_500)
    assert len(logo_requests) == settled, f"logo still reloading: {settled} -> {len(logo_requests)}"
    # Tab favicon plus the NavBar and Footer <img>s (dev StrictMode runs effects twice)
    assert settled < 10, f"logo requested {settled} times"


@pytest.mark.smoke
def test_theme_color_follows_theme(page: Page, app_url: str):
    """Asserts every theme-color tag matches the page background in light (the default here) and
    dark theme."""
    # With nothing stored the app follows the OS, and Playwright's default color scheme is light.
    page.goto(app_url, wait_until="domcontentloaded")
    theme_colors = page.locator('meta[name="theme-color"]')
    expect(theme_colors).to_have_count(2)
    for i in range(2):
        expect(theme_colors.nth(i)).to_have_attribute("content", THEME_COLORS["light"])

    page.evaluate("key => localStorage.setItem(key, 'dark')", THEME_STORAGE_KEY)
    page.reload(wait_until="domcontentloaded")
    for i in range(2):
        expect(theme_colors.nth(i)).to_have_attribute("content", THEME_COLORS["dark"])
