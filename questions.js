// Ziehung der Einstiegsfragen aus dem Pool. Reine Logik ohne DOM (läuft im Browser und in Node).
// Es gibt keinen Plan und keine Zuordnungstabelle: Die Fragen ergeben sich allein aus dem persönlichen Code
// der Versuchsperson und einem festen Seed (data/draw.json). Der Controller (tools/question_draw.py)
// rechnet exakt dasselbe aus. Beide Implementierungen müssen identisch bleiben (Testvektoren in tests/).
// Pro Stufe werden die Fragen mit einem vom Code abhängigen Zufall gemischt: die erste kommt in Gespräch 1,
// die zweite in Gespräch 2. So gibt es pro Person nie eine Frage doppelt, und die Stufen steigen auf.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QUESTIONS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // FNV-1a, 32 Bit (Code ist ASCII: a-z, 0-9)
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i) & 0xff;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  // mulberry32: kleiner, seedbarer Zufallsgenerator
  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pool (Liste aus questions.json) -> { 1: [ids], 2: [ids], 3: [ids] } in Dateireihenfolge
  function byTier(list) {
    var t = {};
    list.forEach(function (q) {
      (t[q.tier] = t[q.tier] || []).push(q.id);
    });
    return t;
  }

  // Liefert { block1: [id Stufe 1, id Stufe 2, id Stufe 3], block2: [...] }
  function draw(code, seed, list) {
    var tiers = byTier(list);
    var out = { block1: [], block2: [] };
    Object.keys(tiers)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      })
      .forEach(function (tier) {
        var arr = tiers[tier].slice();
        var rnd = mulberry32(fnv1a(seed + ":" + String(code).toLowerCase() + ":t" + tier));
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(rnd() * (i + 1));
          var tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
        out.block1.push(arr[0]);
        out.block2.push(arr[1]);
      });
    return out;
  }

  // Die ersten n Fragen eines Blocks (n = 2: Stufe 1 und 2; n = 3: zusätzlich Stufe 3)
  function forBlock(code, seed, list, block, n) {
    return draw(code, seed, list)["block" + block].slice(0, n);
  }

  return { fnv1a: fnv1a, mulberry32: mulberry32, draw: draw, forBlock: forBlock };
});
