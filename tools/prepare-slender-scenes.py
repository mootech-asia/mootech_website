"""Package the seven independently redrawn neutral-masculine scenes as static PNGs.
Requires ImageMagick 7. Does not generate or deform character artwork.
"""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
SCENES=['vision','team','ideas','learning','workspace','coffee','fitness']
if __name__=='__main__':
 for i,name in enumerate(SCENES):
  source=ROOT/f'source/images/mootech_website_SRCIMG{16+i:03d}_slender-{name}.png'
  target=ROOT/f'assets/images/mootech_website_IMG{134+i:03d}_slender-{name}.png'
  if not source.is_file():raise FileNotFoundError(source)
  subprocess.run(['magick',str(source),'-resize','608x608','-background','none','-gravity','center','-extent','640x640',str(target)],check=True)
  print(name,target.name)
