"""Export the three registered hero sources at their declared delivery sizes."""
from PIL import Image
from asset_paths import registered_path

total=0
for variant in ('a','b','c'):
    src=registered_path(f'assets/photos-src/{variant}/hero-datacenter.jpg')
    with Image.open(src) as original:
        im=original.convert('RGB')
        for width in (960,1440,1920):
            out=registered_path(f'assets/photos/{variant}/hero-datacenter-{width}.webp')
            image=im if im.width<=width else im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
            image.save(out,'WEBP',quality=74,method=6);total+=out.stat().st_size
print(f'done, {total//1024} KB; verify declared image specs and update manifest hashes before publishing')
