from __future__ import annotations

import sys
import os
from pathlib import Path

# Add backend directory to sys.path for all pytest tests
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
