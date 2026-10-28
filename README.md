# MOOTECH 官網

單一檔案 `index.html`，內含三個設計版型，右側浮動按鈕可即時切換比較（手機版在底部）。

| 版型 | 走向 | 適合 |
| --- | --- | --- |
| A 企業信賴 | 延續原站藍白、資料中心走廊主視覺、卡片式解決方案 | 重視穩定與信任感的企業客戶 |
| B 網路維運中心 | 深色主控台、等寬字、節點連線動態、Bento 版面 | 強調網路與資安技術實力 |
| C 瑞士網格 | 純白、巨型字體、12 欄網格、單一青綠色 | 品牌辨識度、國際感，不依賴照片 |

- 切換方式：右側按鈕、鍵盤 `1` `2` `3`，或網址 `#design-a` / `#design-b` / `#design-c`
- 目前視覺（走廊、節點網路、直播波形、地圖）都是程式繪製，不需要圖片檔
- 地圖上的資料中心位置（香港、新加坡、東京）是示意，請確認實際據點後修改 `index.html` 中的 `PINS`
- 聯絡表單尚未串接寄信服務

## 線上瀏覽

部署於 GitHub Pages：https://mootech-asia.github.io/mootech_website/

推送到 `main` 或 `claude/inspiring-hypatia-rpjq0j` 後，GitHub Actions（`.github/workflows/deploy-pages.yml`）會自動部署。
