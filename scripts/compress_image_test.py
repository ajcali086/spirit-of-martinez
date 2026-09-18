from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from compress_image import compress, missing_webp_sources, og_crop


class CompressImage(unittest.TestCase):
    def test_writes_jpeg_and_webp(self):
        with tempfile.TemporaryDirectory() as raw:
            src_dir = Path(raw)
            src = src_dir / "plate.png"
            Image.new("RGB", (400, 600), (40, 30, 20)).save(src)
            out = src_dir / "out"
            written = compress(src, out)
            self.assertTrue(written["jpg"].exists())
            self.assertTrue(written["webp"].exists())
            self.assertLess(written["webp"].stat().st_size, written["jpg"].stat().st_size * 2)

    def test_og_crop_is_1200x630(self):
        im = Image.new("RGB", (800, 1200), (80, 60, 40))
        card = og_crop(im, 0.28)
        self.assertEqual(card.size, (1200, 630))

    def test_og_crop_wide_banner_does_not_squash(self):
        im = Image.new("RGB", (1500, 599), (80, 60, 40))
        card = og_crop(im, 0.5)
        self.assertEqual(card.size, (1200, 630))

    def test_missing_skips_og_folder(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            (root / "og").mkdir()
            Image.new("RGB", (80, 80), (10, 10, 10)).save(root / "hero.jpg")
            Image.new("RGB", (80, 80), (10, 10, 10)).save(root / "og" / "hero.jpg")
            missing = [p.name for p in missing_webp_sources(root)]
            self.assertEqual(missing, ["hero.jpg"])


if __name__ == "__main__":
    unittest.main()
