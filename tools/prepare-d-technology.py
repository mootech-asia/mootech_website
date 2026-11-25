"""Package D technology icons and its shallow panorama without distorting subjects."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
SCENES=['vision','team','ideas','learning','workspace','coffee','fitness','banner']
for i,scene in enumerate(SCENES):
 src=ROOT/f'source/images/mootech_website_SRCIMG{44+i:03d}_d-tech-{scene}.png'
 dst=ROOT/f'assets/images/mootech_website_IMG{161+i:03d}_d-tech-{scene}.{"webp" if scene=="banner" else "png"}'
 args=['magick',str(src)]
 if scene=='banner':args+=['-crop','2172x483+0+120','+repage','-resize','1800x400!','-strip','-quality','90']
 else:args+=['-trim','+repage','-resize','560x560','-background','none','-gravity','center','-extent','640x640']
 subprocess.run(args+[str(dst)],check=True)
