"""Wait for entrance animations before measuring what the user sees.

FadeContent (src/components/animations/FadeContent.tsx) starts hidden (translate-y-10 opacity-0)
and fades in over a second once it scrolls into view. axe-core computes text contrast with the
element's current opacity, so scanning mid-fade reports half-transparent text as a contrast
violation. With reduced motion (the suite's default, see conftest.py) FadeContent skips the fade,
so this wait returns as soon as the content is rendered.

Routes are lazy: until a route's chunk loads, the app shows only a spinner (no <main>, no <h1>),
and on a busy CPU `networkidle` can fire before that chunk is even requested. So the page's own
content must be in the DOM too, or there is nothing fading yet and the wait passes too early.

The selector below is tied to FadeContent's class names: update both together."""

from playwright.sync_api import Page

from tests.config import NORMAL_TIMEOUT

# Settled = the page's content is rendered, no FadeContent block inside the viewport is still
# hidden (blocks below the fold only fade in once scrolled to, and axe skips fully transparent
# content) and no transition is running.
_SETTLED = """(content) => {
    if (!document.querySelector(content)) return false;
    const inViewport = (el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    };
    const hidden = [...document.querySelectorAll('.translate-y-10.opacity-0')].filter(inViewport);
    const fading = document.getAnimations().filter(
        (a) => a instanceof CSSTransition && a.playState === 'running',
    );
    return hidden.length === 0 && fading.length === 0;
}"""


def wait_for_fade_in(page: Page, timeout_ms: int = NORMAL_TIMEOUT, content: str = "h1") -> None:
    """Block until `content` (a CSS selector, the page's h1 by default) is rendered and every
    visible FadeContent block has started and finished its fade-in."""
    page.wait_for_function(_SETTLED, arg=content, timeout=timeout_ms)
