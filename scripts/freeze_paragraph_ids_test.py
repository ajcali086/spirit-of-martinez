from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).parent))
from freeze_paragraph_ids import freeze_text

SAMPLE = """export const chapters = [
  {
    number: 1,
    slug: "one",
    sections: [
      {
        id: "1.1",
        title: "A",
        blocks: [
          { type: "p", text: "First." },
          { type: "figure", id: "merit" },
          { type: "p", text: "Second." },
        ],
      },
    ],
  },
  {
    number: 9,
    slug: "mission-one",
    sections: [
      {
        id: "9.1",
        title: "B",
        blocks: [
          { type: "p", id: "m-1", text: "Named." },
          { type: "p", text: "After." },
        ],
      },
    ],
  },
];
"""


class FreezeParagraphIds(unittest.TestCase):
    def test_fills_blanks_and_keeps_missions(self):
        out, stats = freeze_text(SAMPLE)
        self.assertEqual(stats["written"], 3)
        self.assertEqual(stats["kept"], 1)
        self.assertIn('id: "1.1-p0"', out)
        self.assertIn('id: "1.1-p1"', out)
        self.assertIn('id: "m-1"', out)
        self.assertIn('id: "9.1-p1"', out)
        self.assertNotIn('id: "9.1-p0"', out)

    def test_second_pass_is_noop(self):
        once, _ = freeze_text(SAMPLE)
        twice, stats = freeze_text(once)
        self.assertEqual(once, twice)
        self.assertEqual(stats["written"], 0)
        self.assertEqual(stats["kept"], 4)


if __name__ == "__main__":
    unittest.main()
