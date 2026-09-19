#!/usr/bin/env python3
"""สร้างไฟล์ข้อมูล (data/*.js) ให้ต้นแบบ THE STANDARD SPORT

แหล่งข้อมูล 2 ทาง:
  1) ชุดดาต้า CSV จาก thestandard.co (sport_all_posts_*.csv) - ข้อมูลย้อนหลัง
     ตั้งแต่ 2017: id / วันที่ / slug / ลิงก์ / หัวข้อ / ย่อหน้า / author / tags
     (ไม่มีเนื้อความเต็ม และ CSV หยุดที่วันที่ดึง)
  2) WordPress REST API สาธารณะของ thestandard.co - ใช้เติมส่วนที่ CSV ไม่มี:
     บทความที่ลงหลังวันที่ดึง, ชื่อผู้เขียนจริง, ชื่อแท็กจริง, ภาพปก, เนื้อความเต็ม

รัน:
  python3 scripts/build_data.py                 # ใช้ค่าตั้งต้น (CSV ล่าสุดใน ~/Downloads/TSD)
  python3 scripts/build_data.py --csv path.csv  # ระบุไฟล์ CSV เอง
  python3 scripts/build_data.py --since 2026-01-01 --articles 40
  python3 scripts/build_data.py --no-live       # ใช้แต่ CSV (ไม่ยิงเน็ต)

ผลลัพธ์:
  data/sport-posts.js     window.__TSD_POSTS__ / __TSD_STATS__ / __TSD_META__
  data/sport-articles.js  window.__TSD_ARTICLES__ (เนื้อความเต็ม แบบ HTML ที่กรองแล้ว)

ภาพปก: อ้าง URL จาก thestandard.co ตรง ๆ ไม่ดาวน์โหลดมาเก็บในโปรเจกต์เลย
(ประหยัดเนื้อที่เครื่อง/เรพозитори - หน้าเว็บต้องต่อเน็ตจึงจะเห็นภาพ)

หมายเหตุ: ต้องใส่ User-Agent แบบเบราว์เซอร์ทุกครั้ง ไม่งั้น WAF ของเว็บตอบ 403
และต้องเว้นจังหวะระหว่าง request (สคริปต์ sleep ให้แล้ว) - ดู tsd-sport-web-data-guide.md
"""
from __future__ import annotations

import argparse
import csv
import glob
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_POSTS = ROOT / "data" / "sport-posts.js"
OUT_ARTICLES = ROOT / "data" / "sport-articles.js"
CACHE = ROOT / "scripts" / ".cache"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
API = "https://thestandard.co/wp-json/wp/v2"
CATEGORY_SPORT = 14
CATEGORY_LINK = "https://thestandard.co/category/news/sport/"

# ขนาดภาพปกที่จะอ้าง URL ต้นทาง (ตั้งผ่าน --cover-size) - large = 1024px
PREFERRED_COVER_SIZE = "large"

# ── ภาพปก: 3 โหมด (--cover-mode) ────────────────────────────────────────────
# proxy  (ค่าเริ่มต้น) อ้างผ่าน image proxy ที่ย่อ/บีบอัดให้ และที่สำคัญคือส่ง header
#                     ให้ฝังข้ามโดเมนได้ - thestandard.co ตอบมาด้วย
#                     "cross-origin-resource-policy: same-origin" เบราว์เซอร์จึง
#                     ปฏิเสธภาพทุกใบถ้าหน้าเว็บอยู่คนละโดเมน (curl โหลดได้ แต่ <img> ไม่ขึ้น)
# direct              อ้าง URL ต้นทางตรง ๆ (ภาพจะไม่แสดงในเบราว์เซอร์ตามเหตุผลข้างบน
#                     ใช้ได้เฉพาะกรณีเสิร์ฟหน้าเว็บจากโดเมนเดียวกัน)
# local               ดาวน์โหลดมาเก็บใน uploads/news/ (ออฟไลน์ได้ แต่กินเนื้อที่เครื่อง)
COVER_PROXY = "https://wsrv.nl/"
COVER_WIDTH = 1200   # ภาพใหญ่ (hero/การ์ดหลัก)
THUMB_WIDTH = 400    # ภาพย่อ (รางข่าวข้าง, related)

TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
             "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# ป้ายหมวดบนการ์ด - เดาจากคำในหัวข้อ/แท็ก (เว็บจริงมีแค่ category เดียวคือ Sport)
