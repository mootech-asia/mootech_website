#!/usr/bin/env python3
"""把一個獨立版型資料夾（design-a～design-e）做成可上傳到另一個網址的發佈用副本。

用法：
  python3 tools/publish-design.py d https://www.example.com/
  python3 tools/publish-design.py d https://www.example.com/ --out dist/example --force

流程：
  1. 執行 tools/build-en.py，產生最新的英文頁 design-x/en/。
  2. 檢查 design-x 的素材副本（tools/check-design-assets.py）。
  3. 複製 design-x 到輸出資料夾（預設 dist/<版型>-<網域>/），排除內部用的 ASSET_MANIFEST.json。
  4. 把寫死的 GitHub Pages 網址換成新網址：canonical、hreflang、og:url、og:image、twitter:image、
     JSON-LD 的 url／logo、robots.txt 的 Sitemap 與 sitemap.xml。
  5. 確認沒有殘留舊網址，且頁面引用的本機檔案都在輸出資料夾內。

只改輸出資料夾，不會修改 design-x 本身（design-x 由 split-designs.py 重新產生時會被覆蓋，網址不應改在那裡）。
新網址可以是網域根目錄或子路徑，結尾斜線可省略。輸出資料夾直接上傳到該網址對應的位置即可。
依地區切換語系需要網站經過 Cloudflare 代理（/cdn-cgi/trace），否則所有訪客都會看到英文。
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mootech-asia.github.io/mootech_website/"  # 與 split-designs.py、build-en.py 相同
TEXT = {".html", ".xml", ".txt", ".css", ".js", ".json", ".svg", ".webmanifest"}
EXCLUDE = {"ASSET_MANIFEST.json", ".DS_Store", "Thumbs.db"}
REQUIRED = ["index.html", "en/index.html", "style.css", "script.js", "robots.txt", "sitemap.xml", "assets"]


def fail(message):
    raise SystemExit("錯誤：" + message)


def normalize_url(url):
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        fail("網址需以 https:// 開頭並包含網域，例如 https://www.example.com/")
    if parts.query or parts.fragment:
        fail("網址不可包含 ? 或 #")
    path = parts.path if parts.path.endswith("/") else parts.path + "/"
    return "%s://%s%s" % (parts.scheme, parts.netloc, path)


def local_refs(page, text, out):
    """回傳頁面引用、但輸出資料夾裡不存在的本機檔案。"""
    found = set()
    for value in re.findall(r'(?:src|href|poster)="([^"]+)"', text):
        found.add(value)
    for value in re.findall(r'srcset="([^"]+)"', text):
        found.update(part.strip().split(" ")[0] for part in value.split(","))
    for value in re.findall(r"url\((['\"]?)([^'\")]+)\1\)", text):
        found.add(value[1])
    if page.suffix == ".js":  # 腳本內的素材路徑相對於版型根目錄
        found.update(re.findall(r"""["'](assets/[^"'\s)]+)["']""", text))
    missing = []
    for ref in found:
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|%23)", ref, re.I) or "${" in ref or "' +" in ref or '" +' in ref:
            continue
        target = (page.parent / ref.split("#")[0].split("?")[0]).resolve()
        if out.resolve() not in target.parents and target != out.resolve():
            missing.append("%s → %s（指到輸出資料夾外）" % (page.relative_to(out), ref))
        elif not target.exists():
            missing.append("%s → %s" % (page.relative_to(out), ref))
    return missing


def main():
    sys.stdout.reconfigure(line_buffering=True)
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("variant", choices=list("abcde"), help="版型代號，例如 d")
    parser.add_argument("url", help="要發佈到的網址，例如 https://www.example.com/")
    parser.add_argument("--out", help="輸出資料夾（預設 dist/<版型>-<網域>）")
    parser.add_argument("--force", action="store_true", help="輸出資料夾已存在時先刪除再產生")
    args = parser.parse_args()

    new_base = normalize_url(args.url)
    source = ROOT / ("design-" + args.variant)
    if not (source / "index.html").is_file():
        fail("%s 不存在，請先執行 python3 tools/split-designs.py" % source.relative_to(ROOT))
    host = urlsplit(new_base).netloc
    out = Path(args.out) if args.out else ROOT / "dist" / ("design-%s-%s" % (args.variant, host.replace(":", "_")))
    out = out if out.is_absolute() else Path.cwd() / out
    # 安全限制：--force 會刪除輸出資料夾，專案內只允許 dist/ 底下，也不可是專案的上層
    resolved, dist = out.resolve(), (ROOT / "dist").resolve()
    if resolved in ROOT.parents or (ROOT in resolved.parents or resolved == ROOT) and dist not in resolved.parents:
        fail("輸出資料夾在專案內時必須位於 dist/ 底下：%s" % out)
    if out.exists() and any(out.iterdir()):
        if not args.force:
            fail("輸出資料夾已存在且不是空的：%s（確認要覆蓋時加 --force）" % out)
        shutil.rmtree(out)

    print("1/5 產生英文頁")
    subprocess.run([sys.executable, str(ROOT / "tools" / "build-en.py")], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    print("2/5 檢查素材副本")
    subprocess.run([sys.executable, str(ROOT / "tools" / "check-design-assets.py"), source.name], cwd=ROOT, check=True)

    print("3/5 複製 %s → %s" % (source.relative_to(ROOT), out))
    shutil.copytree(source, out, ignore=shutil.ignore_patterns(*EXCLUDE))
    missing = [name for name in REQUIRED if not (out / name).exists()]
    if missing:
        fail("輸出缺少必要檔案：" + "、".join(missing))

    print("4/5 替換網址 %s → %s" % (BASE + source.name + "/", new_base))
    old_folder = BASE + source.name + "/"
    total, changed = 0, []
    for path in sorted(p for p in out.rglob("*") if p.is_file() and p.suffix.lower() in TEXT):
        text = path.read_text(encoding="utf-8")
        # 先換版型資料夾網址，再換網站根網址（JSON-LD 的公司網址）
        count = text.count(old_folder) + text.replace(old_folder, "").count(BASE)
        if count:
            text = text.replace(old_folder, new_base).replace(BASE, new_base)
            path.write_text(text, encoding="utf-8")
            total += count
            changed.append("%s（%d）" % (path.relative_to(out), count))
    if not total:
        fail("找不到任何舊網址，split-designs.py／build-en.py 的網址可能已變更，請檢查本工具的 BASE")
    for item in changed:
        print("    " + item)

    print("5/5 檢查")
    problems, warnings = [], []
    old_host = urlsplit(BASE).netloc
    for path in (p for p in out.rglob("*") if p.is_file() and p.suffix.lower() in TEXT):
        text = path.read_text(encoding="utf-8")
        if old_host in text:
            problems.append("殘留舊網址：%s" % path.relative_to(out))
        if path.suffix in (".html", ".css"):
            problems.extend("缺檔：" + m for m in local_refs(path, text, out))
        elif path.suffix == ".js":
            # 共用腳本保留各版程式（例如只有 E 版客服會載入的貼圖），split-designs.py 只附帶該版實際用到的素材
            warnings.extend(local_refs(path, text, out))
    for name in ("index.html", "en/index.html"):
        text = (out / name).read_text(encoding="utf-8")
        for tag in ("canonical", 'hreflang="zh-Hant"', 'hreflang="en"', "og:url", "og:image"):
            if not re.search(r'%s"? (?:href|content)="%s' % (re.escape(tag), re.escape(new_base)), text) \
                    and not re.search(r'%s[^>]*(?:href|content)="%s' % (re.escape(tag), re.escape(new_base)), text):
                problems.append("%s 的 %s 未指向新網址" % (name, tag))
    if problems:
        fail("\n  " + "\n  ".join(sorted(set(problems))))

    if warnings:
        print("  注意：腳本內有 %d 個路徑在輸出中不存在，屬其他版型專用、此版不會載入：" % len(warnings))
        for item in sorted(warnings):
            print("    " + item)
    files = [p for p in out.rglob("*") if p.is_file()]
    size = sum(p.stat().st_size for p in files)
    print("\n完成：%s" % out)
    print("  %d 個檔案、%.1f MB，共替換 %d 處網址" % (len(files), size / 1e6, total))
    print("  中文頁 %s，英文頁 %sen/" % (new_base, new_base))
    print("  將此資料夾的內容上傳到網站根目錄（或該子路徑）即可。")
    print("  提醒：依地區切換語系需要網站經過 Cloudflare 代理，否則所有訪客會看到英文。")


if __name__ == "__main__":
    main()
