"""重新產生思源黑體的字元子集（index.html 中 Noto Sans TC 連結的 text 參數）。

改動任何中文內容後執行：python3 tools/update-font-subset.py
"""
import re, urllib.parse

p = "index.html"
s = open(p, encoding="utf-8").read()
chars = sorted(set(c for c in s if ord(c) > 0x2E7F))
text = urllib.parse.quote("".join(chars) + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:;!?-–—·/()&@%+→←↓✓●")
s, n = re.subn(r"(family=Noto\+Sans\+TC:wght@400;700;900&display=swap&text=)[^\"]*", lambda m: m.group(1) + text, s)
open(p, "w", encoding="utf-8").write(s)
print(f"{len(chars)} CJK chars, {n} links updated")

# 思源宋體只用在 class="serif" 的關鍵字（含英文版 data-en 裡的 serif）
s = open(p, encoding="utf-8").read()
serif = sorted(set("".join(re.findall(r'class="serif"[^>]*>([^<]*)<', s)) + "".join(re.findall(r"class=&quot;serif&quot;&gt;(.*?)&lt;", s))))
stext = urllib.parse.quote("".join(serif) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,")
s, n2 = re.subn(r'(family=Noto\+Serif\+TC:wght@900&display=swap&text=)[^"]*', lambda m: m.group(1) + stext, s)
open(p, "w", encoding="utf-8").write(s)
print(f"serif: {len(serif)} chars, {n2} links updated")
