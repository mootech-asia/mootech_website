#!/usr/bin/env python3
"""把根目錄 index.html 的 A～E 版型拆成五個獨立資料夾 design-a/～design-e/。

每個資料夾包含：
  index.html          只有該版型、共用圖示與客服；不含版型切換器
  style.css           只保留該版型可能命中的規則（其他版型專屬的選擇器、切換器樣式、未使用的動畫已移除）
  script.js           原有腳本，移除版型切換並固定版型；其他版型專屬的 E／B 互動段落已移除
  assets/             該頁實際引用的圖檔／影片完整副本（路徑與檔名同根目錄）
  ASSET_MANIFEST.json 副本登錄，由 tools/check-design-assets.py 檢查
  robots.txt、sitemap.xml  該版中英文網址；robots.txt 只在資料夾作為網域根目錄部署時才會被爬蟲讀取
英文頁 design-x/en/index.html 由 tools/build-en.py 產生（部署時自動執行，不提交）。

拆分後五個資料夾各自獨立維護，根目錄合併頁不受影響。重新執行會覆蓋上述產出，必須加 --force。
用法：python3 tools/split-designs.py [--force]
"""
import argparse
import copy
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mootech-asia.github.io/mootech_website/"
NAMES = {"a": "A 企業信賴", "b": "B 網路維運中心", "c": "C 瑞士網格", "d": "D 未來光感", "e": "E 縱深"}
# D 分享圖（中文／英文），需與 index.html 的 og:image 及 tools/build-en.py 的 D_SOCIAL_ZH／D_SOCIAL_EN 一致
D_SOCIAL = ("assets/images/mootech_website_IMG169_d-tech-social-zh.jpg", "assets/images/mootech_website_IMG170_d-tech-social-en.jpg")
DEFAULT_SOCIAL = "assets/og.jpg"
ASSET_RE = re.compile(r"assets/[A-Za-z0-9_./-]+?\.(?:png|jpe?g|webp|svg|gif|mp4|webm)")


def take(text, start, end):
    """回傳 text 中 start 標記（含）到其後第一個 end 標記（不含）之間的內容。"""
    i = text.index(start)
    return text[i:text.index(end, i + len(start))]


def sub_once(pattern, repl, text, flags=0):
    result, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit("找不到預期內容，index.html 結構已變更：" + pattern[:60])
    return result


def replace_once(old, new, text):
    if text.count(old) != 1:
        raise SystemExit("預期內容應出現一次：" + old[:60])
    return text.replace(old, new)


# ---------------------------------------------------------------- CSS

def skip_string(css, i):
    q = css[i]; i += 1
    while css[i] != q:
        i += 2 if css[i] == "\\" else 1
    return i + 1


def find_stop(css, i, stops):
    """從 i 往後找第一個位於字串、括號與註解之外的 stops 字元。"""
    depth = 0
    while i < len(css):
        ch = css[i]
        if ch in "\"'":
            i = skip_string(css, i); continue
        if css.startswith("/*", i):
            i = css.index("*/", i) + 2; continue
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif depth == 0 and ch in stops:
            return i
        i += 1
    return i


def block_end(css, i):
    """i 指向 '{'，回傳對應 '}' 之後的位置。"""
    depth = 0
    while True:
        ch = css[i]
        if ch in "\"'":
            i = skip_string(css, i); continue
        if css.startswith("/*", i):
            i = css.index("*/", i) + 2; continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1


