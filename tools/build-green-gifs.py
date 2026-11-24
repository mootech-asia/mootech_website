"""Render 40 continuous mesh-animation frames at 20 fps per independent scene.
Requires Playwright Chromium and ImageMagick 7. Source: approved SRCIMG007.
"""
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading
from pathlib import Path
import subprocess,tempfile
root=Path(__file__).resolve().parents[1]
names=['vision','team','ideas','learning','workspace','coffee','fitness']
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':320,'height':320},device_scale_factor=1)
 page.goto(f'http://127.0.0.1:{server.server_port}/tools/gradient-motion.html');page.evaluate('window.ready')
 with tempfile.TemporaryDirectory() as d:
  for mode,name in enumerate(names):
   frames=[]
   for f in range(40):
    page.evaluate('([m,f])=>draw(m,f)',[mode,f]);path=Path(d)/f'{f:03d}.png';page.locator('#out').screenshot(path=str(path),omit_background=True);frames.append(str(path))
   target=root/f'assets/images/mootech_website_IMG{119+mode*2:03d}_green-{name}.gif'
   subprocess.run(['magick','-delay','5','-dispose','background',*frames,'-channel','A','-threshold','50%','+channel','-loop','0',str(target)],check=True)
   subprocess.run(['magick',frames[10],str(root/f'assets/images/mootech_website_IMG{120+mode*2:03d}_green-{name}-still.png')],check=True)
   print(name,'40 frames at 20 fps',flush=True)
 b.close()
