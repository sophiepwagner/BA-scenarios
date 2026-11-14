#!/usr/bin/env python3
"""Zeigt, wie oft jede Frage pro Block vorkommt.

  python3 tools/simulate_balance.py --n 45 --seed-codes 1      # 45 zufällige Codes (Simulation)
  python3 tools/simulate_balance.py --codes abc12 x9y8z ...    # echte Codes (z. B. aus den Controller-Logs)

Die Ausgewogenheit ist nur näherungsweise gegeben, weil jede Vp ihren Code selbst wählt.
"""
import argparse
import random
import string
from collections import Counter

from question_draw import draw, load_pool


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=45)
    ap.add_argument("--seed-codes", type=int, default=1, help="Seed für die zufälligen Test-Codes")
    ap.add_argument("--codes", nargs="*", help="echte Codes statt Zufallscodes")
    ap.add_argument("--per-block", type=int, default=3)
    a = ap.parse_args()
    pool, seed = load_pool()
    rng = random.Random(a.seed_codes)
    codes = a.codes or ["".join(rng.choice(string.ascii_lowercase + string.digits) for _ in range(5)) for _ in range(a.n)]
    c = {1: Counter(), 2: Counter()}
    for code in codes:
        d = draw(code, seed, pool)
        for b in (1, 2):
            c[b].update(d[f"block{b}"][: a.per_block])
    print(f"{len(codes)} Codes, {a.per_block} Fragen pro Block\n")
    print("Frage   Block1  Block2  gesamt")
    for q in pool:
        i = q["id"]
        if int(i[1]) > a.per_block:
            continue
        print(f"{i:6}  {c[1][i]:6}  {c[2][i]:6}  {c[1][i] + c[2][i]:6}")


if __name__ == "__main__":
    main()
