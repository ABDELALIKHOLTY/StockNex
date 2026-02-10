import sys
import os

# Auto-setup paths when app package is imported
_project_root = os.path.dirname(__file__)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)