"""Create web-sized copies of Mihiir's photographs; originals stay untouched."""
from pathlib import Path
from PIL import Image, ImageOps

source = Path(__file__).resolve().parents[2] / 'ImageAssets'
destination = Path(__file__).resolve().parents[1] / 'public' / 'images'
destination.mkdir(parents=True, exist_ok=True)
photos = {
    'Mihiir_posing_in_salt_water_lake.JPG': ('mihiir-lake', 1500),
    'DSC_9551_122.jpg': ('mountain-panorama', 2200),
    'DSC_9568.JPG': ('night-camp', 1600),
    'mihiir_far_on_snow_during_mountaineering.JPG': ('mountaineering', 1500),
    'DSC_4031.JPG': ('evening-light', 1200),
}
for filename, (name, width) in photos.items():
    with Image.open(source / filename) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((width, width))
        photo.save(destination / f'{name}.webp', 'WEBP', quality=84, method=6)
        print(name, photo.size)
