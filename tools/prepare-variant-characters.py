"""Package independently designed A mono-blue / E bear art; no recolouring or deformation."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
SCENES=['vision','team','ideas','learning','workspace','coffee','fitness','banner']
for variant in ['a','e']:
 for i,scene in enumerate(SCENES):
  n=(144 if variant=='a' else 151)+i if scene!='banner' else (158 if variant=='a' else 159)
  sn=(27 if variant=='a' else 34)+i if scene!='banner' else (41 if variant=='a' else 42)
  source=ROOT/f'source/images/mootech_website_SRCIMG{sn:03d}_{variant}-{scene}.png'
  target=ROOT/f'assets/images/mootech_website_IMG{n:03d}_{variant}-{scene}.{ "webp" if scene=="banner" else "png" }'
  if not source.is_file():raise FileNotFoundError(source)
  args=['magick',str(source)]
  if scene=='banner':args+=['-resize','1600x','-strip','-quality','90']
  else:args+=['-trim','+repage','-resize','592x592','-background','none','-gravity','center','-extent','640x640']
  subprocess.run(args+[str(target)],check=True)
  print(target.name)
