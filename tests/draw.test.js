// Tests der Ziehungslogik (questions.js). Start: node tests/draw.test.js
const assert = require("assert");
const Q = require("../questions.js");
const list = require("../data/questions.json");
const seed = require("../data/draw.json").seed;

// Feste Testvektoren: müssen mit tests/test_question_draw.py übereinstimmen (gleiche Ziehung in JS und Python)
const VECTORS = {
  abc12: { block1: ["S1-3", "S2-6", "S3-1"], block2: ["S1-1", "S2-1", "S3-3"] },
  x9y8z: { block1: ["S1-6", "S2-2", "S3-1"], block2: ["S1-5", "S2-4", "S3-4"] },
  "00000": { block1: ["S1-5", "S2-3", "S3-2"], block2: ["S1-3", "S2-1", "S3-5"] },
};
Object.keys(VECTORS).forEach((c) => assert.deepStrictEqual(Q.draw(c, seed, list), VECTORS[c], "Vektor " + c));

const tierOf = {};
list.forEach((q) => (tierOf[q.id] = q.tier));
assert.strictEqual(list.length, 18);
const codes = [];
for (let i = 0; i < 500; i++) codes.push((i * 7919 + 12345).toString(36).padStart(5, "0").slice(-5));
codes.forEach((c) => {
  const d = Q.draw(c, seed, list);
  assert.deepStrictEqual(d, Q.draw(c, seed, list), "reproduzierbar");
  assert.deepStrictEqual(d, Q.draw(c.toUpperCase(), seed, list), "Groß-/Kleinschreibung egal");
  const all = d.block1.concat(d.block2);
  assert.strictEqual(new Set(all).size, 6, "keine Frage doppelt: " + c);
  ["block1", "block2"].forEach((b) => assert.deepStrictEqual(d[b].map((id) => tierOf[id]), [1, 2, 3], "Stufen aufsteigend"));
  assert.deepStrictEqual(Q.forBlock(c, seed, list, 1, 2), d.block1.slice(0, 2));
  assert.deepStrictEqual(Object.keys(d).sort(), ["block1", "block2"]);
});
// Über viele Codes kommt jede Frage in jedem Block vor (keine Frage wird nie gezogen)
["block1", "block2"].forEach((b) => {
  const seen = new Set();
  codes.forEach((c) => Q.draw(c, seed, list)[b].forEach((id) => seen.add(id)));
  assert.strictEqual(seen.size, 18, "alle Fragen kommen in " + b + " vor");
});
console.log("draw.test.js: ok");
