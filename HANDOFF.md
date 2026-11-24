# mootech_website — Codex／Claude 交接

更新日期：2026-11-20（Asia/Taipei）。適用本 repo 與同組專案協作；專案規則以 CLAUDE.md、AGENTS.md 與使用者最新指示為準。

## 開始前必讀

1. 先讀根目錄 `AGENTS.md`、`CLAUDE.md`，再讀本文件；素材工作另讀 [統一素材標準](docs/ASSET_STANDARD.md)、[用途清單](docs/ASSETS.md) 與根目錄 `ASSET_MANIFEST.json`。
2. 執行 `git status --short`、`git branch --show-current`、`git log -5 --oneline` 並核對遠端。先檢視未提交差異，不能把其他人的修改當成廢檔。
3. 依任務閱讀實際程式和相關子目錄規則；此交接是狀態快照，不取代 Git、設定或使用者的新指示。

## 跨 repo 導覽

| Repo | 用途 | 目前預設工作分支（2026-11-20 快照） | 交接文件 |
|---|---|---|---|
| cms_system | 多版本 CMS 預覽與四款活動 | `main` | [接手說明](https://github.com/mootech-asia/cms_system/blob/main/HANDOFF.md) |
| mootech_website | MOOTECH 官網 A～E、中英文及品牌來源 | `claude/inspiring-hypatia-rpjq0j` | [接手說明](https://github.com/mootech-asia/mootech_website/blob/claude/inspiring-hypatia-rpjq0j/HANDOFF.md) |
| bo_system | 第三方支付後台介面原型 | `claude/web-deployment-url-yvya4o` | [接手說明](https://github.com/mootech-asia/bo_system/blob/claude/web-deployment-url-yvya4o/HANDOFF.md) |
| Informatica-Administrator | Node 監控入口與設計交付頁 | `main` | [接手說明](https://github.com/mootech-asia/Informatica-Administrator/blob/main/HANDOFF.md) |

接手時重新查 `gh repo view mootech-asia/<repo> --json defaultBranchRef`；不可假設四個 repo 都以 main 作為預設分支或有相同部署設定。

## Codex／Claude 協作規則

- 使用者的新指示優先；依 repo 的現有授權工作，不把另一個 repo 的發布授權或技術選型直接套過來。
- 同一 repo 同時作業時，各用獨立 worktree／工作分支並約定負責檔案；若共用 main，必須串行提交。不得同時改同一份 manifest、共用引擎或 lockfile。
- 開工先說明本次範圍；提交前重新查看遠端與本機差異，只提交本次工作。遠端前進時先整合並重驗相關項目，不強制推送、不改寫別人的已發布提交。
- 不使用 reset／clean 或刪檔清空他人的工作；遇到不明修改先保留，透過 Git 差異判斷來源。未經使用者明確要求，不另派 subagent。
- 不修改 GitHub 環境保護、部署允許分支或審核條件來繞過發布失敗；記錄阻塞與原始錯誤。
- 不提交密碼、token、實際使用者資料或產生的資料庫。技術註解只記必要限制，工作歷程寫交接紀錄或 commit。

## 共用素材維護

- 正式素材按 images／music／sounds／effects／3d 分類；有實檔時才加 videos、fonts。新檔採專案或活動前綴＋分類編號，原稿與正式檔分離。
- `pathPolicy: contract` 是已登錄的公開／動態／品牌相容路徑，並不表示那些檔案已改成新檔名；先追引用再決定是否搬移，不複製一份圖只為了湊命名。
- manifest 是登錄來源，`docs/ASSETS.md` 是產生的清單。改素材時先驗尺寸、透明、動畫、UV／音量，再更新指紋及規格；`catalog` 不會替你自動驗收新圖或補算交付指紋。
- 同玩法換圖必須維持畫布、錨點、比例、UV、動畫時間；色票另調 CSS。更改骨架、輪廓或玩法需要工程配合。
- 四個 repo 的 `docs/ASSET_STANDARD.md`、`tools/assets.py`、`.github/workflows/asset-standard.yml` 目前內容一致。若改共用標準或 checker，需同步四份並在各 repo 驗證；單一專案細節留在自己的交接文件。

```bash
python3 tools/assets.py check
# 只有登錄資料變更時才重新產生清單：
python3 tools/assets.py catalog
# 新功能需要製作清單時：
python3 tools/assets.py brief --name feature_name
```

## 每次工作結束的交接要求

每次工作結束都更新本 repo `HANDOFF.md` 的「工作紀錄／下一步」，並同步必要的 README／入口連結；跨 repo 修改則更新各受影響 repo。記錄能由 Git、CI 或實際操作證實的事，不以聊天記憶當證據。

- 寫明做了什麼、改動檔案／功能、程式基準提交、目前分支、測試指令與結果、部署 run／失敗原因。
- 區分已完成、進行中、阻塞、未驗證與下一個可執行步驟；CI 素材檢查通過不等於業務、視覺或實機已驗收。
- 文件不放容器專屬暫存路徑或秘密。只有文件／規則變更時檢查差異與連結，不因此跑全站建置或瀏覽器；runtime 素材改動才按影響範圍做畫面及功能回歸。

交接紀錄格式：

```text
日期／負責者：
任務與狀態：已完成／進行中／阻塞
工作分支／程式提交：
修改範圍：
驗證指令與結果／CI 證據：
發布狀態／阻塞原因：
未驗證與下一步：
```

## 本 repo 結構與修改範圍

- `index.html`：A～E 五種版型、中文內容、EN 翻譯字典、Canvas／CSS 動態及客服介面。網址 #design-a～#design-e 可切換版型。
- `tools/build-en.py`：由 index.html 產生忽略提交的 en/index.html；改文案／路徑後要重新產生英文頁，不能只改生成檔。
- `assets/images/`、`assets/videos/`：編號正式交付；`source/images/`、`source/videos/` 是現行來源。
- `brand/moo-bear/`、`brand/moo-rabbit/`：跨 repo 參考的品牌原稿包，保留內部檔名與設定。重複 ZIP 已移除，不再新增兩份相同品牌包。
- `tools/asset_paths.py` 依 manifest 的 previousPath 對應照片／影片製作槽位；新增輸出槽位需先登錄，不能繞過編號另產生舊路徑素材。

## 本機與相關驗證

```bash
python3 -m http.server 8000
python3 tools/assets.py check
# 改中文版內容／網址後：
python3 tools/build-en.py
```

圖片／影片改動才使用 optimize-images.py／make-loop.py；不要為了整理文件反覆壓縮正式素材。換圖後測 A～E × 中文／英文 × 手機／桌機，尤其 srcset、影片 poster、客服動態貼圖與相對路徑。CI 只做登錄檢查，不代替實際畫面。

## 發布與待辦

- 預設分支為 claude/inspiring-hypatia-rpjq0j；deploy-pages.yml 也接受 main。推送前查目前遠端與 workflow，不擅自改預設分支。
- 部署時先生成英文頁，再排除 source、brand、tools、docs 等原稿／製作資料，只發布實際網站檔案。
- 聯絡表單及客服的聯絡動作仍以 mailto 為主；不能視為寄信後端已串接。資料中心位置與信箱等正式內容仍須業務確認。
- 下一步修改網站時沿用當前版型／token，不因素材重新分類改動布局；新增品牌素材先查是否已有可用原稿與授權。

## 工作紀錄／下一步

- 2026-11-20：素材整理基準 [commit a02ac85](https://github.com/mootech-asia/mootech_website/commit/a02ac85c92277ff04ebe46997640c2297d4aff00)；分支 `claude/inspiring-hypatia-rpjq0j`。這是程式／素材基準，不是本文件未來的最新版本號。
- 本 repo 層級登錄 129 項素材；[素材 CI](https://github.com/mootech-asia/mootech_website/actions/runs/44700777426) 已通過。
- 已完成：跨 repo 標準、用途清單、缺檔／編號／指紋檢查與協作入口。現有 contract 路徑仍保留，沒有宣稱所有舊檔都已改名。
- 本次交接補齊：本文件、Claude 閱讀入口及每次完工更新交接的規則；本次僅修改文件，不改 runtime 或部署保護設定。
- 前一輪有相關手機／桌機與語系操作驗證；本次未重新跑 UI／實機或後端驗收。接手改 runtime 時依上述指令與影響範圍重測，不把舊結果當成新驗收。

### 2026-11-25／Codex：品牌小綠人與客服去吉祥物

- 狀態：已完成實作；工作分支 `codex/brand-green-motion`，基準 `1557ee6`。使用者明確要求無五官，最終稿所有頭部均為光滑無眼、鼻、嘴；主色參考 Logo 黃綠 `#B6D24B`。
- D 版願景與六張文化卡改為七組透明 GIF（各 237×237、4 幀、1.4 秒循環）；新增減少動態偏好的靜態 PNG 與暫停按鈕。原稿 SRCIMG006、正式 IMG119–132、製作說明 `docs/art-green-motion.md`、重製工具 `tools/build-green-gifs.py`，已登錄清單與指紋。原稿留白不等距，工具使用人工核對的列界避免裁入鄰列道具。
- 共用客服移除所有人物頭像、視訊人物、吉祥物貼圖與熊表情字元，改用中性耳機圖示與 MOOTECH 客服名稱；舊圖保留原有公開路徑，客服不再載入。
- 驗證：`python3 tools/assets.py check` 通過 144 項素材；`python3 tools/build-en.py` 通過；`git diff --check` 通過。所有 inline JS 經 Node 語法檢查。
- Playwright／Chromium：A–E × 中英文 × 1440 桌機／390 手機（20 組）確認客服開啟、縮小與重開；客服內圖片與 SVG use 引用為 0，無 pageerror。D 版七組圖載入成功；暫停切換靜態、英文減少動態偏好使用 PNG 均通過。已目視核對無五官原稿、透明黑底合成與 GIF 幀裁切。
- 發布狀態：本次交付工作分支／PR，尚未合併或部署正式 GitHub Pages。下一步由使用者檢視角色風格及四關鍵幀循環節奏後合併；未以素材檢查宣稱已正式上線。客服沿用 mailto，未新增寄信後端。

#### 發布追記（使用者已授權上線）

- PR #1 已合併，正式 runtime 提交 `393cd3eaf6c0656e2915c7433c17d901d6482e9c`；分支 `claude/inspiring-hypatia-rpjq0j`。
- GitHub Pages 首次部署因上傳後 artifact metadata 暫時回傳 0 件而失敗；重跑同一 run 的失敗工作，第 2 次成功：[部署紀錄](https://github.com/mootech-asia/mootech_website/actions/runs/45361403197)。未修改環境保護或發布允許分支。
- 正式站 HTML 已含新功能，七支 GIF 下載指紋逐一符合 manifest。正式站 Chromium 驗證七組圖片載入、暫停切換、客服開啟及 3 個初始選項、無吉祥物圖片／人物引用、英文 reduced-motion PNG；無 pageerror。
- 已上線：https://mootech-asia.github.io/mootech_website/#design-d 。下一步：使用者檢視正式動畫效果；無待解部署阻塞。

### 漸層角色與動畫流暢度修正

- 使用者要求至少 12 fps、每個角色獨立出圖，並選定新青藍→薄荷→黃綠漸層、無五官造型。已改用單一核准原稿 SRCIMG007 與連續網格骨架動畫；不再裁切四關鍵幀拼圖。
- 七組 GIF 各 320×320、40 幀、2 秒，全部幀間隔 50ms（20 fps）。驗證每對相鄰幀含循環接點均不同；週期往返會重訪相同姿勢，不宣稱所有循環姿勢唯一。各情境另輸出獨立 PNG，沿用正式 IMG119–132 路徑並更新指紋。
- 工具 `tools/build-green-gifs.py`、`tools/gradient-motion.html` 可獨立重製；原稿、正式圖及規格已登錄。素材 check 通過 145 項、英文生成與 diff check 通過；D 版載入與暫停／reduced-motion／客服回歸另以 Chromium 驗證。
- 本輪使用者已選定造型，沿用本聊天上線授權發布；部署結果以下方追記為準。
