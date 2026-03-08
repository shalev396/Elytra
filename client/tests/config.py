"""
E2E test configuration - timeouts and shared constants.
Import from tests.config in E2E test files.
"""

# Playwright timeouts (milliseconds)
DEFAULT_TIMEOUT = 5_000   # Playwright default for assertions
SHORT_TIMEOUT = 10_000    # Form fills, quick clicks
NORMAL_TIMEOUT = 15_000   # Page loads, visibility checks
LONG_TIMEOUT = 20_000     # Redirects, async flows
FORGOT_PASSWORD_TIMEOUT = 50_000  # Cognito forgot-password API + redirect (can be slow in CI)
