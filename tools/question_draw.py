"""Ziehung der Einstiegsfragen, exakte Entsprechung zu questions.js (gleiche Hash- und Zufallsfunktion).

Keine Plan-Datei: Die Fragen ergeben sich aus dem persönlichen Code der Vp und dem Seed aus data/draw.json.
"""
import json
import os

M = 0xFFFFFFFF
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


def fnv1a(s: str) -> int:
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch) & 0xFF
        h = (h * 0x01000193) & M
    return h


def mulberry32(a: int):
    a &= M

    def rnd() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & M
        t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & M
        t = (t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & M)) & M)) & M
        return ((t ^ (t >> 14)) & M) / 4294967296

    return rnd


def load_pool(data_dir: str = DATA_DIR):
    with open(os.path.join(data_dir, "questions.json"), encoding="utf-8") as f:
        pool = json.load(f)
    with open(os.path.join(data_dir, "draw.json"), encoding="utf-8") as f:
        seed = json.load(f)["seed"]
    return pool, seed


def draw(code: str, seed: str, pool: list) -> dict:
    tiers = {}
    for q in pool:
        tiers.setdefault(q["tier"], []).append(q["id"])
    out = {"block1": [], "block2": []}
    for tier in sorted(tiers):
        arr = list(tiers[tier])
        rnd = mulberry32(fnv1a(f"{seed}:{code.lower()}:t{tier}"))
        for i in range(len(arr) - 1, 0, -1):
            j = int(rnd() * (i + 1))
            arr[i], arr[j] = arr[j], arr[i]
        out["block1"].append(arr[0])
        out["block2"].append(arr[1])
    return out


def get_questions(vp_id: str, block: int, n: int = 3, data_dir: str = DATA_DIR) -> list:
    """Frage-IDs (aufsteigende Stufe) für diesen Code und Block (1 oder 2); n = 2 oder 3."""
    if block not in (1, 2):
        raise ValueError("block muss 1 oder 2 sein")
    pool, seed = load_pool(data_dir)
    return draw(vp_id, seed, pool)[f"block{block}"][:n]
