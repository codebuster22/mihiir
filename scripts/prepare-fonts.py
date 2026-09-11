"""Encode the approved Plex font files as WOFF2, preserving all glyphs."""
from pathlib import Path
from fontTools.ttLib import TTFont

for source in Path('public/fonts').glob('plex-sans-*.ttf'):
    target = source.with_suffix('.woff2')
    font = TTFont(source)
    font.flavor = 'woff2'
    font.save(target)
    print(f'{target.name}: {source.stat().st_size} -> {target.stat().st_size} bytes')