# เป็นการ map ของต้นแบบ ไม่ใช่ taxonomy ทางการของเว็บ
CAT_RULES = [
    ("F1", ["formula 1", "f1", "ฟอร์มูลาวัน", "f1 2026", "กรังด์ปรีซ์", "grand prix", "มาดริง", "เวอร์สแตพเพน", "แฮมิลตัน", "ferrari", "mercedes", "red bull"]),
    ("VOLLEYBALL", ["วอลเลย์บอล", "volleyball", "vnl"]),
    ("FOOTBALL", ["ฟุตบอล", "football", "พรีเมียร์ลีก", "premier league", "laliga", "la liga", "ไทยลีก", "ยูฟ่า", "uefa", "แมนฯ", "ลิเวอร์พูล", "อาร์เซนอล"]),
    ("TENNIS", ["เทนนิส", "tennis", "ยอโควิช", "djokovic", "US Open", "wimbledon", "roland garros", "แกรนด์สแลม"]),
    ("GOLF", ["กอล์ฟ", "golf", "พีจีเอ", "pga"]),
    # ระวัง: ห้ามใส่คำว่า "เกม" เดี่ยว ๆ - "เอเชียนเกมส์" จะถูกจับเป็นอีสปอร์ตทันที
    ("ESPORTS", ["อีสปอร์ต", "esport", "e-sport", "gaming", "rov", "valorant", "esports"]),
    ("CYCLING", ["จักรยาน", "cycling", "bmx", "ทัวร์ เดอ"]),
    ("BOXING", ["มวย", "boxing", "mma", "ยูยิตสู", "มวยไทย"]),
    ("BASKETBALL", ["บาสเกตบอล", "basketball", "nba"]),
    ("BADMINTON", ["แบดมินตัน", "badminton", "วิว กุลวุฒิ"]),
    ("SWIMMING", ["ว่ายน้ำ", "swimming"]),
    ("ATHLETICS", ["กรีฑา", "athletics", "มาราธอน", "marathon", "วิ่ง"]),
    ("ASIAN GAMES", ["เอเชียนเกมส์", "asian games", "aichi", "นากูยะ", "โอลิมปิก", "olympic", "sea games"]),
]


# ── util ──────────────────────────────────────────────────────────────────────
def log(*a):
    print(*a, flush=True)


def fetch(path: str, params: dict | None = None, tries: int = 4):
    """GET JSON จาก WP REST API พร้อม cache ลง scripts/.cache (กันยิงซ้ำ/WAF)"""
    qs = urllib.parse.urlencode(params or {}, safe=",")
    url = f"{API}/{path}" + (f"?{qs}" if qs else "")
    CACHE.mkdir(parents=True, exist_ok=True)
    key = re.sub(r"[^A-Za-z0-9._-]", "_", path + "__" + (qs or "all"))[:180]
    fp = CACHE / f"{key}.json"
    if fp.exists():
        return json.loads(fp.read_text(encoding="utf-8"))
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode("utf-8"))
            fp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
            return data
        except Exception as exc:  # noqa: BLE001
            if i == tries - 1:
                raise
            log(f"   retry {i + 1}/{tries} ({exc})")
            time.sleep(2 * (i + 1))
    return []


def clean_text(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s or "")
    s = html.unescape(s)
    s = s.replace("\u00a0", " ").replace("\u200b", "")
    s = re.sub(r"\s*\[…\]\s*/?\s*$", "", s)
    s = re.sub(r"\s*\[&hellip;\]\s*", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def thai_date(iso: str) -> str:
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso or "")
    if not m:
        return ""
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f"{d} {TH_MONTHS[mo - 1]} {y}"


def derive_cat(title: str, tags: list[str]) -> str:
    hay = (title + " " + " ".join(tags)).lower()
    for label, keys in CAT_RULES:
        if any(k.lower() in hay for k in keys):
            return label
    return "SPORT"


def excerpt_from_body(body_html: str, limit: int = 200) -> str:
    """ย่อหน้าจริงจากเนื้อความ (CSV/API ให้มาแค่ประโยคเดียวที่ตัดด้วย […])"""
    text = clean_text(re.sub(r"<img[^>]*>", "", body_html))
    if len(text) <= limit:
        return text
    cut = text[:limit]
    for sep in (" ", "。"):
        idx = cut.rfind(sep)
        if idx > limit * 0.6:
            cut = cut[:idx]
            break
    return cut.rstrip(" ,.;:") + "…"


