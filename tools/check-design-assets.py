#!/usr/bin/env python3
"""檢查獨立版型資料夾（design-a～design-e）的素材副本登錄。

由根目錄 ASSET_MANIFEST.json 的 delegates 呼叫：python3 tools/check-design-assets.py design-a
檢查缺檔、未登錄、重複編號／路徑與指紋；path 相對於該資料夾。
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.mov', '.glb', '.gltf',
         '.blend', '.fbx', '.psd', '.ai', '.woff', '.woff2', '.ttf', '.otf', '.eot'}


def main(name):
    folder = ROOT / name
    data = json.loads((folder / 'ASSET_MANIFEST.json').read_text(encoding='utf-8'))
    errors, ids, paths = [], set(), set()
    for a in data['assets']:
        path = a['path']
        if a['id'] in ids:
            errors.append('重複編號：' + a['id'])
        if path in paths:
            errors.append('重複路徑：' + path)
        ids.add(a['id']); paths.add(path)
        if not a.get('purpose'):
            errors.append('缺用途：' + path)
        p = folder / path
        if not p.is_file():
            errors.append('缺檔：%s/%s' % (name, path)); continue
        if hashlib.sha256(p.read_bytes()).hexdigest() != a.get('sha256'):
            errors.append('指紋變更，請先核對規格：%s/%s' % (name, path))
    for item in data.get('procedural', []):
        if not (folder / item['path']).is_file():
            errors.append('程式生成來源缺檔：%s/%s' % (name, item['path']))
    raw = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', name], cwd=ROOT)
    actual = {Path(v.decode()).relative_to(name).as_posix() for v in raw.split(b'\0') if v}
    actual = {p for p in actual if (folder / p).is_file() and Path(p).suffix.lower() in MEDIA}
    errors.extend('未登錄素材：%s/%s' % (name, p) for p in sorted(actual - paths))
    if errors:
        print('\n'.join(errors)); return 1
    print('PASS %s: %d 項素材副本' % (name, len(paths)))
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 2 or not (ROOT / sys.argv[1] / 'ASSET_MANIFEST.json').is_file():
        raise SystemExit('用法：python3 tools/check-design-assets.py design-a')
    sys.exit(main(sys.argv[1]))
