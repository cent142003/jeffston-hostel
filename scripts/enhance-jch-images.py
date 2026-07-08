from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


PHOTO_EXTENSIONS = {".jpg", ".jpeg"}

WEB_EXPORTS = {
    "front of building.jpg": "HERO.png",
    "JCH logo white background.jpg": "logo2.jpg",
    "JCH logo.jpg": "logo.jpg",
    "JCH SEAL.jpg": "logoseal.jpg",
    "rooms 1.jpg": "bedroom2.jpg",
    "kitchen from inside.jpg": "kit2.jpg",
    "rooms 2.jpg": "bedroom1.jpg",
    "rooms 3.jpg": "bedroom3.jpg",
    "rooms 4.jpg": "bedroom4.jpg",
    "rooms 6.jpg": "bedroom5.jpg",
    "Living area.jpg": "liv3.jpg",
    "Living area 1.jpg": "liv1.jpg",
    "view 2 living room.jpg": "liv2.jpg",
    "laundry room.jpg": "laundryroom.jpg",
    "Bathroom.jpg": "bathroom.jpg",
    "kitchen from entrance.jpg": "kit1.jpg",
}


def gray_world_balance(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    pixels = rgb.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
    average = sum(pixels) / 3
    if average <= 0:
        return rgb
    lut = []
    for channel_average in pixels:
        factor = average / max(channel_average, 1)
        lut.extend(min(255, int(value * factor)) for value in range(256))
    return rgb.point(lut)


def enhance_photo(source: Path, destination: Path, *, max_width: int | None) -> None:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        if max_width and image.width > max_width:
            height = round(image.height * (max_width / image.width))
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)

        image = gray_world_balance(image)
        image = ImageOps.autocontrast(image, cutoff=0.7, preserve_tone=True)
        image = ImageEnhance.Color(image).enhance(1.07)
        image = ImageEnhance.Brightness(image).enhance(1.03)
        image = ImageEnhance.Contrast(image).enhance(1.08)
        image = image.filter(ImageFilter.MedianFilter(size=3))
        image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=4))

        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.suffix.lower() == ".png":
            image.save(destination, optimize=True)
        else:
            image.save(destination, quality=88, optimize=True, progressive=True)


def backup_originals(source_dir: Path) -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = source_dir / f"_originals_backup_{stamp}"
    backup_dir.mkdir()
    for image_path in source_dir.iterdir():
        if image_path.is_file() and image_path.suffix.lower() in PHOTO_EXTENSIONS:
            shutil.copy2(image_path, backup_dir / image_path.name)
    return backup_dir


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--web-dir", required=True, type=Path)
    parser.add_argument("--max-master-width", default=2200, type=int)
    parser.add_argument("--max-web-width", default=1600, type=int)
    args = parser.parse_args()

    source_dir = args.source_dir.resolve()
    web_dir = args.web_dir.resolve()
    backup_dir = backup_originals(source_dir)

    enhanced = []
    for image_path in source_dir.iterdir():
        if not image_path.is_file() or image_path.suffix.lower() not in PHOTO_EXTENSIONS:
            continue
        temp_path = source_dir / f".enhanced-{image_path.name}"
        enhance_photo(image_path, temp_path, max_width=args.max_master_width)
        temp_path.replace(image_path)
        enhanced.append(str(image_path))

    exported = {}
    for source_name, output_name in WEB_EXPORTS.items():
        source_path = source_dir / source_name
        if source_path.exists():
            output_path = web_dir / output_name
            enhance_photo(source_path, output_path, max_width=args.max_web_width)
            exported[source_name] = str(output_path)

    print(json.dumps({
        "backupDir": str(backup_dir),
        "enhancedCount": len(enhanced),
        "exported": exported,
    }, indent=2))


if __name__ == "__main__":
    main()
