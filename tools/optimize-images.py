"""把 assets/photos-src/ 的原始 JPG 轉成網站用的多尺寸 WebP（輸出到 assets/photos/）。

用法：python3 tools/optimize-images.py
換照片時把新的 JPG 用同檔名放進 assets/photos-src/<a|b|c>/，再執行一次即可。
"""
import os
from PIL import Image

SRC, OUT = "assets/photos-src", "assets/photos"
WIDE = ("hero", "cta")          # 全寬圖：960 / 1440 / 1920
QUALITY = 74

def widths(name):
    return (960, 1440, 1920) if name.startswith(WIDE) else (480, 800, 1280)

total = 0
for folder in sorted(os.listdir(SRC)):
    src_dir, out_dir = os.path.join(SRC, folder), os.path.join(OUT, folder)
    if not os.path.isdir(src_dir):
        continue
    os.makedirs(out_dir, exist_ok=True)
    for f in sorted(os.listdir(src_dir)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        name = os.path.splitext(f)[0]
        im = Image.open(os.path.join(src_dir, f)).convert("RGB")
        for w in widths(name):
            out = os.path.join(out_dir, f"{name}-{w}.webp")
            r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(out, "WEBP", quality=QUALITY, method=6)
            total += os.path.getsize(out)
print(f"done, {total // 1024} KB")
