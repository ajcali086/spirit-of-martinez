#!/usr/bin/env python3
"""Display copies for the archive. JPEG + WebP, optional 1200×630 share crop.

  python3 scripts/compress-image.py incoming/maxwellpair.tif --out public/images/archive --og --og-focus 0.28
  python3 scripts/compress-image.py --missing   # write webp siblings that don't exist yet

Does not rewrite an existing JPEG unless --force. Portraits need --og; Facebook
center-crops otherwise. og-focus is 0–1 from the top (0.35 = upper third).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

JPEG_QUALITY = 86
WEBP_QUALITY = 80
OG_W, OG_H = 1200, 630
SKIP_WEBP = {"og.jpg"}


def load(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode in ("RGBA", "P"):
        im = im.convert("RGB")
    elif im.mode != "RGB":
        im = im.convert("RGB")
    return im


def fit_max(im: Image.Image, max_edge: int) -> Image.Image:
    if max_edge <= 0:
        return im
    w, h = im.size
    long_edge = max(w, h)
    if long_edge <= max_edge:
        return im
    scale = max_edge / long_edge
    return im.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)


def og_crop(im: Image.Image, focus: float) -> Image.Image:
    w, h = im.size
    target_h = max(1, round(w * OG_H / OG_W))
    if h <= target_h:
        crop = im
    else:
        focus = min(1.0, max(0.0, focus))
        top = int(round(focus * h - target_h / 2))
        top = max(0, min(top, h - target_h))
        crop = im.crop((0, top, w, top + target_h))
    return crop.resize((OG_W, OG_H), Image.Resampling.LANCZOS)


def write_jpeg(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)


def write_webp(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)


def should_skip_webp(path: Path) -> bool:
    if path.name in SKIP_WEBP:
        return True
    if path.parent.name == "og":
        return True
    return False


def compress(
    src: Path,
    out_dir: Path,
    *,
    webp_only: bool = False,
    force: bool = False,
    og: bool = False,
    og_focus: float = 0.35,
    max_edge: int = 1800,
) -> dict[str, Path]:
    im = fit_max(load(src), max_edge)
    stem = src.stem
    written: dict[str, Path] = {}
    jpg = out_dir / f"{stem}.jpg"
    webp = out_dir / f"{stem}.webp"

    if not webp_only:
        if force or not jpg.exists():
            write_jpeg(im, jpg)
            written["jpg"] = jpg
    if not should_skip_webp(jpg) and (force or not webp.exists()):
        write_webp(im, webp)
        written["webp"] = webp
    if og:
        card = og_crop(load(src), og_focus)
        og_path = out_dir / "og" / f"{stem}.jpg"
        write_jpeg(card, og_path)
        written["og"] = og_path
    return written


def missing_webp_sources(root: Path) -> list[Path]:
    found = []
    for p in sorted(root.rglob("*")):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        if should_skip_webp(p):
            continue
        if not p.with_suffix(".webp").exists():
            found.append(p)
    return found


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--missing", action="store_true", help="write webp for display JPEGs that lack one")
    parser.add_argument("--webp-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--og", action="store_true")
    parser.add_argument("--og-focus", type=float, default=0.35)
    parser.add_argument("--max", dest="max_edge", type=int, default=1800)
    args = parser.parse_args(argv)

    paths = list(args.paths)
    if args.missing:
        paths.extend(missing_webp_sources(Path("public/images")))
        args.webp_only = True
    if not paths:
        parser.print_help()
        return 2

    for src in paths:
        if not src.is_file():
            print(f"skip (missing): {src}", file=sys.stderr)
            continue
        out_dir = args.out or src.parent
        written = compress(
            src,
            out_dir,
            webp_only=args.webp_only,
            force=args.force,
            og=args.og,
            og_focus=args.og_focus,
            max_edge=args.max_edge,
        )
        if written:
            note = ", ".join(f"{k}={v}" for k, v in written.items())
            print(f"{src.name}: {note}")
        else:
            print(f"{src.name}: already current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
