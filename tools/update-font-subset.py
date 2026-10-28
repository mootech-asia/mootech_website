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
