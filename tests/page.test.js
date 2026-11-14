// Seitenlogik mit jsdom: Fragen, n_questions, Debug-Text, mp3-Fallback, Reload. Start: node tests/page.test.js
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { JSDOM, VirtualConsole } = require("jsdom");
const Q = require("../questions.js");

const ROOT = path.join(__dirname, "..");
const list = require("../data/questions.json");
const seed = require("../data/draw.json").seed;
const text = {};
list.forEach((q) => (text[q.id] = q.text));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const CODE = "abc12";
const IDX = { pause1: 3, qa1: 4, talk1: 5 };

// Baut die Seite mit eingebetteten Skripten; opts: config, search, ls (localStorage-Stand), mp3 (vorhandene Dateien), files404
function boot(opts) {
  opts = opts || {};
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    let code = fs.readFileSync(path.join(ROOT, src), "utf8");
    if (src === "config.js") code += "\nObject.assign(window.CONFIG," + JSON.stringify(Object.assign({ n_questions: 3 }, opts.config)) + ");";
    return "<script>" + code.replace(/<\/script>/g, "<\\/script>") + "</script>";
  });
  const spoken = [];
  const played = [];
  const warns = [];
  const vc = new VirtualConsole();
  vc.on("warn", (...a) => warns.push(a.join(" ")));
  const dom = new JSDOM(html, {
    url: "http://localhost/index.html" + (opts.search || ""),
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {};
      Object.keys(opts.ls || {}).forEach((k) => w.localStorage.setItem(k, opts.ls[k]));
      w.fetch = (url) => {
        if (/^https?:/.test(url)) return Promise.reject(new Error("offline"));
        const f = path.join(ROOT, url);
        if ((opts.files404 || []).indexOf(url) >= 0 || !fs.existsSync(f)) return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error("404")) });
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(fs.readFileSync(f, "utf8"))) });
      };
      // Sprachausgabe-Mock: deutsche Stimme vorhanden (oder keine), spricht sofort fertig
      const voices = opts.noVoice ? [] : [{ name: "Anna", lang: "de-DE" }];
      w.SpeechSynthesisUtterance = function (t) {
        this.text = t;
      };
      w.speechSynthesis = {
        getVoices: () => voices,
        addEventListener() {},
        cancel() {},
        speak(u) {
          if (u.volume !== 0) {
            spoken.push(u.text);
            setTimeout(() => u.onend && u.onend(), 1);
          }
        },
      };
      // Audio-Mock: nur Dateien aus opts.mp3 "existieren"
      w.Audio = function () {
        const a = { src: "", play() {
          if (/^data:/.test(a.src)) return Promise.resolve();
          const id = decodeURIComponent(a.src.replace(/^audio\//, "").replace(/\.mp3$/, ""));
          if ((opts.mp3 || []).indexOf(id) < 0) return Promise.reject(new Error("NotSupportedError"));
          played.push(id);
          setTimeout(() => a.onended && a.onended(), 1);
          return Promise.resolve();
        }, pause() {} };
        return a;
      };
    },
  });
  return { dom, w: dom.window, d: dom.window.document, spoken, played, warns };
}
function lsFor(index, extra) {
  const st = Object.assign({ sid: "s1", code: CODE, index: index }, extra || {});
  return { "studie:active": JSON.stringify("s1"), "studie:s1:state": JSON.stringify(st), "studie:s1:log": JSON.stringify([]) };
}
function snapshot(w) {
  const o = {};
  for (let i = 0; i < w.localStorage.length; i++) o[w.localStorage.key(i)] = w.localStorage.getItem(w.localStorage.key(i));
  return o;
}
const log = (w) => JSON.parse(w.localStorage.getItem("studie:s1:log")).map((e) => e.ereignis);
const visible = (d, id) => !d.getElementById(id).hidden;

