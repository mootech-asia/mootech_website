"""Render bilingual D social cards from the approved character-free technology icon."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE='http://localhost:8765/'
with sync_playwright() as p:
 b=p.chromium.launch(args=['--no-sandbox']);page=b.new_page(viewport={'width':1200,'height':630},device_scale_factor=1)
 for lang,n,title,sub in [('zh',169,'透過創新<br>推動企業發展','直播串流 · 國際專線 · IP Transit · CDN'),('en',170,'Driving business<br>through innovation','Live Streaming · IPLC · IP Transit · CDN')]:
  page.set_content(f'''<html><head><meta charset="utf-8"><style>
  *{{box-sizing:border-box}}body{{margin:0;background:#030609;color:#fff;font-family:Arial,'Noto Sans CJK TC',sans-serif;width:1200px;height:630px;overflow:hidden}}
  .bg{{position:absolute;inset:0;background:radial-gradient(ellipse at 80% 55%,#29b6e814,transparent 60%)}}
  .brand{{position:absolute;left:68px;top:52px;width:230px}}.tag{{position:absolute;left:70px;top:156px;color:#83d5c9;font-size:15px;letter-spacing:5px}}
  h1{{position:absolute;left:68px;top:196px;margin:0;font-size:{52 if lang=='zh' else 46}px;line-height:1.32;font-weight:800;letter-spacing:-1px}}
  .sub{{position:absolute;left:70px;top:386px;font-size:19px;color:#a2b0bf;line-height:1.8}}.art{{position:absolute;width:530px;height:530px;right:8px;top:60px;object-fit:contain}}
  .line{{position:absolute;left:70px;right:70px;bottom:67px;height:1px;background:linear-gradient(90deg,#29b6e8,#b9d85a,transparent)}}.foot{{position:absolute;bottom:28px;left:70px;color:#a2b0bf;font-size:15px;letter-spacing:1px}}
  </style></head><body><div class="bg"></div><img class="brand" src="{BASE}assets/images/mootech_website_IMG003_brand_logo-h-white.png"><div class="tag">DESIGN D · FUTURE IN LIGHT</div><h1>{title}</h1><div class="sub">{sub}<br>Network Architecture · System Integration</div><img class="art" src="{BASE}assets/images/mootech_website_IMG161_d-tech-vision.png"><div class="line"></div><div class="foot">MOOTECH · Since 2016 · mootech.asia</div></body></html>''')
  page.locator('img').evaluate_all('(es)=>Promise.all(es.map(e=>e.decode()))');page.screenshot(path=str(ROOT/f'assets/images/mootech_website_IMG{n}_d-tech-social-{lang}.jpg'),type='jpeg',quality=94)
 b.close()
