# 照片

每個版型各用一組照片，資料夾 `a/`、`b/`、`c/` 對應 A 企業信賴、B 網路維運中心、C 瑞士網格。

- `hero-datacenter` 首頁主視覺、`about-office` 關於我們、`sol-*` 五個解決方案、`cta-team` 行動呼籲
- A：`hero-2`、`hero-3` 首頁輪播，`about-2` 關於我們輪播，`field-*` 服務場景照片牆
- B：`3d-*` 解決方案全景分頁
- C：全部使用彩色原圖，頁面以 CSS 濾鏡呈現黑白，滑鼠移上去轉為彩色；`field-*` 為服務場景橫向圖帶

這裡是自動產生的 WebP，請勿手動編輯。換圖時把 JPG 用相同檔名放進 `assets/photos-src/<a|b|c>/`，再執行 `python3 tools/optimize-images.py`。照片缺漏時，解決方案與關於我們會自動退回 `assets/thumbs/` 的插圖。
