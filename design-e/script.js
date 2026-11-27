/* MOOTECH 官網 E 縱深 版：由 tools/split-designs.py 自 index.html 拆出，之後獨立維護。 */
(function () {
  /* All variants share the MOOTECH company careers destination. */
  var RECRUIT_URL = "https://www.104.com.tw/company/1a2x6bjqez?jobsource=index_s_ac";
  document.querySelectorAll("a[data-recruit]").forEach(function (a) { if (RECRUIT_URL) a.href = RECRUIT_URL; });

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 地圖：以經緯度多邊形產生點陣 ---------- */
  /* 陸地點陣遮罩：由 Natural Earth 1:50m 陸地資料預先算好（每格 1 bit，base64），執行時不必做多邊形運算 */
  var MASK = {"ab": {"s": 1.7, "c": 59, "r": 58, "b": "///////4AP////////Af///////+AH///////8AP///////oAf//////+QA///////4gB///////jgD//////4EAH/////3gIAP/////jAwAf/////jDgA/////+E8AB/////+CAAD/////8AAAH/////4AAAP/////wAAAf/////AAAAD////9AAAAD////yAAAAD/x/0AAAAAD/B/IAAAAAH8D+AYAAAAHwF+AgAAAAPAD+AAAAAAOAH8AAAAAAcAJwDgAAAAQARADAAAAAYAQAOAAAAAACwCAAAAAAAGwcAAAAAAAHh4AAAAAAAHH1AAAAAAAGPMGAAAAAAOe4twAAAAAMAgH4AAAAAMAAD6AAAAAHggH4AAAAAABAAYAAAAAAAEEAAAAAAAAeIAAAAAAAH8YAAAAAAAf9wAAAAAAB//wAAAAAAH//wAAAAAB///wAAAAAH///wAAAAAP///gAAAAAf///gAAAAAf///AAAAAA///+AAAAAB///8AAAAAD8D/wAAAAACAB/AAAAAAAAB+AAAAAAAABQAAAAAAAAAAAAAAAAAABgA="}, "c": {"s": 1.5, "c": 66, "r": 65, "b": "////////4AH/////////AD/////////wC/////////wA/////////wA////////+gA////////8AA////////4wA////////xwA///////+AAA///////8BgA//////4YDAA///////MHAA//////8M/AA//////8B4AA//////+DAAA//////+AAAA//////+AAAA//////+AAAA//////8AAAA//////4AAAAB/////yAAAAA/////AAAAAAP/H/kAAAAAAP8D/sAAAAAAP4B/gDAAAAAHwBfwCAAAAAHwAf4CAAAAADwEf4DgAAAADgAR4BQAAAABgARgBAAAAABQAYAAwAAAAAYAIAAwAAAAAABmAYAAAAAAAA2A4AAAAAAAAeD4AAAAAAAAOP7kAAAAAAAOH0BgAAAAAAHn2A2AAAAAADgnG/wAAAAABgFAH4QAAAAA/AAD9EAAAAAPIAD8AAAAAAAEwAjAAAAAAAAAAAAAAAAAAAB4wAAAAAAAAL4wAAAAAAAAf44AAAAAAAB/+4AAAAAAAB//8AAAAAAAH//+AAAAAAAf///AAAAAAB////AAAAAAB////gAAAAAA////wAAAAAA////wAAAAAA////wAAAAAA////wAAAAAAf+//wAAAAAAfAP/gAAAAAAYAD/AAAAAAAAAB/AAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAOAA"}};
  /* 據點（示意，請依實際據點確認） */
  /* E 版：辦公室與 IX 對等互聯點 */
  var E_PINS = [
    { lon: 103.82, lat: 1.35, kind: "office", code: "SGIX" },
    { lon: 121.56, lat: 25.03, kind: "office", code: "TPE" },
    { lon: 114.17, lat: 22.32, kind: "ix", code: "HKIX" },
    { lon: 101.69, lat: 3.14, kind: "ix", code: "MYIX" },
    { lon: 139.69, lat: 35.68, kind: "ix", code: "JPIX" }
  ];
  var PINS = [
    { lon: 103.82, lat: 1.35, kind: "office", code: "SIN" },
    { lon: 121.56, lat: 25.03, kind: "office", code: "TPE" },
    { lon: 114.17, lat: 22.32, kind: "dc", code: "HKG" },
    { lon: 139.69, lat: 35.68, kind: "dc", code: "TYO" }
  ];
  function px(lon) { return lon - 60; }
  function py(lat) { return 56 - lat; }
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function drawMap(svg) {
    if (svg._drawn) return; svg._drawn = true;
    var style = svg.getAttribute("data-map");
    var mk = MASK[style === "c" ? "c" : "ab"], r = style === "c" ? .42 : .5, d = [], bin = atob(mk.b);
    for (var k = 0; k < mk.r * mk.c; k++) {
      /* 每個點畫成一個小圓弧，全部合併成單一 path，DOM 節點從上千個降到 1 個 */
      if (bin.charCodeAt(k >> 3) & (128 >> (k & 7))) {
        var lon = 61 + (k % mk.c) * mk.s, lat = 55 - Math.floor(k / mk.c) * mk.s;
        d.push("M" + (px(lon) - r).toFixed(2) + " " + py(lat).toFixed(2) + "a" + r + " " + r + " 0 1 0 " + 2 * r + " 0a" + r + " " + r + " 0 1 0 " + -2 * r + " 0");
      }
    }
    /* 靜態點陣放在獨立的底層 SVG，上層只剩會動的據點，動畫重繪時不必重畫上千個點 */
    var wrap = document.createElement("div"); wrap.className = "map-wrap " + svg.getAttribute("class").replace("map", "").trim();
    svg.parentNode.insertBefore(wrap, svg); wrap.appendChild(svg);
    var base = el("svg", { viewBox: svg.getAttribute("viewBox"), "class": "map map-dots", "aria-hidden": "true" });
    base.appendChild(el("path", { d: d.join(""), "class": "dot" }));
    wrap.insertBefore(base, svg);
    if (style === "b" || style === "d") {
      var hub = E_PINS[0];
      E_PINS.slice(1).forEach(function (t) {
        var x1 = px(hub.lon), y1 = py(hub.lat), x2 = px(t.lon), y2 = py(t.lat);
        var mx = (x1 + x2) / 2 - (y2 - y1) * .25, my = (y1 + y2) / 2 + (x2 - x1) * .1 - 6;
        svg.appendChild(el("path", { d: "M" + x1 + " " + y1 + " Q" + mx + " " + my + " " + x2 + " " + y2, "class": "arc" }));
      });
    }
    if (style === "e") {
      [[60, 48, 121.56, 25.03], [160, 50, 121.56, 25.03], [62, -12, 103.82, 1.35], [158, -30, 103.82, 1.35], [95, 55, 103.82, 1.35]].forEach(function (a, i) {
        var x1 = px(a[0]), y1 = py(a[1]), x2 = px(a[2]), y2 = py(a[3]), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 10;
        var d = "M" + x1 + " " + y1 + " Q" + mx + " " + my + " " + x2 + " " + y2, delay = (i * .55).toFixed(2) + "s";
        /* 底層淡紅虛線＋沿路徑飛行的攻擊光束，抵達據點時炸開綠色攔截波 */
        svg.appendChild(el("path", { d: d, "class": "atk" }));
        svg.appendChild(el("path", { d: d, "class": "atk-run", pathLength: "100", style: "animation-delay:" + delay }));
        svg.appendChild(el("circle", { cx: x2, cy: y2, r: 2.2, "class": "hit", style: "animation-delay:" + delay }));
      });
    }
    E_PINS.forEach(function (p) {
      var cls = p.kind === "office" ? "pin-office" : "pin-dc";
      var cx = px(p.lon), cy = py(p.lat);
      svg.appendChild(el("circle", { cx: cx, cy: cy, r: 2.6, "class": "halo " + cls }));
      svg.appendChild(el("circle", { cx: cx, cy: cy, r: style === "c" ? 1.3 : 1.2, "class": cls }));
      if (style === "b" || style === "d" || style === "e") { var t = el("text", { x: cx + ({ MYIX: -11, HKIX: -10.5, SGIX: 2.2 }[p.code] || 2), y: cy + ({ MYIX: -1.6, HKIX: 3.4, SGIX: 3.8 }[p.code] || -1.6) }); t.textContent = p.code; svg.appendChild(t); }
    });
  }

  /* ---------- 效能：只在看得到時才動 ---------- */
  var LOW = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
  var viewIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      e.target._vis = e.isIntersecting; e.target.classList.toggle("off", !e.isIntersecting);
      if (e.isIntersecting && e.target._needDraw && e.target._draw) { e.target._needDraw = false; e.target._draw(performance.now(), 16); }
    });
    kick();
  }, { rootMargin: "120px 0px" }) : null;
  function watch(el) { if (el._watched) return; el._watched = true; el._vis = !viewIO; if (viewIO) viewIO.observe(el); }
  function live(el) { return !!el._vis && !document.hidden && !el.closest(".v[hidden]"); }
  document.querySelectorAll(".map, .vc-marquee, .vb-pipe, .vb-status, .vb-term, .va-slides, .vd-cta, .vd-hero, .ve-hero, .ve-stage, .pt-marquee").forEach(watch);
  document.addEventListener("visibilitychange", kick);

  /* ---------- 畫布藝術 ---------- */
  function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var BUCKETS = [.35, .55, .75, 1];
  var ARTS = {
    /* 機房走廊：牆面與光暈畫進離屏快取，每格只重畫 LED，並依透明度分 4 批一次填色 */
    corridor: function (cv) {
      var ctx = cv.getContext("2d"), rnd = seeded(7), leds = [], n = LOW ? 320 : 700;
      var bg = document.createElement("canvas"), bctx = bg.getContext("2d"), key = "";
      for (var i = 0; i < n; i++) leds.push({ d: rnd(), v: rnd(), side: rnd() < .5 ? -1 : 1, c: rnd() < .8 ? 0 : 1, ph: rnd() * 6.28 });
      var depthAt = function (u) { return 1 / (1 + u * 9); };
      cv._fps = LOW ? 15 : 24;
      cv._active = function () { var b = cv.parentNode.querySelector(".va-slides > .blank"); return !b || b.classList.contains("on"); };
      function paintStatic(w, h, vx, vy) {
        bg.width = w; bg.height = h;
        bctx.fillStyle = "#05070c"; bctx.fillRect(0, 0, w, h);
        var fl = bctx.createLinearGradient(0, vy, 0, h); fl.addColorStop(0, "#0b111b"); fl.addColorStop(1, "#1a2433");
        bctx.fillStyle = fl; bctx.beginPath(); bctx.moveTo(vx, vy); bctx.lineTo(w, h); bctx.lineTo(0, h); bctx.fill();
        [-1, 1].forEach(function (side) {
          var nearX = side < 0 ? -w * .05 : w * 1.05;
          for (var k = 0; k < 12; k++) {
            var s1 = depthAt(k / 12), s2 = depthAt((k + .92) / 12);
            var xa = vx + (nearX - vx) * s1, xb = vx + (nearX - vx) * s2;
            var ta = vy - vy * 1.1 * s1, tb = vy - vy * 1.1 * s2, ba = vy + (h - vy) * .92 * s1, bb = vy + (h - vy) * .92 * s2;
            bctx.fillStyle = k % 2 ? "#0c121c" : "#0f1622";
            bctx.beginPath(); bctx.moveTo(xa, ta); bctx.lineTo(xb, tb); bctx.lineTo(xb, bb); bctx.lineTo(xa, ba); bctx.closePath(); bctx.fill();
            bctx.strokeStyle = "rgba(120,150,190,.18)"; bctx.lineWidth = Math.max(1, 2 * s1); bctx.stroke();
          }
          bctx.fillStyle = "rgba(200,220,255,.85)";
          for (var c = 0; c < 10; c++) {
            var s = depthAt((c + .5) / 10), y = vy - vy * 1.02 * s, cx = vx + side * w * .06 * s * 4;
            bctx.globalAlpha = .25 + .75 * s; bctx.fillRect(cx - 18 * s * 3, y, 36 * s * 3, Math.max(1.5, 5 * s)); bctx.globalAlpha = 1;
          }
        });
        var glow = bctx.createRadialGradient(vx, vy, 0, vx, vy, h * .5); glow.addColorStop(0, "rgba(120,170,255,.5)"); glow.addColorStop(1, "rgba(110,160,255,0)");
        bctx.fillStyle = glow; bctx.fillRect(0, 0, w, h);
      }
      return function (t) {
        cv._sx = (cv._sx || 0) + (((cv._px || 0) * -0.06) - (cv._sx || 0)) * .15; cv._sy = (cv._sy || 0) + (((cv._py || 0) * -0.05) - (cv._sy || 0)) * .15;
        var w = cv.width, h = cv.height, vx = Math.round(w * (.5 + cv._sx)), vy = Math.round(h * (.5 + cv._sy)), k2 = w + "x" + h + "@" + vx + "," + vy;
        if (k2 !== key) { key = k2; paintStatic(w, h, vx, vy); }
        ctx.drawImage(bg, 0, 0);
        var paths = [[], []];
        for (var b = 0; b < 4; b++) { paths[0][b] = new Path2D(); paths[1][b] = new Path2D(); }
        for (var i = 0; i < leds.length; i++) {
          var l = leds[i], s = depthAt(l.d), nearX = l.side < 0 ? -w * .05 : w * 1.05;
          var x = vx + (nearX - vx) * s, top = vy - vy * 1.1 * s, bot = vy + (h - vy) * .92 * s;
          var a = Math.min(1, (.45 + .55 * Math.max(0, Math.sin(t / 700 + l.ph))) * (.55 + .75 * s));
          var bi = a < .45 ? 0 : a < .65 ? 1 : a < .85 ? 2 : 3;
          paths[l.c][bi].rect(x, top + (bot - top) * (.06 + l.v * .88), Math.max(1, 6 * s), Math.max(1, 2.4 * s));
        }
        ["#3d8bff", "#7fe3ff"].forEach(function (col, c) {
          ctx.fillStyle = col;
          for (var b = 0; b < 4; b++) { ctx.globalAlpha = BUCKETS[b]; ctx.fill(paths[c][b]); }
        });
        ctx.globalAlpha = 1;
      };
    },
    /* 節點網路：節點數依裝置縮減，用平方距離比較，連線依透明度分 4 批一次描線 */
    mesh: function (cv) {
      var ctx = cv.getContext("2d"), rnd = seeded(11), pts = [], n = LOW || innerWidth < 700 ? 24 : 44;
      for (var i = 0; i < n; i++) pts.push({ x: rnd(), y: rnd(), vx: (rnd() - .5) * .00012, vy: (rnd() - .5) * .00012 });
      cv._fps = LOW ? 20 : 30;
      return function (t, dt) {
        var w = cv.width, h = cv.height, dpr = cv._dpr, lim = 170 * dpr, lim2 = lim * lim, xs = [], ys = [];
        ctx.clearRect(0, 0, w, h);
        var lines = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], dots = new Path2D(), hot = new Path2D();
        for (var i = 0; i < n; i++) {
          var p = pts[i]; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
          xs[i] = (.35 + p.x * .65) * w; ys[i] = p.y * h;
        }
        for (i = 0; i < n; i++) {
          for (var j = i + 1; j < n; j++) {
            var dx = xs[i] - xs[j], dy = ys[i] - ys[j], d2 = dx * dx + dy * dy;
            if (d2 < lim2) { var q = Math.min(3, (1 - Math.sqrt(d2) / lim) * 4 | 0); lines[q].moveTo(xs[i], ys[i]); lines[q].lineTo(xs[j], ys[j]); }
          }
          var R = (i % 9 === 0 ? 2.6 : 1.6) * dpr, tgt = i % 9 === 0 ? hot : dots;
          tgt.moveTo(xs[i] + R, ys[i]); tgt.arc(xs[i], ys[i], R, 0, 6.29);
        }
        ctx.lineWidth = dpr;
        for (var b = 0; b < 4; b++) { ctx.strokeStyle = "rgba(58,208,230," + (.07 * (b + 1)) + ")"; ctx.stroke(lines[b]); }
        ctx.fillStyle = "rgba(58,208,230,.8)"; ctx.fill(dots);
        ctx.fillStyle = "#4ade80"; ctx.fill(hot);
      };
    },
    /* 黑曜石盾：多面體盾牌、邊緣藍光，紅色光束擊中後迸出青藍火花；有影片時停止 */
    shield: function (cv) {
      var ctx = cv.getContext("2d"), rnd = seeded(9), sparks = [], beam = null, next = 900;
      var hero = cv.parentNode;
      cv._fps = LOW ? 20 : 30;
      cv._active = function () { return !hero.classList.contains("has-video") && !hero.classList.contains("has-poster"); };
      var P = [[0, -1], [.66, -.7], [.6, .2], [0, 1], [-.6, .2], [-.66, -.7]];
      function face(pts, lit, glossDir) {
        var x0 = pts[0][0], y0 = pts[0][1], x1 = pts[pts.length - 1][0], y1 = pts[pts.length - 1][1];
        var g = ctx.createLinearGradient(x0, y0, x1, y1), base = 8 + lit * 58;
        g.addColorStop(0, "rgb(" + (base * .72 | 0) + "," + (base * .86 | 0) + "," + (base * 1.12 | 0) + ")");
        g.addColorStop(1, "rgb(" + (base * .28 | 0) + "," + (base * .34 | 0) + "," + (base * .46 | 0) + ")");
        ctx.fillStyle = g; ctx.beginPath(); pts.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
      }
      return function (t, dt) {
        var w = cv.width, h = cv.height, dpr = cv._dpr, small = innerWidth < 900;
        var cx = w * (small ? .5 : .7), cy = h * (small ? .3 : .5), S = Math.min(w, h) * (small ? .25 : .31);
        var sway = Math.sin(t / 3200) * .05;
        ctx.clearRect(0, 0, w, h);
        var g = ctx.createRadialGradient(cx, cy - S * .3, 0, cx, cy, S * 2);
        g.addColorStop(0, "rgba(41,182,232,.16)"); g.addColorStop(.45, "rgba(41,182,232,.04)"); g.addColorStop(1, "rgba(41,182,232,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        var fl = ctx.createRadialGradient(cx, cy + S * 1.22, 0, cx, cy + S * 1.22, S * 1.3);
        fl.addColorStop(0, "rgba(92,200,238,.14)"); fl.addColorStop(1, "rgba(92,200,238,0)");
        ctx.fillStyle = fl; ctx.beginPath(); ctx.ellipse(cx, cy + S * 1.22, S * 1.3, S * .16, 0, 0, 6.283); ctx.fill();
        var O = P.map(function (q) { return [cx + (q[0] + sway * (1 - Math.abs(q[1]))) * S, cy + q[1] * S]; });
        var core = [cx + sway * S * 1.2, cy - S * .06];
        var I = O.map(function (q) { return [core[0] + (q[0] - core[0]) * .74, core[1] + (q[1] - core[1]) * .74]; });
        var L = [-.55, -.83];
        for (var i = 0; i < 6; i++) {
          var a = O[i], b = O[(i + 1) % 6], c = I[(i + 1) % 6], d = I[i];
          var mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy, len = Math.hypot(mx, my) || 1;
          var litBevel = Math.max(0, (mx * L[0] + my * L[1]) / len);
          face([a, b, c, d], .15 + litBevel * .95);
          var litIn = Math.max(0, (-(mx) * L[0] * .4 - my * L[1] * .4) / len + .15);
          face([core, d, c], .08 + litIn * .5);
        }
        ctx.save();
        ctx.beginPath(); O.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.clip();
        var sweep = ((t / 5200) % 1) * 3.2 - 1.1, sx = cx + sweep * S * 1.6;
        var sg = ctx.createLinearGradient(sx - S * .5, cy - S, sx + S * .5, cy + S);
        sg.addColorStop(0, "rgba(200,235,255,0)"); sg.addColorStop(.5, "rgba(200,235,255,.16)"); sg.addColorStop(1, "rgba(200,235,255,0)");
        ctx.fillStyle = sg; ctx.fillRect(cx - S * 2, cy - S * 1.2, S * 4, S * 2.4);
        ctx.restore();
        ctx.lineWidth = dpr;
        for (i = 0; i < 6; i++) {
          ctx.strokeStyle = "rgba(160,220,245," + (i === 5 || i === 0 ? .55 : .22) + ")";
          ctx.beginPath(); ctx.moveTo(I[i][0], I[i][1]); ctx.lineTo(I[(i + 1) % 6][0], I[(i + 1) % 6][1]); ctx.stroke();
          ctx.strokeStyle = "rgba(160,220,245,.12)";
          ctx.beginPath(); ctx.moveTo(O[i][0], O[i][1]); ctx.lineTo(I[i][0], I[i][1]); ctx.stroke();
        }
        ctx.beginPath(); O.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
        ctx.shadowColor = "rgba(41,182,232,.55)"; ctx.shadowBlur = 22 * dpr;
        ctx.strokeStyle = "rgba(130,215,245,.8)"; ctx.lineWidth = 1.4 * dpr; ctx.stroke(); ctx.shadowBlur = 0;
        next -= dt;
        if (!beam && next <= 0) {
          var side = rnd() < .5 ? -1 : 1, e = (rnd() * 4 | 0) + (side < 0 ? 4 : 1), tp = O[e % 6], tq = O[(e + 1) % 6], f = .3 + rnd() * .4;
          beam = { x0: side < 0 ? -w * .05 : w * 1.05, y0: h * (.1 + rnd() * .8), x1: tp[0] + (tq[0] - tp[0]) * f, y1: tp[1] + (tq[1] - tp[1]) * f, life: 0 };
          next = 2000 + rnd() * 1800;
        }
        if (beam) {
          beam.life += dt;
          var k = Math.min(1, beam.life / 260), hx = beam.x0 + (beam.x1 - beam.x0) * k, hy = beam.y0 + (beam.y1 - beam.y0) * k;
          var lg = ctx.createLinearGradient(beam.x0, beam.y0, hx, hy);
          lg.addColorStop(0, "rgba(255,93,108,0)"); lg.addColorStop(1, "rgba(255,120,130,.95)");
          ctx.strokeStyle = lg; ctx.lineWidth = 1.6 * dpr; ctx.beginPath(); ctx.moveTo(beam.x0, beam.y0); ctx.lineTo(hx, hy); ctx.stroke();
          if (k >= 1) {
            for (var n = 0; n < (LOW ? 14 : 26); n++) { var ang = rnd() * 6.283, sp = (.04 + rnd() * .22) * dpr; sparks.push({ x: beam.x1, y: beam.y1, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - .04 * dpr, life: 0, max: 600 + rnd() * 700 }); }
            beam = null;
          }
        }
        ctx.fillStyle = "#29b6e8";
        for (var j = sparks.length - 1; j >= 0; j--) {
          var sp2 = sparks[j]; sp2.life += dt;
          if (sp2.life > sp2.max) { sparks.splice(j, 1); continue; }
          sp2.x += sp2.vx * dt; sp2.y += sp2.vy * dt; sp2.vy += .00025 * dpr * dt;
          ctx.globalAlpha = 1 - sp2.life / sp2.max; ctx.fillRect(sp2.x, sp2.y, 1.6 * dpr, 1.6 * dpr);
        }
        ctx.globalAlpha = 1;
      };
    },
    /* 亞太互連地圖（參考老闆範例）：節點間弧線、訪客市場流量、可疑流量在抵達前被攔截 */
    interconnect: function (cv) {
      var ctx = cv.getContext("2d"), off = document.createElement("canvas"), o = off.getContext("2d"), key = "", C = {}, L = [], hp = [], up = [], pk = [], acc = 0, flatRoutes = !!cv.closest(".va, .vc");
      var HB = [["SIN", "新加坡", 103.82, 1.35, "l"], ["TPE", "台灣", 121.56, 25.03, "r"], ["HKG", "香港", 114.17, 22.32, "l"], ["TYO", "東京", 139.69, 35.68, "r"]];
      var UM = [["泰國", 100.5, 13.75], ["越南", 106.7, 10.8], ["馬來西亞", 101.69, 3.14], ["斯里蘭卡", 79.85, 6.93], ["印度", 77.2, 28.6], ["", 72.88, 19.08], ["印尼", 106.8, -6.2], ["韓國", 126.98, 37.57], ["菲律賓", 121, 14.6]];
      var HL = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], UL = [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2], [3, 0], [4, 0], [4, 2], [5, 0], [6, 0], [7, 3], [7, 1], [8, 1], [8, 2]];
      cv._fps = LOW ? 20 : innerWidth < 760 ? 24 : 30;
      function nm(z) { return typeof lang !== "undefined" && lang === "en" && typeof EN !== "undefined" && EN[z] ? EN[z] : z; }
      function colors() { var cs = getComputedStyle(cv); ["bg", "dot", "hub", "user", "link", "ulink", "pk", "bad", "tx", "tx2"].forEach(function (k) { C[k] = cs.getPropertyValue("--im-" + k).trim(); }); }
      function lay(w, h, dpr) {
        colors(); off.width = w; off.height = h; SPR = {};
        var nar = w / dpr < 760, V = nar ? [68, 145, 45, -10] : [62, 152, 52, -12];
        var pT = (nar ? 52 : 34) * dpr, pB = (nar ? 86 : 34) * dpr, bw = w, bh = h - pT - pB, sc = Math.min(bw / (V[1] - V[0]), bh / (V[2] - V[3]));
        var ox = (bw - sc * (V[1] - V[0])) / 2, oy = pT + (bh - sc * (V[2] - V[3])) / 2;
        function P(lo, la) { return [ox + (lo - V[0]) * sc, oy + (V[2] - la) * sc]; }
        o.clearRect(0, 0, w, h); o.fillStyle = C.dot;
        var mk = MASK.c, bin = atob(mk.b), r = Math.max(1 * dpr, sc * mk.s * .21);
        for (var k = 0; k < mk.r * mk.c; k++) {
          if (!(bin.charCodeAt(k >> 3) & (128 >> (k & 7)))) continue;
          var lo = 61 + (k % mk.c) * mk.s, la = 55 - Math.floor(k / mk.c) * mk.s;
          if (lo < V[0] - 2 || lo > V[1] + 2 || la > V[2] + 2 || la < V[3] - 2) continue;
          var q = P(lo, la); o.beginPath(); o.arc(q[0], q[1], r, 0, 6.283); o.fill();
        }
        hp = HB.map(function (x) { return P(x[2], x[3]); }); up = UM.map(function (x) { return P(x[1], x[2]); });
        function arc(a, b) { return { a: a, b: b, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - Math.hypot(a[0] - b[0], a[1] - b[1]) * .24] }; }
        L = HL.map(function (l) { return arc(hp[l[0]], hp[l[1]]); }).concat(UL.map(function (l) { var x = arc(up[l[0]], hp[l[1]]); x.u = 1; return x; }));
        /* 線路底光（靜態，預先畫好，不佔每格效能） */
        o.lineCap = "round";
        L.forEach(function (l) {
          o.beginPath(); o.moveTo(l.a[0], l.a[1]); o.quadraticCurveTo(l.m[0], l.m[1], l.b[0], l.b[1]);
          o.strokeStyle = l.u ? C.ulink : C.link; o.lineWidth = (l.u ? 1 : 1.8) * dpr;
          o.shadowColor = l.u ? C.user : C.hub; o.shadowBlur = flatRoutes ? 0 : (l.u ? 4 : 10) * dpr; o.stroke(); o.shadowBlur = 0;
        });
        pk = [];
        if (reduce) for (var i = 0; i < 10; i++) { spawn(); pk[i].t = .15 + Math.random() * .6; }
      }
      /* 光暈改用預先畫好的放射漸層貼圖，避免每格 shadowBlur 的高成本 */
      var SPR = {};
      function sprite(col, r) {
        var c = document.createElement("canvas"), x = c.getContext("2d"), d = Math.ceil(r * 2); c.width = c.height = d;
        var gr = x.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, col); gr.addColorStop(.25, col); gr.addColorStop(1, "rgba(0,0,0,0)");
        x.globalAlpha = .55; x.fillStyle = gr; x.fillRect(0, 0, d, d); return c;
      }
      /* 淺色地圖使用清楚實心光點，避免放射貼圖在淡底上形成灰黑光暈。 */
      function glow(col, q, r) { if (flatRoutes) return; var k = col + r, sp = SPR[k] || (SPR[k] = sprite(col, r)); ctx.drawImage(sp, q[0] - sp.width / 2, q[1] - sp.height / 2); }
      function bz(l, t) { var k = 1 - t; return [k * k * l.a[0] + 2 * k * t * l.m[0] + t * t * l.b[0], k * k * l.a[1] + 2 * k * t * l.m[1] + t * t * l.b[1]]; }
      function spawn() { var l = L[Math.random() * L.length | 0], bad = !!l.u && Math.random() < .2, fwd = bad || Math.random() < .5; pk.push({ l: l, t: fwd ? 0 : 1, d: fwd ? 1 : -1, bad: bad, s: .00028 + Math.random() * .00028 }); }
      return function (now, dt) {
        var w = cv.width, h = cv.height, dpr = cv._dpr || 1, kk = w + "x" + h;
        if (kk !== key) { key = kk; lay(w, h, dpr); }
        dt = Math.min(dt || 16, 80);
        ctx.clearRect(0, 0, w, h); ctx.drawImage(off, 0, 0);
        /* 沿線流動的光點虛線（參考折線圖的流光） */
        ctx.lineCap = "round";
        [0, 1].forEach(function (u) {
          ctx.setLineDash(u ? [1 * dpr, 9 * dpr] : [1.5 * dpr, 7 * dpr]);
          ctx.lineDashOffset = reduce ? 0 : -(now || 0) * (u ? .012 : .028) * dpr;
          ctx.strokeStyle = u ? C.user : C.pk; ctx.globalAlpha = u ? .45 : .8; ctx.lineWidth = (u ? 1.2 : 1.8) * dpr;
          ctx.beginPath();
          L.forEach(function (l) { if (!!l.u !== !!u) return; ctx.moveTo(l.a[0], l.a[1]); ctx.quadraticCurveTo(l.m[0], l.m[1], l.b[0], l.b[1]); });
          ctx.stroke();
        });
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        if (!reduce) { acc += dt; while (acc > 420) { acc -= 420; spawn(); } }
        pk.forEach(function (p) {
          if (!reduce) p.t += p.s * dt * p.d;
          var q = bz(p.l, Math.max(0, Math.min(1, p.t)));
          if (p.bad && p.t >= .86) {
            p.bu = (p.bu || 0) + dt / 480;
            ctx.globalAlpha = Math.max(0, 1 - p.bu); ctx.strokeStyle = C.bad; ctx.lineWidth = 2 * dpr;
            ctx.beginPath(); ctx.arc(q[0], q[1], (6 + p.bu * 30) * dpr, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
            if (p.bu >= 1) p.x = 1; return;
          }
          /* 光束拖尾：沿弧線往回取樣，越後越淡越細 */
          var col = p.bad ? C.bad : C.pk, prev = q, TL = p.l.u ? 9 : 12;
          ctx.strokeStyle = col;
          for (var j = 1; j <= TL; j++) {
            var tt = p.t - p.d * j * .014; if (tt < 0 || tt > 1) break;
            var qq = bz(p.l, tt); ctx.globalAlpha = (1 - j / (TL + 1)) * .85; ctx.lineWidth = (2.6 - j * 1.8 / TL) * dpr;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(qq[0], qq[1]); ctx.stroke(); prev = qq;
          }
          ctx.globalAlpha = 1;
          glow(p.bad ? C.bad : C.hub, q, 12 * dpr);
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q[0], q[1], (p.bad ? 3.6 : 3.2) * dpr, 0, 6.283); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(q[0], q[1], 1.3 * dpr, 0, 6.283); ctx.fill();
          if (p.t >= 1 || p.t <= 0) p.x = 1;
        });
        pk = pk.filter(function (p) { return !p.x; });
        var nar = w / dpr < 760, fs = (nar ? 10.5 : 12) * dpr;
        ctx.textAlign = "center";
        up.forEach(function (q, i) {
          ctx.strokeStyle = C.user; ctx.fillStyle = C.bg; ctx.lineWidth = 2 * dpr;
          ctx.beginPath(); ctx.arc(q[0], q[1], 3.6 * dpr, 0, 6.283); ctx.fill(); ctx.stroke();
          if (UM[i][0] && !(cv.closest(".ve-global") && h / dpr < 380)) { ctx.font = "500 " + fs + 'px "Noto Sans TC", system-ui, sans-serif'; ctx.fillStyle = C.tx2; ctx.fillText(nm(UM[i][0]), q[0], q[1] - 9 * dpr); }
        });
        hp.forEach(function (q, i) {
          var ph = ((now || 0) / 1000 + i * .5) % 2 / 2;
          if (reduce) ph = .35;
          ctx.strokeStyle = C.hub; ctx.globalAlpha = 1 - ph; ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath(); ctx.arc(q[0], q[1], (6 + ph * 20) * dpr, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
          ctx.globalAlpha = .35; ctx.lineWidth = 1 * dpr; ctx.beginPath(); ctx.arc(q[0], q[1], 9 * dpr, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
          glow(C.hub, q, 16 * dpr);
          ctx.fillStyle = C.hub; ctx.beginPath(); ctx.arc(q[0], q[1], 5 * dpr, 0, 6.283); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(q[0], q[1], 2 * dpr, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
          ctx.font = "700 " + (nar ? 11.5 : 13.5) * dpr + 'px "Noto Sans TC", system-ui, sans-serif'; ctx.fillStyle = C.tx;
          var left = HB[i][4] === "l" || (nar && i === 3); ctx.textAlign = left ? "right" : "left";
          ctx.fillText(HB[i][0] + " " + nm(HB[i][1]), q[0] + (left ? -12 : 12) * dpr, q[1] + (i === 1 ? -4 : i === 2 ? 12 : i === 3 && nar ? 20 : 4) * dpr);
        });
      };
    },
    /* 粒子雙螺旋：每條鏈由 3 道粒子組成緞帶，橫檔也是粒子；依深度與色階分 12 批一次填色 */
    helix: function (cv) {
      var ctx = cv.getContext("2d"), small = LOW || innerWidth < 700, n = small ? 70 : 160, rnd = seeded(5), jit = [];
      var COLS = [[41, 182, 232], [80, 196, 200], [130, 206, 150], [185, 216, 90]], ALPHA = [.32, .62, 1];
      for (var q = 0; q < n * 8; q++) jit.push(rnd() - .5);
      cv._fps = LOW ? 20 : small ? 24 : 30;
      function dot(out, x, y, z, u, r) {
        var di = z < -.33 ? 0 : z < .33 ? 1 : 2, ci = Math.min(3, (u * 4) | 0), size = r * (.7 + (z + 1) * .55);
        out[ci * 3 + di].moveTo(x + size, y); out[ci * 3 + di].arc(x, y, size, 0, 6.283);
      }
      function strandSet(w, h, cx, tilt, R, t, dir, out) {
        var r = 1.9 * cv._dpr, ribbon = small ? 2 : 3;
        for (var i = 0; i < n; i++) {
          var u = i / (n - 1), ax = cx + tilt * (u - .5) * 2, ay = -h * .08 + u * h * 1.16, base = u * 2.2 * 6.283 + t * .0006 * dir;
          var pts = [];
          for (var s2 = 0; s2 < 2; s2++) {
            for (var k = 0; k < ribbon; k++) {
              var ph = base + s2 * 3.1416 + (k - (ribbon - 1) / 2) * .09, z = Math.sin(ph);
              dot(out, ax + Math.cos(ph) * R + jit[i * 8 + k] * 3 * cv._dpr, ay + z * R * .18 + jit[i * 8 + k + 3] * 2 * cv._dpr, z, u, r);
            }
            pts.push([ax + Math.cos(base + s2 * 3.1416) * R, ay + Math.sin(base + s2 * 3.1416) * R * .18, Math.sin(base + s2 * 3.1416)]);
          }
          if (i % (small ? 3 : 2) === 0) for (var m = 1; m < 7; m++) {
            var f = m / 7, zz = pts[0][2] + (pts[1][2] - pts[0][2]) * f;
            dot(out, pts[0][0] + (pts[1][0] - pts[0][0]) * f, pts[0][1] + (pts[1][1] - pts[0][1]) * f, zz * .6, u, r * .7);
          }
        }
      }
      return function (t) {
        var w = cv.width, h = cv.height, R = Math.min(w, h) * (small ? .22 : .17), out = [];
        for (var k = 0; k < 12; k++) out.push(new Path2D());
        ctx.clearRect(0, 0, w, h);
        var edge = small ? .02 : .1;
        strandSet(w, h, w * edge, w * .06, R, t, 1, out);
        strandSet(w, h, w * (1 - edge), -w * .06, R, t + 4000, -1, out);
        for (var c = 0; c < 4; c++) for (var d = 0; d < 3; d++) {
          ctx.fillStyle = "rgba(" + COLS[c].join(",") + "," + ALPHA[d] + ")"; ctx.fill(out[c * 3 + d]);
        }
      };
    },
    wave: function (cv) {
      var ctx = cv.getContext("2d");
      cv._fps = LOW ? 20 : 30;
      return function (t) {
        var w = cv.width, h = cv.height, dpr = cv._dpr;
        ctx.clearRect(0, 0, w, h);
        for (var k = 0; k < 5; k++) {
          ctx.beginPath();
          for (var x = 0; x <= w; x += 8 * dpr) {
            var y = h * .35 + Math.sin(x / (90 * dpr) + t / 900 + k * .8) * 26 * dpr * (1 + k * .3) + Math.sin(x / (37 * dpr) - t / 600) * 8 * dpr;
            x ? ctx.lineTo(x, y + k * 14 * dpr) : ctx.moveTo(x, y + k * 14 * dpr);
          }
          ctx.strokeStyle = k === 0 ? "rgba(58,208,230,.9)" : "rgba(59,130,246," + (.5 - k * .08) + ")";
          ctx.lineWidth = (k === 0 ? 2 : 1.2) * dpr; ctx.stroke();
        }
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(28 * dpr, 30 * dpr, 5 * dpr, 0, 6.29); ctx.fill();
        ctx.fillStyle = "rgba(227,236,247,.85)"; ctx.font = (12 * dpr) + "px 'IBM Plex Mono', monospace"; ctx.fillText("LIVE", 40 * dpr, 34 * dpr);
      };
    }
  };
  var running = [], raf = 0;
  function setupArt(root) {
    running = [];
    root.querySelectorAll("canvas[data-art]").forEach(function (cv) {
      if (!cv._draw) cv._draw = ARTS[cv.getAttribute("data-art")](cv);
      watch(cv); running.push(cv);
      if (artRO) artRO.observe(cv);
    });
    if (!artRO) requestAnimationFrame(resize);
  }
  function canRun(cv) { return live(cv) && (!cv._active || cv._active()); }
  /* 畫布尺寸：用 ResizeObserver 在瀏覽器排版完成後取得，不在初始化時強制整頁排版 */
  function sizeArt(cv, w, h) {
    var dpr = Math.min(window.devicePixelRatio || 1, LOW ? 1 : 1.5);
    cv._dpr = dpr; cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
    /* 只立即重畫看得到的畫布；畫面外的（例如頁面下方的地圖）等第一次進入畫面才畫 */
    cv._t = 0; if (cv._vis) cv._draw(performance.now(), 16); else cv._needDraw = true;
  }
  var artRO = "ResizeObserver" in window ? new ResizeObserver(function (es) {
    es.forEach(function (e) { if (running.indexOf(e.target) > -1) sizeArt(e.target, e.contentRect.width, e.contentRect.height); });
  }) : null;
  function resize() {
    running.forEach(function (cv) { var r = cv.getBoundingClientRect(); sizeArt(cv, r.width, r.height); });
  }
  /* 單一 rAF 迴圈：沒有任何畫布在畫面上就完全停止；每張畫布依自己的幀率上限繪製 */
  function loop(now) {
    raf = 0;
    var any = false;
    running.forEach(function (cv) {
      if (!canRun(cv)) return;
      any = true;
      var gap = now - (cv._t || 0);
      if (gap >= 1000 / cv._fps - 2) { cv._draw(now, Math.min(80, gap)); cv._t = now; }
    });
    if (any) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && !reduce && running.some(canRun)) raf = requestAnimationFrame(loop); }
  var rz = 0;
  if (!artRO) window.addEventListener("resize", function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(resize); });

  /* ---------- 版型固定（獨立頁，不提供切換） ---------- */
  function show(v) {
    document.body.setAttribute("data-v", v);
    var root = document.getElementById("v" + v);
    root.querySelectorAll("svg[data-map]").forEach(drawMap);
    setupArt(root); kick();
    root.querySelectorAll(".ve-hero").forEach(function (h) { if (h._play) h._play(); });
    root.querySelectorAll("[data-query]").forEach(function (f) { if (f._run && !f._ran) { f._ran = true; setTimeout(f._run, 700); } });
    renderTurnstile();
  }

  var anchorNavigation = 0;
  /* 區塊捲動不改動網址 hash，避免與版型切換衝突 */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-scroll]"); if (!a) return;
    var t = document.getElementById(a.getAttribute("href").slice(1)); if (!t) return;
    e.preventDefault();
    var head = document.querySelector(".v:not([hidden]) header");
    function target() { return Math.max(0, Math.round(t.getBoundingClientRect().top + window.scrollY - (head ? head.offsetHeight : 0) + 1)); }
    /* Resolve deferred section heights before measuring; scroll only once. */
    var variant = t.closest('.v');
    if (variant) variant.classList.add('anchor-ready');
    var navigation = ++anchorNavigation;
    target(); // Flush layout so newly needed fonts are included in fonts.ready.
    var fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () {
      requestAnimationFrame(function () {
        if (navigation !== anchorNavigation || (variant && variant.hidden)) return;
        window.scrollTo({ top: target(), behavior: reduce ? "instant" : "smooth" });
      });
    });
  });

  /* Cloudflare Turnstile：只渲染目前顯示版型的聯絡表單；固定 normal 尺寸（高 65px，手機容器 70px）。 */
  var tsFailed = false;
  function renderTurnstile() {
    if (!window.turnstile) return;
    document.querySelectorAll("form[data-form] .cf-turnstile").forEach(function (el) {
      var v = el.closest(".v");
      if (el.getAttribute("data-widget-id") || (v && v.hidden)) return;
      var language = document.documentElement.lang.indexOf("en") === 0 ? "en" : "zh-tw";
      var id = window.turnstile.render(el, { sitekey: el.getAttribute("data-sitekey"), theme: el.getAttribute("data-theme") || "auto", size: "normal", language: language });
      if (id) el.setAttribute("data-widget-id", id);
    });
  }
  window.mootechTurnstileLoad = renderTurnstile;
  /* 中英切換時以新語言重新渲染（會清掉已完成的驗證） */
  window.mootechTurnstileRelang = function () {
    if (!window.turnstile) return;
    document.querySelectorAll("form[data-form] .cf-turnstile[data-widget-id]").forEach(function (el) {
      window.turnstile.remove(el.getAttribute("data-widget-id"));
      el.removeAttribute("data-widget-id");
    });
    renderTurnstile();
  };
  if (document.querySelector("form[data-form] .cf-turnstile")) {
    var tsScript = document.createElement("script");
    tsScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=mootechTurnstileLoad";
    tsScript.async = true;
    tsScript.onerror = function () { tsFailed = true; };
    document.head.appendChild(tsScript);
  }

  /* 聯絡表單送出：JSON POST 到寄信 API；長度上限與欄位 maxlength 一致 */
  var SEND_EMAIL_URL = "http://192.168.200.45:8888/api/v1/send_email";
  var FIELD_LIMITS = { company: [200, "公司名稱", "Company name"], name: [100, "聯絡人", "Contact person"], phone: [30, "聯絡電話", "Phone"], message: [5000, "需求描述", "Message"] };
  var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
  function formData(f) {
    var val = function (n) { var el = f.elements[n]; return el ? el.value.trim() : ""; };
    return { company: val("company"), name: val("name"), email: val("email"), phone: val("phone"), message: val("message") };
  }
  function formProblem(d) {
    var en = lang === "en";
    if (!d.name) return en ? "Please enter a contact person." : "請填寫聯絡人。";
    if (!EMAIL_RE.test(d.email)) return en ? "Please enter a valid email address." : "請輸入正確的電子郵件格式。";
    for (var k in FIELD_LIMITS) {
      var lim = FIELD_LIMITS[k];
      if (d[k].length > lim[0]) return en ? lim[2] + " can be at most " + lim[0] + " characters." : lim[1] + "最多 " + lim[0] + " 個字。";
    }
    return "";
  }

  document.querySelectorAll("form[data-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f._sending) return;
      var note = f.querySelector(".form-note"), ts = f.querySelector(".cf-turnstile");
      var id = ts && ts.getAttribute("data-widget-id");
      if (ts) {
        if (!window.turnstile || !id) {
          note.textContent = tsFailed
            ? (lang === "en" ? "Verification could not load. Please try again later or email contact@mootech.asia." : "驗證元件無法載入，請稍後再試，或直接寄信至 contact@mootech.asia。")
            : (lang === "en" ? "Verification is loading. Please try again in a moment." : "驗證載入中，請稍候再送出。");
          return;
        }
        if (!window.turnstile.getResponse(id)) {
          note.textContent = lang === "en" ? "Please complete the verification before sending." : "請先完成驗證再送出。";
          return;
        }
      }
      var token = id ? window.turnstile.getResponse(id) : "";
      var data = formData(f), problem = formProblem(data);
      if (problem) { note.textContent = problem; return; }
      data["cf-turnstile-response"] = token;
      var btn = f.querySelector('[type="submit"]');
      f._sending = true; if (btn) btn.disabled = true;
      note.textContent = lang === "en" ? "Sending…" : "送出中…";
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : 0;
      fetch(SEND_EMAIL_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          f.reset();
          note.textContent = lang === "en" ? "Thanks, we have received your request and will get back to you soon." : "已收到您的需求，我們會盡快與您聯繫。";
        })
        .catch(function (err) {
          if (window.console) console.error("send_email failed", err);
          note.textContent = lang === "en" ? "Sending failed. Please try again later or email contact@mootech.asia." : "送出失敗，請稍後再試，或直接寄信至 contact@mootech.asia。";
        })
        .then(function () {
          clearTimeout(timer);
          f._sending = false; if (btn) btn.disabled = false;
          if (id) window.turnstile.reset(id); // token 只能使用一次
        });
    });
  });

  show("e");

  /* ---------- 升級：選單、終端機、捲動進場、主視覺視差 ---------- */
  document.querySelectorAll("[data-menu]").forEach(function (b) {
    var head = b.closest("header");
    b.addEventListener("click", function () { var o = head.classList.toggle("menu-open"); b.setAttribute("aria-expanded", String(o)); });
    head.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", function () { head.classList.remove("menu-open"); b.setAttribute("aria-expanded", "false"); }); });
  });

  /* 終端機示範（203.0.113.0/24 為文件專用 IP，非真實資料） */
  var TERM = [
    [["p", "$ "], ["", "mootech iplc status --route TPE-SIN"]],
    [["m", "→ checking dedicated path ..."]],
    [["m", "  type      "], ["", "IPLC point-to-point"]],
    [["m", "  latency   "], ["g", "low · stable"]],
    [["m", "  path      "], ["g", "dedicated · encrypted"]],
    [["m", "  backup    "], ["c", "standby ● ready"]],
    [["", ""]],
    [["p", "$ "], ["", "mootech peering status --region apac"]],
    [["c", "  HKIX "], ["g", "● up   "], ["c", "MYIX "], ["g", "● up"]],
    [["c", "  SGIX "], ["g", "● up   "], ["c", "JPIX "], ["g", "● up"]]
  ];
  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function termRender(pre, n) {
    var out = [], left = n;
    for (var i = 0; i < TERM.length && left >= 0; i++) {
      var line = "";
      for (var j = 0; j < TERM[i].length && left >= 0; j++) {
        var seg = TERM[i][j], t = seg[1].slice(0, Math.max(0, left));
        left -= seg[1].length;
        line += seg[0] ? '<span class="' + seg[0] + '">' + esc(t) + "</span>" : esc(t);
      }
      out.push(line); left -= 1;
    }
    pre.innerHTML = out.join("\n") + '<span class="cur"></span>';
  }
  var FR = [], cmdAt = [];
  (function () {
    var flat = [];
    TERM.forEach(function (line, li) { line.forEach(function (seg) { for (var k = 0; k < seg[1].length; k++) { flat.push(seg[0]); cmdAt.push(line[0][0] === "p"); } }); flat.push("\n"); cmdAt.push(false); });
    FR.total = flat.length;
  })();
  function frame(n) { if (!FR[n]) { var tmp = document.createElement("pre"); termRender(tmp, n); FR[n] = tmp.innerHTML; } return FR[n]; }
  document.querySelectorAll("[data-term]").forEach(function (pre) {
    if (reduce) { termRender(pre, FR.total); return; }
    var n = 0, pause = 0;
    setInterval(function () {
      if (!live(pre.parentNode)) return;
      if (pause) { pause--; if (!pause) n = 0; return; }
      n = Math.min(FR.total, n + (cmdAt[n] ? 1 : 4));
      pre.innerHTML = frame(n);
      if (n >= FR.total) pause = 120;
    }, 35);
  });

  var RV = ".va-mosaic figure,.va-sol-head,.va-card,.va-why-item,.va-steps li,.va-facts,.va-about .text,.va-about-img,.va-loc li,.va-cta .wrap > *,.vb-sec-head,.vb-cell,.vb-check,.vb-pipe li,.vb-spec,.vb-about .text,.vb-nodes > div,.vc-row,.vc-why > div,.vc-steps li,.vc-lead,.vc-cols,.vc-about-img,.vc-loc > div,.vc-cta h2,.vd-head2,.vd-card,.vd-why > div,.vd-steps li,.vd-facts > div,.vd-about-text,.vd-loc > div,.vd-ctasec .wrap > *,.ve-head2,.ve-process li,.ve-line,.sp-line,.sp-group,.ve-loc > div,.ve-band .wrap > div";
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(RV).forEach(function (el) {
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", Math.min(sib, 5) * 0.08 + "s");
      el.classList.add("rv"); io.observe(el);
    });
  }

  var heroA = document.querySelector(".va-hero");
  if (heroA && !reduce) heroA.addEventListener("pointermove", function (e) {
    var r = heroA.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    var cv = heroA.querySelector("canvas"); if (cv) { cv._px = x; cv._py = y; }
    kick();
    heroA.style.setProperty("--mx", (-x * 18).toFixed(1) + "px"); heroA.style.setProperty("--my", (-y * 12).toFixed(1) + "px");
  });

  /* ---------- E：網路維運主控台（示範資料，非實際流量） ---------- */
  var SCN = {"iplc": [["route    ", "HQ Taipei ⇄ Branch Singapore", ""], ["type     ", "IPLC point-to-point", ""], ["peering  ", "HKIX · SGIX", ""], ["latency  ", "low · stable", "ok"], ["path     ", "dedicated · encrypted", "ok"], ["status   ", "ACTIVE", "ok"]], "live": [["stream   ", "product-launch", ""], ["mode     ", "real-time · low latency", ""], ["primary  ", "SIN ● online", "ok"], ["backup   ", "HKG ● standby", "md"], ["failover ", "automatic · no interruption", "ok"], ["viewers  ", "global delivery", "ok"]], "mon": [["link     ", "HQ ⇄ Branch · IPLC", ""], ["traffic  ", "62% of capacity", ""], ["peak     ", "21:00 – 23:00", "md"], ["latency  ", "within target", "ok"], ["alert    ", "none", "ok"], ["report   ", "weekly · ready", "ok"]]};
  document.querySelectorAll("[data-query]").forEach(function (f) {
    var out = f.querySelector(".ve-result"), tabs = f.querySelectorAll("[data-scn]"), cur = "iplc", timer, auto;
    function line(r) { return '<span class="k">' + r[0] + "</span>" + (r[2] ? '<span class="' + r[2] + '">' + r[1] + "</span>" : r[1]); }
    function run(key) {
      cur = key; clearInterval(timer);
      tabs.forEach(function (b) { var on = b.getAttribute("data-scn") === key; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); });
      var lines = SCN[key].map(line);
      lines.push('<span class="note">' + (lang === "en" ? "demo data · not live traffic" : "示範資料 · 非實際流量") + "</span>");
      if (reduce) { out.innerHTML = lines.join("\n"); return; }
      var n = 0; out.innerHTML = "";
      timer = setInterval(function () { n++; out.innerHTML = lines.slice(0, n).join("\n"); if (n >= lines.length) clearInterval(timer); }, 150);
    }
    function next() { var keys = Object.keys(SCN); run(keys[(keys.indexOf(cur) + 1) % keys.length]); }
    tabs.forEach(function (b) { b.addEventListener("click", function () { clearInterval(auto); run(b.getAttribute("data-scn")); }); });
    f._run = function () { run(cur); if (!reduce) { clearInterval(auto); auto = setInterval(function () { if (live(f.closest(".ve-hero"))) next(); }, 7000); } };
    if (!f.closest(".v[hidden]")) { f._ran = true; setTimeout(f._run, 700); }
  });

  /* ---------- E：服務分頁（桌機隨捲動依序切換；點清單捲到對應位置） ---------- */
  document.querySelectorAll("[data-etabs]").forEach(function (box) {
    var tabs = box.querySelectorAll("[role=tab]"), panels = box.querySelectorAll("[role=tabpanel]"), track = box.parentNode, cur = -1, n = tabs.length;
    var desk = matchMedia("(min-width: 901px)");
    function set(k, prog) {
      tabs.forEach(function (x, i) { x.style.setProperty("--fill", i < k ? 1 : i === k ? prog : 0); });
      if (k === cur) return; cur = k;
      tabs.forEach(function (x, i) { x.classList.toggle("on", i === k); x.setAttribute("aria-selected", String(i === k)); panels[i].classList.toggle("on", i === k); panels[i].classList.toggle("past", i < k); });
    }
    function seg() { return (track.offsetHeight - innerHeight) / n; }
    function update() {
      if (!desk.matches || box.closest(".v[hidden]")) return;
      var r = track.getBoundingClientRect(), passed = Math.max(0, -r.top), sg = seg();
      var k = Math.min(n - 1, Math.floor(passed / sg)), prog = Math.min(1, (passed - k * sg) / sg);
      set(k, prog);
    }
    tabs.forEach(function (tb, i) {
      tb.addEventListener("click", function () {
        if (!desk.matches) return;
        var top = track.getBoundingClientRect().top + scrollY + i * seg() + 2;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      });
    });
    /* 手機：區塊固定在畫面上，往下捲動時卡片由左到右依序滑過，最後一張看完才繼續往下 */
    var pw = box.querySelector(".ve-svc-panels"), bar = document.createElement("div"), STEP = .55;
    bar.className = "ve-svc-bar"; bar.setAttribute("aria-hidden", "true");
    for (var b = 0; b < n; b++) bar.appendChild(document.createElement("i"));
    pw.parentNode.insertBefore(bar, pw.nextSibling);
    function layoutM() {
      if (desk.matches) { track.style.height = ""; pw.style.transform = ""; return; }
      var hh = 72, h = box.offsetHeight, room = innerHeight - hh; if (!h) return;
      box._top = Math.max(hh, hh + (room - h) / 2); box.style.setProperty("--svc-top", box._top + "px");
      track.style.height = (h + (n - 1) * innerHeight * STEP) + "px"; box._span = (n - 1) * innerHeight * STEP; box._w = pw.children[0].offsetWidth; box._cw = pw.clientWidth;
    }
    function updateM() {
      if (desk.matches || box.closest(".v[hidden]")) return;
      if (!track.style.height) layoutM();
      var w = box._w + 12, max = Math.max(0, (n - 1) * w - (box._cw - box._w));
      var r = track.getBoundingClientRect(), top = box._top || 0;
      var p = Math.min(1, Math.max(0, (top - r.top) / (box._span || 1))) * (n - 1);
      var k = Math.floor(p), f = p - k;
      /* 每張卡片前段停留、後段才滑動，讀起來比較穩 */
      f = f < .35 ? 0 : (f - .35) / .65; f = f * f * (3 - 2 * f);
      var x = Math.min(max, (k + f) * w);
      pw.style.transform = "translate3d(" + (-x).toFixed(1) + "px,0,0)";
      var at = Math.min(n - 1, Math.round(k + f));
      [].forEach.call(bar.children, function (el, i) { el.style.setProperty("--f", i <= at ? 1 : 0); });
    }
    var ticking = false;
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); updateM(); }); } }, { passive: true });
    window.addEventListener("resize", function () { layoutM(); update(); updateM(); });
    window.addEventListener("load", function () { layoutM(); updateM(); });
    /* 手機版固定區塊的量測延到下一格，避免與初始化擠在同一個長任務 */
    set(0, 0); update(); requestAnimationFrame(function () { layoutM(); updateM(); });
  });

  /* ---------- E：捲動時封包穿越防線 ---------- */
  document.querySelectorAll(".ve-depth").forEach(function (box) {
    var stage = box.querySelector(".ve-stage"), steps = box.querySelectorAll(".ve-step");
    if (!("IntersectionObserver" in window)) { steps.forEach(function (st) { st.classList.add("on"); }); return; }
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (st) { st.classList.toggle("on", st === e.target); });
        stage.setAttribute("data-active", e.target.getAttribute("data-step"));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (st) { sio.observe(st); });
    steps[0].classList.add("on");
  });

  /* ---------- E 手機：四層防線固定後，往下捲動由左到右依序切換 ---------- */
  document.querySelectorAll(".ve-depth").forEach(function (track) {
    var strip = track.querySelector(".ve-steps"); if (!strip) return;
    var mob = matchMedia("(max-width: 900px)"), box = document.createElement("div"), bar = document.createElement("div"), n = strip.children.length, STEP = .55;
    box.className = "ve-pin"; strip.parentNode.insertBefore(box, strip); box.appendChild(strip);
    bar.className = "ve-svc-bar"; bar.setAttribute("aria-hidden", "true"); for (var b = 0; b < n; b++) bar.appendChild(document.createElement("i")); box.appendChild(bar);
    function layout() {
      if (!mob.matches) { track.style.height = ""; strip.style.transform = ""; return; }
      var hh = 72, h = box.offsetHeight; if (!h) return;
      box._top = Math.max(hh, hh + (innerHeight - hh - h) / 2); box.style.setProperty("--pin-top", box._top + "px");
      track.style.height = (h + (n - 1) * innerHeight * STEP) + "px"; box._span = (n - 1) * innerHeight * STEP; box._w = strip.children[0].offsetWidth; box._cw = strip.clientWidth;
    }
    function upd() {
      if (!mob.matches || track.closest(".v[hidden]")) return;
      if (!track.style.height) layout();
      var w = box._w + 12, max = Math.max(0, (n - 1) * w - (box._cw - box._w));
      var r = track.getBoundingClientRect(), top = box._top || 0;
      var p = Math.min(1, Math.max(0, (top - r.top) / (box._span || 1))) * (n - 1), k = Math.floor(p), f = p - k;
      f = f < .35 ? 0 : (f - .35) / .65; f = f * f * (3 - 2 * f);
      strip.style.transform = "translate3d(" + (-Math.min(max, (k + f) * w)).toFixed(1) + "px,0,0)";
      var at = Math.min(n - 1, Math.round(k + f));
      [].forEach.call(bar.children, function (el, i) { el.style.setProperty("--f", i <= at ? 1 : 0); });
    }
    var tk = false;
    window.addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(function () { tk = false; upd(); }); } }, { passive: true });
    window.addEventListener("resize", function () { layout(); upd(); });
    window.addEventListener("load", function () { layout(); upd(); });
    requestAnimationFrame(function () { layout(); upd(); });
  });

  /* ---------- E：首屏輪播（第 1 張品牌影片、第 2 張招聘；影片預設一定播放，右下角可暫停） ---------- */
  document.querySelectorAll(".ve-hero").forEach(function (hero) {
    var v1 = hero.querySelector("video.s1"), v2 = hero.querySelector("video.s2"), dots = hero.querySelectorAll(".ve-dots button");
    var vids = [v1, v2 && v2.getAttribute("data-ready") === "1" ? v2 : null], cur = 0, userPaused = false, started = false, timer, DURS = [9000, 14200];
    /* 每張停留時間：第 2 張招聘影片播完一整輪才切換 */
    function dur() { return DURS[cur] || DURS[0]; }
    if (!vids[1]) hero.classList.remove("v2ok"); else hero.classList.add("v2ok");
    hero.style.setProperty("--ve-dur", dur() / 1000 + "s");
    var btn = document.createElement("button");
    (function () { var ve = hero.closest(".ve"), on = null, tk = false; if (!ve) return;
      function upd() { tk = false; var v = (window.scrollY || 0) > 8; if (v !== on) { on = v; ve.classList.toggle("scrolled", v); } }
      addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true }); upd(); })();
    function load(v) { if (!v || v._loaded) return; v._loaded = true; v.querySelectorAll("source[data-src]").forEach(function (so) { so.src = so.getAttribute("data-src"); }); v.preload = "auto"; v.load(); v.addEventListener("playing", function () { v.classList.add("on"); var ps = v.parentNode.querySelector(".ve-poster." + (v.classList.contains("s2") ? "s2" : "s1")); if (ps) ps.classList.add("vgone"); }); }
    function act() { return vids[cur]; }
    function tryPlay() { var v = act(); if (userPaused || !started || !v) return; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    function label() { var p = userPaused; btn.setAttribute("aria-label", p ? "播放背景影片" : "暫停背景影片"); btn.innerHTML = p ? '<svg viewBox="0 0 16 16"><path d="M5 3l8 5-8 5z"/></svg>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>'; hero.classList.toggle("paused", p); }
    function go(n, manual) {
      cur = (n + 2) % 2; hero.setAttribute("data-slide", String(cur + 1)); hero.style.setProperty("--ve-dur", dur() / 1000 + "s");
      dots.forEach(function (d, k) { d.classList.toggle("on", k === cur); if (k === cur) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      vids.forEach(function (v, k) { if (v && k !== cur) v.pause(); });
      if (cur === 1 && vids[1] && vids[1]._loaded) { try { vids[1].currentTime = 0; } catch (e) {} }
      load(act()); tryPlay(); arm(); place();
    }
    function arm() { clearTimeout(timer); if (!dots.length) return; if (!userPaused && !reduce) timer = setTimeout(function () { if (!hero.closest(".v[hidden]") && live(hero)) go(cur + 1); else arm(); }, dur()); }
    function start() { if (started) return; started = true; load(v1); if (vids[1]) setTimeout(function () { load(vids[1]); }, 2500); tryPlay(); }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k, true); }); });
    btn.type = "button"; btn.className = "ve-vbtn";
    btn.addEventListener("click", function () { userPaused = !userPaused; if (userPaused) { var v = act(); if (v) v.pause(); clearTimeout(timer); } else { tryPlay(); arm(); } label(); });
    /* 暫停鈕併入輪播進度列，成為同一組控制，不再浮在畫面上與其他元素打架 */
    hero.appendChild(btn); label();
    function place() { var v = act() || v1; if (!v) return; var h = hero.getBoundingClientRect(), r = v.getBoundingClientRect(), pad = innerWidth > 900 ? 22 : 12;
      var right = Math.min(r.right, h.right, document.documentElement.clientWidth), bottom = Math.min(r.bottom, h.bottom);
      hero.style.setProperty("--vb-x", (right - h.left - 36 - pad) + "px"); hero.style.setProperty("--vb-y", (bottom - h.top - 36 - pad) + "px"); }
    place(); window.addEventListener("resize", place, { passive: true }); window.addEventListener("load", place);
    if (document.readyState === "complete") setTimeout(start, 300); else window.addEventListener("load", function () { setTimeout(start, 300); });
    ["pointerdown", "touchstart", "scroll", "keydown", "click"].forEach(function (ev) { window.addEventListener(ev, function () { var v = act(); if (v && v.paused) tryPlay(); }, { passive: true }); });
    setInterval(function () { var v = act(); if (v && v.paused && !userPaused && !hero.closest(".v[hidden]")) tryPlay(); }, 1000);
    hero._play = function () { tryPlay(); arm(); };
    watch(hero); arm();
  });
  /* 招聘按鈕：自動帶入需求類型 */
  document.querySelectorAll("[data-need]").forEach(function (a) {
    a.addEventListener("click", function () { var sel = document.getElementById("e-need"), want = a.getAttribute("data-need"); if (!sel) return; [].forEach.call(sel.options, function (o) { if (o.textContent === want || o.textContent === (EN[want] || "")) sel.value = o.value; }); });
  });

  /* ---------- 動畫插圖（無人物）：直播、網路、國際線路、架構優化、系統整合、機房 ---------- */
  var ILL = (function () {
    function grid() { var g = '<rect width="320" height="200" fill="var(--ill-bg)"/><g class="g">'; for (var x = 20; x < 320; x += 20) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="200"/>'; for (var y = 20; y < 200; y += 20) g += '<line x1="0" y1="' + y + '" x2="320" y2="' + y + '"/>'; return g + "</g>"; }
    function mover(d, cls, dur, delay) { return '<circle r="2.6" class="' + cls + '"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + d + '"/></circle>'; }
    function rack(x, y, w, h, n, seed) {
      var o = '<rect class="card" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"/>', uh = (h - 6) / n, grp = ["", "", ""];
      for (var i = 0; i < n; i++) {
        var yy = y + 3 + i * uh;
        o += '<rect x="' + (x + 3) + '" y="' + yy.toFixed(1) + '" width="' + (w - 6) + '" height="' + (uh - 1.5).toFixed(1) + '" rx="1" fill="none" stroke="var(--ill-line)" stroke-width=".6"/>';
        for (var k = 0; k < 3; k++) { var r = ((seed * 9301 + i * 49297 + k * 233) % 233280) / 233280; grp[(i + k + seed) % 3] += '<rect class="' + (r < .7 ? "fa" : "fb") + '" x="' + (x + 6 + k * 4) + '" y="' + (yy + uh / 2 - 1.5).toFixed(1) + '" width="2.2" height="1.6"/>'; }
      }
      /* LED 分三組一起閃爍：動畫數量從數十個降到 3 個 */
      return o + grp.map(function (g, gi) { return '<g class="blink" style="animation-delay:-' + (gi * .73 + seed * .21).toFixed(2) + 's">' + g + "</g>"; }).join("");
    }
    var A = {
      software: function () {
        var o = grid();
        /* 需求規劃：左側需求清單卡 */
        o += '<rect class="card" x="18" y="58" width="52" height="80" rx="4"/>';
        o += '<rect x="18" y="58" width="52" height="13" rx="4" fill="var(--ill-a)" opacity=".14"/><circle cx="26" cy="64.5" r="2" class="fa"/><rect x="31" y="63" width="28" height="3" rx="1.5" class="fl"/>';
        for (var i = 0; i < 4; i++) { var ry = 82 + i * 13; o += '<rect x="24" y="' + ry + '" width="7" height="7" rx="1.5" class="' + (i < 2 ? "fa" : "card") + '"/><rect x="35" y="' + (ry + 1.5) + '" width="' + (26 - i * 4) + '" height="3" rx="1.5" class="fl"/>'; }
        /* 需求 → 編輯器 */
        var f1 = "M70 98 L92 100"; o += '<path class="ln" d="' + f1 + '"/>' + mover(f1, "fa", 1.6, 0);
        /* 程式編輯器（主體） */
        o += '<rect class="card" x="92" y="42" width="122" height="118" rx="6"/>';
        o += '<rect x="92" y="42" width="122" height="14" rx="6" fill="var(--ill-a)" opacity=".12"/><line x1="92" y1="56" x2="214" y2="56" class="ln" opacity=".6"/>';
        o += '<circle cx="102" cy="49" r="2.3" class="fr"/><circle cx="111" cy="49" r="2.3" class="fa"/><circle cx="120" cy="49" r="2.3" class="fb"/>';
        o += '<text x="200" y="52.5" text-anchor="middle" class="tx" style="font-size:9px;opacity:.75">&lt;/&gt;</text>';
        o += '<line x1="112" y1="58" x2="112" y2="158" class="ln" opacity=".4"/>';
        var CL = [[0, [[12, "fa"], [22, "fl"]]], [1, [[8, "fb"], [16, "fl"], [10, "fa"]]], [1, [[24, "fl"]]], [2, [[10, "fa"], [15, "fl"]]], [0, [[16, "fb"], [12, "fl"]]], [1, [[8, "fa"], [26, "fl"]]], [2, [[18, "fl"], [8, "fb"]]]], cur = 156;
        CL.forEach(function (r, idx) { var x = 118 + r[0] * 9, y = 70 + idx * 12; o += '<text x="108" y="' + (y + 1.5) + '" text-anchor="end" class="tx" style="font-size:6px;opacity:.45">' + (idx + 1) + '</text>'; r[1].forEach(function (seg) { o += '<rect x="' + x + '" y="' + (y - 3) + '" width="' + seg[0] + '" height="4" rx="1.5" class="' + seg[1] + '" opacity=".9"/>'; x += seg[0] + 5; }); if (idx === 4) cur = x; });
        o += '<rect x="' + cur + '" y="' + (70 + 4 * 12 - 4) + '" width="2.4" height="8" class="fa blink"/>';
        /* 介面設計：右上線框 */
        o += '<rect class="card" x="236" y="46" width="66" height="52" rx="4"/>';
        o += '<rect x="236" y="46" width="66" height="11" rx="4" fill="var(--ill-b)" opacity=".16"/><circle cx="243" cy="51.5" r="1.6" class="fb"/><rect x="248" y="50" width="22" height="3" rx="1.5" class="fl"/>';
        o += '<rect x="242" y="62" width="17" height="30" rx="2" class="card"/><rect x="264" y="62" width="33" height="7" rx="1.5" class="fl"/><rect x="264" y="73" width="33" height="7" rx="1.5" class="fl" opacity=".55"/><rect x="264" y="84" width="22" height="8" rx="4" class="fb"/>';
        var f2 = "M214 74 L236 70"; o += '<path class="lnB" d="' + f2 + '"/>' + mover(f2, "fb", 1.9, -.5);
        /* 功能開發：右下旋轉齒輪 */
        var gx = 266, gy = 138, teeth = "";
        for (var t = 0; t < 8; t++) { var a = t * Math.PI / 4, x1 = gx + Math.cos(a) * 16, y1 = gy + Math.sin(a) * 16, x2 = gx + Math.cos(a) * 22, y2 = gy + Math.sin(a) * 22; teeth += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="ln" stroke-width="3"/>'; }
        o += '<g><animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 ' + gx + ' ' + gy + '" to="360 ' + gx + ' ' + gy + '" dur="16s" repeatCount="indefinite"/>' + teeth + '<circle cx="' + gx + '" cy="' + gy + '" r="16" class="card"/><circle cx="' + gx + '" cy="' + gy + '" r="7.5" class="ln"/></g>';
        o += '<circle cx="' + gx + '" cy="' + gy + '" r="2.6" class="fa pulse"/>';
        var f3 = "M214 128 Q238 134 251 138"; o += '<path class="lnB" d="' + f3 + '"/>' + mover(f3, "fb", 2.1, -1);
        o += '<text class="tx" x="14" y="192">PLANNING · UI DESIGN · DEVELOPMENT</text>';
        return o;
      },
      live: function () {
        var o = grid(), src = [78, 100], scr = [[236, 46], [236, 100], [236, 154]];
        for (var i = 0; i < 3; i++) o += '<circle class="ring" cx="78" cy="100" r="26" style="animation-delay:' + (i * .85) + 's"/>';
        scr.forEach(function (p, i) {
          var d = "M100 100 C160 100 170 " + p[1] + " 214 " + p[1];
          o += '<path class="ln" d="' + d + '"/>' + mover(d, "fa", 2.2, -i * .7);
          o += '<rect class="card" x="214" y="' + (p[1] - 18) + '" width="64" height="38" rx="4"/><rect x="220" y="' + (p[1] - 12) + '" width="52" height="22" rx="2" fill="var(--ill-a)" opacity=".16"/>' +
               '<path d="M243 ' + (p[1] - 6) + ' l10 5 -10 5z" class="fa"/><rect x="220" y="' + (p[1] + 13) + '" width="30" height="2" class="fl"/>';
        });
        var bd = "M78 128 C78 176 180 176 214 112";
        o += '<path class="lnB" d="' + bd + '"/>' + mover(bd, "fb", 3.2, -1) + '<text class="tx" x="120" y="186">BACKUP · FAILOVER</text>';
        o += '<rect class="card" x="56" y="84" width="44" height="32" rx="5"/><path d="M73 92 l12 8 -12 8z" class="fa"/>';
        o += '<rect x="40" y="38" width="40" height="15" rx="7.5" class="fr"/><circle cx="49" cy="45.5" r="3" fill="#fff" class="pulse"/><text x="55" y="48.5" style="font:700 7.5px var(--mono);fill:#fff">LIVE</text>';
        o += '<text class="tx" x="214" y="22">REAL-TIME · LOW LATENCY</text>';
        return o;
      },
      network: function () {
        var o = grid() + '<g class="bob"><circle cx="160" cy="100" r="72" class="ln"/><ellipse cx="160" cy="100" rx="72" ry="26" class="ln"/><ellipse cx="160" cy="100" rx="30" ry="72" class="ln"/><ellipse cx="160" cy="100" rx="56" ry="72" class="ln" opacity=".6"/>';
        var P = [[112, 62], [196, 54], [222, 112], [178, 150], [110, 132], [150, 92]], L = [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
        L.forEach(function (l, i) { var a = P[l[0]], b = P[l[1]], d = "M" + a[0] + " " + a[1] + " Q160 100 " + b[0] + " " + b[1]; if (l[1] !== 5) d = "M" + a[0] + " " + a[1] + " L" + b[0] + " " + b[1]; o += '<path class="lnA" d="' + d + '" opacity=".55"/>' + (i % 2 ? "" : mover(d, "fa", 2.4, -i * .4)); });
        P.forEach(function (p, i) { o += (i === 5 ? '<circle class="ring" cx="150" cy="92" r="8"/>' : "") + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 5 ? 6 : 4) + '" class="' + (i === 5 ? "fa" : "fb") + '"/>'; });
        o += "</g>" + '<text class="tx" x="18" y="186">INTERNET ACCESS · CDN · CN / SEA ROUTES</text>';
        return o;
      },
      transit: function () {
        var o = grid();
        function bld(x, lbl) { var r = '<rect class="card" x="' + x + '" y="96" width="40" height="62" rx="2"/>'; for (var i = 0; i < 4; i++) for (var k = 0; k < 3; k++) r += '<rect x="' + (x + 6 + k * 11) + '" y="' + (104 + i * 13) + '" width="6" height="7" class="' + ((i + k) % 3 ? "fl" : "fa") + ((i * k) % 2 ? " blink" : "") + '" style="animation-delay:-' + (i * .4 + k * .3) + 's"/>'; return r + '<text class="txA" x="' + x + '" y="172">' + lbl + "</text>"; }
        o += bld(24, "HQ") + bld(256, "BRANCH");
        var arc = "M64 112 Q160 18 256 112";
        o += '<path class="ln" d="' + arc + '" stroke-width="6" opacity=".35"/><path class="flow" d="' + arc + '"/>';
        [[112, 66, "HKIX"], [208, 66, "SGIX"]].forEach(function (x) { o += '<rect class="card" x="' + (x[0] - 20) + '" y="' + (x[1] - 9) + '" width="40" height="16" rx="8"/><text class="txA" x="' + (x[0] - 13) + '" y="' + (x[1] + 2) + '">' + x[2] + "</text>"; });
        o += '<text class="tx" x="132" y="28">IPLC · DEDICATED</text>';
        for (var i = 0; i < 5; i++) { var ex = 70 + i * 45, d = "M160 186 Q" + (160 + (ex - 160) * .4) + " 150 " + ex + " 128"; o += '<path class="lnB" d="' + d + '"/>' + mover(d, "fb", 2.8, -i * .5); }
        o += '<circle cx="160" cy="186" r="5" class="fb"/><text class="tx" x="176" y="190">IP TRANSIT · IPv4 / IPv6</text>';
        return o;
      },
      optimise: function () {
        var o = grid(), N = [[46, 60], [96, 46], [70, 108], [120, 100], [52, 156], [118, 156]], E = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5]];
        E.forEach(function (e) { var a = N[e[0]], b = N[e[1]]; o += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="ln"/>'; });
        N.forEach(function (n, i) { o += '<rect x="' + (n[0] - 9) + '" y="' + (n[1] - 7) + '" width="18" height="14" rx="3" class="card"/><circle cx="' + n[0] + '" cy="' + n[1] + '" r="2.6" class="fa pulse" style="animation-delay:' + (i * .3) + 's"/>'; });
        o += '<rect class="card" x="160" y="34" width="144" height="134" rx="6"/><text class="tx" x="170" y="50">TRAFFIC · LATENCY</text>';
        for (var i = 0; i < 9; i++) o += '<rect class="fb grow" x="' + (172 + i * 14) + '" y="96" width="8" height="58" opacity=".35" style="animation-delay:-' + (i * .35) + 's"/>';
        o += '<path class="lnA draw" d="M170 132 L186 120 L200 126 L216 100 L232 106 L248 84 L264 90 L280 70 L296 74"/>';
        o += '<path d="M222 160 a28 28 0 0 1 56 0" class="ln"/><line x1="250" y1="160" x2="250" y2="138" class="lnA sway"/>';
        o += '<text class="tx" x="18" y="186">TOPOLOGY REVIEW · MONITORING · TESTING</text>';
        return o;
      },
      integrate: function () {
        var o = grid();
        o += '<path class="card" d="M126 62 a18 18 0 0 1 8-34 a24 24 0 0 1 44-6 a18 18 0 0 1 20 22 a14 14 0 0 1-4 18z"/><text class="txA" x="146" y="52">CLOUD</text>';
        o += rack(30, 104, 52, 76, 6, 3) + rack(238, 104, 52, 76, 6, 7);
        o += '<polygon points="160,112 176,121 176,139 160,148 144,139 144,121" class="card"/><text class="txA" x="153" y="133">SI</text><circle class="ring" cx="160" cy="130" r="14"/>';
        [["M56 104 C56 76 110 56 130 56", -.2], ["M264 104 C264 76 210 56 196 56", -1.1], ["M82 142 L144 132", -.6], ["M238 142 L176 132", -1.6], ["M160 68 L160 112", -.9]].forEach(function (d) { o += '<path class="ln" d="' + d[0] + '"/>' + mover(d[0], "fa", 2.2, d[1]); });
        o += '<text class="tx" x="18" y="194">ON-PREM</text><text class="tx" x="262" y="194">ON-PREM</text>';
        return o;
      },
      /* ---- E 版四層防線專屬 ---- */
      cdn: function () {
        var o = grid(), C0 = [160, 100], R = 62, pops = [];
        for (var i = 0; i < 6; i++) { var an = -Math.PI / 2 + i * Math.PI / 3; pops.push([C0[0] + Math.cos(an) * R, C0[1] + Math.sin(an) * R * .82]); }
        o += '<polygon class="ln" points="' + pops.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ") + '" stroke-dasharray="3 4"/>';
        pops.forEach(function (q, i) {
          var d = "M160 100 L" + q[0].toFixed(1) + " " + q[1].toFixed(1);
          o += '<path class="ln" d="' + d + '"/>' + mover(d, "fa", 1.8, -i * .3);
          var ex = C0[0] + (q[0] - C0[0]) * 1.55, ey = C0[1] + (q[1] - C0[1]) * 1.55, d2 = "M" + q[0].toFixed(1) + " " + q[1].toFixed(1) + " L" + ex.toFixed(1) + " " + ey.toFixed(1);
          o += '<path class="lnB" d="' + d2 + '"/>' + mover(d2, "fb", 1.4, -i * .23 - .5) + '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="3" class="fb"/>';
          o += '<rect class="card" x="' + (q[0] - 11).toFixed(1) + '" y="' + (q[1] - 8).toFixed(1) + '" width="22" height="16" rx="3"/><rect x="' + (q[0] - 6).toFixed(1) + '" y="' + (q[1] - 3).toFixed(1) + '" width="12" height="6" rx="1" class="fa pulse" style="animation-delay:' + (i * .25) + 's"/>';
        });
        o += '<circle class="ring" cx="160" cy="100" r="16"/><rect class="card" x="146" y="88" width="28" height="24" rx="4"/><text class="txA" x="150" y="103">ORIGIN</text>';
        return o + '<text class="tx" x="14" y="192">CDN · EDGE CACHE · LOW LATENCY</text>';
      },
      globe: function () {
        var o = grid() + '<defs><clipPath id="gbc"><circle cx="160" cy="98" r="70"/></clipPath></defs><circle cx="160" cy="98" r="70" class="card"/>';
        o += '<g clip-path="url(#gbc)">';
        for (var i = -2; i <= 2; i++) o += '<ellipse cx="160" cy="' + (98 + i * 26) + '" rx="' + (70 * Math.sqrt(1 - Math.pow(i * 26 / 70, 2))).toFixed(1) + '" ry="5" class="ln" opacity=".5"/>';
        for (var k = 0; k < 4; k++) o += '<ellipse cx="160" cy="98" rx="' + (12 + k * 18) + '" ry="70" class="ln" opacity=".45"><animate attributeName="rx" values="' + (12 + k * 18) + ";" + (72 - k * 18) + ";" + (12 + k * 18) + '" dur="' + (7 + k) + 's" repeatCount="indefinite"/></ellipse>';
        o += "</g>";
        [["M104 70 Q160 20 222 74", "lnA", "IPv4", 108, 60], ["M100 128 Q160 176 226 118", "lnB", "IPv6", 196, 166]].forEach(function (r, i) {
          o += '<path d="' + r[0] + '" class="' + r[1] + ' draw" style="stroke-width:2;animation-delay:' + (i * 1.2) + 's"/><text class="txA" x="' + r[3] + '" y="' + r[4] + '">' + r[2] + "</text>" + mover(r[0], i ? "fb" : "fa", 2.6, -i);
        });
        [[104, 70], [222, 74], [100, 128], [226, 118]].forEach(function (q, i) { o += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="4" class="' + (i < 2 ? "fa" : "fb") + '"/>'; });
        return o + '<text class="tx" x="14" y="192">IP TRANSIT · GLOBAL COVERAGE</text>';
      },
      tunnel: function () {
        var o = grid();
        for (var i = 0; i < 7; i++) { var f = 1 - i * .13; o += '<rect x="' + (160 - 120 * f).toFixed(1) + '" y="' + (98 - 66 * f).toFixed(1) + '" width="' + (240 * f).toFixed(1) + '" height="' + (132 * f).toFixed(1) + '" rx="' + (14 * f).toFixed(1) + '" fill="none" stroke="var(--ill-a)" stroke-width="1" opacity="' + (.12 + i * .1).toFixed(2) + '"/>'; }
        for (var r = 0; r < 3; r++) o += '<rect class="ring" x="40" y="32" width="240" height="132" rx="14" style="animation-duration:3s;animation-delay:-' + r + 's;animation-direction:reverse"/>';
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c, k) {
          var d = "M" + (160 + c[0] * 118) + " " + (98 + c[1] * 64) + " L" + (160 + c[0] * 26) + " " + (98 + c[1] * 14);
          o += '<path class="ln" d="' + d + '" opacity=".5"/>' + mover(d, "fa", 1.6, -k * .4);
        });
        o += '<rect class="card" x="141" y="83" width="38" height="30" rx="5"/><path d="M152 92 v-4 a8 8 0 0 1 16 0 v4" fill="none" stroke="var(--ill-a)" stroke-width="2"/><rect x="149" y="92" width="22" height="15" rx="2" class="fa"/>';
        o += '<text class="txA" x="14" y="18">HQ</text><text class="txA" x="268" y="18">BRANCH</text>';
        return o + '<text class="tx" x="14" y="192">IPLC · PRIVATE · POINT-TO-POINT</text>';
      },
      ops: function () {
        var o = grid() + '<rect class="card" x="14" y="22" width="292" height="150" rx="8"/>';
        o += '<circle cx="74" cy="92" r="38" fill="none" stroke="var(--ill-line)" stroke-width="7"/><circle cx="74" cy="92" r="38" fill="none" stroke="var(--ill-b)" stroke-width="7" stroke-linecap="round" stroke-dasharray="239" stroke-dashoffset="239" transform="rotate(-90 74 92)" class="draw" style="stroke-dasharray:239;animation-duration:5s"/>';
        o += '<text class="txA" x="56" y="96" style="font-size:11px">99.9</text><text class="tx" x="58" y="108">UPTIME</text>';
        o += '<defs><clipPath id="hbc"><rect x="130" y="40" width="160" height="60"/></clipPath></defs><g clip-path="url(#hbc)"><g><animateTransform attributeName="transform" type="translate" from="0 0" to="-80 0" dur="2.4s" repeatCount="indefinite"/>';
        var hb = "M130 70"; for (var x = 130; x < 380; x += 40) hb += " L" + (x + 14) + " 70 L" + (x + 18) + " 54 L" + (x + 22) + " 86 L" + (x + 26) + " 66 L" + (x + 30) + " 70 L" + (x + 40) + " 70";
        o += '<path d="' + hb + '" class="lnA"/></g></g><text class="tx" x="132" y="36">HEARTBEAT</text>';
        ["LINK", "ROUTING", "BACKUP"].forEach(function (t, i) { var y = 120 + i * 16; o += '<circle cx="136" cy="' + y + '" r="3.5" class="fb pulse" style="animation-delay:' + (i * .4) + 's"/><text class="tx" x="146" y="' + (y + 2.5) + '">' + t + '</text><rect x="210" y="' + (y - 2) + '" width="' + (70 - i * 14) + '" height="4" rx="2" class="fa grow" style="transform-origin:left;animation-name:illGrowX;animation-delay:-' + i + 's"/>'; });
        return o + '<text class="tx" x="14" y="192">24/7 MONITORING · OPTIMISATION</text>';
      },
      broadcast: function () {
        var o = grid();
        o += '<path d="M150 170 L160 92 L170 170 M154 140 L166 140 M152 156 L168 156" class="lnA" fill="none"/><circle cx="160" cy="88" r="6" class="fr pulse"/>';
        for (var i = 0; i < 4; i++) o += '<path d="M134 70 A34 34 0 0 1 186 70" class="ring" style="animation-delay:' + (i * .7) + 's;transform-origin:160px 88px;transform-box:view-box"/>';
        var V = [[42, 52], [76, 128], [36, 152], [258, 44], [286, 114], [244, 156], [104, 34], [216, 30]];
        V.forEach(function (q, k) {
          var d = "M160 88 Q" + ((160 + q[0]) / 2) + " " + (Math.min(88, q[1]) - 28) + " " + q[0] + " " + q[1];
          o += '<path class="lnB" d="' + d + '" opacity=".6"/>' + mover(d, "fa", 2 + k * .15, -k * .35);
          o += '<rect class="card" x="' + (q[0] - 12) + '" y="' + (q[1] - 8) + '" width="24" height="16" rx="3"/><rect x="' + (q[0] - 8) + '" y="' + (q[1] - 4) + '" width="16" height="8" rx="1" class="fb blink" style="animation-delay:-' + (k * .5) + 's"/>';
        });
        return o + '<text class="tx" x="14" y="192">LIVE · GLOBAL AUDIENCE · FAILOVER</text>';
      },
      /* 等角 3D 資料中心：3×3 伺服器方塊、中央核心光柱、走道上流動的光點 */
      datacenter: function () {
        var S = 12.5, CX = 160, CY = 54, C = Math.cos(Math.PI / 6) * S, H = Math.sin(Math.PI / 6) * S;
        function P(x, y, z) { return [CX + (x - y) * C, CY + (x + y) * H - z * S]; }
        function pts(a) { return a.map(function (q) { var v = P(q[0], q[1], q[2]); return v[0].toFixed(1) + "," + v[1].toFixed(1); }).join(" "); }
        function path(a) { return "M" + a.map(function (q) { var v = P(q[0], q[1], q[2] || 0); return v[0].toFixed(1) + " " + v[1].toFixed(1); }).join(" L"); }
        var o = '<rect width="320" height="200" fill="var(--ill-bg)"/>' +
          '<defs><radialGradient id="dcg" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="var(--ill-a)" stop-opacity=".22"/><stop offset="1" stop-color="var(--ill-a)" stop-opacity="0"/></radialGradient>' +
          '<linearGradient id="dcb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--ill-a)" stop-opacity=".55"/><stop offset="1" stop-color="var(--ill-a)" stop-opacity="0"/></linearGradient></defs>' +
          '<rect width="320" height="200" fill="url(#dcg)"/>';
        /* 地面網格 */
        o += '<g class="g" opacity=".9">';
        for (var i = 0; i <= 10; i++) o += '<polyline fill="none" points="' + pts([[i, 0, 0], [i, 10, 0]]) + '"/><polyline fill="none" points="' + pts([[0, i, 0], [10, i, 0]]) + '"/>';
        o += '<polygon fill="none" stroke="var(--ill-line)" stroke-width=".8" points="' + pts([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]]) + '"/></g>';
        /* 走道與流動光點（先畫，會被方塊遮住） */
        var lanes = [[[3.5, 0], [3.5, 10]], [[6.5, 10], [6.5, 0]], [[0, 3.5], [10, 3.5]], [[10, 6.5], [0, 6.5]]];
        lanes.forEach(function (l, k) {
          var d = path(l);
          o += '<path d="' + d + '" fill="none" stroke="var(--ill-a)" stroke-width=".8" opacity=".35"/>';
          for (var m = 0; m < 2; m++) o += '<rect x="-3" y="-1" width="6" height="2" rx="1" class="fa"><animateMotion dur="' + (3.2 + k * .4) + 's" begin="-' + (m * 1.7 + k * .5).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></rect>';
        });
        /* 方塊：由後往前畫 */
        var B = [[1, 1, 3], [4, 1, 4], [7, 1, 3], [1, 4, 4], [4, 4, 0], [7, 4, 4], [1, 7, 3], [4, 7, 4], [7, 7, 3]];
        B.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
        B.forEach(function (bx, n) {
          var x = bx[0], y = bx[1], core = bx[2] === 0, h = core ? 6.5 : bx[2], w = 2, d = 2;
          var top = [[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], L = [[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]], R = [[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]];
          o += '<polygon points="' + pts(L) + '" fill="var(--ill-card)" stroke="var(--ill-line)" stroke-width=".7"/><polygon points="' + pts(L) + '" fill="var(--ill-a)" opacity=".10"/>';
          o += '<polygon points="' + pts(R) + '" fill="var(--ill-card)" stroke="var(--ill-line)" stroke-width=".7"/><polygon points="' + pts(R) + '" fill="var(--ill-a)" opacity=".22"/>';
          o += '<polygon points="' + pts(top) + '" fill="var(--ill-card)" stroke="var(--ill-line)" stroke-width=".7"/>';
          /* 側面燈條，分三組閃爍 */
          var g = ["", "", ""];
          for (var z = .7; z < h - .3; z += .8) {
            var gi = Math.round(z * 10 + n) % 3;
            g[gi] += '<polyline fill="none" stroke="var(--ill-a)" stroke-width="1.1" stroke-linecap="round" points="' + pts([[x + w, y + .35, z], [x + w, y + .35 + (core ? 1.3 : .8), z]]) + '"/>';
            g[(gi + 1) % 3] += '<polyline fill="none" stroke="var(--ill-b)" stroke-width="1.1" stroke-linecap="round" points="' + pts([[x + .35, y + d, z], [x + .35 + .5, y + d, z]]) + '"/>';
          }
          o += g.map(function (s, k) { return '<g class="blink" style="animation-delay:-' + (k * .7 + n * .13).toFixed(2) + 's">' + s + "</g>"; }).join("");
          if (core) {
            var c = P(x + 1, y + 1, h);
            o += '<polygon points="' + pts(top) + '" fill="var(--ill-a)" opacity=".35" class="pulse"/>';
            o += '<rect x="' + (c[0] - 7).toFixed(1) + '" y="0" width="14" height="' + c[1].toFixed(1) + '" fill="url(#dcb)" class="pulse"/>';
            o += '<ellipse class="ring" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" rx="14" ry="8"/>';
          }
        });
        o += '<text class="tx" x="14" y="192">DATA CENTER · 24/7 OPERATIONS</text>';
        return o;
      }
    };
    return function (el) {
      if (el._ill) return; el._ill = true;
      var k = el.getAttribute("data-ill"); if (!A[k]) return;
      el.innerHTML = '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + A[k]() + "</svg>";
      var svg = el.firstChild;
      if (svg.pauseAnimations) svg.pauseAnimations();
    };
  })();
  /* 頁面載入完成後才開始繪製；只有畫面上看得到的插圖會播放 */
  var illReady = false, illVis = new Set();
  var illLive = false;
  /* SMIL 一律暫停，改由共用時鐘以約 30fps 推進畫面上的插圖：
     原生 SMIL 每格都觸發整張 SVG 重繪，降到 30fps 並集中在同一格更新，主執行緒負擔明顯下降 */
  var illRun = new Set(), illT0 = 0, illLast = 0, illTicking = false;
  function illTick(now) {
    if (!illRun.size || document.hidden) { illTicking = false; return; }
    if (now - illLast >= 33) { illLast = now; var t = now - illT0; illRun.forEach(function (svg) { svg.setCurrentTime(t / 1000); if (svg._an) svg._an.forEach(function (a) { a.currentTime = t; }); }); }
    requestAnimationFrame(illTick);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && illRun.size && !illTicking) { illTicking = true; requestAnimationFrame(illTick); } });
  function illSet(el, on) {
    if (on && illReady) ILL(el);
    on = on && illLive; el._live = on;
    el.classList.toggle("off", !on);
    var svg = el.firstChild;
    if (!svg || !svg.setCurrentTime || reduce) return;
    /* SVG 子元素的 CSS 動畫無法交給合成器，同樣暫停後由共用時鐘推進 */
    if (on && !svg._an && svg.getAnimations) { svg._an = svg.getAnimations({ subtree: true }); svg._an.forEach(function (a) { a.pause(); }); }
    if (on) { if (!illT0) illT0 = performance.now(); illRun.add(svg); if (!illTicking) { illTicking = true; requestAnimationFrame(illTick); } }
    else illRun.delete(svg);
  }
  var illIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) illVis.add(e.target); else illVis.delete(e.target); illSet(e.target, e.isIntersecting); });
  }, { rootMargin: "0px" }) : null;
  document.querySelectorAll(".ill[data-ill]").forEach(function (el) { if (illIO) illIO.observe(el); });
  function illStart() { illReady = true; if (illIO) illVis.forEach(function (el) { illSet(el, true); }); else document.querySelectorAll(".ill[data-ill]").forEach(ILL); }
  window.addEventListener("load", function () { (window.requestIdleCallback || function (f) { setTimeout(f, 600); })(illStart, { timeout: 2500 }); });
  /* 插圖先靜態顯示；訪客開始捲動或互動後才播放動畫，避免拖慢首屏 */
  function illGo() { if (illLive) return; illLive = true; illVis.forEach(function (el) { illSet(el, true); }); }
  ["scroll", "pointerdown", "touchstart", "keydown", "wheel"].forEach(function (ev) { window.addEventListener(ev, illGo, { once: true, passive: true }); });

  /* ---------- 照片輪播 ---------- */
  document.querySelectorAll("[data-slides]").forEach(function (box, bi) {
    var imgs = box.children, dots = bi === 0 ? document.querySelectorAll("[data-dots] button") : [], i = 0, timer;
    /* 輪播圖等到快輪到時才下載：顯示第 n 張時預先載入第 n+1 張 */
    function prime(n) { var im = imgs[n % imgs.length]; if (im && im.dataset && im.dataset.srcset) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; delete im.dataset.srcset; delete im.dataset.src; } }
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 1500); };
    window.addEventListener("load", function () { idle(function () { prime(i + 1); }); });
    function go(n) {
      imgs[i].classList.remove("on"); if (dots[i]) dots[i].classList.remove("on");
      i = (n + imgs.length) % imgs.length;
      prime(i); imgs[i].classList.add("on"); if (dots[i]) dots[i].classList.add("on"); prime(i + 1);
    }
    function play() { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (live(box)) { go(i + 1); kick(); } }, bi === 0 ? 6000 : 4500); }
    Array.prototype.forEach.call(dots, function (d, n) { d.addEventListener("click", function () { go(n); play(); kick(); }); });
    play();
  });

  /* ---------- 中英切換 ---------- */
  var EN = {"MOOTECH｜Complete IT solutions, one move ahead.": "MOOTECH | Complete IT solutions, one move ahead.", "認識 MOOTECH 願景": "Explore MOOTECH Vision", "主選單": "Main menu", "關於我們": "About", "解決方案": "Solutions", "全球據點": "Global", "聯絡我們": "Contact", "切換語言": "Switch language", "開啟選單": "Open menu", "探索解決方案": "Explore solutions", "解決方案捷徑": "Solution shortcuts", "直播": "Live Streaming", "網路連線": "Connectivity", "網路架構": "Network Architecture", "系統整合": "System integration", "威脅情報庫": "Threat Intelligence", "資料中心機房": "Data center", "從網路接取、國際專線到 L3–L7 DDoS 防護，MOOTECH 為企業與直播內容打造低延遲、不中斷的網路。": "From internet access and international private lines to L3–L7 DDoS protection, MOOTECH builds low-latency, always-on networks for businesses and live content.", "網路維運主控台": "Network operations console", "示範資料": "Demo data", "主控台情境": "Console scenarios", "DDoS 攔截": "DDoS mitigation", "國際專線": "Private line", "直播容錯": "Live failover", "查看服務": "View services", "服務": "Services", "網路": "Network", "DDoS 緩解範圍": "DDoS mitigation coverage", "HKIX · MYIX · SGIX · JPIX 對等互聯": "Peering at HKIX · MYIX · SGIX · JPIX", "IPv4 與 IPv6 雙協定": "IPv4 and IPv6 support", "網際網路接取與 CDN": "Internet access and CDN", "流量進入的第一道門。": "The first gate traffic passes through.", "低延遲線路與中國、東南亞區域優化線路，為您傳輸受歡迎的應用與內容；CDN 加快網站載入、降低頻寬成本，並強化內容備援。": "Low-latency routes and optimised paths for China and Southeast Asia carry your applications and content; CDN speeds up page loads, cuts bandwidth costs and adds content redundancy.", "DDoS 防護": "DDoS protection", "在攻擊抵達之前攔截。": "Stops attacks before they arrive.", "以先發制人的 CDN 保護機制，偵測並緩解各種形式的分散式阻斷攻擊，涵蓋 L3 網路層到 L7 應用層，提升線上服務時間與表現。": "Pre-emptive CDN protection detects and mitigates every kind of distributed denial-of-service attack, from the L3 network layer to the L7 application layer, keeping services online and fast.", "IPLC 國際專線": "IPLC private line", "總部與分行之間的專屬通道。": "A dedicated path between headquarters and branches.", "國際點對點專線，在總部與全球分行之間提供專用、可靠、安全的連接；兼具高可用性與低延遲，並與 HKIX、MYIX、SGIX、Equinix JPIX 對等互聯。": "Point-to-point international lines give dedicated, reliable and secure links between headquarters and branches worldwide, with high availability, low latency and peering at HKIX, MYIX, SGIX and Equinix JPIX.", "架構優化與系統整合": "Optimisation and system integration", "讓整套網路持續最佳化。": "Keeps the whole network at its best.", "盤點網路使用狀態、負荷量、限制與安全漏洞，提出優化方案；整合雲端與機房環境，並由專業技術人員到場代客操作與排查。": "We assess usage, load, limits and security gaps to find optimisations, integrate cloud and on-premises environments, and send trained engineers on site for remote-hands operation and troubleshooting.", "直播串流": "Live streaming", "在同一套防線上，把內容送到全球。": "Delivers content worldwide on the same line of defence.", "隨心所欲地呈現您的內容：即時串流、低延遲畫面，以及不間斷的直播服務與容錯機制。": "Present your content your way: real-time streaming, low-latency pictures and uninterrupted service with built-in redundancy.", "EDGE · 接取": "EDGE", "SHIELD · 防護": "SHIELD", "BACKBONE · 骨幹": "BACKBONE", "OPS · 維運": "OPS", "DELIVERY · 傳遞": "DELIVERY", "往下捲動，看流量如何一層一層通過 MOOTECH 的網路。DDoS 攻擊會在防護層被攔下，正常流量則經由專線送達全球。": "Scroll to follow traffic through the MOOTECH network layer by layer. DDoS attacks are stopped at the shield; legitimate traffic travels the backbone to the world.", "線路類型": "Line types", "網路架構優化": "Network optimisation", "隨心所欲地呈現您的內容。": "Present your content your way.", "即時串流": "Real-time picture", "畫面即時送達觀眾，活動、發表會與賽事都能同步呈現。": "Pictures reach viewers in real time, keeping events, launches and matches in sync.", "低延遲": "Low-latency picture", "縮短從拍攝到觀看的時間差，互動更即時。": "Shorter delay from camera to viewer for more immediate interaction.", "不間斷與容錯": "Redundancy", "備援線路與容錯機制，讓直播服務不中斷。": "Backup paths and failover keep the stream running without interruption.", "從接取、專線到加速與防護，一次到位。": "Access, private lines, acceleration and protection in one place.", "網際網路接取": "Internet access", "使用低延遲線路或中國及東南亞區域優化線路，為客戶傳輸受歡迎的應用或內容。": "Low-latency routes, or routes optimised for China and Southeast Asia, carry your popular applications and content.", "IPLC 國際私人租用線路": "IPLC international private leased circuits", "為跨國企業提供國際點對點專線，在總部與全球各地分行之間提供專用、可靠、安全的連接。": "International point-to-point lines give multinationals dedicated, reliable and secure links between headquarters and branches worldwide.", "CDN 服務": "CDN services", "立即提升網站效能，改善載入時間與安全性、減少頻寬成本並強化內容備援。": "Boost website performance right away: faster loads, better security, lower bandwidth costs and stronger content redundancy.", "以先發制人的 CDN 保護機制偵測並緩解各種分散式阻斷攻擊，提升線上服務時間與表現。": "Pre-emptive CDN protection detects and mitigates all forms of DDoS attack, improving uptime and performance.", "IP Transit、IPLC 與 Security 防護，依需求組合。": "Combine IP Transit, IPLC and Security as you need.", "涵蓋率遍佈全球": "Global coverage", "支援 IPv6 與 IPv4": "IPv6 and IPv4 support", "優良的國際流量線路規劃": "Well-planned international routes", "與中國頂尖電信供應商合作": "Partnerships with leading Chinese carriers", "中國與東南亞區域專有的優化線路": "Optimised routes for China and Southeast Asia", "安全性高的點對點資料傳輸": "Secure point-to-point data transfer", "兼具高可用性與低延遲": "High availability with low latency", "與 HKIX、MYIX、SGIX、Equinix JPIX 對等互聯": "Peering with HKIX, MYIX, SGIX and Equinix JPIX", "網際網路交換中心對等互聯": "Internet exchange peering", "強效的反 DDoS 攻擊方案": "Strong anti-DDoS solutions", "保護基礎設施免受 DDoS 攻擊": "Protects infrastructure from DDoS attacks", "服務安全性與可靠性": "Service security and reliability", "兼具靈活性與擴展性": "Flexible and scalable", "L3 網路層至 L7 應用層的緩解攻擊機制": "Mitigation from the L3 network layer to the L7 application layer", "協助取得您的網路使用狀態、負荷量、限制和安全性漏洞，發掘更多優化的可能性。": "We map your network usage, load, limits and security gaps to uncover more ways to optimise.", "網路配置與品質優化": "Configuration and quality", "調整網路配置，提升連線品質。": "Tune configuration to improve connection quality.", "網路架構設計": "Architecture design", "網路架構設計與拓樸圖審核。": "Network architecture design and topology review.", "庫存管理": "Inventory management", "設備庫存管理。": "Equipment inventory management.", "網路流量監控": "Traffic monitoring", "網路流量表現分析。": "Traffic performance analysis.", "網路優化": "Optimisation", "網路優化方案、網路漏洞測試與驗證。": "Optimisation plans plus vulnerability testing and validation.", "從諮詢、部署到建置後支援，整合雲端與機房環境。": "From consulting and deployment to post-launch support, joining cloud and data-center environments.", "諮詢服務": "Consulting", "IT 系統整合諮詢服務。": "IT system integration consulting.", "部署與遷移": "Deployment and migration", "IT 解決方案的建置與資料遷移。": "Building IT solutions and migrating data.", "客製化需求": "Custom requirements", "客製化測試情境、驗收條件與文件紀錄。": "Custom test scenarios, acceptance criteria and documentation.", "建置後支援": "Post-launch support", "建置完成後的支援服務。": "Support after go-live.", "雲端與機房整合": "Cloud and data-center integration", "整合雲端與在地系統。": "Integrating cloud and on-premises systems.", "代客操作服務": "Remote hands", "受過專業訓練的技術人員到場代客操作、安裝，並為您的機房設備排查問題，快速且可靠。": "Trained engineers come on site to operate, install and troubleshoot your data-center equipment, quickly and reliably.", "直播串流、網路連線、線路類型、架構優化與系統整合，可以單獨導入，也能組合成完整的企業網路基礎。": "Live streaming, connectivity, line types, optimisation and system integration. Adopt one or combine them into a complete enterprise network foundation.", "服務項目": "Services", "與亞太主要網際網路交換中心對等互聯，並提供中國與東南亞區域優化線路，讓連線穩定、不中斷。": "Peering with major Asia-Pacific internet exchanges, plus optimised routes for China and Southeast Asia. Stable, uninterrupted connectivity.", "對等互聯": "Peering", "香港": "Hong Kong", "吉隆坡": "Kuala Lumpur", "新加坡": "Singapore", "東京": "Tokyo", "優化線路": "Optimised routes", "中國與東南亞區域": "China and Southeast Asia", "需求類型": "What do you need?", "網際網路接取 / IP Transit": "Internet access / IP Transit", "系統整合 / 代客操作": "System integration / remote hands", "其他": "Other", "防線": "Layers", "據點": "Locations", "流程": "Process", "查看防線": "See the layers", "從邊界連線到威脅情報，MOOTECH 以四層防線守護企業的關鍵系統。": "From edge connectivity to threat intelligence, MOOTECH guards critical business systems with four layers of defence.", "查詢 IP 威脅情報": "Look up IP threat intelligence", "查詢": "Look up", "成立": "Founded", "層防線": "layers of defence", "大解決方案": "core solutions", "雙據點": "Two offices", "MOOTECH 概況": "MOOTECH at a glance", "往下捲動，看封包如何一層一層被檢查。被判定為威脅的請求，會在途中被攔下。": "Scroll to watch a request get checked layer by layer. Anything judged a threat is stopped on the way.", "請求進入的第一道門。": "The first gate a request passes through.", "決定流量怎麼走、哪裡能被擋。": "Decides how traffic flows and where it can be stopped.", "把系統接成一致的整體，減少縫隙。": "Joins systems into one whole, leaving fewer gaps.", "貫穿每一層的判斷依據。": "The judgement behind every layer.", "攻擊路徑從各地湧入，在 MOOTECH 的據點被攔截。": "Attack paths pour in from everywhere and are intercepted at MOOTECH locations.", "亞太區據點與攔截地圖": "Asia-Pacific locations and interception map", "EDGE · 邊界": "EDGE", "NETWORK · 網路": "NETWORK", "SYSTEM · 系統": "SYSTEM", "INTEL · 情報": "INTEL", "首頁": "Home", "5 大解決方案": "5 core solutions", "穩定，": "Stability", "從架構開始。": "starts with architecture.", "服務場景": "In action", "從機房、會議室到活動現場，看看 MOOTECH 的解決方案如何運作。": "From data centers and meeting rooms to live events, see MOOTECH solutions at work.", "機房佈線": "Data center cabling", "架構規劃": "Architecture planning", "資安監控": "Security monitoring", "活動直播": "Event streaming", "解決方案全景": "Solution overview", "點選服務，查看它在企業環境中的樣貌。": "Pick a service to see how it fits into an enterprise environment.", "MOOTECH 辦公室": "MOOTECH office", "MOOTECH 團隊": "MOOTECH team", "團隊合作": "Team collaboration", "主視覺切換": "Hero slides", "成立年份，深耕企業 IT 服務": "Founded, serving enterprise IT ever since", "5 大": "5 core", "解決方案：直播、網路、架構、整合、威脅情報": "Solutions: streaming, connectivity, architecture, integration, threat intel", "新加坡 · 台灣": "Singapore · Taiwan", "雙據點，服務全球客戶": "Two offices serving clients worldwide", "MOOTECH 是一家成立於 2016 年的專業 IT 公司，專注於創新解決方案。我們的服務範圍包括 Web API 架構、系統和網路高可用性優化、即時串流媒體以及免費威脅情報庫。": "MOOTECH is a professional IT company founded in 2016, focused on innovative solutions. Our services cover Web API architecture, high-availability optimisation for systems and networks, real-time streaming media and a free threat intelligence database.", "在 MOOTECH，我們優先考慮安全和威脅評估，並致力於維護強大的威脅情報庫，這有助於我們主動應對潛在的安全問題。我們秉持前瞻性的 IT 解決方案理念，憑藉精湛的技術實力和對卓越的不懈追求，我們能夠為全球客戶提供穩定且可擴展的創新解決方案。": "At MOOTECH, security and threat assessment come first. We maintain a robust threat intelligence database that lets us address potential security issues before they become problems. With a forward-looking approach to IT, strong engineering and a constant pursuit of excellence, we deliver stable, scalable and innovative solutions to clients around the world.", "從實施核心解決方案到部署加值功能，我們採取靈活、反應迅速的方式，為全球用戶提供穩定且創新的解決方案。": "From implementing core solutions to deploying value-added features, we work in a flexible, responsive way to give users worldwide stable and innovative solutions.", "從內容傳遞到基礎架構與資安防護，為企業打造穩定、可擴展的 IT 環境。": "From content delivery to infrastructure and security, we build stable, scalable IT environments for businesses.", "直播示意圖": "Live streaming", "網路連線示意圖": "Connectivity", "網路架構示意圖": "Network architecture", "系統整合示意圖": "System integration", "威脅情報庫示意圖": "Threat intelligence", "透過 MOOTECH 的直播解決方案，您可以接觸到全球受眾，提升品牌曝光度與互動率。我們可自訂的平台讓您根據自身需求打造專屬直播內容，無論是虛擬活動、產品發表會或其他任何形式的直播，都能輕鬆進行。MOOTECH 幫助您將直播提升至全新高度。": "With MOOTECH live streaming you can reach a global audience and lift brand exposure and engagement. Our customisable platform lets you build streams around your own needs, whether it is a virtual event, a product launch or any other kind of broadcast. MOOTECH takes your live streaming to a new level.", "諮詢此方案 →": "Ask about this →", "我們提供的網路與連線解決方案具備高度靈活且強大的連接能力，並提供專業的諮詢與支援，以保護您的業務。": "Our network and connectivity solutions offer flexible, powerful connections, backed by expert consulting and support to protect your business.", "MOOTECH 團隊將依您的需求設計架構，協助您選擇符合業務需求與預算的最佳化網路解決方案。": "The MOOTECH team designs an architecture around your requirements and helps you choose the optimal network solution for your business and budget.", "我們為客戶提供最佳解決方案，將市場上多個 IT 系統、硬體與軟體連接成協調一致、操作流暢的整體。": "We connect multiple IT systems, hardware and software from the market into one coordinated whole that runs smoothly.", "我們提供以 IP 位址為基礎的威脅情報資料庫，針對各類威脅與惡意行為提供解決方案，確保您的網路與系統安全。": "Our IP-based threat intelligence database addresses a wide range of threats and malicious activity, keeping your networks and systems secure.", "為什麼選擇 MOOTECH": "Why MOOTECH", "安全優先": "Security first", "以威脅評估為起點，持續維護威脅情報庫，主動應對潛在的安全風險。": "We start from threat assessment and keep our threat intelligence database current, so risks are handled before they hit.", "高可用性": "High availability", "從 Web API 架構到網路層，針對穩定與高可用性進行設計與優化。": "From Web API architecture down to the network layer, everything is designed and tuned for stability and uptime.", "靈活迅速": "Fast and flexible", "從核心解決方案到加值功能，以靈活、反應迅速的方式交付。": "From core solutions to value-added features, we deliver quickly and adapt as you go.", "全球視野": "Global reach", "以新加坡與台灣為據點，為全球客戶提供穩定且可擴展的服務。": "Based in Singapore and Taiwan, we provide stable, scalable services to clients worldwide.", "合作流程": "How we work", "需求諮詢": "Consultation", "了解您的業務目標、現有系統與預算。": "We learn your business goals, current systems and budget.", "架構設計": "Architecture design", "規劃網路與系統架構，選出最適合的解決方案。": "We plan the network and system architecture and choose the best-fit solution.", "部署導入": "Deployment", "實施核心解決方案，完成系統整合與測試。": "We implement the core solution and complete integration and testing.", "維運支援": "Ongoing support", "提供專業支援與優化，並依需求擴充加值功能。": "We provide expert support and optimisation, and add value-added features as you grow.", "穩定，從架構開始。": "Stability starts with architecture.", "從架構規劃到上線維運，MOOTECH 與您一起打造穩定、安全的 IT 基礎。": "From architecture planning to day-to-day operations, MOOTECH builds a stable, secure IT foundation with you.", "預約諮詢 →": "Book a consultation →", "預約諮詢": "Book a consultation", "立足新加坡與台灣，服務全球客戶。": "Based in Singapore and Taiwan, serving clients worldwide.", "亞太區據點地圖": "Asia-Pacific locations map", "辦公室": "Office", "新加坡、台灣": "Singapore, Taiwan", "資料中心": "Data center", "香港、新加坡、東京": "Hong Kong, Singapore, Tokyo", "姓名": "Name", "電子郵件": "Email", "訊息": "Message", "發送訊息": "Send message", "地點": "Locations", "台灣": "Taiwan", "社群": "Social", "加入我們": "Join Us", "架構優化": "Network Optimisation", "Mootech Pte. Ltd. · © 2026 版權所有": "Mootech Pte. Ltd. · © 2026 All rights reserved", "Web API 架構、高可用性網路、即時串流與威脅情報。MOOTECH 讓企業的關鍵系統保持穩定、安全且隨時可擴展。": "Web API architecture, high-availability networks, real-time streaming and threat intelligence. MOOTECH keeps critical business systems stable, secure and ready to scale.", "查看解決方案 →": "View solutions →", "查看解決方案": "View solutions", "聯絡工程團隊": "Talk to our engineers", "新加坡 / 台灣": "Singapore / Taiwan", "高可用性架構": "HA architecture", "MOOTECH 是一家成立於 2016 年的專業 IT 公司，專注於創新解決方案。服務範圍包括 Web API 架構、系統和網路高可用性優化、即時串流媒體以及免費威脅情報庫。": "MOOTECH is a professional IT company founded in 2016, focused on innovative solutions. Our services cover Web API architecture, high-availability optimisation for systems and networks, real-time streaming media and a free threat intelligence database.", "我們優先考慮安全和威脅評估，並致力於維護強大的威脅情報庫，主動應對潛在的安全問題。秉持前瞻性的 IT 解決方案理念，以精湛的技術實力為全球客戶提供穩定且可擴展的創新方案。": "Security and threat assessment come first. We maintain a robust threat intelligence database to get ahead of potential security issues, and apply strong engineering to deliver stable, scalable solutions to clients worldwide.", "從實施核心解決方案到部署加值功能，我們採取靈活、反應迅速的方式，為全球用戶提供穩定且創新的服務。": "From implementing core solutions to deploying value-added features, we work in a flexible, responsive way to give users worldwide stable and innovative service.", "提供六個服務模組，可獨立導入，也能組合成完整的 IT 基礎架構解決方案。": "Six service modules, used independently or together as your enterprise IT foundation.", "接觸全球受眾，提升品牌曝光與互動率。可自訂的平台讓您打造專屬直播內容，虛擬活動、產品發表會或任何形式的直播都能輕鬆進行。": "Reach a global audience and lift brand exposure and engagement. Our customisable platform handles virtual events, product launches and any other kind of broadcast.", "高度靈活且強大的連接能力，並提供專業諮詢與支援，保護您的業務。": "Flexible, powerful connectivity, backed by expert consulting and support to protect your business.", "依需求設計架構，選擇符合業務與預算的最佳化網路方案。": "Architecture designed around your needs, with the optimal network for your business and budget.", "將市場上多個 IT 系統、硬體與軟體連接成協調一致、操作流暢的整體。": "Multiple IT systems, hardware and software connected into one coordinated, smooth-running whole.", "以 IP 位址為基礎的威脅情報資料庫，針對各類威脅與惡意行為提供解決方案，確保網路與系統安全。": "An IP-based threat intelligence database that counters threats and malicious activity to keep networks and systems secure.", "立足新加坡與台灣，": "Based in Singapore and Taiwan,", "服務全球客戶。": "serving clients worldwide.", "亞太區據點與連線地圖": "Asia-Pacific locations and links map", "SIN · 新加坡": "SIN · Singapore", "TPE · 台灣": "TPE · Taiwan", "HKG · 香港": "HKG · Hong Kong", "TYO · 東京": "TYO · Tokyo", "告訴我們您的需求，工程團隊會盡快回覆。": "Tell us what you need and our engineering team will get back to you soon.", "NAME · 姓名": "NAME", "EMAIL · 電子郵件": "EMAIL", "MESSAGE · 訊息": "MESSAGE", "發送訊息 →": "Send message →", "© 2026 Mootech Pte. Ltd. · 版權所有": "© 2026 Mootech Pte. Ltd. · All rights reserved", "關於": "About", "聯絡": "Contact", "在 MOOTECH，我們優先考慮安全和威脅評估，並致力於維護強大的威脅情報庫，這有助於我們主動應對潛在的安全問題。我們秉持前瞻性的 IT 解決方案理念，憑藉精湛的技術實力和對卓越的不懈追求，為全球客戶提供穩定且可擴展的創新解決方案。": "At MOOTECH, security and threat assessment come first. We maintain a robust threat intelligence database that lets us address potential security issues early. With a forward-looking approach to IT, strong engineering and a constant pursuit of excellence, we deliver stable, scalable and innovative solutions worldwide.", "從實施核心解決方案到部署加值功能，我們採取靈活、反應迅速的方式，為全球用戶提供穩定且創新的解決方案。我們的服務同時涵蓋免費威脅情報庫，讓更多企業能及早掌握風險。": "From implementing core solutions to deploying value-added features, we work in a flexible, responsive way. Our services also include a free threat intelligence database, so more businesses can see risks early.", "接觸全球受眾，提升品牌曝光度與互動率。可自訂的平台讓您打造專屬直播內容，虛擬活動、產品發表會或任何形式的直播都能輕鬆進行。": "Reach a global audience and lift brand exposure and engagement. Our customisable platform handles virtual events, product launches and any other kind of broadcast.", "高度靈活且強大的網路連接能力，並提供專業的諮詢與支援，以保護您的業務。": "Flexible, powerful network connectivity, backed by expert consulting and support to protect your business.", "依您的需求設計架構，協助選擇符合業務需求與預算的最佳化網路解決方案。": "We design the architecture around your needs and help you choose the optimal network for your business and budget.", "將市場上多個 IT 系統、硬體與軟體連接成一個協調一致、操作流暢的整體。": "We connect multiple IT systems, hardware and software into one coordinated, smooth-running whole.", "以 IP 位址為基礎的威脅情報資料庫，針對各類威脅與惡意行為提供解決方案，確保您的網路與系統安全。": "An IP-based threat intelligence database that counters threats and malicious activity to keep your networks and systems secure.", "© 2026 版權所有": "© 2026 All rights reserved", "網際網路接取、IPLC 國際專線與 CDN 服務；使用低延遲線路及中國、東南亞區域優化線路，為您傳輸應用與內容。": "Internet access, IPLC international private lines and CDN, using low-latency routes and optimised routes for China and Southeast Asia to carry your applications and content.", "協助取得您的網路使用狀態、負荷量、限制和安全性漏洞，從配置、架構設計、流量監控到漏洞測試，發掘更多優化的可能性。": "We map your network usage, load, limits and security gaps, from configuration and architecture design to traffic monitoring and vulnerability testing, to uncover more ways to optimise.", "從諮詢、部署與資料遷移到建置後支援，整合雲端與機房環境，並由專業技術人員到場代客操作與排查。": "From consulting, deployment and data migration to post-launch support, we join cloud and data-center environments and send trained engineers on site for remote hands and troubleshooting.", "DDoS 防護示意圖": "DDoS protection", "MOOTECH 成立於 2016 年，據點位於新加坡與台灣，提供直播串流、網路連線、DDoS 防護、網路架構優化與系統整合服務，為企業打造低延遲、不中斷的網路。": "Founded in 2016 with offices in Singapore and Taiwan, MOOTECH provides live streaming, connectivity, DDoS protection, network optimisation and system integration, building low-latency, always-on networks for businesses.", "我們提供低延遲線路與中國、東南亞區域優化線路，並與 HKIX、MYIX、SGIX、Equinix JPIX 對等互聯；搭配 L3 至 L7 的 DDoS 緩解機制，讓企業的關鍵服務穩定、安全地運作。": "We offer low-latency routes and optimised routes for China and Southeast Asia, peer with HKIX, MYIX, SGIX and Equinix JPIX, and add L3–L7 DDoS mitigation so critical business services run stable and secure.", "從需求諮詢、架構設計、部署導入到建置後支援，我們採取靈活、反應迅速的方式，並可由專業技術人員到場代客操作。": "From consultation and design to deployment and post-launch support, we work in a flexible, responsive way, and our trained engineers can operate equipment on site for you.", "直播串流、國際專線、CDN 與 L3–L7 DDoS 防護。MOOTECH 讓企業的關鍵服務保持低延遲、不中斷且安全。": "Live streaming, international private lines, CDN and L3–L7 DDoS protection. MOOTECH keeps critical business services low-latency, always on and secure.", "解決方案：直播串流、網路連線、DDoS 防護、架構優化、系統整合": "Solutions: live streaming, connectivity, DDoS protection, optimisation and integration", "L3 網路層至 L7 應用層的 DDoS 緩解機制，在攻擊抵達之前就攔截。": "DDoS mitigation from the L3 network layer to the L7 application layer stops attacks before they arrive.", "IPLC 專線兼具高可用性與低延遲，直播服務具備不間斷的容錯機制。": "IPLC lines combine high availability with low latency, and live streams have uninterrupted failover.", "與 HKIX、MYIX、SGIX、Equinix JPIX 對等互聯，並提供中國與東南亞區域優化線路。": "Peering with HKIX, MYIX, SGIX and Equinix JPIX, plus optimised routes for China and Southeast Asia.", "4 IX 對等互聯": "4 IX peering", "L3–L7 DDoS 防護": "L3–L7 DDoS protection", "HKIX 香港、MYIX 吉隆坡、SGIX 新加坡、Equinix JPIX 東京": "HKIX Hong Kong, MYIX Kuala Lumpur, SGIX Singapore, Equinix JPIX Tokyo", "IX 對等互聯": "IX peering", "HKIX 香港": "HKIX Hong Kong", "MYIX 吉隆坡": "MYIX Kuala Lumpur", "SGIX 新加坡": "SGIX Singapore", "Equinix JPIX 東京": "Equinix JPIX Tokyo", "HKIX · 香港": "HKIX · Hong Kong", "MYIX · 吉隆坡": "MYIX · Kuala Lumpur", "SGIX · 新加坡": "SGIX · Singapore", "JPIX · 東京": "JPIX · Tokyo", "服務細項與線路類型": "Service details and line types", "IP Transit、IPLC 與 Security 防護可以依需求組合；下方列出每項服務的完整內容。": "Combine IP Transit, IPLC and Security as you need. Every service is listed in full below.", "電信營運商": "Carriers", "雲端與資安": "Cloud and security", "網路設備": "Network equipment", "中華電信": "Chunghwa Telecom", "電訊盈科 PCCW": "PCCW", "合作夥伴": "Partners", "與亞太主要電信營運商、雲端與資安平台及網路設備品牌合作，為您提供穩定的線路與完整的服務。": "We work with leading Asia-Pacific carriers, cloud and security platforms and network equipment brands to deliver stable connectivity and complete services.", "涵蓋全球、支援 IPv4 與 IPv6，與中國頂尖電信供應商合作，並提供中國與東南亞區域專有的優化線路。": "Global coverage with IPv4 and IPv6, partnerships with leading Chinese carriers and dedicated optimised routes for China and Southeast Asia.", "IP Transit 全球線路": "IP Transit", "把流量送往全球各地。": "Carries your traffic to the world.", "TRANSIT · 線路": "TRANSIT", "往下捲動，看流量如何一層一層通過 MOOTECH 的網路：從接取、全球線路、國際專線到維運，最後送達全球觀眾。": "Scroll to follow traffic through the MOOTECH network layer by layer: access, global transit, private lines and operations, then out to a global audience.", "從接取、專線到加速，一次到位。": "Access, private lines and acceleration in one place.", "IP Transit 涵蓋全球、支援 IPv4 與 IPv6，與中國頂尖電信供應商合作；IPLC 國際點對點專線兼具高可用性與低延遲，並與 HKIX、MYIX、SGIX、Equinix JPIX 對等互聯。": "IP Transit with global coverage, IPv4 and IPv6 and leading Chinese carriers; IPLC point-to-point private lines with high availability, low latency and peering at HKIX, MYIX, SGIX and Equinix JPIX.", "網際網路接取與 CDN 服務：使用低延遲線路及中國、東南亞區域優化線路傳輸您的應用與內容，並提升網站效能、降低頻寬成本。": "Internet access and CDN: low-latency routes and optimised routes for China and Southeast Asia carry your applications and content, while speeding up websites and cutting bandwidth costs.", "國際線路": "International Lines", "國際線路示意圖": "International lines", "MOOTECH 於 2012 年在新加坡成立總部，2016 年設立台灣分公司，專注為企業打造低延遲、高可用的網路傳輸環境。我們的服務涵蓋企業級連線、國際專線、高併發直播串流，以及量身規劃的網路架構優化與系統整合。": "Headquartered in Singapore since 2012 with a branch office established in Taiwan in 2016, MOOTECH specializes in building low-latency, high-availability network transmission environments for enterprises. Our services encompass enterprise connectivity, international private leased circuits (IPLC), high-concurrency live streaming, as well as tailored network architecture optimization and system integration.", "我們建置亞洲區域優化線路，並在香港（HKIX）、馬來西亞（MYIX）、新加坡（SGIX）與日本（JPIX）等核心網路交換中心直接對等互聯（Peering）。流量不必繞經多層轉接，路由更短、延遲更低，讓您的關鍵業務隨時保持安全、流暢與穩定。": "We operate regionally optimized routes across Asia and maintain direct peering at major internet exchange points, including Hong Kong (HKIX), Malaysia (MYIX), Singapore (SGIX), and Japan (JPIX). By eliminating unnecessary multi-hop transit, we deliver shorter routing paths and lower latency—ensuring your mission-critical operations remain secure, seamless, and reliable at all times.", "面對快速變動的市場，IT 不只是後勤支援，更是企業領先的關鍵。我們以全局視角為您打造完整的科技基礎建設，協助企業預見趨勢、超前部署，在數位轉型浪潮中始終快人一步。": "In a rapidly evolving market, IT is more than support—it’s your competitive edge. With a holistic view of your technology ecosystem, we build complete, future-ready IT foundations that keep your business one move ahead of change.", "從網路接取、IPLC 國際專線到直播串流，MOOTECH 為企業打造低延遲、不中斷的網路。": "From internet access and IPLC private lines to live streaming, MOOTECH builds low-latency, always-on networks for businesses.", "解決方案：直播串流、網路連線、國際線路、架構優化、系統整合": "Solutions: live streaming, connectivity, international lines, optimisation and integration", "IP Transit 涵蓋全球、支援 IPv4 與 IPv6，並與中國頂尖電信供應商合作。": "IP Transit with global coverage, IPv4 and IPv6 support and leading Chinese carrier partners.", "全球線路": "Global transit", "中國與東南亞優化線路": "Optimised routes for China and SE Asia", "流量監控": "Traffic monitoring", "亞太互連示意圖 · 動畫示意，非即時數據": "Asia-Pacific interconnect map · Illustrative animation, not live data", "亞太互連示意圖：新加坡、台灣、香港、東京節點，與泰國、越南、馬來西亞、斯里蘭卡、印度、印尼、韓國、菲律賓之間的連線動畫": "Asia-Pacific interconnect map: animated links between the Singapore, Taiwan, Hong Kong and Tokyo nodes and visitors from Thailand, Vietnam, Malaysia, Sri Lanka, India, Indonesia, South Korea and the Philippines", "MOOTECH 節點": "MOOTECH nodes", "主要訪客市場（示意）": "Main visitor markets (illustrative)", "正常流量": "Normal traffic", "被攔截的可疑流量": "Blocked suspicious traffic", "泰國": "Thailand", "越南": "Vietnam", "馬來西亞": "Malaysia", "斯里蘭卡": "Sri Lanka", "印度": "India", "印尼": "Indonesia", "韓國": "South Korea", "菲律賓": "Philippines", "首屏輪播": "Hero carousel", "我們正在尋找熱愛網路與直播技術的夥伴，在新加坡與台灣一起打造低延遲、不中斷的網路。": "We are looking for people who love networks and live-streaming technology to build low-latency, always-on networks with us in Singapore and Taiwan.", "加入我們（應徵）": "Join us (job application)", "投遞履歷": "Apply now", "了解我們的工作": "See what we do", "切換首屏": "Switch slide", "← 左右滑動查看 5 項服務 →": "← Swipe to see all 5 services →", "公司名稱（選填）": "Company name (optional)", "聯絡人": "Contact person", "聯絡電話（選填）": "Phone (optional)", "簡單描述需求（選填）": "Briefly describe your needs (optional)", "送出需求": "Send request", "查看詳情": "View details", "收合詳情": "Hide details", "軟體開發": "Software Development", "需求規劃・介面設計・功能開發": "Planning · UI design · Development", "需求規劃": "Requirements planning", "介面設計": "Interface design", "功能開發": "Development", "整理使用情境與功能需求，作為後續規劃方向。": "Outline user scenarios and requirements for future planning.", "規劃操作流程與畫面示意。": "Explore user flows and interface concepts.", "依需求範圍安排開發與測試。": "Plan development and testing around the agreed scope.", "先看服務大綱，點選「查看詳情」展開完整內容。": "Browse the overview, then select View details to expand the full content.", "全球覆蓋・IPv4 / IPv6・區域優化": "Global coverage · IPv4 / IPv6 · Optimised routes", "點對點專線・低延遲・對等互聯": "Private lines · Low latency · Peering", "安全防護・可靠服務・彈性擴充": "Protection · Reliability · Scalability", "即時串流・低延遲・備援容錯": "Real-time streaming · Low latency · Failover", "網路接取・國際專線・CDN 加速": "Internet access · Private lines · CDN", "架構設計・流量監控・品質優化": "Architecture · Monitoring · Optimisation", "部署遷移・雲端整合・維運支援": "Migration · Cloud integration · Support", "六大解決方案": "Six core solutions", "直播串流、網路連線、國際線路、架構優化、系統整合、軟體開發": "Live streaming, connectivity, international lines, optimisation, integration and software development", "軟體開發示意圖": "Software development illustration", "完整服務內容與線路規格。": "Full service details and connectivity specifications.", "團隊生活照片輪播": "Team life photo carousel", "上一個主題": "Previous topic", "下一個主題": "Next topic", "暫停輪播": "Pause slideshow", "明亮開放的辦公空間、綠色座椅與植栽": "A bright, open office with green chairs and plants", "團隊一起聚餐分享美食": "The team sharing a meal", "團隊共同討論網路架構與分享知識": "The team sharing knowledge around a network architecture diagram", "顯示第1個主題": "Show topic 1", "顯示第2個主題": "Show topic 2", "顯示第3個主題": "Show topic 3", "招募職缺": "Career opportunities", "6 大解決方案": "6 core solutions"};
  var lang = "zh", done = [];
  /* 頁面標題：英文頁載入時已是英文，反查字典取回中文標題 */
  var zhTitle = document.title;
  Object.keys(EN).forEach(function (k) { if (EN[k] === zhTitle) zhTitle = k; });
  function setLang(l) {
    if (l === lang) return;
    if (l === "en") {
      document.querySelectorAll(".v [data-en]").forEach(function (el) { el._zh = el.innerHTML; el.innerHTML = el.getAttribute("data-en"); done.push([el, "html"]); });
      document.querySelectorAll(".v").forEach(function (root) {
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
        while ((n = w.nextNode())) {
          var k = n.nodeValue.trim();
          if (k && EN[k]) { done.push([n, "text", n.nodeValue]); n.nodeValue = n.nodeValue.replace(k, EN[k]); }
        }
        root.querySelectorAll("[alt],[aria-label]").forEach(function (el) {
          ["alt", "aria-label"].forEach(function (a) { var v = el.getAttribute(a); if (v && EN[v]) { done.push([el, a, v]); el.setAttribute(a, EN[v]); } });
        });
      });
    } else {
      for (var i = done.length - 1; i >= 0; i--) {
        var r = done[i];
        if (r[1] === "html") r[0].innerHTML = r[0]._zh; else if (r[1] === "text") r[0].nodeValue = r[2]; else r[0].setAttribute(r[1], r[2]);
      }
      done = [];
    }
    lang = l;
    running.forEach(function (cv) { if (!cv._draw) return; if (cv._vis) cv._draw(performance.now(), 0); else cv._needDraw = true; });
    document.documentElement.lang = l === "en" ? "en" : "zh-Hant";
    if (window.mootechTurnstileRelang) window.mootechTurnstileRelang();
    document.title = l === "en" ? (EN[zhTitle] || zhTitle) : zhTitle;
    document.querySelectorAll("[data-query] .note").forEach(function (n) { n.textContent = l === "en" ? "demo data · not live traffic" : "示範資料 · 非實際流量"; });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) { b.textContent = l === "en" ? "中文" : "EN"; b.setAttribute("aria-label", l === "en" ? "中文 切換為中文" : "EN 切換為英文"); });
  }
  /* 中英切換不換頁：就地替換文字，網址與捲動位置不變；記住手動選擇，之後載入優先使用 */
  document.querySelectorAll("[data-lang-toggle]").forEach(function (b) { b.addEventListener("click", function () {
    setLang(lang === "en" ? "zh" : "en");
    try { localStorage.setItem("mootech-lang", lang); } catch (e) {}
  }); });
  if (window.MOOTECH_LANG === "en") setLang("en");
  /* 依訪客所在地切換語系（台灣中文，其餘英文），之後仍可用按鈕手動切換 */
  if (window.MOOTECH_GEO) window.MOOTECH_GEO.then(function (l) { setLang(l); document.documentElement.classList.remove("lang-pending"); });
})();