def parse_css(css, i=0, end=None):
    """切成節點：comment／rule／group（@media 等可巢狀）／raw（@keyframes、@font-face 等）。"""
    end = len(css) if end is None else end
    nodes = []
    while i < end:
        j = i
        while j < end and css[j].isspace():
            j += 1
        lead = css[i:j]
        if j >= end:
            break
        if css.startswith("/*", j):
            k = css.index("*/", j) + 2
            nodes.append({"type": "comment", "lead": lead, "text": css[j:k]}); i = k; continue
        k = find_stop(css, j, "{;}")
        if css[k] == ";":
            nodes.append({"type": "raw", "lead": lead, "text": css[j:k + 1]}); i = k + 1; continue
        prelude = css[j:k]; close = block_end(css, k)
        if re.match(r"@(media|supports|container|layer)\b", prelude):
            nodes.append({"type": "group", "lead": lead, "prelude": prelude, "children": parse_css(css, k + 1, close - 1),
                          "tail": re.search(r"\s*$", css[k + 1:close - 1]).group(0)})
        elif prelude.startswith("@"):
            name = re.match(r"@(?:-webkit-)?keyframes\s+([\w-]+)", prelude)
            nodes.append({"type": "raw", "lead": lead, "text": css[j:close], "keyframes": name.group(1) if name else None})
        else:
            nodes.append({"type": "rule", "lead": lead, "selector": prelude, "body": css[k:close]})
        i = close
    return nodes


def split_selectors(selector):
    parts, i, start = [], 0, 0
    while True:
        k = find_stop(selector, i, ",")
        parts.append(selector[start:k])
        if k >= len(selector):
            return parts
        i = start = k + 1


def strip_not(selector):
    out, i = "", 0
    while True:
        k = selector.find(":not(", i)
        if k < 0:
            return out + selector[i:]
        out += selector[i:k]; depth, j = 0, k + 4
        while True:
            depth += selector[j] == "("; depth -= selector[j] == ")"; j += 1
            if depth == 0:
                break
        i = j


def selector_scopes(item):
    """選擇器的版型作用域：.va／#va、.sp-a／.pt-a、[data-v="a"] 等。"""
    s = strip_not(item)
    found = set(re.findall(r"[.#]v([a-e])(?![\w-])", s))
    found |= set(re.findall(r"[.#](?:sp|pt)-([a-e])(?![\w-])", s))
    found |= set(re.findall(r'\[data-(?:v|variant|init)="([a-e])"\]', s))
    return found


def keep_selector(item, v, page):
    if re.search(r"(?<![\w-])\.(?:switcher|sw-[\w-]+)\b", item):
        return False
    scopes = selector_scopes(item)
    if scopes and v not in scopes:
        return False
    # 其他版型命名的 class／id（例如 A～D 共用 D 的 .vd-careers 招募區）：本頁實際用到才保留
    for name, letter in re.findall(r"[.#](v([a-e])-[\w-]+)", strip_not(item)):
        if letter != v and not re.search(r"(?<![\w-])" + re.escape(name) + r"(?![\w-])", page):
            return False
    return True


def filter_nodes(nodes, v, page):
    out = []
    pending = []  # 註解跟隨下一個節點：節點被移除時一起移除
    for node in nodes:
        if node["type"] == "comment":
            pending.append(node); continue
        if node["type"] == "rule":
            items = split_selectors(node["selector"])
            kept = [s for s in items if keep_selector(s, v, page)]
            if not kept:
                pending = []; continue
            if len(kept) != len(items):
                node = dict(node, selector=",".join(kept).strip() + " ")
        elif node["type"] == "group":
            children = filter_nodes(node["children"], v, page)
            if not any(c["type"] != "comment" for c in children):
                pending = []; continue
            node = dict(node, children=children)
        out.extend(pending); pending = []
        out.append(node)
    return out + pending


def prune_keyframes(nodes, used):
    out = []
    for node in nodes:
        if node["type"] == "raw" and node.get("keyframes") and not re.search(r"(?<![\w-])" + re.escape(node["keyframes"]) + r"(?![\w-])", used):
            continue
        if node["type"] == "group":
            node = dict(node, children=prune_keyframes(node["children"], used))
            if not any(c["type"] != "comment" for c in node["children"]):
                continue
        out.append(node)
    return out


def render(nodes):
    text = ""
    for n in nodes:
        if n["type"] == "comment":
            text += n["lead"] + n["text"]
        elif n["type"] == "rule":
            text += n["lead"] + n["selector"] + n["body"]
        elif n["type"] == "group":
            text += n["lead"] + n["prelude"] + "{" + render(n["children"]) + n["tail"] + "}"
        else:
            text += n["lead"] + n["text"]
    return text


