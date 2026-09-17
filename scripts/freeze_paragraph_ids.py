#!/usr/bin/env python3
"""Stamp stable paragraph ids into chapters.ts. Fill blanks only; never renumber.

  python3 scripts/freeze_paragraph_ids.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CHAPTERS = Path("src/data/chapters.ts")
SECTION_ID = re.compile(r'^        id: "([^"]+)",\s*$')
CHAPTER_START = re.compile(r"^    number: ")
P_BLOCK = re.compile(r'^          \{ type: "p"(, id: "([^"]+)")?, text:')
RESERVED = ("m-", "p-", "g-", "sec-", "ch-")


def freeze_text(text: str) -> tuple[str, dict[str, int]]:
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    section: str | None = None
    p_index = 0
    page_ids: set[str] = set()
    written = 0
    kept = 0
    for line in lines:
        if CHAPTER_START.match(line):
            section = None
            p_index = 0
            page_ids = set()
        sec = SECTION_ID.match(line.rstrip("\n"))
        if sec:
            section = sec.group(1)
            p_index = 0
            if section in page_ids:
                raise SystemExit(f"collision: section {section}")
            page_ids.add(section)
        m = P_BLOCK.match(line)
        if m:
            existing = m.group(2)
            if section is None:
                raise SystemExit("paragraph before a section id")
            positional = f"{section}-p{p_index}"
            p_index += 1
            if existing:
                if existing in page_ids:
                    raise SystemExit(f"collision: {existing}")
                page_ids.add(existing)
                kept += 1
            else:
                if positional in page_ids:
                    raise SystemExit(f"collision: {positional}")
                if positional.startswith(RESERVED):
                    raise SystemExit(f"reserved: {positional}")
                line = line.replace('{ type: "p", text:', f'{{ type: "p", id: "{positional}", text:', 1)
                page_ids.add(positional)
                written += 1
        out.append(line)
    return "".join(out), {"written": written, "kept": kept}


def main() -> int:
    src = CHAPTERS.read_text()
    next_text, stats = freeze_text(src)
    if next_text == src:
        print(f"already frozen ({stats['kept']} named, 0 written)")
        return 0
    CHAPTERS.write_text(next_text)
    print(f"wrote {stats['written']} ids, kept {stats['kept']}")
    again, stats2 = freeze_text(next_text)
    if again != next_text or stats2["written"] != 0:
        print("second pass was not a no-op", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