/* 客服依版型換色，僅 E 使用既有北極熊角色：選擇題式對話，分求職者／需求方／其他三條路線，2～3 輪問答後
   整理成已填好內容的郵件（網站沒有後端，使用訪客自己的郵件程式寄出）。 */
(function () {
  /* 英文頁位於 en/，由頁面設定 MOOTECH_ROOT 指回本資料夾 */
  var ASSET_ROOT = window.MOOTECH_ROOT || "";
  var root = document.getElementById("mt-chat"); if (!root) return;
  /* 收件信箱：HR_EMAIL 請改成公司正式的人資信箱 */
  var SALES_EMAIL = "contact@mootech.asia", HR_EMAIL = "contact@mootech.asia";
  var $ = function (id) { return document.getElementById(id); };
  var call = $("mtc-call"), fab = $("mtc-fab"), log = $("mtc-log");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function en() { return document.documentElement.lang === "en"; }
  function L(zh, enS) { return en() ? enS : zh; }
  var T = {
    name: ["MOOTECH 客服", "MOOTECH Support"], role: ["MOOTECH 線上客服", "MOOTECH Assistant"],
    calling: ["接線中…", "Connecting…"], live: ["通話中", "Live"],
    accept: ["開啟 MOOTECH 客服對話", "Open MOOTECH support"], min: ["縮小", "Minimise"], reopen: ["開啟線上客服", "Open chat"],
    end: ["結束通話", "End call"], mic: ["按下說話，用語音選擇", "Tap to answer by voice"], hide: ["縮小視窗", "Minimise"],
    note: ["點選選項回覆 · 約 1 分鐘完成", "Tap an option · takes about a minute"], restart: ["重新開始", "Start over"],
    listening: ["聆聽中…", "Listening…"],
    noMic: ["您的瀏覽器不支援語音輸入，請直接點選選項", "Voice input isn’t supported in this browser. Just tap an option"],
    denied: ["沒有取得麥克風權限，請直接點選選項。", "Microphone access was blocked. Just tap an option."],
    noMatch: ["我沒聽清楚，請直接點選上面的選項", "I didn’t catch that. Please tap one of the options"]
  };
  function isBear() { return document.body.dataset.v === "e"; }
  function t(k) { if (k === "name" && isBear()) return en() ? "MOO Assistant" : "MOO 助手"; return T[k][en() ? 1 : 0]; }
  function sticker(name) {
    if (!isBear()) return;
    var sources = { wave: ASSET_ROOT + "assets/images/mootech_website_IMG012_chat_sticker-wave.webp", heart: ASSET_ROOT + "assets/images/mootech_website_IMG010_chat_sticker-heart.webp" };
    var image = new Image(); image.className = "mtc-sticker"; image.src = sources[name]; image.alt = ""; image.width = 132; image.decoding = "async"; image.onload = scroll; log.appendChild(image);
  }
  function syncMascot() {
    root.querySelectorAll('[data-mascot-src]').forEach(function (box) {
      if (!isBear()) { box.replaceChildren(); return; }
      if (box.firstChild) return;
      var image = new Image(); image.src = box.dataset.mascotSrc; image.alt = ""; image.decoding = "async"; box.appendChild(image);
    });
    if (!isBear()) log.querySelectorAll('.mtc-sticker').forEach(function (image) { image.remove(); });
    else if (started && !log.querySelector('.mtc-sticker')) sticker('wave');
    renderStatic();
  }

  /* ---------- 對話流程 ---------- */
  var state = {}, busy = false, voiceReply = false, curOpts = [];
  function scroll() { log.scrollTop = log.scrollHeight; }
  function bubble(cls, text) { var d = document.createElement("div"); d.className = "mtc-msg " + cls; d.textContent = text; log.appendChild(d); scroll(); return d; }
  function say(text, next) {
    busy = true;
    var typing = document.createElement("div"); typing.className = "mtc-msg bot mtc-typing"; typing.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(typing); scroll();
    setTimeout(function () { typing.remove(); bubble("bot", text); speak(text); busy = false; if (next) next(); }, reduce ? 120 : 550 + Math.min(text.length * 6, 500));
  }
  /* 顯示選項；點選後收起選項並把選擇顯示成使用者訊息 */
  function ask(opts) {
    var box = document.createElement("div"); box.className = "mtc-opts"; curOpts = [];
    opts.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "mtc-opt"; b.textContent = o.label;
      b.addEventListener("click", function () { pick(box, o); });
      box.appendChild(b); curOpts.push({ box: box, o: o });
    });
    log.appendChild(box); scroll();
  }
  function pick(box, o) { if (busy || box.classList.contains("done")) return; box.classList.add("done"); curOpts = []; bubble("me", o.label.replace(/^\S+\s/, "")); o.go(); }

  function start() {
    log.innerHTML = ""; state = {}; sticker("wave"); say(L("您好，歡迎聯絡 MOOTECH！ 請問今天想做什麼呢？", "Welcome to MOOTECH! What brings you here today?"), function () {
      ask([
        { label: L("🙋 我想應徵工作", "🙋 I'd like to apply for a job"), k: /應徵|工作|求職|職缺|履歷|apply|job|career|hiring/i, go: job1 },
        { label: L("🏢 我有網路／直播服務需求", "🏢 I need network or streaming services"), k: /需求|服務|網路|直播|報價|專線|service|network|stream|quote|business/i, go: biz1 },
        { label: L("💬 其他問題", "💬 Something else"), k: /其他|別的|問題|other|else|question/i, go: other1 }
      ]);
    });
  }
  /* 求職者：職位 → 地點 → 簡單資料 → 寄履歷到 HR */
  function job1() {
    say(L("太好了！我們正在找熱愛網路與直播技術的夥伴。你想應徵哪個方向？", "Great! We're looking for people who love networks and live-streaming tech. Which role interests you?"), function () {
      ask([
        { label: L("🌐 網路工程師", "🌐 Network engineer"), k: /網路|network/i, go: function () { state.role = L("網路工程師", "Network engineer"); job2(); } },
        { label: L("📡 直播技術工程師", "📡 Live-streaming engineer"), k: /直播|串流|stream|live/i, go: function () { state.role = L("直播技術工程師", "Live-streaming engineer"); job2(); } },
        { label: L("🧩 系統整合工程師", "🧩 Systems integration engineer"), k: /系統|整合|system|integration/i, go: function () { state.role = L("系統整合工程師", "Systems integration engineer"); job2(); } },
        { label: L("✨ 其他職位", "✨ Another role"), k: /其他|別的|other/i, go: function () { state.role = L("其他職位", "Other role"); job2(); } }
      ]);
    });
  }
  function job2() {
    say(L("希望的工作地點是？", "Where would you like to work?"), function () {
      ask([
        { label: L("🇸🇬 新加坡", "🇸🇬 Singapore"), k: /新加坡|singapore/i, go: function () { state.loc = L("新加坡", "Singapore"); job3(); } },
        { label: L("🇹🇼 台北", "🇹🇼 Taipei"), k: /台北|台灣|臺北|taipei|taiwan/i, go: function () { state.loc = L("台北", "Taipei"); job3(); } },
        { label: L("🌏 都可以", "🌏 Either is fine"), k: /都可以|都行|皆可|either|both|any/i, go: function () { state.loc = L("新加坡或台北皆可", "Singapore or Taipei"); job3(); } }
      ]);
    });
  }
  function job3() {
    say(L("最後留下簡單的資料，我幫你整理成應徵信，再請你把履歷寄給我們的人資團隊 📄", "Last step: leave a few details and I'll draft your application email, then send your CV to our HR team 📄"), function () {
      contactForm(function (v) {
        var subj = L("【應徵】", "[Application] ") + state.role + " - " + v.name + " - " + state.loc;
        var body = [L("您好，我想應徵 MOOTECH 的職缺：", "Hello, I'd like to apply to MOOTECH:"), "",
          L("應徵職位：", "Role: ") + state.role, L("希望地點：", "Location: ") + state.loc].concat(contactLines(v), ["",
          L("履歷已附在這封信中，謝謝！", "My CV is attached. Thank you!")]).join("\n");
        say(L("謝謝你，" + v.name + "！🙌 請按下方按鈕開啟郵件，內容我已幫你填好，記得附上履歷（PDF）再寄到人資信箱 " + HR_EMAIL + "。", "Thanks, " + v.name + "! 🙌 Tap below to open the email I've drafted, attach your CV (PDF) and send it to our HR inbox at " + HR_EMAIL + "."), function () {
          links([{ hot: 1, label: L("📧 開啟郵件並附上履歷", "📧 Open email and attach CV"), href: mail(HR_EMAIL, subj, body) }, { label: L("複製人資信箱", "Copy HR email"), copy: HR_EMAIL }]);
        });
      });
    });
  }
  /* 需求方：服務 → 地區 → 聯絡資料 → 寄需求信／填網站表單 */
  var SVC = [
    { zh: "軟體開發", en: "Software development", need: "軟體開發", ic: "💻", k: /軟體|開發|software|develop|application/i, dzh: "從需求規劃、介面設計到功能開發與測試，依您的使用情境打造合適的軟體。", den: "From requirements planning and interface design to development and testing, we build software around how you work." },
    { zh: "直播串流", en: "Live streaming", need: "直播串流", ic: "📡", k: /直播|串流|live|stream/i, dzh: "即時、低延遲的直播傳輸，搭配備援線路與容錯機制，活動、發表會、賽事都不中斷。", den: "Real-time, low-latency streaming with backup routes and failover, so events and matches never drop." },
    { zh: "網路連線（IP Transit・IPLC・CDN）", en: "Connectivity (IP Transit, IPLC, CDN)", need: "IPLC 國際專線", ic: "🌐", k: /連線|網路|transit|iplc|cdn|專線|頻寬|connect/i, dzh: "全球 IP Transit、總部與分行之間的 IPLC 國際專線，以及加速網站的 CDN；並提供中國與東南亞優化線路。", den: "Global IP Transit, IPLC private lines between HQ and branches, and CDN acceleration, with optimised China and SE Asia routes." },
    { zh: "網路架構優化", en: "Network optimisation", need: "網路架構優化", ic: "🛠", k: /優化|架構|監控|optimi|architecture|monitor/i, dzh: "先了解您的使用狀態與瓶頸，再提供配置調整、架構設計、流量監控與漏洞測試。", den: "We map your usage and bottlenecks, then tune configuration, design architecture, monitor traffic and test for weak spots." },
    { zh: "系統整合・代客操作", en: "System integration & remote hands", need: "系統整合 / 代客操作", ic: "🧩", k: /系統|整合|代客|機房|雲端|integration|remote|data/i, dzh: "從諮詢、部署遷移到建置後支援，整合雲端與機房，也有技術人員到場安裝與排查。", den: "From consulting and migration to post-launch support, joining cloud and data centres, with on-site engineers when needed." },
    { zh: "還不確定，想先諮詢", en: "Not sure yet, I'd like advice", need: "其他", ic: "🤔", k: /不確定|諮詢|不知道|not sure|advice|unsure/i, dzh: "沒問題！告訴我們您的情況，我們會幫您找出最適合的組合。", den: "No problem. Tell us about your situation and we'll suggest the right mix." }
  ];
  function biz1() {
    say(L("了解！您想了解哪一類服務呢？", "Got it! Which kind of service are you interested in?"), function () {
      ask(SVC.map(function (x) { return { label: x.ic + " " + (en() ? x.en : x.zh), k: x.k, go: function () { state.svc = x; say(en() ? x.den : x.dzh, biz2); } }; }));
    });
  }
  function biz2() {
    say(L("需求大概在哪個地區？", "Where is the requirement?"), function () {
      var R = [[L("台灣", "Taiwan"), /台灣|台北|taiwan|taipei/i], [L("新加坡・東南亞", "Singapore & SE Asia"), /新加坡|東南亞|singapore|asia|sea/i], [L("中國", "China"), /中國|大陸|china/i], [L("跨國多地", "Multiple countries"), /跨國|多地|全球|multi|global|countries/i]];
      ask(R.map(function (r) { return { label: "📍 " + r[0], k: r[1], go: function () { state.region = r[0]; biz3(); } }; }));
    });
  }
  function biz3() {
    say(L("請留下聯絡方式，我們的業務會盡快與您聯繫 🤝", "Leave your contact details and our team will get back to you shortly 🤝"), function () {
      contactForm(function (v) {
        var svc = en() ? state.svc.en : state.svc.zh;
        var subj = L("【服務諮詢】", "[Enquiry] ") + svc + " - " + (v.company || v.name);
        var body = [L("您好，我想了解 MOOTECH 的服務：", "Hello, I'd like to know more about MOOTECH's services:"), "",
          L("服務類型：", "Service: ") + svc, L("地區：", "Region: ") + state.region].concat(contactLines(v)).join("\n");
        say(L("收到，" + v.name + "！我已把您的需求整理好，按下方按鈕寄出，業務會盡快回覆您。", "Thanks, " + v.name + "! I've summarised your request. Send it below and our team will reply soon."), function () {
          links([{ hot: 1, label: L("📧 寄出需求信", "📧 Send request email"), href: mail(SALES_EMAIL, subj, body) }, { label: L("改填網站聯絡表單", "Use the contact form"), fill: { company: v.company, name: v.name, email: v.email, phone: v.phone, msg: L("服務類型：", "Service: ") + svc + "\n" + L("地區：", "Region: ") + state.region + "\n" + (v.message || "") } }]);
        });
      });
    });
  }
  /* 其他：公司介紹／據點／合作夥伴／留言，之後可轉到另外兩條路線 */
  function other1() {
    say(L("沒問題，想了解什麼呢？", "Sure, what would you like to know?"), function () {
      ask([
        { label: L("🏛 公司介紹", "🏛 About MOOTECH"), k: /公司|介紹|關於|about|company/i, go: function () { say(L("MOOTECH 成立於 2016 年，專注網路連線、IPLC 國際專線、CDN 與直播串流，為企業打造低延遲、不中斷的網路。", "Founded in 2016, MOOTECH specialises in connectivity, IPLC private lines, CDN and live streaming, building low-latency, always-on networks for businesses."), other2); } },
        { label: L("📍 據點與聯絡方式", "📍 Locations & contact"), k: /據點|地址|聯絡|在哪|location|contact|where/i, go: function () { say(L("我們的據點在新加坡與台灣，並與 HKIX、MYIX、SGIX、JPIX 對等互聯。業務信箱：" + SALES_EMAIL, "We're in Singapore and Taiwan, peering at HKIX, MYIX, SGIX and JPIX. Email: " + SALES_EMAIL), other2); } },
        { label: L("🤝 合作夥伴", "🤝 Partners"), k: /合作|夥伴|partner/i, go: function () { say(L("我們與中華電信、PCCW、Telstra、AWS、Cloudflare、Cisco、Juniper 等夥伴合作。", "We work with partners including Chunghwa Telecom, PCCW, Telstra, AWS, Cloudflare, Cisco and Juniper."), other2); } },
        { label: L("✉️ 我想留言", "✉️ Leave a message"), k: /留言|訊息|message/i, go: otherMsg }
      ]);
    });
  }
  function other2() {
    say(L("還有什麼我可以幫忙的嗎？", "Anything else I can help with?"), function () {
      ask([
        { label: L("🙋 我也想應徵工作", "🙋 I'd like to apply for a job"), k: /應徵|工作|job|apply/i, go: job1 },
        { label: L("🏢 我有服務需求", "🏢 I need a service"), k: /需求|服務|service/i, go: biz1 },
        { label: L("✉️ 留言給我們", "✉️ Leave a message"), k: /留言|message/i, go: otherMsg },
        { label: L("👍 沒有了，謝謝", "👍 That's all, thanks"), k: /沒有|謝謝|不用|no|thanks|that's all/i, go: function () { say(L("不客氣！有需要隨時再找我", "You're welcome! Call me anytime"), function () { }); } }
      ]);
    });
  }
  function otherMsg() {
    say(L("請留下您的聯絡方式與想說的話：", "Leave your details and message:"), function () {
      contactForm(function (v) {
        var body = contactLines(v).join("\n");
        say(L("謝謝您的留言！按下方按鈕寄出，我們會盡快回覆。", "Thanks! Send it below and we'll reply soon."), function () {
          links([{ hot: 1, label: L("📧 寄出留言", "📧 Send message"), href: mail(SALES_EMAIL, L("【網站留言】", "[Website message] ") + v.name, body) }]);
        });
      });
    });
  }

  /* The active public contact form is the single source for field labels, order and requirements. */
  function contactForm(done) {
    var source = document.querySelector('.v:not([hidden]) form[data-form]');
    if (!source) return;
    var fields = Array.prototype.map.call(source.querySelectorAll('input:not([type="hidden"]),textarea'), function (el) {
      return { n: el.name, l: el.labels[0].textContent.trim(), req: el.required, ac: el.autocomplete,
        type: el.type, area: el.tagName === 'TEXTAREA', maxLength: el.maxLength };
    });
    form(fields, source.querySelector('[type="submit"]').textContent.trim(), done);
  }
  function contactLines(v) {
    return [L("公司名稱：", "Company: ") + (v.company || "-"), L("聯絡人：", "Contact person: ") + v.name,
      L("電子郵件：", "Email: ") + v.email, L("聯絡電話：", "Phone: ") + (v.phone || "-"), "",
      L("需求說明：", "Details: ") + (v.message || "-")];
  }

  /* ---------- 迷你表單、郵件連結 ---------- */
  function mail(to, subj, body) { return "mailto:" + to + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body); }
  function form(fields, submitLabel, done) {
    var f = document.createElement("form"); f.className = "mtc-mini"; f.noValidate = true;
    fields.forEach(function (x) {
      var lab = document.createElement("label"); lab.textContent = x.l;
      var el;
      if (x.sel) { el = document.createElement("select"); x.sel.forEach(function (o) { var op = document.createElement("option"); op.textContent = o; el.appendChild(op); }); }
      else if (x.area) el = document.createElement("textarea");
      else { el = document.createElement("input"); el.type = x.type || "text"; }
      el.name = x.n; if (x.ac) el.autocomplete = x.ac; if (x.req) el.required = true; if (x.maxLength >= 0) el.maxLength = x.maxLength;
      lab.appendChild(el); f.appendChild(lab);
    });
    var err = document.createElement("div"); err.className = "mtc-err"; err.setAttribute("role", "alert"); f.appendChild(err);
    var btn = document.createElement("button"); btn.type = "submit"; btn.textContent = submitLabel; f.appendChild(btn);
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var v = {}, bad = "";
      fields.forEach(function (x) { var el = f.elements[x.n]; v[x.n] = el.value.trim(); if (!bad && x.req && !v[x.n]) bad = L("請填寫「" + x.l + "」", "Please fill in " + x.l); });
      if (!bad && f.elements.email && !f.elements.email.checkValidity()) bad = L("電子郵件格式不正確", "That email doesn't look right");
      if (bad) { err.textContent = bad; return; }
      err.textContent = ""; f.classList.add("sent"); done(v);
    });
    log.appendChild(f); scroll();
    var first = f.querySelector("input,select,textarea"); if (first && matchMedia("(min-width: 721px)").matches) first.focus({ preventScroll: true });
  }
  function links(items) {
    sticker("heart");
    var box = document.createElement("div"); box.className = "mtc-links";
    items.forEach(function (x) {
      var el;
      if (x.href) { el = document.createElement("a"); el.href = x.href; }
      else { el = document.createElement("button"); el.type = "button"; }
      el.textContent = x.label; if (x.hot) el.className = "hot";
      if (x.copy) el.addEventListener("click", function () { var done = function () { el.textContent = L("已複製 ✓", "Copied ✓"); }; if (navigator.clipboard) navigator.clipboard.writeText(x.copy).then(done, done); else done(); });
      if (x.fill) el.addEventListener("click", function () { fillSiteForm(x.fill); });
      box.appendChild(el);
    });
    log.appendChild(box); scroll();
  }
  /* 把資料帶入目前版型的聯絡表單並捲過去 */
  function fillSiteForm(d) {
    var v = document.querySelector(".v:not([hidden])"); if (!v) return;
    var id = v.id + "-contact", sec = document.getElementById(id); if (!sec) return;
    var f = sec.querySelector("form");
    if (f) {
      var set = function (sel, val) { var el = f.querySelector(sel); if (el && val) el.value = val; };
      set('[name="company"]', d.company); set('[name="name"]', d.name); set('[name="email"]', d.email); set('[name="phone"]', d.phone); set('[name="message"]', d.msg);
    }
    hide();
    var a = document.createElement("a"); a.href = "#" + id; a.setAttribute("data-scroll", ""); a.style.display = "none"; v.appendChild(a); a.click(); a.remove();
  }

  /* ---------- 語音：用說的選擇選項；用語音互動時，小熊也用語音回覆 ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, listening = false, mic = $("mtc-mic");
  function speak(text) {
    if (!voiceReply || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, " "));
      u.lang = en() ? "en-US" : "zh-TW"; u.rate = en() ? 1 : 1.05; u.pitch = .9;
      var vs = speechSynthesis.getVoices().filter(function (x) { return x.lang.replace("_", "-").indexOf(u.lang) === 0; }); if (vs.length) u.voice = vs[0];
      u.onstart = function () { root.classList.add("speaking"); }; u.onend = u.onerror = function () { root.classList.remove("speaking"); };
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function stopListen() { listening = false; mic.classList.remove("listening"); mic.setAttribute("aria-pressed", "false"); $("mtc-note").textContent = t("note"); }
  function shutUp() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} root.classList.remove("speaking"); if (rec && listening) { try { rec.abort(); } catch (e) {} stopListen(); } }
  mic.addEventListener("click", function () {
    if (!SR) { bubble("bot", t("noMic")); return; }
    if (listening) { try { rec.stop(); } catch (e) {} return; }
    if (busy) return;
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    rec = new SR(); rec.lang = en() ? "en-US" : "zh-TW"; rec.interimResults = true; rec.continuous = false;
    var said = "";
    rec.onstart = function () { listening = true; mic.classList.add("listening"); mic.setAttribute("aria-pressed", "true"); $("mtc-note").textContent = t("listening"); };
    rec.onresult = function (ev) { said = ""; for (var i = 0; i < ev.results.length; i++) said += ev.results[i][0].transcript; $("mtc-note").textContent = "🎙 " + said; };
    rec.onerror = function (ev) { stopListen(); if (ev.error === "not-allowed" || ev.error === "service-not-allowed") bubble("bot", t("denied")); };
    rec.onend = function () {
      stopListen(); said = said.trim(); if (!said) return;
      voiceReply = true;
      var hit = null; curOpts.forEach(function (c) { if (!hit && c.o.k && c.o.k.test(said)) hit = c; });
      if (hit) pick(hit.box, hit.o); else { bubble("me", said); say(t("noMatch")); }
    };
    try { rec.start(); } catch (e) { stopListen(); }
  });

  /* ---------- 通話外觀：來電、接通、縮小、掛斷 ---------- */
  var timer = 0, t0 = 0, started = false;
  function renderStatic() {
    $("mtc-cname").textContent = t("name"); $("mtc-cname").title = t("name"); $("mtc-cstat").textContent = t("calling");
    $("mtc-name").textContent = t("name"); if (!t0) $("mtc-timer").textContent = t("role") + " · 00:00"; $("mtc-live").textContent = t("live");
    call.setAttribute("aria-label", t("accept")); $("mtc-min").setAttribute("aria-label", t("min")); fab.setAttribute("aria-label", t("reopen"));
    $("mtc-end").setAttribute("aria-label", t("end")); mic.setAttribute("aria-label", t("mic")); $("mtc-hide").setAttribute("aria-label", t("hide")); $("mtc-top-min").setAttribute("aria-label", t("hide"));
    $("mtc-note").textContent = t("note"); $("mtc-restart").textContent = t("restart");
  }
  function tick() { var s = Math.floor((Date.now() - t0) / 1000), txt = ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2); $("mtc-timer").textContent = t("role") + " · " + txt; $("mtc-pill").textContent = txt; }
  function answer() {
    if (root.classList.contains("open") || root.classList.contains("connecting")) return;
    var go = function () {
      root.classList.remove("connecting"); root.classList.add("open", "incall"); root.classList.remove("mini");
      if (!t0) t0 = Date.now(); tick(); clearInterval(timer); timer = setInterval(tick, 1000);
      if (!started) { started = true; start(); }
    };
    if (root.classList.contains("mini") || reduce) { go(); return; }
    root.classList.add("connecting"); setTimeout(go, 1300);
  }
  function hide() { shutUp(); root.classList.remove("open"); root.classList.add("mini"); fab.focus({ preventScroll: true }); }
  function end() { shutUp(); root.classList.remove("open", "incall"); root.classList.add("mini"); clearInterval(timer); t0 = 0; started = false; voiceReply = false; log.innerHTML = ""; fab.focus({ preventScroll: true }); }
  $("mtc-restart").addEventListener("click", function () { if (!busy) { shutUp(); start(); } });

  /* 來電進場：頁面載入後約 2.5 秒，以全像投影效果彈出 */
  function ringIn() { root.classList.remove("pre"); if (reduce || root.classList.contains("mini")) return; root.classList.add("ringin"); setTimeout(function () { root.classList.remove("ringin"); }, 1600); }
  if (document.readyState === "complete") setTimeout(ringIn, 2500); else addEventListener("load", function () { setTimeout(ringIn, 2500); });
  /* 不定時震動：每隔 4～10 秒隨機震一下；通話視窗打開、拖曳中、分頁在背景時不震 */
  (function buzzLoop() {
    setTimeout(function () {
      if (!reduce && !document.hidden && !root.classList.contains("pre") && !root.classList.contains("ringin") && !root.classList.contains("open") && !root.classList.contains("dragging") && !root.classList.contains("connecting")) {
        root.classList.remove("buzz"); void root.offsetWidth; root.classList.add("buzz");
        setTimeout(function () { root.classList.remove("buzz"); }, 750);
      }
      buzzLoop();
    }, 4000 + Math.random() * 6000);
  })();
  /* 縮小頭像拖曳：移動超過 6px 才算拖曳，否則視為點擊打開；放開時吸附到最近的左右邊緣 */
  var pos = null, drag = null, justDragged = false;
  try { pos = JSON.parse(localStorage.getItem("mtc-pos") || "null"); } catch (e) {}
  /* 強制不與版型切換器重疊：頭像若落在切換器範圍（手機以抽屜展開後的整排計算），就推到它的上方或下方 */
  function avoidSwitcher(x, y, w, h) {
    var sw = document.querySelector(".switcher"); if (!sw) return y;
    var r = sw.getBoundingClientRect(), gap = 12, L = innerWidth <= 720 ? 0 : r.left, T = r.top, B = r.bottom;
    if (x + w + gap <= L || x - gap >= r.right || y + h + gap <= T || y - gap >= B) return y;
    var up = T - h - gap, down = B + gap;
    return (down + h <= innerHeight - 8 && Math.abs(down - y) < Math.abs(y - up)) ? down : Math.max(8, up);
  }
  function applyPos() {
    if (!root.classList.contains("mini") || root.classList.contains("open")) { root.style.left = root.style.top = root.style.right = root.style.bottom = ""; return; }
    var w = fab.offsetWidth || 58, h = fab.offsetHeight || 58, x, y;
    if (pos) { x = Math.min(Math.max(8, pos.x), innerWidth - w - 8); y = Math.min(Math.max(8, pos.y), innerHeight - h - 16); }
    else { root.style.left = root.style.top = root.style.right = root.style.bottom = ""; var fr = fab.getBoundingClientRect(); x = fr.left; y = fr.top; }
    var ny = avoidSwitcher(x, y, w, h);
    if (!pos && ny === y) return;
    if (pos && !root.classList.contains("dragging")) pos.y = ny;
    root.style.left = x + "px"; root.style.top = ny + "px"; root.style.right = "auto"; root.style.bottom = "auto";
  }
  new MutationObserver(applyPos).observe(root, { attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", applyPos);
  var swEl = document.querySelector(".switcher"); if (swEl) new MutationObserver(applyPos).observe(swEl, { attributes: true, attributeFilter: ["class"] });
  fab.addEventListener("pointerdown", function (e) {
    if (!root.classList.contains("mini") || root.classList.contains("open") || e.button > 0) return;
    var r = fab.getBoundingClientRect(); drag = { sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, on: false, id: e.pointerId };
  });
  addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return; drag.on = true; root.classList.add("dragging"); try { fab.setPointerCapture(e.pointerId); } catch (er) {} }
    pos = { x: e.clientX - drag.ox, y: e.clientY - drag.oy }; applyPos(); e.preventDefault();
  }, { passive: false });
  function dropFab(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var was = drag.on; drag = null; if (!was) return;
    root.classList.remove("dragging");
    var w = fab.offsetWidth; pos.x = pos.x + w / 2 < innerWidth / 2 ? 12 : innerWidth - w - 12; applyPos();
    try { localStorage.setItem("mtc-pos", JSON.stringify(pos)); } catch (er) {}
    justDragged = true; setTimeout(function () { justDragged = false; }, 0);
  }
  addEventListener("pointerup", dropFab); addEventListener("pointercancel", dropFab);
  call.addEventListener("click", function (e) { if (e.target.closest(".mtc-min")) return; answer(); });
  call.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answer(); } });
  $("mtc-min").addEventListener("click", function (e) { e.stopPropagation(); root.classList.add("mini"); });
  fab.addEventListener("click", function () { if (justDragged) return; answer(); });
  $("mtc-end").addEventListener("click", end);
  $("mtc-hide").addEventListener("click", hide);
  $("mtc-top-min").addEventListener("click", hide);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("open")) hide(); });
  new MutationObserver(renderStatic).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  new MutationObserver(syncMascot).observe(document.body, { attributes: true, attributeFilter: ["data-v"] });
  syncMascot();
})();

