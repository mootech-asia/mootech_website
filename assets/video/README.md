# E 版首屏影片

目前首屏使用靜態底圖 `e-hero-poster-*.webp`（黑曜石盾）。

## 加入影片（自動做成無縫循環）

```bash
python3 tools/make-loop.py 即夢下載的影片.mp4
```

工具會把影片最後 1 秒與開頭交叉淡化，結尾自然融回開頭（不倒播，攻擊方向不會反過來），並輸出：

- `e-hero.mp4`（H.264）、`e-hero.webm`（VP9），已壓縮給網頁使用
- `e-hero-poster.jpg` 與 `e-hero-poster-{960,1440,1920}.webp`：影片第一格，與影片完全對齊

接著在 `index.html` 找到 `<section class="ve-hero"`，把 `data-video=""` 改成 `data-video="assets/video/e-hero"`。

可調參數：`--fade 1.5`（交叉淡化秒數，畫面變化大時可加長）、`--width 1920`。

桌機播放影片；手機、省流量模式、系統「減少動態」時只顯示靜態圖。
