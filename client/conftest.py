"""
Pytest configuration and fixtures for Elytra E2E tests.

BASE_URL: npm run test   → http://localhost:5173 (local dev)
          npm run test:qa → https://qa.elytra.shalev396.com (QA)

Requires: client (and server for auth flows) running at the target URL.

WARNING: every run wipes the database, S3 user uploads and Cognito users of the stage the API
is bound to (see reset_database and tests/README.md).

Parallel runs (pytest-xdist, see tests/scripts/run-tests.ts): session setup (DB reset, shared
user, translations export) runs once for the whole run, and the tests listed in
SHARED_STATE_TESTS run on a single worker, in order.
"""
import base64
import json
import os
import subprocess
import warnings
from pathlib import Path

import pytest
import requests
from filelock import FileLock

# Tests that change state other tests read (accounts, profile data). In parallel runs they share
# one worker, so they never overlap each other.
SHARED_STATE_TESTS = ("tests/e2e/flows/",)


@pytest.hookimpl(tryfirst=True)
def pytest_collection_modifyitems(items):
    for item in items:
        if item.nodeid.startswith(SHARED_STATE_TESTS):
            item.add_marker(pytest.mark.xdist_group("shared-state"))


def _run_once(tmp_path_factory, name: str, produce):
    """
    Run `produce` once per test run and return its (JSON) result, also with pytest-xdist.

    Without workers it just runs. With workers, the first one to take the lock runs it and saves
    the result; the others wait on the lock, then reuse the saved result.
    """
    if os.getenv("PYTEST_XDIST_WORKER") is None:
        return produce()
    run_dir = tmp_path_factory.getbasetemp().parent  # shared by all workers of this run
    result_file = run_dir / f"{name}.json"
    with FileLock(str(run_dir / f"{name}.lock")):
        if result_file.exists():
            return json.loads(result_file.read_text(encoding="utf-8"))
        result = produce()
        result_file.write_text(json.dumps(result), encoding="utf-8")
        return result


@pytest.fixture(scope="session", autouse=True)
def ensure_translations_exported(tmp_path_factory):
    """Ensure translations.json exists before any test (for test_translations)."""

    def export():
        fixtures_dir = Path(__file__).resolve().parent / "tests" / "fixtures"
        translations_path = fixtures_dir / "translations.json"
        if not translations_path.exists():
            script = Path(__file__).resolve().parent / "tests" / "scripts" / "export-translations.ts"
            subprocess.run(
                ["npx", "tsx", str(script)],
                cwd=Path(__file__).resolve().parent,
                check=True,
                capture_output=True,
                # npx is npx.cmd on Windows, which only starts through a shell.
                shell=os.name == "nt",
            )
        return True

    _run_once(tmp_path_factory, "translations", export)


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
    """Base URL for the backend API (root, without the public/private prefix)."""
    return os.getenv("API_BASE_URL", "http://localhost:3000/api")


@pytest.fixture(scope="session")
def public_api_base_url(api_base_url):
    """Base URL for the public API (auth)."""
    return f"{api_base_url}/public"


@pytest.fixture(scope="session")
def private_api_base_url(api_base_url):
    """Base URL for the private API (account; needs an id token)."""
    return f"{api_base_url}/private"


@pytest.fixture
def app_url(base_url):
    """Full app URL with English locale."""
    return f"{base_url}/en"


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """
    Every test browser prefers reduced motion, so animations (FadeContent, background effects,
    count-ups) render in their final state. CI browsers have no GPU and little CPU; animations
    there slow pages down and make contrast checks flaky. Tests of those effects opt back in with
    @pytest.mark.browser_context_args(reduced_motion="no-preference").
    """
    return {**browser_context_args, "reduced_motion": "reduce"}


@pytest.fixture(scope="session", autouse=True)
def reset_database(api_base_url, tmp_path_factory):
    """
    Wipe the DB, S3 user uploads, and Cognito user pool before the test session.

    DESTRUCTIVE: this empties whatever stage the API at API_BASE_URL is bound to, including qa when
    the local API was started with `--stage qa` (as CI's _test-local.yml does).

    Calls POST /api/dev/reset (no auth required; the route exists on every stage except prod, so
    a run against prod fails here instead of wiping it). The reset also re-syncs the DB schema.
    shared_test_user depends on this fixture, so the reset completes before any user is created.
    Runs once, before any worker starts its tests.
    """
    if os.getenv("E2E_TEST_EMAIL"):
        # Pre-existing user mode: the reset would delete that Cognito user and every E2E_TEST_*
        # token with it, so the whole run would fail. Tests then run against existing data.
        warnings.warn(
            "E2E_TEST_EMAIL is set: skipping the database reset. Tests run against existing data.",
            stacklevel=1,
        )
        return

    def reset():
        r = requests.post(f"{api_base_url}/dev/reset", timeout=60)
        assert r.status_code == 200, f"DB reset failed: {r.status_code} {r.text}"
        return True

    _run_once(tmp_path_factory, "reset-database", reset)


@pytest.fixture(scope="session")
def shared_test_user(api_base_url, reset_database, tmp_path_factory):
    """
    One shared test user for the whole run (all workers). All auth-dependent tests should use
    this via authenticated_page or login_page_with_user. Only tests that must create a new user
    (e.g. signup, delete account) should use create_test_user.
    Uses env vars if set, else creates once. Uses 0 SES emails if E2E_TEST_* are all set.

    Creating the user fails (instead of skipping) on SES or rate-limit errors: a skip would hide
    every auth-dependent test behind green skips. To avoid spending SES quota, set E2E_TEST_*.
    """
    from tests.helpers.mailtm import TestUser, create_test_user, get_test_user_from_env

    def create():
        user = get_test_user_from_env()
        if user:
            return user._asdict()
        return create_test_user(api_base_url)._asdict()

    return TestUser(**_run_once(tmp_path_factory, "shared-test-user", create))


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
    from tests.helpers.mailtm import login_page_with_user

    login_page_with_user(page, app_url, shared_test_user)
    return page
