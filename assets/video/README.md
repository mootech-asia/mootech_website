# E 版首屏影片

1. 把生成好的影片轉成兩種格式，放在這個資料夾：
   - `e-hero.webm`（VP9，建議 ≤ 1.5 MB）
   - `e-hero.mp4`（H.264，建議 ≤ 1.5 MB）
   - `e-hero-poster.jpg`（影片第一格，1920 寬，給手機與載入前使用）
2. 在 `index.html` 找到 `<section class="ve-hero"`，把屬性改成：
   `data-video="assets/video/e-hero" data-poster="assets/video/e-hero-poster.jpg"`

桌機會播放影片並停止程式繪製的盾牌；手機、省流量模式、系統「減少動態」時只顯示靜態圖。