# ── HTML sanitizer (เนื้อความเต็มจาก WP -> HTML ที่ปลอดภัยพอจะใส่ในหน้าเรา) ──
ALLOWED_TAGS = {"p", "br", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i",
                "u", "blockquote", "a", "img", "figure", "figcaption", "hr",
                "table", "thead", "tbody", "tr", "th", "td", "small", "span"}
ALLOWED_ATTRS = {"a": {"href", "title"}, "img": {"src", "alt", "width", "height"},
                 "td": {"colspan", "rowspan"}, "th": {"colspan", "rowspan"}}


class WPCleaner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.skip_depth = 0

    @staticmethod
    def _abs(url: str) -> str:
        if url.startswith("//"):
            return "https:" + url
        if url.startswith("/"):
            return "https://thestandard.co" + url
        return url

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "iframe", "form", "input", "svg"):
            self.skip_depth += 1
            return
        if self.skip_depth or tag not in ALLOWED_TAGS:
            return
        keep = []
        a = dict(attrs)
        for k, v in a.items():
            if k not in ALLOWED_ATTRS.get(tag, set()) or v is None:
                continue
            if k in ("href", "src"):
                v = self._abs(v)
                if "pixel" in v or "blank.gif" in v or v.startswith("data:"):
                    return
            keep.append(f'{k}="{html.escape(v, quote=True)}"')
        if tag == "a":
            keep += ['target="_blank"', 'rel="noopener"']
        void = tag in ("br", "img", "hr")
        self.out.append("<" + tag + (" " + " ".join(keep) if keep else "") + (" /" if void else "") + ">")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "iframe", "form", "input", "svg"):
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if self.skip_depth or tag not in ALLOWED_TAGS or tag in ("br", "img", "hr"):
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip_depth:
            self.out.append(html.escape(data, quote=False))


def sanitize_body(raw: str) -> str:
    p = WPCleaner()
    p.feed(raw or "")
    out = "".join(p.out)
    out = re.sub(r"(<p>(\s|&nbsp;)*</p>\s*)+", "", out)          # ย่อหน้าว่าง
    out = re.sub(r"(\s*<br\s*/?>\s*){3,}", "<br />", out)
    return out.strip()


def plain_len(body_html: str) -> int:
    return len(clean_text(body_html))


# ── 1. CSV (ข้อมูลย้อนหลัง) ───────────────────────────────────────────────────
def find_csv(explicit: str | None) -> Path:
    if explicit:
        return Path(explicit).expanduser()
    pats = [str(Path.home() / "Downloads" / "TSD" / "**" / "sport_all_posts_*.csv"),
            str(ROOT / "*.csv")]
    hits = sorted({p for pat in pats for p in glob.glob(pat, recursive=True)})
    if not hits:
        sys.exit("ไม่พบไฟล์ CSV - ระบุด้วย --csv <path> หรือใช้ --no-csv")
    return Path(hits[-1])


def load_csv(path: Path, since: str) -> tuple[list[dict], Counter]:
    rows, monthly = [], Counter()
    with path.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            monthly[r["date"][:7]] += 1
            if r["date"] >= since:
                rows.append(r)
    log(f"CSV: {path.name} -> {len(rows)} โพสต์ตั้งแต่ {since} (สถิติรายเดือนทั้งประวัติ {len(monthly)} เดือน)")
    return rows, monthly


# ── 2. LIVE API (ส่วนที่ CSV ไม่มี) ───────────────────────────────────────────
def live_posts(since: str) -> list[dict]:
    fields = "id,date,modified,slug,link,title,excerpt,author,tags,featured_media"
    out, page = [], 1
    while True:
        batch = fetch("posts", {"categories": CATEGORY_SPORT, "per_page": 100, "page": page,
                                "orderby": "date", "order": "asc",
                                "after": f"{since}T00:00:00", "_fields": fields})
        if not batch:
            break
        out += batch
        if len(batch) < 100:
            break
        page += 1
        time.sleep(0.35)
    log(f"LIVE: พบ {len(out)} โพสต์ตั้งแต่ {since} บนเว็บจริง")
    return out


