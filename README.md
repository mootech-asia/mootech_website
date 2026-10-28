# MOOTECH 官網

單一檔案 `index.html`，內含四個設計版型，右側浮動按鈕可即時切換比較（手機版在底部）。

| 版型 | 走向 | 適合 |
| --- | --- | --- |
| A 企業信賴 | 延續原站藍白、資料中心走廊主視覺、卡片式解決方案 | 重視穩定與信任感的企業客戶 |
| B 網路維運中心 | 深色主控台、等寬字、節點連線動態、Bento 版面 | 強調網路與資安技術實力 |
| C 瑞士網格 | 純白、巨型字體、12 欄網格、單一青綠色 | 品牌辨識度、國際感，不依賴照片 |
| D 未來光感 | 純黑、玻璃擬態、品牌漸層大標、粒子雙螺旋、旋轉光框 CTA | 旗艦級科技感，第一眼衝擊力 |

- 切換方式：右側按鈕、鍵盤 `1` `2` `3` `4`，或網址 `#design-a` ～ `#design-d`
- 照片：原始檔在 `assets/photos-src/`，網站使用 `assets/photos/` 的 WebP（見下方「效能」）
- 中英切換：中文版 `/`、英文版 `/en/`（部署時由 `tools/build-en.py` 自動產生），翻譯字典在 `index.html` 的 `EN` 物件
- 響應式：桌機、平板、手機皆支援，手機版有漢堡選單
- 首頁動態視覺（走廊、節點網路、直播波形、地圖）為程式繪製
- 地圖上的資料中心位置（香港、新加坡、東京）是示意，請確認實際據點後修改 `index.html` 中的 `PINS`
- 聯絡表單尚未串接寄信服務

## 線上瀏覽

部署於 GitHub Pages：https://mootech-asia.github.io/mootech_website/

推送到 `main` 或 `claude/inspiring-hypatia-rpjq0j` 後，GitHub Actions（`.github/workflows/deploy-pages.yml`）會自動部署。

## 效能

- 動畫：畫布只在畫面上看得到時繪製，並限制幀率（走廊 24fps、節點與波形 30fps）；被照片蓋住或捲出畫面就停止。CPU 核心數或記憶體 ≤ 4、或開啟省流量模式時自動降載
- 圖片：WebP 多尺寸（一般 480/800/1280、全寬 960/1440/1920），全部延遲載入，沒在看的版型不下載；首頁輪播圖輪到前一張時才下載
- 換照片：把 JPG 放進 `assets/photos-src/<a|b|c>/`，執行 `python3 tools/optimize-images.py` 重新產生 WebP
- 字型：思源黑體只下載頁面用到的字（`index.html` 中 Noto Sans TC 連結的 `text` 參數）；改動中文內容後需重新產生
- 字型樣式表非同步載入，不阻擋首次繪製
- 動畫只動 transform / opacity；畫面外的區塊延後渲染（content-visibility）
- 支援 `prefers-reduced-motion`：系統開啟「減少動態」時停止所有動畫

### Lighthouse（本機實測）

| 版型 | 手機效能 | 桌機效能 | 無障礙 / 最佳實務 / SEO |
| --- | --- | --- | --- |
| A | 100 | 98 | 100 / 100 / 100 |
| B | 97 | 99 | 100 / 100 / 100 |
| C | 100 | 100 | 100 / 100 / 100 |

GitHub Pages 的快取時間固定為 10 分鐘，若要更長需另外接 CDN。

## SEO 與分享

- 社群分享縮圖：`assets/og.jpg`（1200×630）
- 結構化資料（Organization）、canonical、hreflang、`sitemap.xml`、`robots.txt`
- 正式網域上線時，把 `index.html`、`tools/build-en.py`、`sitemap.xml`、`robots.txt` 中的 `https://mootech-asia.github.io/mootech_website/` 換成正式網址

## 維護工具

| 指令 | 用途 |
| --- | --- |
| `python3 tools/optimize-images.py` | 換照片後重新產生 WebP |
| `python3 tools/update-font-subset.py` | 改動中文內容後更新字型子集 |
| `python3 tools/build-en.py` | 本機產生英文版（部署時自動執行） |
| `node tools/map-mask.mjs` | 重新產生地圖點陣（需先安裝檔案開頭註明的套件） |
