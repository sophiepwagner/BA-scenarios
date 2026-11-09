// Studienablauf auf dem Tablet: führt die Versuchsperson (Vp) durch Fragebögen und zwei Gespräche.
// Reines Vanilla-JS, kein Build. Diese Seite kennt die Bedingung (Teleprompter/Webcam) und die
// Reihenfolge gar nicht: Die Verteilung übernimmt ein separates Skript, die Zuordnung zum Code
// wird erst bei der Auswertung ergänzt. Gespräch 1 und 2 haben denselben Fragebogen.
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
  var HOLD_MS = 2000; // so lange muss "Gespräch ist beendet" gedrückt werden
  var ADVANCE_MS = 1500; // Wartezeit nach dem Absenden eines Fragebogens bis zum nächsten Schritt
  var IFRAME_TIMEOUT_MS = 20000; // lädt der Fragebogen nicht, erscheint der Fallback-Knopf
  var RING_LEN = 163.36; // Umfang des Fortschrittsrings (2 * PI * 26), passt zu style.css

  // ---------- Ablauf (Reihenfolge fix) ----------
  // g = Gespräch 1 oder 2, form = welches Tally-Formular
  var STATES = [
    { id: "start", screen: "s-start" },
    { id: "pre", screen: "s-pre", form: "pre" },
    { id: "sit1", screen: "s-sit", g: 1 },
    { id: "pause1", screen: "s-pause", g: 1 },
    { id: "talk1", screen: "s-talk", g: 1 },
    { id: "fb1", screen: "s-fb", form: "gespraech", g: 1 },
    { id: "sit2", screen: "s-sit", g: 2 },
    { id: "pause2", screen: "s-pause", g: 2 },
    { id: "talk2", screen: "s-talk", g: 2 },
    { id: "fb2", screen: "s-fb", form: "gespraech", g: 2 },
    { id: "done", screen: "s-done" },
    { id: "post", screen: "s-post", form: "abschluss" },
    { id: "end", screen: "s-end" },
  ];
  var LAST = STATES.length - 1;

  // Ablauf-Leiste oben: Abschnitte, in die die Zustände gruppiert werden
  var STEPS = ["Fragebogen vorher", "Gespräch 1", "Gespräch 2", "Abschluss", "Ende"];
  var STEP_OF = { pre: 0, sit1: 1, pause1: 1, talk1: 1, fb1: 1, sit2: 2, pause2: 2, talk2: 2, fb2: 2, done: 3, post: 3, end: 4 };

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
  var K_ACTIVE = "studie:active";
  function kState(code) {
    return "studie:" + code + ":state";
  }
  function kLog(code) {
    return "studie:" + code + ":log";
  }

  // ---------- Zustand ----------
  var session = null; // { code, index }
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
    var log = lsGet(kLog(session.code)) || [];
    log.push({
      code: session.code,
      zustand: st.id,
      gespraech: st.g || "",
      ts_iso: now.toISOString(), // UTC, mit Millisekunden
      ts_epoch_ms: now.getTime(),
      ereignis: ereignis,
    });
    lsSet(kLog(session.code), log);
  }
  var LOG_COLS = ["code", "zustand", "gespraech", "ts_iso", "ts_epoch_ms", "ereignis"];
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
  function downloadLog(kind) {
    if (!session) return;
    var log = lsGet(kLog(session.code)) || [];
    var base = "log_" + session.code + "_" + new Date().toISOString().slice(0, 10);
    if (kind === "csv") download(base + ".csv", toCsv(log), "text/csv;charset=utf-8");
    else download(base + ".json", JSON.stringify(log, null, 2), "application/json");
  }

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
    lsSet(kState(session.code), session);
    logEntry(ereignis || "wechsel");
    render();
  }
  function next(ereignis) {
    if (session && session.index < LAST) go(session.index + 1, ereignis);
  }

  // ---------- Anzeige ----------
  var SCREENS = ["s-start", "s-pre", "s-fb", "s-post", "s-sit", "s-pause", "s-talk", "s-done", "s-end"];
  function render() {
    var st = cur();
    SCREENS.forEach(function (id) {
      $(id).hidden = id !== st.screen;
    });
    document.body.classList.toggle("dark", st.id === "talk1" || st.id === "talk2");
    renderSteps(st);
    window.scrollTo(0, 0);
    if (st.screen === "s-sit") {
      $("sit-eyebrow").textContent = "Gespräch " + st.g;
      fillScenario(st.g);
    }
    if (st.screen === "s-pause") $("pause-nr").textContent = st.g === 1 ? "erste" : "zweite";
    if (st.screen === "s-talk") resetHold();
    if (st.form) buildTally(st);
    renderAdmin();
  }

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
    ol.hidden = cur === undefined || st.id === "talk1" || st.id === "talk2";
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
    if (placeholder) showFallback();
    ensureTallyScript(function (ok) {
      if (!session || session.index !== idx) return;
      if (ok && window.Tally && typeof window.Tally.loadEmbeds === "function") {
        window.Tally.loadEmbeds();
      } else {
        iframe.setAttribute("src", url); // ohne Tally-Script: direkt laden
        showFallback();
      }
    });
    iframeTimer = setTimeout(showFallback, IFRAME_TIMEOUT_MS);
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
    var idx = session.index;
    logEntry("form_abgesendet");
    advanceTimer = setTimeout(function () {
      if (session && session.index === idx) next();
    }, ADVANCE_MS);
  });

  // ---------- Start (Versuchsleiterin) ----------
  function startSession(code) {
    session = { code: code, index: 0 };
    lsSet(K_ACTIVE, code);
    lsSet(kState(code), session);
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
      err.textContent = "Der Code muss aus genau 5 Zeichen bestehen (Kleinbuchstaben und Ziffern).";
      err.hidden = false;
      return;
    }
    if (lsGet(kState(code))) {
      err.textContent = "Für diesen Code gibt es schon eine Sitzung. Zum Neustart im Admin-Bereich zurücksetzen.";
      err.hidden = false;
      return;
    }
    requestWake();
    startSession(code);
  });

  // ---------- Gespräch beenden: 2 Sekunden gedrückt halten ----------
  var btnEnd = $("btn-end");
  var ringFg = $("ring-fg");
  var holdT0 = 0;
  var holdRaf = 0;
  var holding = false;
  function setRing(p) {
    ringFg.style.strokeDashoffset = String(RING_LEN * (1 - p));
  }
  function resetHold() {
    holding = false;
    cancelAnimationFrame(holdRaf);
    setRing(0);
  }
  function holdTick() {
    if (!holding) return;
    var p = Math.min(1, (performance.now() - holdT0) / HOLD_MS);
    setRing(p);
    if (p >= 1) {
      resetHold();
      next();
    } else {
      holdRaf = requestAnimationFrame(holdTick);
    }
  }
  btnEnd.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (holding) return;
    holding = true;
    holdT0 = performance.now();
    holdRaf = requestAnimationFrame(holdTick);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    btnEnd.addEventListener(ev, resetHold);
  });
  // Finger rutscht vom Knopf (bei Touch gibt es kein pointerleave): abbrechen
  btnEnd.addEventListener("pointermove", function (e) {
    if (!holding) return;
    var r = btnEnd.getBoundingClientRect();
    var m = 16;
    if (e.clientX < r.left - m || e.clientX > r.right + m || e.clientY < r.top - m || e.clientY > r.bottom + m) resetHold();
  });
  btnEnd.addEventListener("contextmenu", function (e) {
    e.preventDefault();
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
    talk1: "Gespräch 1 (dunkel)",
    fb1: "Fragebogen nach Gespräch 1",
    sit2: "Situation + Gegenstände 2",
    pause2: "STOPP-Seite 2",
    talk2: "Gespräch 2 (dunkel)",
    fb2: "Fragebogen nach Gespräch 2",
    done: "Geschafft (Brustgurt)",
    post: "Abschlussfragebogen",
    end: "Ende",
  };
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
      session = existing || { code: "test0", index: 0 };
      lsSet(K_ACTIVE, session.code);
      if (!existing) lsSet(kState(session.code), session);
    }
    if (index < 1 || index > LAST) return;
    requestWake();
    go(index, "sprung_admin");
  }
  jumpSelect.addEventListener("change", function () {
    jumpTo(parseInt(jumpSelect.value, 10));
  });
  $("btn-prev").addEventListener("click", function () {
    jumpTo(session ? Math.max(1, session.index - 1) : 1);
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
    if (!admin) $("admin-scen").hidden = true;
    if (!admin) return;
    $("admin-info").textContent = session ? "Code " + session.code + " · " + cur().id : "keine Sitzung";
    $("btn-csv").disabled = $("btn-json").disabled = $("btn-reset").disabled = !session;
    jumpSelect.value = session && session.index > 0 ? String(session.index) : "";
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
  $("btn-reset").addEventListener("click", function () {
    if (!session) return;
    if (!window.confirm("Sitzung " + session.code + " zurücksetzen? Fortschritt UND Log werden gelöscht. Bitte vorher das Log herunterladen.")) return;
    lsRemove(kState(session.code));
    lsRemove(kLog(session.code));
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
  (function init() {
    var urlCode = (params.get("code") || "").toLowerCase();
    var urlOk = validCode(urlCode);

    // Code aus der Adresszeile entfernen (Fortschritt liegt im Speicher)
    if (params.has("code")) {
      params.delete("code");
      var qs = params.toString();
      try {
        history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      } catch (e) {}
    }

    var code = urlOk ? urlCode : lsGet(K_ACTIVE);
    var stored = code ? lsGet(kState(code)) : null;
    if (stored && validCode(stored.code) && STATES[stored.index]) {
      // Neuladen: im selben Zustand weitermachen
      session = stored;
      lsSet(K_ACTIVE, session.code);
      logEntry("neu_geladen");
      render();
    } else if (urlOk) {
      startSession(urlCode);
    } else {
      render();
    }
  })();
})();