def keyframe_free(nodes):
    """把 @keyframes 定義以外的 CSS 串起來，用來判斷動畫名稱是否還被使用。"""
    return render([dict(n, children=[c for c in n["children"] if not c.get("keyframes")]) if n["type"] == "group" else n
                   for n in nodes if not n.get("keyframes")])


def build_css(css, v, page_text):
    nodes = filter_nodes(parse_css(css), v, page_text)
    for _ in range(3):  # 動畫可能被另一段已移除的動畫引用，重複幾輪直到穩定
        nodes = prune_keyframes(nodes, keyframe_free(nodes) + page_text)
    return render(nodes).strip() + "\n"


# ---------------------------------------------------------------- JS

def build_js(main, chat, extras, v):
    main = sub_once(r"  var NOTES = \{\n.*?\n  \};\n", "", main, re.S)
    main = replace_once("  var current = null;\n", "", main)
    start = main.index("  /* ---------- 切換版型 ---------- */")
    end = main.index("  var anchorNavigation = 0;\n")
    main = main[:start] + (
        "  /* ---------- 版型固定（獨立頁，不提供切換） ---------- */\n"
        "  function show(v) {\n"
        "    document.body.setAttribute(\"data-v\", v);\n"
        "    var root = document.getElementById(\"v\" + v);\n"
        "    root.querySelectorAll(\"svg[data-map]\").forEach(drawMap);\n"
        "    setupArt(root); kick();\n"
        "    root.querySelectorAll(\".ve-hero\").forEach(function (h) { if (h._play) h._play(); });\n"
        "    root.querySelectorAll(\"[data-query]\").forEach(function (f) { if (f._run && !f._ran) { f._ran = true; setTimeout(f._run, 700); } });\n"
        "  }\n\n") + main[end:]
    main = sub_once(r"  var init = .*?\n  show\(init \|\| \"d\"\);\n", "  show(\"%s\");\n" % v, main, re.S)
    # 移除其他版型專屬的互動段落（段落以「  /* ---------- 標題」開頭，到下一個段落標題為止）
    segments = re.split(r"(?m)^(?=  /\* -{10} )", main)
    kept = []
    for seg in segments:
        title = re.match(r"  /\* -{10} (\S+)", seg)
        owner = title and re.match(r"([A-E])(?:[：\s]|$)", title.group(1))
        if owner and owner.group(1).lower() != v:
            continue
        kept.append(seg)
    main = "".join(kept)
    chat = sub_once(r"(?m)^\(function \(\) \{\n", "(function () {\n  /* 英文頁位於 en/，由頁面設定 MOOTECH_ROOT 指回本資料夾 */\n  var ASSET_ROOT = window.MOOTECH_ROOT || \"\";\n", chat)
    if chat.count('"assets/') != 2:
        raise SystemExit("客服腳本的素材路徑數量已變更，請檢查 split-designs.py")
    chat = chat.replace('"assets/', 'ASSET_ROOT + "assets/')
    parts = [main, chat] + extras
    header = "/* MOOTECH 官網 %s 版：由 tools/split-designs.py 自 index.html 拆出，之後獨立維護。 */\n" % NAMES[v]
    return header + "\n".join(p.strip("\n") + "\n" for p in parts)


# ---------------------------------------------------------------- HTML

def build_head(head, v):
    folder = BASE + "design-%s/" % v
    head = sub_once(r"<script>\n  \(function \(\) \{\n    var m = location\.hash.*?</script>\n", "", head, re.S)
    head = sub_once(r"<style>\n  html\[data-init\].*?</style>\n", "", head, re.S)  # 移入 style.css
    head = replace_once('<link rel="canonical" href="%s">' % BASE, '<link rel="canonical" href="%s">' % folder, head)
    head = replace_once('<meta property="og:url" content="%s">' % BASE, '<meta property="og:url" content="%s">' % folder, head)
    for code, dest in [("zh-Hant", folder), ("en", folder + "en/"), ("x-default", folder)]:
        head = sub_once(r'<link rel="alternate" hreflang="%s" href="[^"]*">' % code, '<link rel="alternate" hreflang="%s" href="%s">' % (code, dest), head)
    if BASE + D_SOCIAL[0] not in head:
        raise SystemExit("index.html 的 og:image 已不是 %s，請同步 split-designs.py 與 build-en.py 的 D 分享圖" % D_SOCIAL[0])
    if v != "d":
        head = head.replace(D_SOCIAL[0], DEFAULT_SOCIAL)
        head = sub_once(r'<meta property="og:image:alt" content="[^"]*">', '<meta property="og:image:alt" content="MOOTECH｜透過創新推動企業發展">', head)
    # 頁面自帶素材副本：絕對網址的圖片改指向本資料夾
    head = head.replace(BASE + "assets/", folder + "assets/")
    return head + '<link rel="stylesheet" href="style.css">\n</head>\n'


