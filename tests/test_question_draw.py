"""Tests: Python-Ziehung (tools/question_draw.py) und Blinding-Check. Start: python3 -m unittest discover -s tests -v"""
import os
import re
import sys
import unittest
from collections import Counter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(ROOT, "tools"))
from question_draw import draw, get_questions, load_pool  # noqa: E402

# Gleiche Vektoren wie in tests/draw.test.js
VECTORS = {
    "abc12": {"block1": ["S1-3", "S2-6", "S3-1"], "block2": ["S1-1", "S2-1", "S3-3"]},
    "x9y8z": {"block1": ["S1-6", "S2-2", "S3-1"], "block2": ["S1-5", "S2-4", "S3-4"]},
    "00000": {"block1": ["S1-5", "S2-3", "S3-2"], "block2": ["S1-3", "S2-1", "S3-5"]},
}


def codes(n=500):
    out = []
    for i in range(n):
        x, s = i * 7919 + 12345, ""
        while x:
            s = "0123456789abcdefghijklmnopqrstuvwxyz"[x % 36] + s
            x //= 36
        out.append(s.rjust(5, "0")[-5:])
    return out


class DrawTests(unittest.TestCase):
    def setUp(self):
        self.pool, self.seed = load_pool()
        self.tier = {q["id"]: q["tier"] for q in self.pool}

    def test_pool(self):
        self.assertEqual(len(self.pool), 18)
        self.assertEqual(Counter(q["tier"] for q in self.pool), {1: 6, 2: 6, 3: 6})

    def test_vectors_match_js(self):
        for c, v in VECTORS.items():
            self.assertEqual(draw(c, self.seed, self.pool), v)

    def test_properties(self):
        for c in codes():
            d = draw(c, self.seed, self.pool)
            self.assertEqual(d, draw(c, self.seed, self.pool))
            self.assertEqual(d, draw(c.upper(), self.seed, self.pool))
            self.assertEqual(len(set(d["block1"] + d["block2"])), 6)
            for b in ("block1", "block2"):
                self.assertEqual([self.tier[i] for i in d[b]], [1, 2, 3])
            self.assertEqual(set(d), {"block1", "block2"})

    def test_get_questions(self):
        self.assertEqual(get_questions("abc12", 1), VECTORS["abc12"]["block1"])
        self.assertEqual(get_questions("abc12", 2, n=2), VECTORS["abc12"]["block2"][:2])
        with self.assertRaises(ValueError):
            get_questions("abc12", 3)

    def test_balance_roughly(self):
        # Codes sind frei gewählt, daher nur grobe Ausgewogenheit: keine Frage fehlt, keine dominiert extrem
        for b in ("block1", "block2"):
            c = Counter(i for code in codes() for i in draw(code, self.seed, self.pool)[b])
            self.assertEqual(len(c), 18)
            self.assertLess(max(c.values()) - min(c.values()), 0.5 * (500 / 6))


class BlindingTests(unittest.TestCase):
    FORBIDDEN = re.compile(r"teleprompter|webcam|condition|kondition|bedingung", re.I)

    def test_no_condition_words_in_public_data(self):
        checked = 0
        for folder in ("data", "audio"):
            for dirpath, _, files in os.walk(os.path.join(ROOT, folder)):
                for f in files:
                    path = os.path.join(dirpath, f)
                    checked += 1
                    self.assertIsNone(self.FORBIDDEN.search(f), f"Dateiname verrät etwas: {path}")
                    with open(path, "rb") as fh:
                        text = fh.read().decode("latin-1")
                    self.assertIsNone(self.FORBIDDEN.search(text), f"Verbotenes Wort in {path}")
        self.assertGreater(checked, 0)


if __name__ == "__main__":
    unittest.main()