(function () {
  var button = document.querySelector('[data-top-btn]'), chat = document.getElementById('mt-chat');
  if (!button || !chat) return;
  function position() {
    button.classList.toggle('show', window.scrollY > 480);
    button.setAttribute('href', '#v' + (document.body.dataset.v || 'd') + '-top');
    button.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Back to top' : '回到頂端');
    button.style.left = ''; button.style.right = ''; button.style.bottom = '';
    // Prefer the opposite corner, then lift above a full-width support panel.
    var target = chat.classList.contains('open') ? document.getElementById('mtc-panel') : chat;
    var a = button.getBoundingClientRect(), b = target.getBoundingClientRect(), gap = 16;
    function overlaps(rect) { return rect.right + gap > b.left && rect.left - gap < b.right && rect.bottom + gap > b.top && rect.top - gap < b.bottom; }
    if (overlaps(a)) {
      button.style.left = 'auto';
      button.style.right = 'calc(16px + env(safe-area-inset-right, 0px))';
      if (overlaps(button.getBoundingClientRect())) {
        button.style.bottom = Math.min(window.innerHeight - a.height - 8, Math.max(16, window.innerHeight - b.top + gap + 24)) + 'px';
      }
    }
  }
  window.addEventListener('scroll', position, { passive: true });
  window.addEventListener('resize', position);
  new MutationObserver(position).observe(chat, { attributes: true, attributeFilter: ['class', 'style'] });
  var sizeObserver = new ResizeObserver(position);
  sizeObserver.observe(chat); sizeObserver.observe(document.getElementById('mtc-panel'));
  document.getElementById('mtc-panel').addEventListener('transitionend', position);
  document.getElementById('mtc-panel').addEventListener('animationend', position);
  new MutationObserver(position).observe(document.body, { attributes: true, attributeFilter: ['data-v'] });
  new MutationObserver(position).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  position();
})();

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-vision-carousel]').forEach(function (box) {
    var slides = box.querySelectorAll('[data-vision-slide]');
    var current = 0, paused = reduced.matches, hovered = false, focused = false, visible = false, cycle;
    function schedule() {
      if (!cycle) return;
      if (!paused && !hovered && !focused && visible && !document.hidden && !box.closest('.v[hidden]')) cycle.play(); else cycle.pause();
    }
    function show(index) {
      if (cycle) cycle.cancel();
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.hidden = i !== current; });
      cycle = new Animation(new KeyframeEffect(null, [], { duration: 6000 }), document.timeline);
      cycle.pause(); cycle.onfinish = function () { show(current + 1); };
      schedule();
    }
    box.querySelector('[data-vision-prev]').addEventListener('click', function () { show(current - 1); });
    box.querySelector('[data-vision-next]').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('mouseenter', function () { hovered = true; schedule(); });
    box.addEventListener('mouseleave', function () { hovered = false; schedule(); });
    box.addEventListener('focusin', function () { focused = true; schedule(); });
    box.addEventListener('focusout', function () { requestAnimationFrame(function () { focused = box.contains(document.activeElement); schedule(); }); });
    document.addEventListener('visibilitychange', schedule);
    new MutationObserver(schedule).observe(box.closest('.v'), { attributes: true, attributeFilter: ['hidden'] });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: .2 }).observe(box); else visible = true;
    reduced.addEventListener('change', function () { paused = reduced.matches; schedule(); });
    show(0);
  });
})();
