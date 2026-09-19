#!/usr/bin/env python3
"""Refresh the real THE STANDARD SPORT YouTube cards without an API key.

Usage:
  python3 scripts/fetch_youtube.py

The script reads the public channel pages, resolves titles through oEmbed,
and writes uploads/youtube-data.js for the static prototype.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "uploads" / "youtube-data.js"
CHANNEL = "https://www.youtube.com/@THESTANDARDSPORT"
CHANNEL_ID = "UC0wnO6eqpyqhIduYlV1ahLA"


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8")


def discover(path: str, limit: int) -> list[str]:
    html = get(CHANNEL + path)
    ids: list[str] = []
    for video_id in re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', html):
        if video_id not in ids:
            ids.append(video_id)
        if len(ids) == limit:
            break
    if len(ids) < limit:
        raise RuntimeError(f"Only found {len(ids)} videos at {CHANNEL}{path}")
    return ids


def resolve(video_id: str, kind: str) -> dict[str, str]:
    watch = f"https://www.youtube.com/watch?v={video_id}"
    endpoint = "https://www.youtube.com/oembed?" + urllib.parse.urlencode(
        {"url": watch, "format": "json"}
    )
    info = json.loads(get(endpoint))
    return {
        "id": video_id,
        "title": info["title"],
        "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "url": watch,
        "type": kind,
    }


def main() -> None:
    data = {
        "channel": {
            "handle": "@THESTANDARDSPORT",
            "channelId": CHANNEL_ID,
            "url": CHANNEL,
        },
        "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "videos": [resolve(v, "video") for v in discover("/videos", 6)],
        "shorts": [resolve(v, "short") for v in discover("/shorts", 7)],
    }
    OUT.write_text(
        "window.__YT_LIVE__ = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(data['videos'])} videos and {len(data['shorts'])} shorts to {OUT}")


if __name__ == "__main__":
    main()
