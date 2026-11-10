"""重新產生思源黑體的字元子集（index.html 中 Noto Sans TC 連結的 text 參數）。

改動任何中文內容後執行：python3 tools/update-font-subset.py
"""
import re, urllib.parse

p = "index.html"
s = open(p, encoding="utf-8").read()
# 只收頁面上真的會用思源黑體顯示的字：去掉註解，以及使用系統字型的右下角客服視窗
# （text 參數過長時 Google Fonts 會改回傳整套字型的上百個切片，載入時反覆重排整頁）
scan = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
scan = re.sub(r"<!--.*?-->", "", scan, flags=re.S)
scan = re.sub(r'<div class="mtc[ "].*?</script>', "", scan, flags=re.S)
chars = sorted(set(c for c in scan if ord(c) > 0x2E7F))
text = urllib.parse.quote("".join(chars) + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:;!?-–—·/()&@%+→←↓✓●")
s, n = re.subn(r"(family=Noto\+Sans\+TC:wght@400;700;900&display=swap&text=)[^\"]*", lambda m: m.group(1) + text, s)
open(p, "w", encoding="utf-8").write(s)
print(f"{len(chars)} CJK chars, {n} links updated, url length {len(text)}")
if len(text) > 7000:
    print("警告：字元太多，Google Fonts 可能改回傳整套字型切片，請減少 index.html 中的中文用字或改用系統字型")

# 思源宋體只用在 class="serif" 的關鍵字（含英文版 data-en 裡的 serif）
s = open(p, encoding="utf-8").read()
serif = sorted(set("".join(re.findall(r'class="serif"[^>]*>([^<]*)<', s)) + "".join(re.findall(r"class=&quot;serif&quot;&gt;(.*?)&lt;", s))))
stext = urllib.parse.quote("".join(serif) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,")
s, n2 = re.subn(r'(family=Noto\+Serif\+TC:wght@900&display=swap&text=)[^"]*', lambda m: m.group(1) + stext, s)
open(p, "w", encoding="utf-8").write(s)
print(f"serif: {len(serif)} chars, {n2} links updated")
