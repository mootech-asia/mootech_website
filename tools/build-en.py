"""由 index.html 產生英文版與 D 版分享入口（部署時由 GitHub Actions 自動執行）。

英文內容沿用 index.html 內的 EN 翻譯字典，頁面載入時套用；這裡只處理網址、語系與 meta。
本機預覽英文版：python3 tools/build-en.py
"""
import re, os

BASE = "https://mootech-asia.github.io/mootech_website/"
src = open("index.html", encoding="utf-8").read()
s = src.replace('<html lang="zh-Hant">', '<html lang="en">', 1)

meta = {
    "title": "MOOTECH | Driving business through innovation",
    "desc": "Since 2016 MOOTECH has provided live streaming, internet access, CDN, IP Transit, IPLC private lines, network optimisation and system integration, with offices in Singapore and Taiwan.",
}
s = re.sub(r"<title>.*?</title>", f"<title>{meta['title']}</title>", s, count=1)
s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{meta["desc"]}">', s, count=1)
s = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{meta["title"]}">', s, count=1)
s = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{meta["desc"]}">', s, count=1)
s = s.replace("mootech_website_IMG141_design-d-social-zh.jpg", "mootech_website_IMG142_design-d-social-en.jpg")
s = re.sub(r'<meta property="og:image:alt" content="[^"]*">', '<meta property="og:image:alt" content="MOOTECH Design D: faceless gradient character on black, driving business through innovation">', s, count=1)
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

# Hash fragments are not sent to social crawlers. Separate paths provide stable D previews.
def build_design_d(page, english=False):
    prefix = "en/" if english else ""
    result = page.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="mootech-default-variant" content="d">', 1)
    result = result.replace(f'<link rel="canonical" href="{BASE}{prefix}">', f'<link rel="canonical" href="{BASE}{prefix}d/">', 1)
    result = result.replace(f'<meta property="og:url" content="{BASE}{prefix}">', f'<meta property="og:url" content="{BASE}{prefix}d/">', 1)
    for code, destination in [("zh-Hant", "d/"), ("en", "en/d/"), ("x-default", "d/")]:
        result = re.sub(r'<link rel="alternate" hreflang="' + code + r'" href="[^"]*">', f'<link rel="alternate" hreflang="{code}" href="{BASE}{destination}">', result, count=1)
    result = re.sub(r'<meta name="mootech-alt" content="[^"]*">', '<meta name="mootech-alt" content="' + ('../../d/' if english else '../en/d/') + '">', result, count=1)
    if english:
        result = result.replace('../assets/', '../../assets/')
    else:
        result = re.sub(r'(?<=["\'(\s,])assets/', '../assets/', result)
    target = prefix + "d"
    os.makedirs(target, exist_ok=True)
    open(target + "/index.html", "w", encoding="utf-8").write(result)
    print(target + "/index.html written")

build_design_d(src)
build_design_d(s, english=True)
