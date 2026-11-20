"""Resolve existing art slots to their numbered delivery/source files."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ASSETS=json.loads((ROOT/'ASSET_MANIFEST.json').read_text())['assets']

def registered_path(previous):
    item=next((a for a in ASSETS if a.get('previousPath')==previous),None)
    if item is None:raise ValueError('請先登錄新素材槽位：'+previous)
    path=ROOT/item['path'];path.parent.mkdir(parents=True,exist_ok=True)
    return path
