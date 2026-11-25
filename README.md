# MOOTECH 官網

單一檔案 `index.html`，內含五個設計版型，右側浮動按鈕可即時切換比較（手機版在底部）。

| 版型 | 走向 | 適合 |
| --- | --- | --- |
| A 企業信賴 | 延續原站藍白、資料中心走廊主視覺、卡片式解決方案 | 重視穩定與信任感的企業客戶 |
| B 網路維運中心 | 深色主控台、等寬字、節點連線動態、Bento 版面 | 強調網路與資安技術實力 |
| C 瑞士網格 | 純白、巨型字體、12 欄網格、單一青綠色 | 品牌辨識度、國際感，不依賴照片 |
| D 未來光感 | 純黑、玻璃擬態、品牌漸層大標、粒子雙螺旋、旋轉光框 CTA | 旗艦級科技感，第一眼衝擊力 |
| E 縱深 | 首屏影片輪播（黑曜石盾＋熊北招聘）、捲動時封包穿越四層防線、吉祥物熊北點綴 | 強調資安與品牌親和力 |

- 切換方式：右側按鈕、鍵盤 `1`～`5`，或網址 `#design-a` ～ `#design-e`
- 右下角客服「MOO 小熊」：五個版型共用，選擇題式對話（求職者／需求方／其他），可語音回答，最後整理成郵件寄出
- 中英切換：中文版 `/`、英文版 `/en/`（部署時由 `tools/build-en.py` 自動產生），翻譯字典在 `index.html` 的 `EN` 物件
- 響應式：桌機、平板、手機皆支援，手機版有漢堡選單
- 首頁動態視覺（走廊、節點網路、直播波形、地圖）為程式繪製
- 地圖上的資料中心位置（香港、新加坡、東京）是示意，請確認實際據點後修改 `index.html` 中的 `PINS`
- 各版聯絡表單統一為單欄：公司名稱（選填）、聯絡人、電子郵件、聯絡電話（選填）、簡單描述需求（選填）；聯絡人與電子郵件必填，按鈕為「送出需求」。
- 官網聯絡表單仍為設計預覽，尚未串接寄信服務；客服可整理內容後開啟郵件，寄到 contact@mootech.asia（人資信箱待提供）。

## 線上瀏覽

部署於 GitHub Pages：https://mootech-asia.github.io/mootech_website/


## 效能

- 動畫：畫布只在畫面上看得到時繪製，並限制幀率（走廊 24fps、節點與波形 30fps）；被照片蓋住或捲出畫面就停止。CPU 核心數或記憶體 ≤ 4、或開啟省流量模式時自動降載
- 圖片：WebP 多尺寸（一般 480/800/1280、全寬 960/1440/1920），全部延遲載入，沒在看的版型不下載；首頁輪播圖輪到前一張時才下載
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
| E | 91～97 | 100 | 100 / 100 / 100 |

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
| `python3 tools/make-loop.py 影片.mp4 --name e-hero-2` | 把 E 版首屏影片做成無縫循環並產生對齊的靜態圖（說明見 `assets/video/README.md`） |
| `node tools/map-mask.mjs` | 重新產生地圖點陣（需先安裝檔案開頭註明的套件） |

## 素材管理

- [跨 repo 素材目錄與製作標準](docs/ASSET_STANDARD.md)
- [素材編號、用途與規格清單](docs/ASSETS.md)
- 檢查：`python3 tools/assets.py check`；更新清單：`python3 tools/assets.py catalog`。
- 新功能製作清單：`python3 tools/assets.py brief --name 功能英文名稱`，有既有玩法範本時優先沿用範本。
網站正式圖片位於 assets/images/，影片位於 assets/videos/；現行照片和首屏影片原稿位於 source/images/、source/videos/。品牌原稿包保留 brand/ 的跨 repo 引用路徑，重複 ZIP 已移除。網站發布包不含 source、brand 或製作工具。換照片／影片時工具依 ASSET_MANIFEST.json 查出對應編號檔名，交付後核對規格並更新指紋。

## 協作與交接

Codex／Claude 接手請先讀 [CLAUDE.md](CLAUDE.md)、[AGENTS.md](AGENTS.md) 與 [HANDOFF.md](HANDOFF.md)。每次工作完成後更新交接紀錄、驗證範圍、發布狀態及待辦，避免依賴個別對話記憶。