(async () => {
  const exp = Q.forBlock(CODE, seed, list, 1, 3);

  // 1. Richtige Fragen in Reihenfolge, Zähler, kein Fragetext im DOM
  let p = boot({ ls: lsFor(IDX.pause1), config: { talk_delay_ms: 20 } });
  await wait(30);
  p.d.getElementById("btn-begin").click();
  await wait(30);
  assert(visible(p.d, "s-qa"));
  assert.strictEqual(p.d.getElementById("qa-count").textContent, "Frage 1 von 3");
  assert.deepStrictEqual(p.spoken, [text[exp[0]]]);
  assert(!p.d.body.textContent.includes(text[exp[0]]), "kein Fragetext im DOM");
  assert(!p.d.documentElement.outerHTML.includes(text[exp[0]]), "kein Fragetext im HTML");
  const clone = p.d.documentElement.cloneNode(true);
  clone.querySelectorAll("script").forEach((x) => x.remove());
  assert(!/teleprompter|webcam/i.test(clone.outerHTML), "Kondition nicht im DOM");
  // 5. Nochmal hören: spricht dieselbe Frage, zählt im Log
  p.d.getElementById("btn-qa-again").click();
  p.d.getElementById("btn-qa-again").click();
  await wait(10);
  assert.deepStrictEqual(p.spoken, [text[exp[0]], text[exp[0]], text[exp[0]]]);
  assert(log(p.w).includes("frage_nochmal_2x:" + exp[0]));
  // weiter durch alle Fragen
  p.d.getElementById("btn-qa-next").click();
  assert.strictEqual(p.d.getElementById("qa-count").textContent, "Frage 2 von 3");
  // 10. Reload mitten im Gespräch: gleicher Stand, kein Ton von selbst
  const snap = snapshot(p.w);
  p.w.close();
  const r = boot({ ls: snap, config: { talk_delay_ms: 20 } });
  await wait(30);
  assert(visible(r.d, "s-qa"));
  assert.strictEqual(r.d.getElementById("qa-count").textContent, "Frage 2 von 3");
  assert.deepStrictEqual(r.spoken, [], "nach Reload kein automatischer Ton");
  r.d.getElementById("btn-qa-again").click();
  await wait(5);
  assert.deepStrictEqual(r.spoken, [text[exp[1]]], "dieselbe Frage 2 nach Reload");
  r.d.getElementById("btn-qa-next").click();
  assert.strictEqual(r.d.getElementById("qa-count").textContent, "Frage 3 von 3");
  assert.strictEqual(r.d.getElementById("btn-qa-next").textContent, "Weiter");
  // Ende: nach kurzer Pause erscheint "Gespräch läuft"
  r.d.getElementById("btn-qa-next").click();
  assert(!visible(r.d, "s-talk"));
  await wait(60);
  assert(visible(r.d, "s-talk"), "Gespräch-Seite nach Pause");
  assert(!visible(r.d, "s-qa"));
  r.w.close();

  // 2. n_questions = 2
  p = boot({ ls: lsFor(IDX.pause1), config: { n_questions: 2 } });
  await wait(30);
  p.d.getElementById("btn-begin").click();
  await wait(10);
  assert.strictEqual(p.d.getElementById("qa-count").textContent, "Frage 1 von 2");
  p.d.getElementById("btn-qa-next").click();
  assert.strictEqual(p.d.getElementById("btn-qa-next").textContent, "Weiter", "letzte von 2");
  assert.deepStrictEqual(p.spoken, Q.forBlock(CODE, seed, list, 1, 2).map((i) => text[i]));
  p.w.close();

  // Block 2 nutzt andere Fragen als Block 1
  const b2 = Q.forBlock(CODE, seed, list, 2, 3);
  assert(b2.every((i) => exp.indexOf(i) < 0));
  p = boot({ ls: lsFor(8), config: {} });
  await wait(30);
  p.d.getElementById("btn-begin").click();
  await wait(10);
  assert.deepStrictEqual(p.spoken, [text[b2[0]]]);
  p.w.close();

  // 3./8. Debug: Text nur mit ?debug=1
  p = boot({ ls: lsFor(IDX.pause1), search: "?debug=1" });
  await wait(30);
  p.d.getElementById("btn-begin").click();
  await wait(10);
  assert(p.d.body.textContent.includes(text[exp[0]]), "Debug zeigt Text");
  p.w.close();

  // 5. mp3: vorhandene Datei wird gespielt, fehlende fällt auf tts zurück (mit Konsolen-Log)
  p = boot({ ls: lsFor(IDX.pause1), config: { audio_mode: "mp3" }, mp3: [exp[0]] });
  await wait(30);
  p.d.getElementById("btn-begin").click();
  await wait(10);
  assert.deepStrictEqual(p.played, [exp[0]]);
  assert.deepStrictEqual(p.spoken, []);
  p.d.getElementById("btn-qa-next").click();
  await wait(10);
  assert.deepStrictEqual(p.spoken, [text[exp[1]]], "mp3 fehlt -> tts");
  assert(p.warns.some((m) => m.includes("Fallback auf tts") && m.includes(exp[1])), "Fallback in Konsole");
  p.w.close();

  // Fehlerfälle: Fragenpool nicht ladbar, keine deutsche Stimme -> Hinweis für die Versuchsleitung
  p = boot({ ls: lsFor(IDX.pause1), files404: ["data/questions.json"] });
  await wait(30);
  assert(visible(p.d, "qa-banner") === true && /Fragenpool/.test(p.d.getElementById("qa-banner").textContent));
  p.w.close();
  p = boot({ ls: lsFor(IDX.pause1), noVoice: true });
  await wait(4200);
  assert(!p.d.getElementById("qa-banner").hidden && /deutsche Stimme/.test(p.d.getElementById("qa-banner").textContent));
  p.w.close();

  console.log("page.test.js: ok");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
