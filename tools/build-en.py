"""由 index.html 產生英文版與 D 版分享入口，並為 design-a～design-e 產生英文頁（部署時由 GitHub Actions 自動執行）。

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
# D 分享圖與英文替代文字：根目錄英文頁與 design-d/en/ 共用
D_SOCIAL_ZH, D_SOCIAL_EN = "mootech_website_IMG169_d-tech-social-zh.jpg", "mootech_website_IMG170_d-tech-social-en.jpg"
D_SOCIAL_EN_ALT = "MOOTECH Design D: luminous orbital network and technology icons on black, driving business through innovation"
s = s.replace(D_SOCIAL_ZH, D_SOCIAL_EN)
s = re.sub(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{D_SOCIAL_EN_ALT}">', s, count=1)
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

# 獨立版型資料夾 design-a～design-e（由 tools/split-designs.py 拆出）：各自產生 en/index.html。
# 英文頁位於 en/，共用上一層的 style.css、script.js 與 assets；腳本內的素材路徑由 MOOTECH_ROOT 指回上一層。
def build_design_folder(folder):
    page = open(folder + "/index.html", encoding="utf-8").read()
    url = BASE + folder + "/"
    result = page.replace('<html lang="zh-Hant">', '<html lang="en">', 1)
    result = re.sub(r"<title>.*?</title>", f"<title>{meta['title']}</title>", result, count=1)
    result = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{meta["desc"]}">', result, count=1)
    result = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{meta["title"]}">', result, count=1)
    result = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{meta["desc"]}">', result, count=1)
    if D_SOCIAL_ZH in result:
        result = result.replace(D_SOCIAL_ZH, D_SOCIAL_EN)
        alt = D_SOCIAL_EN_ALT
    else:
        alt = meta["title"]
    result = re.sub(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{alt}">', result, count=1)
    for tag in ('<meta property="og:url" content="{}">', '<link rel="canonical" href="{}">'):
        assert tag.format(url) in result, folder + " 缺少 " + tag
        result = result.replace(tag.format(url), tag.format(url + "en/"), 1)
    result = result.replace('<meta property="og:locale" content="zh_TW">\n<meta property="og:locale:alternate" content="en_US">',
                            '<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="zh_TW">', 1)
    result = result.replace('<meta name="mootech-alt" content="en/">', '<meta name="mootech-alt" content="../">', 1)
    result = re.sub(r'(?<=["\'(\s,])assets/', "../assets/", result)
    result = result.replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="../style.css">', 1)
    result = result.replace('<script src="script.js"></script>',
                            '<script>window.MOOTECH_LANG = "en"; window.MOOTECH_ROOT = "../";</script>\n<script src="../script.js"></script>', 1)
    assert 'href="../style.css"' in result and 'src="../script.js"' in result, folder + " 結構不符"
    os.makedirs(folder + "/en", exist_ok=True)
    open(folder + "/en/index.html", "w", encoding="utf-8").write(result)
    print(folder + "/en/index.html written")


for v in "abcde":
    if os.path.isfile(f"design-{v}/index.html"):
        build_design_folder(f"design-{v}")