def name_maps(posts: list[dict]) -> tuple[dict, dict]:
    users = {u["id"]: u["name"] for u in fetch("users", {"per_page": 100, "_fields": "id,name"})}
    tag_ids = sorted({t for p in posts for t in p.get("tags", [])})
    tags: dict[int, str] = {}
    for i in range(0, len(tag_ids), 100):
        chunk = tag_ids[i:i + 100]
        for t in fetch("tags", {"include": ",".join(map(str, chunk)), "per_page": 100,
                                "_fields": "id,name,slug"}):
            tags[t["id"]] = t["name"]
        time.sleep(0.3)
    log(f"แมปชื่อ: ผู้เขียน {len(users)} คน / แท็ก {len(tags)} แท็ก")
    return users, tags


def media_map(posts: list[dict]) -> dict:
    media_ids = sorted({p["featured_media"] for p in posts if p.get("featured_media")})
    out: dict[int, dict] = {}
    for i in range(0, len(media_ids), 60):
        chunk = media_ids[i:i + 60]
        for m in fetch("media", {"include": ",".join(map(str, chunk)), "per_page": 60,
                                 "_fields": "id,source_url,media_details"}):
            out[m["id"]] = m
        time.sleep(0.3)
    log(f"ภาพปก: {len(out)}/{len(media_ids)} ไฟล์")
    return out


def proxied(url: str, width: int) -> str:
    """ห่อ URL ภาพด้วย image proxy (ย่อ+บีบอัดให้ด้วยในตัว)"""
    if not url:
        return ""
    query = urllib.parse.urlencode(
        {"url": url, "w": width, "output": "jpg", "q": 82},
        quote_via=urllib.parse.quote, safe="/:")
    return COVER_PROXY + "?" + query


