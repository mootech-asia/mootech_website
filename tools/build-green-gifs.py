"""Animate independently illustrated seamless character poses, 40 frames at 20 fps.
Requires Playwright Chromium and ImageMagick 7. No visible joints are added.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading,subprocess,tempfile,shutil,argparse
ROOT=Path(__file__).resolve().parents[1]
NAMES=['vision','team','ideas','learning','workspace','coffee','fitness']
SOURCE=['source/images/mootech_website_SRCIMG007_gradient-character.png']+[f'source/images/mootech_website_SRCIMG{8+i:03d}_pose-{name}.png' for i,name in enumerate(NAMES[1:])]
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--scene',nargs='+',choices=NAMES,default=NAMES);selected=parser.parse_args().scene
 with tempfile.TemporaryDirectory() as work:
  work=Path(work);shutil.copyfile(ROOT/'tools/gradient-motion.html',work/'motion.html')
  for name,source in zip(NAMES,SOURCE):
   if name not in selected:continue
   subprocess.run(['magick',str(ROOT/source),'-resize','336x336','-background','none','-gravity','center','-extent','360x360',str(work/(name+'.png'))],check=True)
  server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(work)));threading.Thread(target=server.serve_forever,daemon=True).start()
  try:
   with sync_playwright() as p:
    b=p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page=b.new_page(viewport={'width':360,'height':360},device_scale_factor=1);page.goto(f'http://127.0.0.1:{server.server_port}/motion.html')
    for mode,name in enumerate(NAMES):
     if name not in selected:continue
     frames=[]
     for f in range(40):
      page.evaluate('async([m,f])=>await draw(m,f)',[mode,f]);path=work/f'frame-{f:03d}.png';page.locator('#out').screenshot(path=str(path),omit_background=True);frames.append(str(path))
     subprocess.run(['magick','-delay','5','-dispose','background',*frames,'-channel','A','-threshold','50%','+channel','-loop','0',str(ROOT/f'assets/images/mootech_website_IMG{119+mode*2:03d}_green-{name}.gif')],check=True)
     subprocess.run(['magick',frames[10],str(ROOT/f'assets/images/mootech_website_IMG{120+mode*2:03d}_green-{name}-still.png')],check=True)
     print(name,'40 frames / 20 fps',flush=True)
    b.close()
  finally:server.shutdown()
