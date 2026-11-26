#!/usr/bin/env python3
"""從使用者提供的辦公室原始照片（SRCIMG057，2282×1514 無損 PNG）輸出網頁用 IMG179。

網頁上最大顯示約 678 CSS px（平板），高解析度螢幕約需 1356px，因此輸出 1600px 寬 WebP（品質 90）。
保留原檔的 ICC 色彩描述檔，讓顏色與原圖一致；不保留 EXIF。原始無損檔留在 source/，不上網站。
需要 Pillow：python3 -m pip install pillow（或在虛擬環境中執行）。
執行後請更新 ASSET_MANIFEST.json 的 bytes／sha256，並以 python3 tools/assets.py check 確認。
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source/images/mootech_website_SRCIMG057_culture-office.png"
TARGET = ROOT / "assets/images/mootech_website_IMG179_culture-office.webp"
WIDTH, QUALITY = 1600, 90

with Image.open(SOURCE) as original:
    icc = original.info.get("icc_profile")
    image = original.convert("RGB")  # 原檔 alpha 全為 255，不需要透明
    height = round(image.height * WIDTH / image.width)
    image = image.resize((WIDTH, height), Image.Resampling.LANCZOS)
    image.save(TARGET, "WEBP", quality=QUALITY, method=6, icc_profile=icc)
print("%s %dx%d %d KB" % (TARGET.relative_to(ROOT), WIDTH, height, TARGET.stat().st_size // 1024))
