"""Slice the approved 4×7 character keyframe sheet using ImageMagick.

Requires ImageMagick 7. Outputs full-canvas transparent GIFs and reduced-motion PNGs.
"""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / 'source/images/mootech_website_SRCIMG006_green-motion-sheet.png'
ROW_BOUNDS = [0, 250, 468, 720, 962, 1178, 1398, 1596]
SCENES = ['vision', 'team', 'ideas', 'learning', 'workspace', 'coffee', 'fitness']

def run(*args):
    subprocess.run(['magick', *map(str, args)], check=True)

if __name__ == '__main__':
    width, height = map(int, subprocess.check_output(['magick', 'identify', '-format', '%w %h', str(SHEET)], text=True).split())
    assert (width, height) == (985, 1596), 'Recheck row gutters when replacing the approved sheet'
    # Generated gutters are uneven; measured bounds exclude adjacent props.
    with tempfile.TemporaryDirectory() as directory:
        for row, name in enumerate(SCENES):
            frames = []
            for column in range(4):
                x, y = round(column * width / 4), ROW_BOUNDS[row]
                cell_width = round((column + 1) * width / 4) - x
                cell_height = ROW_BOUNDS[row + 1] - y
                frame = Path(directory) / f'{row}-{column}.png'
                run(SHEET, '-crop', f'{cell_width}x{cell_height}+{x}+{y}', '+repage', '-background', 'none', '-gravity', 'center', '-extent', '260x260', '-resize', '237x237', frame)
                frames.append(frame)
            target = ROOT / f'assets/images/mootech_website_IMG{119+row*2:03d}_green-{name}.gif'
            # GIF has binary transparency; threshold removes invisible RGB background speckles.
            run('-delay', '35', '-dispose', 'background', *frames,
                '-channel', 'A', '-threshold', '50%', '+channel', '-loop', '0', target)
            still = ROOT / f'assets/images/mootech_website_IMG{120+row*2:03d}_green-{name}-still.png'
            run(frames[2], still)
