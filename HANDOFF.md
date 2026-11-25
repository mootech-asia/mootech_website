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
- 發布完成：runtime `0d46667`；[Pages run 45363074494](https://github.com/mootech-asia/mootech_website/actions/runs/45363074494) 首次成功。正式站七支 GIF 與七張獨立 PNG 均逐檔下載比對指紋。使用者可於 D 版查看新造型與 20 fps 動畫。

### 回到頂端避開客服

- 將 D 版回到頂端移至左下安全區，與預設右下客服分開；客服展開時隱藏，縮小客服拖到左下時，回頂按鈕自動改到右側。監聽客服狀態／位置／尺寸與視窗變化。
- Chromium 回歸：390／1440 × 中英文，驗證來電小窗、左側已拖曳縮小入口、開啟／縮小客服與回頂點擊，無重疊、無 pageerror。英文頁生成與 diff check 通過。沿用上線授權發布。

### 情境動作與角色一致性修正

- 前版使用同一張揮手圖變形、加不同圖示，未滿足不同情境的姿勢／角度要求。使用者再次指定必須保留 SRCIMG007 的無五官、一體平滑手腳與漸層，不可增加可見關節。
- 已以該角色分別編製六張獨立情境原稿 SRCIMG008–013：雙人相向擊掌、斜後側白板講解、側面坐姿打字、跨步回身帶位、斜側坐姿舉杯、正面屈膝雙手啞鈴；願景沿用原角色。各原稿另作相應局部連續網格動畫，不再共用揮手底圖。不宣稱為完整 3D 骨架／相機轉動動畫。過程中未採用的模型實驗未提交／發布。
- 正式 IMG119–132 現為 360×360，GIF 各 40 幀／2 秒、每幀 50ms（20 fps）。逐檔驗證相鄰及循環接點有變化，原稿與正式輸出均更新登錄及指紋；素材檢查通過 151 項、英文生成、JS 語法及 diff check 通過。
- 已目視核對六情境黑底對照，身體輪廓與道具接觸不同、無球形關節；D 版圖片載入、動畫暫停、英文減少動態靜態圖與無吉祥物客服以 Chromium 回歸。HTML 圖片加版本查詢，避免舊 GIF 快取。
- 回到頂端避開客服修正 `98e36f9` 已部署成功：[run 45363658238](https://github.com/mootech-asia/mootech_website/actions/runs/45363658238)，本輪保留。角色新版本發布結果以下方追記為準。
- 已發布：runtime `5794e96`；[Pages run 45365740012](https://github.com/mootech-asia/mootech_website/actions/runs/45365740012) 成功。正式 HTML 已使用 `?v=poses2` 新資源查詢，避免瀏覽器沿用先前揮手圖。正式素材逐檔比對指紋與前端回歸結果另由執行紀錄確認。

### 客服漸層與回到頂端持續顯示

- 依使用者截圖移除「暫停角色動畫」按鈕及其腳本／樣式；保留 OS reduced-motion 靜態圖。客服耳機改共用 SVG 漸層，接聽按鈕與縮小入口外圈、光暈、狀態點改青藍 #22B5D6 → 薄荷 #62C5AE → 黃綠 #ACD65E；未恢復吉祥物。
- 使用者反映回頂消失：取消客服展開時隱藏的規則。回頂仍位於左下，若與拖曳入口重疊會換邊；若客服全寬面板占用兩個角落，回頂移至面板上方，並限制在可視範圍。向下捲動超過 480px 時顯示。
- Chromium 390／1440 × 中英文：來電、左側縮小入口、客服展開／收起、回頂持續可見且無重疊、點擊可回頁首均通過，無 pageerror。截圖核對漸層耳機與圓形入口，computed style 確認 SVG gradient 與三色接聽按鈕。英文生成與 diff check 通過；本輪未修改素材檔案。
- 發布完成：runtime `171e167`；[Pages run 45367376978](https://github.com/mootech-asia/mootech_website/actions/runs/45367376978) 成功。先前 run 45366988546 首次讀取 artifact 為 0 件，重跑後同名 artifact 變成 2 件而失敗，故以原有 workflow_dispatch 新開一次完整發布，未更動環境保護或工作流設定。正式 HTML 已核對新漸層與移除暫停按鈕。
- 補驗 390×640、844×390 短視窗／橫向視窗：客服展開時回頂在可視區且不重疊。

### 靜態圖效果檢視

- 依使用者要求，D 版願景與六張文化卡共七處人物，均改為直接載入既有獨立靜態 PNG（IMG120／122／124／126／128／130／132），加 `?v=static1`。不再於這些槽位載入 GIF；不修改角色、姿勢或原稿。
- 中英文、390／1440 寬度以 Chromium 驗證七張 PNG 全部載入且無 pageerror；英文頁生成與 diff check 通過。未改動素材檔案，不需更新素材指紋。
- 發布阻塞修正：兩次新 run 45368776285、45368912912 均在上傳成功後立刻讀到 0 件 artifact。工作流增加唯讀 Actions 權限，並在發布前每 5 秒檢查同一 run 的 github-pages artifact 是否可讀（最多 18 次），遇重名或逾時明確失敗；不調整環境保護。YAML 已解析核對。
- 已發布靜態展示：`b4d6b09`；發布等待修正 `be61495`。[Pages run 45369169514](https://github.com/mootech-asia/mootech_website/actions/runs/45369169514) 已成功，正式中英文 HTML 七處人物全部為靜態 PNG。

### 願景圖與文化卡統一為情境系列

- 使用者要求願景右側圖須與六張文化卡同系列。已按核准角色與團隊圖作參考，製作「雙人互相扶持登階、朝共同星形目標前進」的靜態情境圖，保留無五官、平滑一體手腳、青藍／薄荷／黃綠漸層及相同柔和材質。
- 新增原稿 SRCIMG014、正式 IMG133（640×640 透明 PNG），網站僅替換願景一處引用並加版本查詢；下方六張文化卡保持原有獨立靜態圖。舊願景檔保留路徑，不再於此槽位載入。
- 素材清單／指紋與規格已更新，`python3 tools/assets.py check` 通過 153 項；英文生成與 diff check 通過。Chromium 中英文 × 390／1440 寬驗證新願景與六張卡均為 PNG 且成功載入、無 pageerror；已核對黑底透明與桌機願景區實際截圖比例。
- 已發布：runtime `0915858`；[Pages run 45369969979](https://github.com/mootech-asia/mootech_website/actions/runs/45369969979) 成功。正式中英文願景引用已核對 IMG133，線上 PNG 指紋與交付檔一致。

### 客服依版型配色，E 恢復北極熊

- 使用者要求客服跟各版型變換配色，且 E 恢復既有北極熊。A 為企業藍淺底、B 青藍科技深底、C 純青綠淺底與較直角卡片、D 黑底品牌漸層、E 黑曜石底青綠；耳機 SVG 色標、接聽按鈕、外圈、訊息、選項、輸入欄、光暈與標題同步換色。
- E 重用 IMG007／008 頭像與客服主視覺、IMG012 問候貼圖及 IMG010 完成貼圖；A–D 保持中性客服、不載入熊圖片。切版觀察 data-v 動態加入／移除圖片與貼圖，保留同一段對話；英文相對路徑由既有 build-en 工具生成。
- 淺色 A／C 的標題、訊息、狀態與語音／縮小控制使用深色文字與主題底；深色 B／D／E 保持亮色文字。標題截斷避免遮住縮小按鈕；客服面板尺寸變化也通知回頂避讓邏輯。
- 素材目的與 E 範圍登錄已更新，未改素材檔案指紋。素材 check 通過 153 項、英文生成、JS 語法與 diff check 通過。
- Chromium：A–E × 中英文 × 390／1440（20 組），驗證主題、E 圖片載入、問候貼圖、客服開啟／縮小重開，無 pageerror；驗證對話中 E→D→A→C→B→E 切換，熊圖片／貼圖僅留在 E。另目視各版來電卡片及 A／C／E 面板，回頂顯示／不重疊／點擊回頁首四組回歸通過。
- 發布追蹤：run 45372974948、45373394467 均在 CLI 初次讀到 artifact 後，部署 action 的下一次讀取仍得到 0。原有等待閘門改為連續 3 次（每次間隔 5 秒）可讀，再等待 5 秒才發布，以涵蓋不同 API 節點的同步；仍保留重名／逾時失敗，未變更環境保護。
- 已發布：客服 runtime `cf7e028`，發布穩定等待 `3f01a9c`；[Pages run 45373584158](https://github.com/mootech-asia/mootech_website/actions/runs/45373584158) 成功。正式站驗證 A–E 五套配色切換、E 專屬熊圖片與問候貼圖、切回 A–D 清除圖片，英文 E 圖片路徑亦通過，無 pageerror。

### 2026-11-25：角色稿調整與移除三個合作夥伴

- 使用者要求參考新圖重設角色，並明確不要女性造型。已產出修長、中性偏男性、較寬肩、平直腰胯、無五官、光滑漸層材質的獨立設計稿 SRCIMG015。此檔為設計交付，尚未替換目前七張情境圖；先前女性化生成稿未登錄或套用網站。
- 依使用者截圖移除中國移動／中國電信／中國聯通：A–E 合作夥伴跑馬燈的原圖與複本、無障礙名稱清單、翻譯字典及中英文客服合作夥伴介紹均已移除。中華電信與其餘 9 個品牌保留。三個舊素材保留既有資源路徑，清單標記停用展示。
- 兩排各保留 5 個不同品牌，補足四組循環以避免縮短後跑馬燈露空；減少動態模式各排只顯示首組 5 個、不重複。C 版無間距循環的偏移修正同步設為 0。
- 驗證：素材 check 通過 154 項；英文頁生成、inline JS 語法與 diff check 通過。Chromium A–E × 中英文 × 390／1440：三品牌不出現在 HTML／圖像引用，無障礙清單保留 10 個品牌，每排減少動態顯示 5 個唯一品牌、無 pageerror；正常動畫循環寬度覆蓋各版桌機視窗。
- 已發布合作夥伴移除：runtime `4a13026`；[Pages run 45532237545](https://github.com/mootech-asia/mootech_website/actions/runs/45532237545) 成功。正式中英文 HTML 已核對無三品牌名稱或圖像引用；角色 SRCIMG015 仍為原稿交付，不在網站情境槽位中載入。

### 2026-11-25：依新版人形完整重設網站七張情境圖

- 使用者明確要求以 SRCIMG015 角色重設網站人物圖。已用同一張中性偏男性、小頭身、寬肩直腰胯、修長四肢、無五官、光滑反光漸層形象，分別重畫願景與六張情境圖；不再僅交付角色稿。
- 新原稿 SRCIMG016–022、正式 IMG134–140，各情境有獨立姿勢／角度／道具互動：互助登階、雙人擊掌、白板講解、側坐打字、行走帶位、坐姿舉杯搭配點心、正面雙手啞鈴。均為 640×640 透明靜態 PNG，未新增可見機械或球形關節。製作清單 `docs/art/slender-character-series.md`；原稿包裝工具 `tools/prepare-slender-scenes.py`。
- 已實際替換 D 版七個人物圖片槽位，加入版本查詢。卡片圖片區調為 176×164、願景上限 360×280，配合修長人物辨識；其餘內容、E 版北極熊及各版客服配色保留。舊圖片維持既有相容路徑，未恢復已移除的三個合作夥伴。
- 驗證：素材 check 通過 168 項；英文生成、inline JS 語法、diff check 與三品牌移除回歸通過。Chromium 中英文 × 390／768／1440 六組：七張新 PNG 皆載入、七個不同新引用、卡片圖片不超界、無 pageerror；E 北極熊三張客服圖仍正常。目視核對七張原稿、黑底六情境合圖與桌機實際願景／卡片截圖。圖片 decode 完成後截圖，避免將非同步解碼的短暫空白當成圖片缺漏。
- 已發布完整七圖替換：runtime `b61bdf7`；[Pages run 45533997402](https://github.com/mootech-asia/mootech_website/actions/runs/45533997402) 成功。正式中英文均為七個新系列引用；七張線上 PNG 逐檔指紋符合 manifest。正式手機寬度頁面七張新圖已解碼並載入，無 pageerror。

### 2026-11-25：依參考格式統一聯絡表單

- A–E 的「聯絡我們」全部改為同一欄位順序與直排格式：公司名稱（選填）、聯絡人、電子郵件、聯絡電話（選填）、簡單描述需求（選填），按鈕「送出需求」。僅聯絡人／email 必填，電話使用 tel 類型，公司／電話／需求文字均可留空；E 原需求類型選單移除。保留各版本配色、字體、輸入框與按鈕設計。
- 中英文翻譯同步；聯絡人、公司與電話均使用正確 autocomplete。客服「改填網站聯絡表單」新增公司／電話帶入，改以精確 name 選擇器填入聯絡人，避免新增第一個公司文字欄後誤填；服務類型與地區併入需求文字，避免移除 E 選單後遺失客服已選內容。
- 表單仍沿用設計預覽送出提示，未宣稱寄信成功或新增後端；README 已區分官網預覽表單與客服 mailto 流程。
- 驗證：英文生成、inline JS 語法、diff check 通過；Chromium A–E × 中英文 × 390／1440（20 組）驗證五欄順序、必填／選填、無效 email 阻擋、只有必填欄即可通過、單欄排列、預覽送出提示、無 pageerror。中英文客服服務需求完整走到帶入官網，五欄對應及服務／地區／備註均通過；桌機 D 版表單已截圖核對。未改動媒體素材。
- 已發布：runtime `33a254e`；[Pages run 45534747775](https://github.com/mootech-asia/mootech_website/actions/runs/45534747775) 成功。正式中英文 HTML 的五份聯絡表單均已核對欄位順序 company／name／email／phone／message，以及僅 name／email 必填。

### 2026-11-25：客服最後聯絡欄位同步官網

- 求職、服務諮詢、其他留言三條流程皆直接讀取目前版型的官網聯絡表單，統一五欄的順序、標籤、必填／選填、輸入類型、autocomplete、長度設定及送出按鈕，中英文同步。僅聯絡人／email 必填；原求職經驗選單改為共用的選填需求文字。
- 三條流程產生的郵件均保留公司、聯絡人、email、電話、需求；職位／地點及服務／地區等先前選項仍保留。服務需求帶入官網的五欄映射同步更新。email 使用原生有效性檢查，與官網規則一致。未新增後端或實際寄信。
- 驗證：英文生成、inline JS 語法、diff check 通過；Chromium A–E × 中英文 × 390／1440 × 三條流程共 60 組，逐欄與官網設定比對、空白與無效 email 驗證、選填留空、郵件內容及服務轉填通過，無 pageerror；另測原生 email 規則一致。手機客服表單截圖核對五欄均完整可見。未改動媒體素材。
- 已發布：runtime `0c0fdf3`；[Pages run 45535808178](https://github.com/mootech-asia/mootech_website/actions/runs/45535808178) 與素材 CI 均成功。正式中英文手機客服表單已走到最後並逐欄對照官網，五欄順序、標籤、僅 name／email 必填及無 pageerror 均通過。

### 2026-11-25：D 版全球據點右欄等高排版

- 依使用者截圖調整 D 版地圖旁資訊欄：桌機由垂直置中改為上下撐滿，兩張卡與地圖頂底對齊；辦公室拆為新加坡／台灣兩列，對等互聯拆為 HKIX 香港、MYIX 吉隆坡、SGIX 新加坡、Equinix JPIX 東京四列，加上數量與分隔線整理資訊。只重排既有據點，未新增據點或服務宣稱。
- 中英文同步；窄螢幕改回自然高度、地圖下方直排。未修改其他版型、客服、聯絡欄位或媒體素材。
- 驗證：英文頁生成與 diff check 通過。Chromium 中英文 × 390／768／1024／1440／1920 共 10 組，桌機地圖／右欄頂底誤差 0px、六列內容完整、英文翻譯、無水平溢出及 pageerror 均通過；桌機實際截圖已目視核對。
- 已發布：runtime `13dfd2d`；[Pages run 45537768118](https://github.com/mootech-asia/mootech_website/actions/runs/45537768118) 及素材 CI 成功；正式中英文桌機已確認六列內容與地圖／右欄上下等高。

### 2026-11-25：D 版專屬分享宣傳圖與固定分享入口

- 依使用者提供的聊天連結預覽製作 D 版專屬宣傳圖：黑底、青藍／薄荷／黃綠漸層、SRCIMG015 核准的無五官中性偏男性角色，手托網路節點球；大標「透過創新推動企業發展」及既有四項服務列。中英文獨立原稿 SRCIMG023／024，正式 IMG141／142（1200×630 不透明 JPEG）。製作規格見 docs/art/design-d-social.md；未改網站情境人物圖或 E 版熊北。
- 根頁預設為 D，故中英文預設 og:image／twitter:image 改用各語系 D 宣傳圖；保留舊 assets/og.jpg 的公開相容路徑及圖檔。Hash 不會送給預覽爬蟲，新增真正的 /d/ 與 /en/d/ 專用分享入口；靜態 HTML 即含正確 metadata，不依賴 JS 改標籤。進站優先 D、可正常切版，中英切換留在專用入口。原根頁版型記憶行為保留。
- tools/build-en.py 及 Pages 建置同步生成三個衍生入口；相對資源、canonical／hreflang／og:url／語系切換連結皆依深度修正。生成頁面加入 ignore，未複製維護完整網站來源。README 已記錄專用分享網址及平台舊預覽快取限制。
- 驗證：素材 check 通過 172 項、英文與 D 入口生成、inline JS 語法及 diff check 通過。Chromium 根頁／英文根頁／D 中英文入口 × 390／1440 共八組：爬蟲停用 JS 仍讀到正確分享圖 metadata；D 入口覆蓋舊 E 版偏好、根頁保留舊偏好、切 D、人物與其他圖片載入、D 入口中英切換均通過，無本機資源 404 或 pageerror。已目視核對中英文宣傳圖字樣、角色與構圖；未向任何社群平台發送訊息。
- 已發布：runtime `7c1bfd2`；[Pages run 45539128893](https://github.com/mootech-asia/mootech_website/actions/runs/45539128893) 與素材 CI 成功。正式中英文 /d/ 入口、固定 D 初始版型與 og metadata 已核對；IMG141／142 線上 JPEG 指紋與清單一致。聊天平台的既有預覽快取未直接刷新，以新專用網址分享。

### 2026-11-25：B 版據點右欄與地圖等高

- 依使用者最新 B 版英文截圖，將 .vb-global 改為 stretch 對齊，.vb-nodes 六列平均分配高度，使第一張卡頂端與最後一張卡底端分別對齊地圖。窄螢幕單欄恢復自然列高，保留六項據點文字及版型設計。只調整 CSS，未改媒體或其他版型。
- 驗證：中英文與 D 分享入口生成、diff check 通過；Chromium 中英文 × 390／768／1024／1440／2048 共十組，桌機右欄與地圖頂底誤差不超過 0.016px、六卡等高、無水平溢出及 pageerror。英文桌機截圖已目視核對。
- 已發布：runtime `498de5f`；[Pages run 45555607485](https://github.com/mootech-asia/mootech_website/actions/runs/45555607485) 與素材 CI 成功；正式中英文 B 版桌機已確認右側六卡頂底與左側地圖一致。

### 2026-11-25：A／E 等高、C 橫向場景、全版回頂與招募連結

- 依最新五項要求完成：A 版地圖旁兩卡延展為左右等高；E 版左側地圖改緊湊等高，右側資訊決定高度並保留 320px 可讀下限，Canvas 地理繪製本來即等比縮放。E 小高度地圖只隱藏次要市場文字、保留節點與流量，避免標籤擠疊，手機維持原地圖比例。
- C 版服務場景改 sticky 固定區塊，原生縱向捲動映射橫向捲動距離，依序看完五圖才釋放接續頁面；可直接橫向瀏覽，會同步縱向進度，可逆向返回。卡寬保留水平瀏覽，短螢幕動態縮整插圖高度，標題、圖說、瀏覽提示完整顯示。使用 scroll／rAF，未攔截全頁 wheel 或鎖死捲動。
- 原 D 專屬回頂移出隱藏版型容器成共用按鈕，A 藍色圓角方、B 深底青色描邊、C 青綠直角黑框、D 品牌漸層圓形、E 黑底青綠圓形。依目前版型更新錨點與語系；保留客服開啟／縮小時的位置避讓及鍵盤焦點。
- 移除全部 Facebook 連結與 104 圖示／SVG symbols／徽章樣式，LinkedIn 保留。A–E 統一「查看職缺／View jobs」連到既有 D 版 MOOTECH 104 公司頁 https://www.104.com.tw/company/1a2x6bjqez?jobsource=index_s_ac ，共享 RECRUIT_URL；E 手機亦顯示職缺文字連結。未移除招募入口。
- 驗證：英文及 D 中英入口生成、inline JS 語法、diff check、素材 check 172 項通過；中英文 × 手機／桌機 × A–E 共 20 組，回頂顯示／正確錨點／客服開啟後不重疊／點擊回頁首、Facebook 與圖示移除、職缺文字及網址通過。A／E 桌機上下等高、截圖已核對。C 中英文 × 390×844／1440×1000／1440×720 六組，起點／中段／終點橫向進度、固定高度完整可見、最後釋放續捲均通過，另驗原生橫向操作正反向同步。五版手機職缺文字皆可見。未改動媒體檔案。
- 已發布：runtime `ccc0d75`；[Pages run 45556619026](https://github.com/mootech-asia/mootech_website/actions/runs/45556619026) 與素材 CI 成功。正式中英文 A／E 等高、A–E 回頂錨點與招募文字連結、Facebook／圖示移除及 C 場景橫向起終點已核對。
