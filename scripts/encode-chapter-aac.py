#!/usr/bin/env python3
"""Encode chapter MP3s to AAC-LC 40 kb/s, 24 kHz, mono.

Keeps duration (no tempo change). Fails if |dur_aac - dur_mp3| >= 100 ms.
Skywatch is music, not a chapter — skip it.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

AUDIO = Path(__file__).resolve().parent.parent / "public" / "audio"
BITRATE = "40k"
RATE = "24000"
MAX_DRIFT_S = 0.100
SKIP = {"skywatch-silence.mp3"}

TIME_RE = re.compile(r"time=(\d+):(\d+):(\d+\.\d+)")


def hms_to_s(h: str, m: str, s: str) -> float:
    return int(h) * 3600 + int(m) * 60 + float(s)


def decoded_duration(path: Path) -> float:
    proc = subprocess.run(
        ["ffmpeg", "-i", str(path), "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    times = TIME_RE.findall(proc.stderr)
    if not times:
        raise RuntimeError(f"no decoded time for {path.name}\n{proc.stderr[-500:]}")
    h, m, s = times[-1]
    return hms_to_s(h, m, s)


def encode_one(mp3: Path) -> dict:
    slug = mp3.stem
    dest = AUDIO / f"{slug}.m4a"
    tmp = Path("/tmp/som-aac") / f"{slug}.m4a"
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(mp3),
        "-vn",
        "-map",
        "0:a:0",
        "-ac",
        "1",
        "-ar",
        RATE,
        "-c:a",
        "aac",
        "-b:a",
        BITRATE,
        "-profile:a",
        "aac_low",
        "-movflags",
        "+faststart",
        str(tmp),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        tmp.unlink(missing_ok=True)
        raise RuntimeError(f"ffmpeg failed for {mp3.name}: {proc.stderr[-800:]}")
    shutil.move(str(tmp), str(dest))

    mp3_dur = decoded_duration(mp3)
    aac_dur = decoded_duration(dest)
    drift = abs(aac_dur - mp3_dur)
    if drift >= MAX_DRIFT_S:
        raise RuntimeError(
            f"{slug}: duration drift {drift*1000:.1f} ms "
            f"(mp3 {mp3_dur:.3f}s, aac {aac_dur:.3f}s)"
        )
    return {
        "slug": slug,
        "mp3_bytes": mp3.stat().st_size,
        "aac_bytes": dest.stat().st_size,
        "mp3_s": mp3_dur,
        "aac_s": aac_dur,
        "drift_ms": drift * 1000,
    }


def main() -> int:
    files = sorted(
        p for p in AUDIO.glob("*.mp3") if p.name not in SKIP
    )
    if len(files) != 15:
        print(f"expected 15 chapter mp3s, found {len(files)}", file=sys.stderr)
        return 1

    Path("/tmp/som-aac").mkdir(parents=True, exist_ok=True)

    rows: list[dict] = []
    failed = False
    with ThreadPoolExecutor(max_workers=3) as pool:
        futs = {pool.submit(encode_one, p): p for p in files}
        for fut in as_completed(futs):
            src = futs[fut]
            try:
                row = fut.result()
                rows.append(row)
                pct = 100 * (1 - row["aac_bytes"] / row["mp3_bytes"])
                print(
                    f"ok  {row['slug']:28}  "
                    f"{row['mp3_bytes']/1e6:5.1f}→{row['aac_bytes']/1e6:4.1f} MB  "
                    f"{pct:4.0f}%  drift {row['drift_ms']:.1f} ms",
                    flush=True,
                )
            except Exception as exc:
                failed = True
                print(f"FAIL {src.name}: {exc}", file=sys.stderr, flush=True)

    if failed:
        return 1

    rows.sort(key=lambda r: r["slug"])
    mp3_total = sum(r["mp3_bytes"] for r in rows)
    aac_total = sum(r["aac_bytes"] for r in rows)
    print()
    print(
        f"chapters  {mp3_total/1e6:.1f} MB mp3  →  {aac_total/1e6:.1f} MB aac  "
        f"({100 * (1 - aac_total / mp3_total):.0f}% smaller)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
