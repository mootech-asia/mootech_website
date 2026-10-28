"""由 index.html 產生英文版 en/index.html（部署時由 GitHub Actions 自動執行）。

英文內容沿用 index.html 內的 EN 翻譯字典，頁面載入時套用；這裡只處理網址、語系與 meta。
本機預覽英文版：python3 tools/build-en.py
"""
import re, os

BASE = "https://mootech-asia.github.io/mootech_website/"
src = open("index.html", encoding="utf-8").read()
s = src.replace('<html lang="zh-Hant">', '<html lang="en">', 1)

meta = {
    "title": "MOOTECH | Driving business through innovation",
    "desc": "Live streaming, connectivity, network architecture, system integration and threat intelligence. Since 2016 MOOTECH has built stable, secure IT foundations for businesses, with offices in Singapore and Taiwan.",
}
s = re.sub(r"<title>.*?</title>", f"<title>{meta['title']}</title>", s, count=1)
s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{meta["desc"]}">', s, count=1)
s = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{meta["title"]}">', s, count=1)
s = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{meta["desc"]}">', s, count=1)
s = s.replace(f'<meta property="og:url" content="{BASE}">', f'<meta property="og:url" content="{BASE}en/">', 1)
s = s.replace(f'<link rel="canonical" href="{BASE}">', f'<link rel="canonical" href="{BASE}en/">', 1)
s = s.replace('<meta property="og:locale" content="zh_TW">\n<meta property="og:locale:alternate" content="en_US">',
              '<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="zh_TW">', 1)
s = s.replace('<meta name="mootech-alt" content="en/">', '<meta name="mootech-alt" content="../">', 1)

# 相對路徑的資源改成指向上一層
s = re.sub(r'(?<=["\'(\s,])assets/', "../assets/", s)
s = s.replace("<script>\n(function () {", '<script>window.MOOTECH_LANG = "en";</script>\n<script>\n(function () {', 1)

assert s != src
os.makedirs("en", exist_ok=True)
open("en/index.html", "w", encoding="utf-8").write(s)
print("en/index.html written")
