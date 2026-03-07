"""
Pytest configuration and fixtures for Elytra E2E tests.

BASE_URL: npm run test   → http://localhost:5173 (local dev)
          npm run test:qa → https://qa.elytra.shalev396.com (QA)

Requires: client (and server for auth flows) running at the target URL.
"""
import base64
import os
import subprocess
from pathlib import Path

import pytest


@pytest.fixture(scope="session", autouse=True)
def ensure_translations_exported():
    """Ensure translations.json exists before any test (for test_translations)."""
    fixtures_dir = Path(__file__).resolve().parent / "tests" / "fixtures"
    translations_path = fixtures_dir / "translations.json"
    if not translations_path.exists():
        script = Path(__file__).resolve().parent / "tests" / "scripts" / "export-translations.ts"
        subprocess.run(
            ["npx", "tsx", str(script)],
            cwd=Path(__file__).resolve().parent,
            check=True,
            capture_output=True,
        )


@pytest.fixture(scope="session")
def base_url(request):
    """Base URL for the client app. Uses --base-url if passed, else env or default."""
    try:
        base = request.config.getoption("base_url", default=None)
    except ValueError:
        base = None
    if base:
        return base.rstrip("/")
    return os.getenv("BASE_URL", "http://localhost:5173").rstrip("/")


@pytest.fixture(scope="session")
def api_base_url():
    """Base URL for the backend API."""
    return os.getenv("API_BASE_URL", "http://localhost:3000/api")


@pytest.fixture
def app_url(base_url):
    """Full app URL with English locale."""
    return f"{base_url}/en"


@pytest.fixture(scope="session")
def shared_test_user(api_base_url):
    """
    One shared test user for the whole run. All auth-dependent tests should use this via
    authenticated_page or login_page_with_user. Only tests that must create a new user
    (e.g. signup, delete account) should use create_test_user.
    Uses env vars if set, else creates once. Uses 0 SES emails if E2E_TEST_* are all set.
    """
    from tests.helpers.mailtm import get_test_user_from_env, create_test_user

    user = get_test_user_from_env()
    if user:
        return user
    try:
        return create_test_user(api_base_url)
    except RuntimeError as e:
        if "429" in str(e) or "limit" in str(e).lower():
            pytest.skip(f"SES/rate limit: set E2E_TEST_EMAIL, E2E_TEST_PASSWORD, etc. to use existing account. {e}")
        raise


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        page = item.funcargs.get("page", None)
        if page:
            from tests.helpers.screenshot_on_failure import take_screenshot_on_failure

            path = take_screenshot_on_failure(page, item)
            if path and path.exists():
                pytest_html = item.config.pluginmanager.getplugin("html")
                if pytest_html:
                    if not hasattr(report, "extras"):
                        report.extras = []
                    with open(path, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode("ascii")
                    report.extras.append(pytest_html.extras.image(b64, name="Screenshot"))


@pytest.fixture
def authenticated_page(page, app_url, shared_test_user):
    """
    Page with authenticated user. Uses shared_test_user (no new account creation).
    """
    try:
        from tests.helpers.mailtm import login_page_with_user
        login_page_with_user(page, app_url, shared_test_user)
    except Exception:
        pass
    return page
