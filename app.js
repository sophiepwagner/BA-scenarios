// Studienablauf auf dem Tablet: führt die Versuchsperson (Vp) durch Fragebögen und zwei Gespräche.
// Reines Vanilla-JS, kein Build. Diese Seite kennt die Bedingung (Teleprompter/Webcam) und die
// Reihenfolge gar nicht: Die Verteilung übernimmt ein separates Skript, die Zuordnung zum Code
// wird erst bei der Auswertung ergänzt. Gespräch 1 und 2 haben denselben Fragebogen.
// Den persönlichen Code gibt die Versuchsperson selbst ein. Weil er nicht eindeutig sein muss,
// läuft jede Sitzung intern unter einer eigenen Sitzungs-ID (sid).
(function () {
  "use strict";

  // ---------- Konfiguration ----------
  // Tally-Formular-IDs hier eintragen (die ID steht in der Tally-URL: tally.so/r/<ID>)
  var TALLY = {
    pre: "zENN9k",
    gespraech: "QoMe18", // wird nach Gespräch 1 und 2 verwendet (gespraech=1 bzw. 2)
    abschluss: "vXrrQD",
  };
  var TALLY_EMBED = "https://tally.so/embed/";
  var TALLY_SCRIPT = "https://tally.so/widgets/embed.js";
  var IFRAME_TIMEOUT_MS = 20000; // lädt der Fragebogen nicht, erscheint der Fallback-Knopf

  // Live-Status für die Versuchsleiterin (nur Anzeige im Controller, steuert nichts). Gesendet werden nur Schrittname,
  // Gesprächsnummer und Zeiten, nie Code, Sitzungs-ID, Antworten oder die Bedingung. Leerer Topic = Status aus.
  var STATUS_URL = "https://ntfy.sh/";
  var STATUS_TOPIC = "ba-status-b6a1fcb99a33e4d4f496"; // muss mit STATUS_TOPIC im Controller übereinstimmen
  var HEARTBEAT_S = 120; // so oft meldet sich die Seite, solange sie offen ist

  // ---------- Ablauf (Reihenfolge fix) ----------
  // g = Gespräch 1 oder 2, form = welches Tally-Formular
  var STATES = [
    { id: "start", screen: "s-start" },
    { id: "pre", screen: "s-pre", form: "pre" },
    { id: "sit1", screen: "s-sit", g: 1 },
    { id: "pause1", screen: "s-pause", g: 1 },
    { id: "qa1", screen: "s-qa", g: 1 },
    { id: "talk1", screen: "s-talk", g: 1 },
    { id: "fb1", screen: "s-fb", form: "gespraech", g: 1 },
    { id: "sit2", screen: "s-sit", g: 2 },
    { id: "pause2", screen: "s-pause", g: 2 },
    { id: "qa2", screen: "s-qa", g: 2 },
    { id: "talk2", screen: "s-talk", g: 2 },
    { id: "fb2", screen: "s-fb", form: "gespraech", g: 2 },
    { id: "done", screen: "s-done" },
    { id: "post", screen: "s-post", form: "abschluss" },
    { id: "end", screen: "s-end" },
  ];
  var LAST = STATES.length - 1;

  // Ablauf-Leiste oben: Abschnitte, in die die Zustände gruppiert werden
  var STEPS = ["Start", "Gespräch 1", "Gespräch 2", "Rückblick", "Fertig"];
  var STEP_OF = { pre: 0, sit1: 1, pause1: 1, qa1: 1, talk1: 1, fb1: 1, sit2: 2, pause2: 2, qa2: 2, talk2: 2, fb2: 2, done: 3, post: 3, end: 4 };

  function $(id) {
    return document.getElementById(id);
  }

  // ---------- Speicher (localStorage, mit Fallback im Arbeitsspeicher) ----------
  var mem = {};
  function lsGet(key) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? null : JSON.parse(v);
    } catch (e) {
      return key in mem ? JSON.parse(mem[key]) : null;
    }
  }
  function lsSet(key, value) {
    var s = JSON.stringify(value);
    mem[key] = s;
    try {
      localStorage.setItem(key, s);
    } catch (e) {}
  }
  function lsRemove(key) {
    delete mem[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
  var K_ACTIVE = "studie:active"; // Sitzungs-ID der laufenden Sitzung
  function kState(sid) {
    return "studie:" + sid + ":state";
  }
  function kLog(sid) {
    return "studie:" + sid + ":log";
  }
  function kSaved(sid) {
    return "studie:" + sid + ":saved"; // Zeitpunkt, zu dem das Log heruntergeladen wurde
  }
  // Eindeutige Sitzungs-ID (Zeitstempel + Zufall), unabhängig vom persönlichen Code
  function newSid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  // ---------- Zustand ----------
  var session = null; // { sid, code, index, enteredAt }
  var advanceTimer = null; // Timer für das automatische Weitergehen nach dem Absenden
  var iframeTimer = null; // Timer für den Lade-Fallback
  var submittedFor = -1; // Index, für den "FormSubmitted" schon verarbeitet wurde

  function validCode(c) {
    return /^[a-z0-9]{5}$/.test(c);
  }
  function cur() {
    return STATES[session ? session.index : 0];
  }

  // ---------- Log ----------
  // Jeder Zustandswechsel (und einige Ereignisse) wird mit Zeitstempel gespeichert.
  function logEntry(ereignis, index) {
    if (!session) return;
    var st = STATES[index === undefined ? session.index : index];
    var now = new Date();
    var log = lsGet(kLog(session.sid)) || [];
    log.push({
      sitzung: session.sid,
      code: session.code,
      zustand: st.id,
      gespraech: st.g || "",
      ts_iso: now.toISOString(), // UTC, mit Millisekunden
      ts_epoch_ms: now.getTime(),
      ereignis: ereignis,
    });
    lsSet(kLog(session.sid), log);
  }
  var LOG_COLS = ["sitzung", "code", "zustand", "gespraech", "ts_iso", "ts_epoch_ms", "ereignis"];
  function toCsv(log) {
    var rows = [LOG_COLS.join(",")];
    log.forEach(function (e) {
      rows.push(
        LOG_COLS.map(function (c) {
          var v = String(e[c] === undefined ? "" : e[c]);
          return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(","),
      );
    });
    return rows.join("\n");
  }
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
  }
  // Code einer gespeicherten Sitzung (aus dem Stand, sonst aus dem ersten Logeintrag)
  function codeOf(sid) {
    var st = lsGet(kState(sid));
    if (st && st.code) return st.code;
    var log = lsGet(kLog(sid)) || [];
    return log.length ? log[0].code : sid;
  }
  // Log einer Sitzung herunterladen und vermerken, dass es gesichert wurde
  function downloadLogFor(sid, kind) {
    var log = lsGet(kLog(sid)) || [];
    var base = "log_" + codeOf(sid) + "_" + new Date().toISOString().slice(0, 10);
    if (kind === "csv") download(base + ".csv", toCsv(log), "text/csv;charset=utf-8");
    else download(base + ".json", JSON.stringify(log, null, 2), "application/json");
    lsSet(kSaved(sid), Date.now());
    renderSessions();
    renderEndSave();
  }
  function downloadLog(kind) {
    if (session) downloadLogFor(session.sid, kind);
  }
  // CSV und JSON nacheinander (mit kurzer Pause, damit der Browser beide Downloads zulässt)
  function saveBoth(sid) {
    downloadLogFor(sid, "csv");
    setTimeout(function () {
      downloadLogFor(sid, "json");
    }, 400);
  }

  // ---------- Gespeicherte Sitzungen (Startseite, nur im Admin-Modus) ----------
  // Alle Sitzungs-IDs, zu denen ein Log im Speicher liegt
  function storedSids() {
    var ids = {};
    function add(k) {
      var m = /^studie:([a-z0-9]{5,}):log$/.exec(k);
      if (m) ids[m[1]] = true;
    }
    try {
      for (var i = 0; i < localStorage.length; i++) add(localStorage.key(i));
    } catch (e) {}
    Object.keys(mem).forEach(add);
    return Object.keys(ids);
  }
  function clock(ts) {
    return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  function sessionRows() {
    return storedSids()
      .map(function (sid) {
        var log = lsGet(kLog(sid)) || [];
        var st = lsGet(kState(sid));
        return {
          sid: sid,
          code: codeOf(sid),
          n: log.length,
          last: log.length ? log[log.length - 1].ts_epoch_ms : 0,
          idx: st ? st.index : 0,
          saved: lsGet(kSaved(sid)),
        };
      })
      .filter(function (r) {
        return r.n > 0;
      })
      .sort(function (a, b) {
        return b.last - a.last;
      });
  }
  function renderSessions() {
    var rows = sessionRows();
    // Die Codes anderer Personen sieht nur der Admin-Modus, nie die Versuchsperson
    $("sessions").hidden = !admin || !rows.length;
    var ul = $("sessions-list");
    ul.innerHTML = "";
    if (!admin) return;
    rows.forEach(function (r) {
      var li = document.createElement("li");
      var info = document.createElement("div");
      info.className = "sess-info";
      var code = document.createElement("span");
      code.className = "sess-code";
      code.textContent = r.code;
      var meta = document.createElement("span");
      meta.className = "sess-meta";
      meta.textContent =
        (r.idx === LAST ? "abgeschlossen" : "stand bei: " + ADMIN_LABEL[STATES[r.idx].id]) + " · " + r.n + " Einträge · " + clock(r.last);
      info.appendChild(code);
      info.appendChild(meta);
      var badge = document.createElement("span");
      badge.className = "badge " + (r.saved ? "ok" : "warn");
      badge.textContent = r.saved ? "Log gespeichert" : "Log noch nicht gespeichert";
      li.appendChild(info);
      li.appendChild(badge);
      ["csv", "json"].forEach(function (kind) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = kind.toUpperCase();
        b.addEventListener("click", function () {
          downloadLogFor(r.sid, kind);
        });
        li.appendChild(b);
      });
      ul.appendChild(li);
    });
  }
  // Endseite (nur Admin): Kasten zum Sichern des Logs mit Statuszeile
  function renderEndSave() {
    var box = $("end-save");
    var show = admin && session && cur().id === "end";
    box.hidden = !show;
    if (!show) return;
    var saved = lsGet(kSaved(session.sid));
    $("end-save-status").textContent = saved ? "Gespeichert um " + clock(saved) + " Uhr." : "Noch nicht gespeichert.";
    box.classList.toggle("unsaved", !saved);
  }

  // ---------- Live-Status (nur Anzeige) ----------
  // Feuer-und-vergessen: Fehler (kein Netz, Dienst down) werden verschluckt und beeinflussen den Ablauf nie.
  function publishStatus(heartbeat) {
    if (!STATUS_TOPIC || admin || !session || session.index < 1) return;
    var st = cur();
    var body = JSON.stringify({
      t: "state",
      step: st.id,
      g: st.g || 0,
      ts: Date.now(),
      entered: session.enteredAt || Date.now(),
      hb: !!heartbeat,
    });
    try {
      fetch(STATUS_URL + STATUS_TOPIC, { method: "POST", body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  setInterval(function () {
    if (session && session.index > 0 && session.index < LAST) publishStatus(true);
  }, HEARTBEAT_S * 1000);

  // ---------- Wechsel zwischen Zuständen ----------
  function clearTimers() {
    clearTimeout(advanceTimer);
    clearTimeout(iframeTimer);
    advanceTimer = null;
    iframeTimer = null;
  }
  function go(index, ereignis) {
    clearTimers();
    session.index = index;
    session.enteredAt = Date.now(); // Beginn dieser Seite (Zeitanzeige im Admin-Bereich)
    lsSet(kState(session.sid), session);
    // Am Ende ist die Sitzung nicht mehr "aktiv": das nächste Öffnen zeigt wieder die Startseite
    if (index === LAST) lsRemove(K_ACTIVE);
    else lsSet(K_ACTIVE, session.sid);
    logEntry(ereignis || "wechsel");
    publishStatus(false);
    qaFresh = true;
    render();
  }
  function next(ereignis) {
    if (session && session.index < LAST) go(session.index + 1, ereignis);
  }

  // ---------- Anzeige ----------
  var SCREENS = ["s-start", "s-confirm", "s-pre", "s-fb", "s-post", "s-sit", "s-pause", "s-qa", "s-talk", "s-done", "s-end"];
  function render() {
    var st = cur();
    SCREENS.forEach(function (id) {
      $(id).hidden = id !== st.screen;
    });
    document.body.classList.toggle("dark", st.id === "talk1" || st.id === "talk2" || st.screen === "s-qa");
    renderSteps(st);
    window.scrollTo(0, 0);
    if (st.screen === "s-sit") {
      $("sit-eyebrow").textContent = "Gespräch " + st.g;
      fillScenario(st.g);
    }
    if (st.screen === "s-qa") enterQa();
    else QAudio.stop();
    if (st.screen === "s-pause") $("pause-nr").textContent = st.g === 1 ? "erste" : "zweite";
    if (st.form) buildTally(st);
    if (st.id === "start") renderSessions();
    renderAdmin();
  }

  // ---------- Einstiegsfragen (nach "Ich bin bereit", vor dem Gespräch) ----------
  // Die Fragen werden nur vorgelesen. Auf dem Bildschirm steht "Frage 1 von 3", der Text nur im Debug-Modus.
  // Nach jeder Frage wartet die Seite, bis die Vp (oder die Versuchsleiterin) "Weiter" tippt. Kein Timer.
  var CFG = window.CONFIG || {};
  var QA = { list: null, seed: null, byId: {}, error: null, ready: null };
  var qaFresh = false; // true = Zustand wurde gerade durch eine Berührung erreicht (Ton darf starten)
  var qaTextTimer = null;
  function debugOn() {
    return params.get("debug") === "1" || CFG.debug === true;
  }
  function nQuestions() {
    return CFG.n_questions === 2 ? 2 : 3;
  }
  function showBanner(msg) {
    var b = $("qa-banner");
    b.textContent = "Technischer Hinweis (für die Versuchsleitung, nicht für die Vp): " + msg;
    b.hidden = false;
  }
  function loadQuestionData() {
    function j(url) {
      return fetch(url, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error(url + " konnte nicht geladen werden (HTTP " + r.status + ")");
        return r.json();
      });
    }
    QA.ready = Promise.all([j("data/questions.json"), j("data/draw.json")])
      .then(function (res) {
        QA.list = res[0];
        QA.seed = res[1].seed;
        res[0].forEach(function (q) {
          QA.byId[q.id] = q;
        });
      })
      .catch(function (e) {
        QA.error = String((e && e.message) || e);
        showBanner("Fragenpool nicht geladen: " + QA.error);
      });
    var mp3 = CFG.audio_mode === "mp3";
    QAudio.init(4000).then(function (r) {
      if (!r.ok) {
        console.warn("[audio] " + r.message);
        if (!mp3) showBanner(r.message);
      } else console.log("[audio] Stimme: " + r.voice);
    });
  }
  function qaIds() {
    return QUESTIONS.forBlock(session.code, QA.seed, QA.list, cur().g, nQuestions());
  }
  function enterQa() {
    var idx = session.index;
    var fresh = qaFresh;
    qaFresh = false;
    $("s-qa").classList.remove("ending");
    $("btn-qa-next").disabled = false;
    QA.ready.then(function () {
      if (!session || session.index !== idx) return;
      if (QA.error) return;
      if (session.qaFor !== idx) {
        session.qaFor = idx;
        session.qi = 0;
        session.replays = {};
        lsSet(kState(session.sid), session);
        logEntry("fragen_zugewiesen:" + qaIds().join("|"));
      }
      showQuestion(fresh ? "frage_gestellt" : null);
    });
  }
  // Zeigt den Zähler (und im Debug den Text) und spielt die Frage ab, wenn ein Ereignisname übergeben wird
  function showQuestion(ereignis) {
    var ids = qaIds();
    var qi = Math.min(session.qi || 0, ids.length - 1);
    var q = QA.byId[ids[qi]];
    $("qa-count").textContent = "Frage " + (qi + 1) + " von " + ids.length;
    $("btn-qa-next").textContent = qi < ids.length - 1 ? "Nächste Frage" : "Weiter";
    var wrap = $("qa-text-wrap");
    clearTimeout(qaTextTimer);
    wrap.innerHTML = "";
    var secs = Number(CFG.question_display_seconds) || 0;
    if (debugOn() || secs > 0) {
      var p = document.createElement("p");
      p.className = "qa-debug-text";
      p.textContent = q.id + ": " + q.text;
      wrap.appendChild(p);
      if (!debugOn()) qaTextTimer = setTimeout(function () { wrap.innerHTML = ""; }, secs * 1000);
    }
    if (ereignis) playQuestion(q, ereignis);
  }
  function playQuestion(q, ereignis) {
    var icon = $("qa-icon");
    icon.classList.add("speaking");
    var idx = session.index;
    QAudio.speak(q)
      .then(function (kind) {
        console.log("[audio] " + q.id + " gespielt über " + kind);
      })
      .catch(function (e) {
        logEntry("audio_fehler:" + q.id);
        showBanner("Ton für " + q.id + " fehlgeschlagen: " + ((e && e.message) || e));
      })
      .then(function () {
        if (session && session.index === idx) icon.classList.remove("speaking");
      });
    logEntry(ereignis + ":" + q.id);
  }
  $("btn-qa-again").addEventListener("click", function () {
    if (!session || cur().screen !== "s-qa" || QA.error) return;
    var ids = qaIds();
    var q = QA.byId[ids[Math.min(session.qi || 0, ids.length - 1)]];
    session.replays = session.replays || {};
    session.replays[q.id] = (session.replays[q.id] || 0) + 1;
    lsSet(kState(session.sid), session);
    playQuestion(q, "frage_nochmal_" + session.replays[q.id] + "x");
  });
  $("btn-qa-next").addEventListener("click", function () {
    if (!session || cur().screen !== "s-qa") return;
    var ids = qaIds();
    if ((session.qi || 0) < ids.length - 1) {
      session.qi = (session.qi || 0) + 1;
      lsSet(kState(session.sid), session);
      showQuestion("frage_gestellt");
      return;
    }
    // Letzte Frage beantwortet: kurz ruhig bleiben, dann erscheint "Gespräch läuft"
    QAudio.stop();
    $("btn-qa-next").disabled = true;
    $("s-qa").classList.add("ending");
    logEntry("fragen_ende");
    var idx = session.index;
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(function () {
      if (session && session.index === idx) next("qa_ende");
    }, Number(CFG.talk_delay_ms) || 1500);
  });

  // ---------- Situation und Gegenstände (eigene Seite vor jedem Gespräch) ----------
  var TAKE = 5; // so viele Gegenstände dürfen mitgenommen werden
  var SCENARIO_OF_G = { 1: "desert", 2: "cabin" }; // Gespräch 1 und 2 haben je ein festes Szenario
  var ROLE = "b"; // Versuchsperson (a wäre die Gesprächspartnerin)
  function fillScenario(g) {
    var sc = window.SCENARIOS && window.SCENARIOS[SCENARIO_OF_G[g]];
    var list = $("sc-items");
    list.innerHTML = "";
    if (!sc) return;
    var mine = sc.items[ROLE];
    var total = sc.items.a.length + sc.items.b.length;
    $("sc-title").textContent = sc.title;
    $("sc-intro").textContent = sc.intro;
    $("sc-task").textContent =
      "Ihr könnt von euren insgesamt " + total + " Gegenständen nur " + TAKE + " mitnehmen. Jede Person hat " + mine.length +
      " davon. Besprecht gemeinsam, welche " + TAKE + " ihr mitnehmt und warum. Ihr müsst euch am Ende einig sein.";
    mine.forEach(function (it) {
      list.appendChild(itemEl(it));
    });
    // Admin: zusätzlich die Gegenstände der Gesprächspartnerin (Sichtbarkeit steuert renderAdmin)
    var listA = $("sc-items-a");
    listA.innerHTML = "";
    sc.items.a.forEach(function (it) {
      listA.appendChild(itemEl(it));
    });
  }
  // Ein Gegenstand als Listeneintrag (Icon, Name, Hinweis)
  function itemEl(it) {
    var li = document.createElement("li");
    var ic = document.createElement("div");
    ic.className = "icon";
    ic.innerHTML = (window.ICONS && window.ICONS[it.icon]) || "";
    var tx = document.createElement("div");
    var n = document.createElement("span");
    n.className = "name";
    n.textContent = it.name;
    var d = document.createElement("span");
    d.className = "note";
    d.textContent = it.note;
    tx.appendChild(n);
    tx.appendChild(d);
    li.appendChild(ic);
    li.appendChild(tx);
    return li;
  }

  // Leiste: aktueller Abschnitt hervorgehoben, erledigte dezent. Auf der Startseite und im dunklen Gespräch ausgeblendet.
  function renderSteps(st) {
    var ol = $("steps");
    var cur = STEP_OF[st.id];
    ol.hidden = cur === undefined || st.id === "talk1" || st.id === "talk2" || st.screen === "s-qa";
    if (ol.hidden) return;
    if (!ol.children.length) {
      STEPS.forEach(function (label) {
        var li = document.createElement("li");
        li.textContent = label;
        ol.appendChild(li);
      });
    }
    Array.prototype.forEach.call(ol.children, function (li, i) {
      li.classList.toggle("done", i < cur);
      li.classList.toggle("current", i === cur);
      if (i === cur) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
  }

  // ---------- Tally ----------
  function tallyUrl(st) {
    var q = ["alignLeft=1", "hideTitle=1", "transparentBackground=1", "dynamicHeight=1", "code=" + encodeURIComponent(session.code)];
    // Optionales Hidden Field "sitzung": eindeutige ID dieser Sitzung (falls zwei Personen denselben Code haben)
    q.push("sitzung=" + encodeURIComponent(session.sid));
    // Nur der Gespräch-Fragebogen bekommt zusätzlich die Gesprächsnummer
    if (st.form === "gespraech") q.push("gespraech=" + st.g);
    return TALLY_EMBED + encodeURIComponent(TALLY[st.form]) + "?" + q.join("&");
  }

  var tallyScript = "idle"; // idle | loading | ok | error
  var tallyWaiting = [];
  function ensureTallyScript(cb) {
    if (tallyScript === "ok" || tallyScript === "error") return cb(tallyScript === "ok");
    tallyWaiting.push(cb);
    if (tallyScript === "loading") return;
    tallyScript = "loading";
    var s = document.createElement("script");
    s.src = TALLY_SCRIPT;
    s.async = true;
    s.onload = function () {
      tallyScript = "ok";
      flush(true);
    };
    s.onerror = function () {
      tallyScript = "error";
      flush(false);
    };
    document.head.appendChild(s);
    function flush(ok) {
      var list = tallyWaiting;
      tallyWaiting = [];
      list.forEach(function (f) {
        f(ok);
      });
    }
  }

  function buildTally(st) {
    var screen = $(st.screen);
    var wrap = screen.querySelector(".tally-wrap");
    var fb = screen.querySelector(".fallback");
    var idx = session.index;
    wrap.innerHTML = "";
    fb.hidden = true;
    submittedFor = -1;

    // Testmodus: Ist noch keine echte Tally-ID eingetragen, steht ein Hinweis da und "Weiter" ist sofort sichtbar
    var placeholder = /^FORMID_/.test(TALLY[st.form]);
    wrap.classList.toggle("placeholder", placeholder);
    if (placeholder) {
      var note = document.createElement("p");
      note.className = "hint";
      note.textContent = "Testmodus: Für diesen Fragebogen ist noch keine Tally-ID eingetragen (" + TALLY[st.form] + "). Mit „Weiter“ geht es im Ablauf weiter.";
      wrap.appendChild(note);
    }

    var url = tallyUrl(st);
    var iframe = document.createElement("iframe");
    iframe.setAttribute("data-tally-src", url); // Tally.loadEmbeds() setzt daraus den src
    iframe.setAttribute("title", "Fragebogen");
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "600");
    iframe.setAttribute("frameborder", "0");
    iframe.addEventListener("load", function () {
      // Das erste load-Ereignis eines iframes ohne src (about:blank) zählt nicht
      if (iframe.getAttribute("src")) clearTimeout(iframeTimer);
    });
    wrap.appendChild(iframe);

    function showFallback() {
      if (session && session.index === idx) fb.hidden = false;
    }
    // Lädt der Fragebogen nicht, bekommt nur die Versuchsleiterin (Admin) einen Notfall-Weiter-Knopf
    function showFallbackAdmin() {
      if (admin) showFallback();
    }
    if (placeholder) showFallback();
    ensureTallyScript(function (ok) {
      if (!session || session.index !== idx) return;
      if (ok && window.Tally && typeof window.Tally.loadEmbeds === "function") {
        window.Tally.loadEmbeds();
      } else {
        iframe.setAttribute("src", url); // ohne Tally-Script: direkt laden
        showFallbackAdmin();
      }
    });
    iframeTimer = setTimeout(showFallbackAdmin, IFRAME_TIMEOUT_MS);
  }
  ["s-pre", "s-fb", "s-post"].forEach(function (id) {
    $(id).querySelector(".fallback").addEventListener("click", function () {
      next("weiter_manuell");
    });
  });

  // Tally meldet das Absenden per postMessage ("Tally.FormSubmitted"), als String oder Objekt
  window.addEventListener("message", function (e) {
    if (!session) return;
    var st = cur();
    if (!st.form) return;
    var iframe = $(st.screen).querySelector("iframe");
    var fromTally = /(^|\.)tally\.so$/.test((e.origin || "").replace(/^https?:\/\//, ""));
    var fromFrame = iframe && iframe.contentWindow && e.source === iframe.contentWindow;
    if (!fromTally && !fromFrame) return;
    var text;
    try {
      text = typeof e.data === "string" ? e.data : JSON.stringify(e.data);
    } catch (err) {
      return;
    }
    if (!text || text.indexOf("Tally.FormSubmitted") === -1) return;
    if (submittedFor === session.index) return; // nur einmal pro Zustand
    submittedFor = session.index;
    logEntry("form_abgesendet");
    // Kein automatisches Weiterspringen: die letzte Seite des Fragebogens bleibt sichtbar, Weiter erscheint erst jetzt
    $(st.screen).querySelector(".fallback").hidden = false;
  });

  // ---------- Start: die Versuchsperson gibt ihren persönlichen Code ein ----------
  function startSession(code) {
    session = { sid: newSid(), code: code, index: 0 };
    lsSet(K_ACTIVE, session.sid);
    lsSet(kState(session.sid), session);
    logEntry("sitzung_gestartet", 0);
    go(1);
  }
  $("in-code").addEventListener("input", function () {
    this.value = this.value.toLowerCase().replace(/[^a-z0-9]/g, "");
  });
  $("start-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var code = $("in-code").value.trim().toLowerCase();
    var err = $("start-error");
    err.hidden = true;
    if (!validCode(code)) {
      err.textContent = "Der Code muss aus genau 5 Zeichen bestehen (Buchstaben und Ziffern).";
      err.hidden = false;
      return;
    }
    showConfirm(code);
  });

  // Bestätigung vor dem Start, damit kein Tippfehler im Code stehen bleibt
  var pendingCode = null;
  function showConfirm(code) {
    pendingCode = code;
    $("confirm-code").textContent = code;
    // Hinweis auf ungespeicherte Logs nur im Admin-Modus (die Vp soll keine fremden Codes sehen)
    var warn = $("confirm-warn");
    var open = admin
      ? sessionRows().filter(function (r) {
          return r.code !== "test0" && !r.saved;
        })
      : [];
    warn.hidden = !open.length;
    if (open.length) {
      warn.textContent =
        "Hinweis: Das Log von " +
        open
          .map(function (r) {
            return r.code;
          })
          .join(", ") +
        " ist noch nicht gespeichert. Du findest es später auf der Startseite unter „Gespeicherte Sitzungen“.";
    }
    $("s-start").hidden = true;
    $("s-confirm").hidden = false;
  }
  $("btn-confirm-no").addEventListener("click", function () {
    pendingCode = null;
    $("s-confirm").hidden = true;
    $("s-start").hidden = false;
    $("in-code").focus();
  });
  $("btn-confirm-yes").addEventListener("click", function () {
    var code = pendingCode;
    pendingCode = null;
    if (!code) return;
    requestWake();
    startSession(code);
  });

  // ---------- Gespräch beenden: einfacher Tipp ----------
  $("btn-end").addEventListener("click", function () {
    next();
  });

  // ---------- Weitere Knöpfe ----------
  $("btn-sit").addEventListener("click", function () {
    next();
  });
  $("btn-begin").addEventListener("click", function () {
    next();
  });
  $("btn-done").addEventListener("click", function () {
    next();
  });

  // ---------- Admin (Versuchsleiterin) ----------
  var params = new URLSearchParams(location.search);
  var admin = params.get("admin") === "1";
  // Namen der Seiten für die Sprung-Auswahl (nur Admin, zum Testen)
  var JUMP_LABELS = {
    pre: "Fragebogen vorher",
    sit1: "Situation + Gegenstände 1",
    pause1: "STOPP-Seite 1",
    qa1: "Einstiegsfragen 1",
    talk1: "Gespräch 1 (dunkel)",
    fb1: "Fragebogen nach Gespräch 1",
    sit2: "Situation + Gegenstände 2",
    pause2: "STOPP-Seite 2",
    qa2: "Einstiegsfragen 2",
    talk2: "Gespräch 2 (dunkel)",
    fb2: "Fragebogen nach Gespräch 2",
    done: "Geschafft",
    post: "Abschlussfragebogen",
    end: "Ende",
  };
  // Kurznamen für die Anzeige in der Admin-Leiste und der Sitzungsliste
  var ADMIN_LABEL = {
    start: "Start",
    pre: "Fragebogen vorher",
    sit1: "Situation 1",
    pause1: "STOPP 1",
    qa1: "Einstiegsfragen 1",
    talk1: "Gespräch 1",
    fb1: "Fragebogen 1",
    sit2: "Situation 2",
    pause2: "STOPP 2",
    qa2: "Einstiegsfragen 2",
    talk2: "Gespräch 2",
    fb2: "Fragebogen 2",
    done: "Geschafft",
    post: "Abschlussfragebogen",
    end: "Ende",
  };
  function fmtDur(ms) {
    var sec = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
  }
  // Zeile in der Admin-Leiste: Code, aktuelle Seite und wie lange sie schon läuft (nur hier, nie bei der Vp)
  function adminInfo() {
    if (!session) return "keine Sitzung";
    var t = "Code " + session.code + " · " + ADMIN_LABEL[cur().id];
    if (session.index > 0 && session.index < LAST && session.enteredAt) t += " · " + fmtDur(Date.now() - session.enteredAt);
    return t;
  }
  setInterval(function () {
    if (admin && session) $("admin-info").textContent = adminInfo();
  }, 1000);
  var jumpSelect = $("admin-jump");
  STATES.forEach(function (st, i) {
    if (i === 0) return;
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = i + ". " + JUMP_LABELS[st.id];
    jumpSelect.appendChild(o);
  });
  // Springen: ohne Sitzung wird eine Testsitzung (Code test0) angelegt
  function jumpTo(index) {
    if (!session) {
      var existing = lsGet(kState("test0"));
      session = existing || { sid: "test0", code: "test0", index: 0 };
      session.sid = "test0";
      lsSet(K_ACTIVE, session.sid);
      if (!existing) lsSet(kState(session.sid), session);
    }
    if (index < 1 || index > LAST) return;
    requestWake();
    go(index, "sprung_admin");
  }
  jumpSelect.addEventListener("change", function () {
    jumpTo(parseInt(jumpSelect.value, 10));
  });
  // Zur Startseite (mit Sitzungsliste): die Sitzung bleibt gespeichert, nur "aktiv" wird sie nicht mehr
  function goHome() {
    clearTimeout(advanceTimer);
    clearTimeout(iframeTimer);
    lsRemove(K_ACTIVE);
    session = null;
    $("s-confirm").hidden = true;
    render();
  }
  $("btn-home").addEventListener("click", goHome);
  $("btn-prev").addEventListener("click", function () {
    if (!session) return;
    if (session.index <= 1) goHome();
    else jumpTo(session.index - 1);
  });
  $("btn-next").addEventListener("click", function () {
    jumpTo(session ? Math.min(LAST, session.index + 1) : 1);
  });
  // Admin: Übersicht beider Szenarien mit den Gegenständen von Vp und Gesprächspartnerin
  var scenBuilt = false;
  function buildAdminScenarios() {
    if (scenBuilt) return;
    scenBuilt = true;
    var body = $("admin-scen-body");
    [1, 2].forEach(function (g) {
      var sc = window.SCENARIOS && window.SCENARIOS[SCENARIO_OF_G[g]];
      if (!sc) return;
      var box = document.createElement("section");
      box.className = "scen-box";
      var h = document.createElement("h2");
      h.textContent = "Gespräch " + g + ": " + sc.title;
      var p = document.createElement("p");
      p.textContent = sc.intro;
      box.appendChild(h);
      box.appendChild(p);
      var cols = document.createElement("div");
      cols.className = "scen-cols";
      [["b", "Versuchsperson (Tablet)"], ["a", "Gesprächspartnerin (du)"]].forEach(function (r) {
        var col = document.createElement("div");
        var h3 = document.createElement("h3");
        h3.textContent = r[1];
        var ul = document.createElement("ul");
        ul.className = "items";
        sc.items[r[0]].forEach(function (it) {
          ul.appendChild(itemEl(it));
        });
        col.appendChild(h3);
        col.appendChild(ul);
        cols.appendChild(col);
      });
      box.appendChild(cols);
      body.appendChild(box);
    });
  }
  $("btn-scen").addEventListener("click", function () {
    buildAdminScenarios();
    $("admin-scen").hidden = false;
    $("admin-scen").scrollTop = 0;
  });
  $("btn-scen-close").addEventListener("click", function () {
    $("admin-scen").hidden = true;
  });
  function renderAdmin() {
    $("admin").hidden = !admin;
    $("sc-admin").hidden = !admin;
    if (!admin) $("admin-scen").hidden = true;
    if (!admin) {
      if (cur().id === "start") renderSessions();
      return;
    }
    $("admin-info").textContent = adminInfo();
    if (cur().id === "start") renderSessions();
    $("btn-csv").disabled = $("btn-json").disabled = $("btn-reset").disabled = !session;
    jumpSelect.value = session && session.index > 0 ? String(session.index) : "";
    renderEndSave();
  }
  window.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.altKey && (e.key === "l" || e.key === "L" || e.code === "KeyL")) {
      e.preventDefault();
      admin = !admin;
      renderAdmin();
    }
  });
  $("btn-csv").addEventListener("click", function () {
    downloadLog("csv");
  });
  $("btn-json").addEventListener("click", function () {
    downloadLog("json");
  });
  $("btn-end-save").addEventListener("click", function () {
    if (session) saveBoth(session.sid);
  });
  $("btn-reset").addEventListener("click", function () {
    if (!session) return;
    if (!window.confirm("Sitzung " + session.code + " zurücksetzen? Fortschritt UND Log werden gelöscht. Bitte vorher das Log herunterladen.")) return;
    lsRemove(kState(session.sid));
    lsRemove(kLog(session.sid));
    lsRemove(kSaved(session.sid));
    lsRemove(K_ACTIVE);
    session = null;
    window.__noGuard = true;
    location.href = location.pathname + (admin ? "?admin=1" : "");
  });

  // ---------- Tablet: Wake Lock, kein Zoomen, Schutz vor Verlassen ----------
  var wakeLock = null;
  function requestWake() {
    try {
      if (!navigator.wakeLock || wakeLock || document.visibilityState !== "visible") return;
      navigator.wakeLock
        .request("screen")
        .then(function (lock) {
          wakeLock = lock;
          lock.addEventListener("release", function () {
            wakeLock = null;
          });
        })
        .catch(function () {});
    } catch (e) {}
  }
  document.addEventListener("pointerdown", requestWake);
  ["click", "touchend"].forEach(function (t) {
    document.addEventListener(t, function () {
      QAudio.unlock();
    });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") requestWake();
  });
  document.addEventListener("gesturestart", function (e) {
    e.preventDefault(); // iOS: Pinch-Zoom
  });
  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
  document.addEventListener(
    "wheel",
    function (e) {
      if (e.ctrlKey) e.preventDefault(); // Strg + Mausrad / Trackpad-Pinch
    },
    { passive: false },
  );
  document.addEventListener("contextmenu", function (e) {
    var t = e.target && e.target.tagName;
    if (t !== "INPUT" && t !== "TEXTAREA") e.preventDefault();
  });
  // Warnung vor versehentlichem Neuladen/Schließen, solange die Sitzung läuft
  window.addEventListener("beforeunload", function (e) {
    if (window.__noGuard || !session || session.index === 0 || session.index === LAST) return;
    e.preventDefault();
    e.returnValue = "";
  });

  // ---------- Beim Laden ----------
  document.title = "Studie";
  loadQuestionData();
  (function init() {
    // Laufende Sitzung fortsetzen (Neuladen), sonst Startseite. Fertige Sitzungen werden nicht wieder aktiv.
    var sid = lsGet(K_ACTIVE);
    var stored = sid ? lsGet(kState(sid)) : null;
    if (stored && validCode(stored.code) && STATES[stored.index]) {
      session = stored;
      session.sid = session.sid || sid; // ältere Stände hatten keine eigene ID
      if (session.index !== LAST) {
        lsSet(K_ACTIVE, session.sid);
        logEntry("neu_geladen");
        publishStatus(false);
      }
    }
    render();
  })();
  // Platz unter dem Inhalt für die Admin-Leiste (Höhe ändert sich beim Umbrechen)
  (function () {
    var bar = $("admin");
    function sync() {
      document.documentElement.style.setProperty("--admin-h", bar.hidden ? "0px" : bar.offsetHeight + 4 + "px");
    }
    if (window.ResizeObserver) new ResizeObserver(sync).observe(bar);
    new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ["hidden"] });
    window.addEventListener("resize", sync);
    sync();
  })();
})();