def build_robots(v):
    return "User-agent: *\nAllow: /\n\nSitemap: %sdesign-%s/sitemap.xml\n" % (BASE, v)


def build_sitemap(v):
    zh, en = BASE + "design-%s/" % v, BASE + "design-%s/en/" % v
    links = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>\n' % (code, url)
                    for code, url in [("zh-Hant", zh), ("en", en), ("x-default", zh)])
    urls = "".join("  <url>\n    <loc>%s</loc>\n%s  </url>\n" % (loc, links) for loc in (zh, en))
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + urls + "</urlset>\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="覆蓋已存在的 design-x 資料夾產出")
    args = parser.parse_args()
    targets = [ROOT / ("design-" + v) for v in NAMES]
    if not args.force and any(t.exists() for t in targets):
        raise SystemExit("design-a～design-e 已存在且可能已獨立修改；確認要以 index.html 重新產生時加 --force")

    src = (ROOT / "index.html").read_text(encoding="utf-8")
    css_start = src.index("<style>\n/*")
    head = src[:css_start]
    css = src[css_start + len("<style>\n"):src.index("\n</style>\n</head>")]
    # head 前段另有一段 <style>：前三行是切換器的首屏預設版型（移除），其餘為後加的共用規則，需排在主樣式之前以維持層疊順序
    early = re.search(r"<style>\n(  html\[data-init\].*?)</style>\n", head, re.S).group(1)
    early_lines = early.split("\n")
    if not all("data-init" in line for line in early_lines[:3]) or any("data-init" in line for line in early_lines[3:]):
        raise SystemExit("head 前段 <style> 結構已變更，請檢查 split-designs.py")
    css = "\n".join(early_lines[3:]).strip("\n") + "\n\n" + css
    sprite = take(src, "<!-- 共用圖示 -->", "\n\n<!-- =====")
    switcher_end = src.index("</aside>", src.index('<aside class="switcher"')) + len("</aside>")
    tail = src[switcher_end:src.index("</body>")]
    # 尾端依序為：主腳本、客服 HTML、客服腳本、共用回頂按鈕、回頂腳本、C 版橫向場景腳本、願景圖文輪播（A～E 共用）
    pieces = re.split(r"<script>\n(.*?)</script>\n", tail, flags=re.S)
    markup, scripts = pieces[0::2], pieces[1::2]
    if len(scripts) != 5 or 'id="mt-chat"' not in markup[1] or "data-top-btn" not in markup[2] \
            or "data-top-btn" not in scripts[2] or "getElementById('vc-field')" not in scripts[3] \
            or "[data-vision-carousel]" not in scripts[4] or any(m.strip() for m in markup[3:]):
        raise SystemExit("index.html 尾端結構已變更，請檢查 split-designs.py")
    main_js, chat_js, top_js, c_field_js, vision_js = scripts
    chat_html, top_html = markup[1].strip("\n") + "\n", markup[2].strip("\n") + "\n"
    manifest = json.loads((ROOT / "ASSET_MANIFEST.json").read_text(encoding="utf-8"))
    by_path = {a["path"]: a for a in manifest["assets"]}

    for v, name in NAMES.items():
        folder = ROOT / ("design-" + v)
        block = take(src, "<!-- ======================= 版型 " + v.upper(), "\n\n<!-- =====")
        block = block.replace('data-variant="%s" hidden>' % v, 'data-variant="%s">' % v, 1)
        chat = chat_html if v == "e" else re.sub(r' data-mascot-src="[^"]*"', "", chat_html)
        # C 版橫向場景腳本未檢查 #vc-field 是否存在，只放進 C
        js = build_js(main_js, chat_js, [top_js] + ([c_field_js] if v == "c" else []) + [vision_js], v)
        top = top_html.replace('href="#vd-top"', 'href="#v%s-top"' % v, 1)
        body = ('<body data-v="%s">\n\n%s\n\n%s\n\n%s%s<script src="script.js"></script>\n</body>\n</html>\n'
                % (v, sprite.strip("\n"), block.strip("\n"), chat, top))
        html = build_head(head, v) + body
        html = re.sub(r"(?m)[ \t]+$", "", html)  # 原檔有兩行只含空白的縮排行
        style = build_css(css, v, html + js)
        style = "/* MOOTECH 官網 %s 版樣式：由 tools/split-designs.py 自 index.html 拆出，之後獨立維護。 */\n%s" % (name, style)

        # 只有 E 版會實際載入客服熊圖；其他版的腳本仍保留同一段客服程式，但不會走到載入圖片
        refs = set(ASSET_RE.findall(html)) | set(ASSET_RE.findall(style))
        if v == "e":
            refs |= set(ASSET_RE.findall(js))
        if v == "d":
            refs.add(D_SOCIAL[1])  # 英文頁分享圖
        missing = sorted(r for r in refs if r not in by_path)
        if missing:
            raise SystemExit("引用的素材未在根目錄清單登錄：" + ", ".join(missing))

        if folder.exists():
            for p in ["index.html", "style.css", "script.js", "ASSET_MANIFEST.json", "robots.txt", "sitemap.xml"]:
                (folder / p).unlink(missing_ok=True)
            shutil.rmtree(folder / "assets", ignore_errors=True)
        folder.mkdir(exist_ok=True)
        (folder / "index.html").write_text(html, encoding="utf-8")
        (folder / "style.css").write_text(style, encoding="utf-8")
        (folder / "script.js").write_text(js, encoding="utf-8")
        (folder / "robots.txt").write_text(build_robots(v), encoding="utf-8")
        (folder / "sitemap.xml").write_text(build_sitemap(v), encoding="utf-8")

        entries = []
        for ref in sorted(refs):
            dest = folder / ref
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / ref, dest)
            entry = copy.deepcopy(by_path[ref])
            entry.pop("previousPath", None)
            entry["copiedFrom"] = ref
            entries.append(entry)
        sub = {
            "standardVersion": manifest.get("standardVersion"),
            "repository": manifest["repository"] + "/design-" + v,
            "prefix": manifest["prefix"],
            "root": "design-" + v,
            "notes": ["%s 獨立頁的素材副本；path 相對於本資料夾，copiedFrom 為拆分時的根目錄來源。副本與根目錄各自維護，改圖後更新本清單的 sha256／規格。" % name],
            "procedural": [{"path": "script.js", "purpose": "%s 版的 Canvas／CSS 場景、地圖與客服動態" % name}],
            "assets": entries,
        }
        (folder / "ASSET_MANIFEST.json").write_text(json.dumps(sub, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        size = sum((folder / r).stat().st_size for r in refs)
        print("design-%s：HTML %d KB、CSS %d KB、JS %d KB、素材 %d 項 %.1f MB" % (
            v, len(html.encode()) // 1024, len(style.encode()) // 1024, len(js.encode()) // 1024, len(refs), size / 1e6))

    delegates = [d for d in manifest.get("delegates", []) if not re.fullmatch(r"design-[a-e]", d.get("root", ""))]
    delegates += [{"root": "design-" + v, "manifest": "design-%s/ASSET_MANIFEST.json" % v,
                   "check": ["python3", "tools/check-design-assets.py", "design-" + v]} for v in NAMES]
    manifest["delegates"] = delegates
    (ROOT / "ASSET_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("已更新根目錄 ASSET_MANIFEST.json 的 delegates")


if __name__ == "__main__":
    sys.exit(main())