def download_cover(post_id: int, url: str, dest_dir: Path) -> bool:
    """เฉพาะโหมด local: เก็บภาพปกไว้ในโปรเจกต์เพื่อเปิดดูออฟไลน์ได้"""
    if not url:
        return False
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{post_id}.jpg"
    if dest.exists() and dest.stat().st_size > 1024:
        return True
    # ชื่อไฟล์ของ WP มีภาษาไทยได้ ต้อง encode ก่อนยิง (ไม่งั้น 'ascii' codec error)
    safe_url = urllib.parse.quote(url, safe="/:?=&%@,")
    try:
        req = urllib.request.Request(safe_url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            blob = r.read()
        if len(blob) < 1024:
            return False
        dest.write_bytes(blob)
        return True
    except Exception as exc:  # noqa: BLE001
        log(f"   ข้ามภาพ {post_id}: {exc}")
        return False


def pick_cover(media: dict, mid: int) -> tuple[str, str]:
    """คืน (url, อัตราส่วนเป็น % ของความสูงต่อความกว้าง) - ใช้ตั้งกรอบภาพให้ตรงรูปจริง"""
    m = media.get(mid) or {}
    md = m.get("media_details") or {}
    sizes = md.get("sizes") or {}
    for k in (PREFERRED_COVER_SIZE, "large", "medium_large", "full"):
        s = sizes.get(k) or {}
        if s.get("source_url"):
            w, h = s.get("width") or 0, s.get("height") or 0
            ratio = f"{round(h / w * 100, 1)}%" if w and h else "56%"
            return s["source_url"], ratio
    w, h = md.get("width") or 0, md.get("height") or 0
    return m.get("source_url") or "", f"{round(h / w * 100, 1)}%" if w and h else "56%"


def fetch_bodies(ids: list[int]) -> dict[int, str]:
    out: dict[int, str] = {}
    for i in range(0, len(ids), 20):
        chunk = ids[i:i + 20]
        for p in fetch("posts", {"include": ",".join(map(str, chunk)), "per_page": 20,
                                 "_fields": "id,content"}):
            out[p["id"]] = sanitize_body((p.get("content") or {}).get("rendered", ""))
        time.sleep(0.35)
    return out


# ── 3. ประกอบข้อมูล ──────────────────────────────────────────────────────────
def build(args) -> None:
    global PREFERRED_COVER_SIZE
    PREFERRED_COVER_SIZE = args.cover_size
    since = args.since
    csv_rows, monthly = ([], Counter()) if args.no_csv else load_csv(find_csv(args.csv), since)

    live: list[dict] = []
    users: dict = {}
    tags: dict = {}
    media: dict = {}
    if not args.no_live:
        live = live_posts(since)
        users, tags = name_maps(live or [{"tags": []}])
        media = media_map(live)

    # รวมสองแหล่ง - โพสต์จาก API ทับของ CSV (ข้อมูลใหม่กว่า) แล้วเรียงใหม่->เก่า
    merged: dict[int, dict] = {}
    for r in csv_rows:
        pid = int(r["id"])
        merged[pid] = {"id": pid, "date": r["date"], "slug": r["slug"], "link": r["link"],
                       "title": clean_text(r["title"]), "excerpt_raw": clean_text(r["excerpt"]),
                       "author": users.get(int(r["author"]), str(r["author"])),
                       "tags": [tags.get(int(t), "") for t in r["tags"].split(",") if t],
                       "cover": "", "ratio": "56%", "featured_media": 0}
    for p in live:
        pid = p["id"]
        cover_url, cover_ratio = pick_cover(media, p.get("featured_media") or 0)
        merged[pid] = {"id": pid, "date": p["date"], "slug": p["slug"], "link": p["link"],
                       "title": clean_text(p["title"]["rendered"]),
                       "excerpt_raw": clean_text(p["excerpt"]["rendered"]),
                       "author": users.get(p["author"], str(p["author"])),
                       "tags": [tags.get(t, "") for t in p.get("tags", [])],
                       "cover": cover_url, "ratio": cover_ratio,
                       "featured_media": p.get("featured_media") or 0}

    posts = sorted(merged.values(), key=lambda p: p["date"], reverse=True)
    if args.limit and len(posts) > args.limit:
        dropped = len(posts) - args.limit
        posts = posts[:args.limit]
        log(f"ตัดโพสต์เก่าออก {dropped} แถว (--limit {args.limit}) เหลือช่วง "
            f"{posts[-1]['date'][:10]} ถึง {posts[0]['date'][:10]}")
    log(f"รวมได้ {len(posts)} โพสต์ (ใหม่สุด {posts[0]['date'][:10]} / เก่าสุด {posts[-1]['date'][:10]})")

    # เนื้อความเต็มของโพสต์ใหม่ที่สุด N ชิ้น (CSV ไม่มีส่วนนี้)
    bodies: dict[int, str] = {}
    if not args.no_live:
        bodies = fetch_bodies([p["id"] for p in posts[:args.articles]])
        log(f"เนื้อความเต็ม: {len(bodies)} บทความ จาก {len(posts)} โพสต์ที่โหลด metadata มา")

    # ภาพปกตามโหมดที่เลือก (ค่าเริ่มต้น: proxy - ไม่เก็บไฟล์ในโปรเจกต์ แต่ภาพยังขึ้น)
    img_dir = ROOT / "uploads" / "news"
    local: set[int] = set()
    if args.cover_mode == "local":
        need = [q for q in posts if q["cover"]]
        log(f"โหมด local: ดาวน์โหลดภาพปก {len(need)} ไฟล์ลง uploads/news/ (กินเนื้อที่เครื่อง)")
        for q in need:
            if download_cover(q["id"], q["cover"], img_dir):
                local.add(q["id"])
            time.sleep(0.12)
    missing_cover = [q["id"] for q in posts if not q["cover"]]
    log(f"โหมดภาพปก: {args.cover_mode}" + (f" (มีในเครื่อง {len(local)})" if local else ""))
    if missing_cover:
        log(f"   หมายเหตุ: {len(missing_cover)} โพสต์ไม่มีภาพปก")

    out_posts = []
    for p in posts:  # เรียงใหม่ -> เก่า
        pid = p["id"]
        body = bodies.get(pid, "")
        ex = excerpt_from_body(body) if body else p["excerpt_raw"]
        if len(ex) > 150:  # การ์ดตัดที่ 2 บรรทัดอยู่แล้ว เก็บยาวกว่านี้มีแต่ทำให้ไฟล์ข้อมูลอ้วน
            ex = ex[:150].rsplit(" ", 1)[0].rstrip(" ,.;:") + "…"
        tags_list = [t for t in dict.fromkeys(p["tags"]) if t][:6]
        src = p["cover"]
        if args.cover_mode == "proxy":
            img, thumb = proxied(src, COVER_WIDTH), proxied(src, THUMB_WIDTH)
        elif args.cover_mode == "local":
            img = thumb = f"uploads/news/{pid}.jpg" if pid in local else src
        else:                       # direct
            img = thumb = src
        out_posts.append({
            "id": pid,
            "link": p["link"],
            "dateISO": p["date"],
            "date": thai_date(p["date"]),
            "title": p["title"],
            "excerpt": ex,
            "author": p["author"],
            "cat": derive_cat(p["title"], tags_list),
            "tags": tags_list,
            "img": img,
            "thumb": thumb or img,
            "ratio": p.get("ratio") or "56%",
            "bg": f"url('{img}') center/cover no-repeat" if img else "",
            "body": bool(body),
        })

    with_body = sum(1 for p in out_posts if p["body"])
    meta = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "source": {
            "csv": None if args.no_csv else find_csv(args.csv).name,
            "api": "https://thestandard.co/wp-json/wp/v2 (category Sport = 14)",
            "categoryLink": CATEGORY_LINK,
        },
        "counts": {"posts": len(out_posts), "postsWithBody": with_body, "since": since,
                   "coverMode": args.cover_mode, "limit": args.limit,
                   "range": [out_posts[-1]["dateISO"][:10], out_posts[0]["dateISO"][:10]]},
        "note": "cat เป็นการ map จากคำในหัวข้อ/แท็กเพื่อใช้บนการ์ด - เว็บจริงมี category เดียวคือ Sport",
    }

    OUT_POSTS.parent.mkdir(parents=True, exist_ok=True)
    OUT_POSTS.write_text(
        "/* สร้างโดย scripts/build_data.py - อย่าแก้มือ (รันสคริปต์ใหม่แทน) */\n"
        "window.__TSD_POSTS__ = " + json.dumps(out_posts, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "window.__TSD_STATS__ = " + json.dumps({"monthly": dict(sorted(monthly.items())), "meta": meta},
                                               ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    arts = {str(p["id"]): bodies[p["id"]] for p in out_posts if p["id"] in bodies}
    OUT_ARTICLES.write_text(
        "/* สร้างโดย scripts/build_data.py - เนื้อความเต็ม (HTML กรองแล้ว) สำหรับหน้าบทความ */\n"
        "window.__TSD_ARTICLES__ = " + json.dumps(arts, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    log("\nเสร็จ:")
    log(f"  {OUT_POSTS.relative_to(ROOT)}  {OUT_POSTS.stat().st_size / 1024:.0f} KB "
        f"({len(out_posts)} โพสต์, มีเนื้อความเต็ม {with_body})")
    log(f"  {OUT_ARTICLES.relative_to(ROOT)}  {OUT_ARTICLES.stat().st_size / 1024:.0f} KB ({len(arts)} บทความ)")
    log(f"  ภาพปก: โหมด {args.cover_mode}" + (" (ไม่เก็บไฟล์ในโปรเจกต์)" if args.cover_mode != "local"
        else f" - {len(local)} ไฟล์ใน uploads/news/"))


def main() -> None:
    ap = argparse.ArgumentParser(description="สร้าง data/*.js สำหรับต้นแบบ THE STANDARD SPORT")
    ap.add_argument("--csv", help="ไฟล์ CSV จากชุดดาต้า (ค่าเริ่มต้น: หาใน ~/Downloads/TSD)")
    ap.add_argument("--since", default="2026-01-01", help="รวมโพสต์ตั้งแต่วันที่นี้ (ค่าเริ่มต้น 2026-01-01)")
    ap.add_argument("--articles", type=int, default=36, help="ดึงเนื้อความเต็มกี่บทความล่าสุด (ค่าเริ่มต้น 36)")
    ap.add_argument("--cover-size", default="large", choices=["large", "medium_large", "full"],
                    help="ขนาดภาพต้นฉบับที่จะอ้าง (ค่าเริ่มต้น large = 1024px)")
    ap.add_argument("--cover-mode", default="proxy", choices=["proxy", "direct", "local"],
                    help="proxy = อ้างผ่าน image proxy ภาพขึ้นแต่ไม่กินเนื้อที่ (ค่าเริ่มต้น) / "
                         "direct = URL ต้นทางตรง ๆ (เบราว์เซอร์จะไม่แสดงภาพ) / local = ดาวน์โหลดเก็บในเครื่อง")
    ap.add_argument("--no-csv", action="store_true", help="ไม่ใช้ CSV (เอาแต่ API สด)")
    ap.add_argument("--no-live", action="store_true", help="ไม่ยิง API (เอาแต่ CSV, ได้แค่ metadata)")
    ap.add_argument("--limit", type=int, default=300,
                    help="เก็บเฉพาะโพสต์ใหม่สุดกี่รายการ (0 = ทั้งหมด, ค่าเริ่มต้น 400)")
    args = ap.parse_args()
    build(args)


if __name__ == "__main__":
    main()
