"""
Shared viewport definitions for E2E tests.
Import from tests.viewports in responsive and visual test files.
"""

VIEWPORTS = [
    {"name": "mobile_small", "width": 320, "height": 568},
    {"name": "mobile_mid", "width": 375, "height": 667},
    {"name": "mobile_large", "width": 425, "height": 844},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "laptop", "width": 1024, "height": 768},
    {"name": "laptop_large", "width": 1440, "height": 900},
    {"name": "desktop", "width": 2560, "height": 1440},
]

DESKTOP_VIEWPORT = {"width": 1440, "height": 900}
