# D 版分享宣傳圖

用途：網站預設 D 版與專用 `/d/`、`/en/d/` 的 Open Graph／Twitter 預覽。

| 槽位 | 交付 | 規格 | 原稿 |
| --- | --- | --- | --- |
| 繁中 | IMG141 | 1200×630、不透明 JPEG、靜態單幀 | SRCIMG023 |
| 英文 | IMG142 | 1200×630、不透明 JPEG、靜態單幀 | SRCIMG024 |

以 SRCIMG015 核准的無五官、中性偏男性、光滑漸層角色為參考，製作手托網路節點球的獨立宣傳情境。黑底、青藍／薄荷／黃綠漸層，主標「透過創新推動企業發展」，服務列 IP Transit／IPLC／CDN／Live Streaming。英文保留同構圖並翻譯主標。原稿由 image generation 製作；正式檔以 ImageMagick 等比例近似原尺寸比縮放至社群標準，未重繪角色。

程式引用：`index.html` 中 og:image／twitter:image；`tools/build-en.py` 生成英文圖片引用及 D 專屬入口。原 `assets/og.jpg` 不刪除、不覆寫；E 版北極熊內容不變。分享圖為靜態單幀，不適用動畫、音效、3D 模型或 UV。
