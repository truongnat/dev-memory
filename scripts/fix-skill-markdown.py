#!/usr/bin/env python3
"""Fix markdown files corrupted with literal \\n instead of newlines (JSON-export bug)."""

from __future__ import annotations

import sys
from pathlib import Path


def needs_fix(text: str) -> bool:
    if "\\n" not in text:
        return False
    return "\\n##" in text or "\\n# " in text or (
        text.startswith("# ") and "\\n" in text[:300]
    )


def unescape(text: str) -> str:
    return text.replace("\\n", "\n").replace("\\t", "\t").replace('\\"', '"')


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    targets = list(root.joinpath("skills").rglob("*.md")) + list(
        root.joinpath("templates").rglob("*.md")
    )
    fixed: list[Path] = []
    for path in targets:
        raw = path.read_text(encoding="utf-8")
        if needs_fix(raw):
            path.write_text(unescape(raw), encoding="utf-8")
            fixed.append(path)
    if not fixed:
        print("No corrupt markdown files found.")
        return 0
    print(f"Fixed {len(fixed)} file(s):")
    for p in fixed:
        print(f"  {p.relative_to(root)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
