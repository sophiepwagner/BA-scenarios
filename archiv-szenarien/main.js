// Hauptlogik: Screen-Ablauf, Peek-Messung, Log
// Benötigt window.ICONS (icons.js) und window.SCENARIOS (scenarios.js).
// Stellt window.App bereit, damit remote.js den Ablauf von außen steuern kann.
(function () {
  // ---------- Einstellungen ----------
  var TAKE = 5; // Wie viele Gegenstände dürfen mitgenommen werden?

  // Ablauf der Sitzung (Schritte der Leiste oben). Die Gespräche haben je ein festes Szenario.
  var STAGES = [
    { key: "welcome", label: "Start" },
    { key: "talk1", label: "Gespräch 1", scenario: "desert" },
    { key: "break", label: "Pause" },
    { key: "talk2", label: "Gespräch 2", scenario: "cabin" },
    { key: "end", label: "Ende" },
  ];
  function stageByKey(key) {
    return STAGES.filter(function (st) {
      return st.key === key;
    })[0];
  }

  // Konfiguration über URL, z. B. ?role=a&person=07&t=60&stage=talk1
  // Zusätzlich: admin=1 (Navbar, siehe remote.js) und room=<code> (Verbindung Admin <-> VP)
  var params = new URLSearchParams(location.search);
  var isAdmin = params.get("admin") === "1";
  var stageKey = "welcome"; // aktueller Schritt, siehe STAGES
  var scenarioKey = "desert"; // Szenario des letzten Gesprächs-Schritts (desert | cabin)
  var role = (params.get("role") || (isAdmin ? "a" : "b")).toLowerCase(); // b = Versuchsperson, a = du
  var person = params.get("person") || ""; // Personen-ID, landet im CSV
  var READ_SECONDS = parseInt(params.get("t"), 10) || 60; // Dauer der Lesephase in Sekunden
  if (role !== "a") role = "b";

  // ---------- Zustand ----------
  var scenario; // aktuelles Szenario-Objekt
  var myItems; // Gegenstände der eigenen Rolle
  var total; // Gesamtzahl aller Gegenstände
  var phase = "start"; // start | read | talk
  var conversationStart = null; // Zeitstempel, ab dem das Gespräch läuft (Nullpunkt für Peek-Zeiten)
  var readTimer = null;
  var peeks = []; // Jedes Nachsehen als { start, dur } in Sekunden
  var peeking = false; // läuft gerade ein Peek?
  var peekT0 = 0; // Startzeit des laufenden Peeks
  var archive = []; // Abgeschlossene Durchläufe [{ key, peeks, person }], damit beim Wechsel nichts verloren geht
  var readStartedAt = null; // Date.now() beim Start der Lesephase (für Wiederherstellung nach Neuladen)
  var talkStartedAt = null; // Date.now() beim Start des Gesprächs (ebenso)
  var countdownTimer = null; // läuft, solange ein gemeinsamer Start-Countdown angezeigt wird
  var noticeTimers = []; // Timer der Einblendung
  var COUNTDOWN_MS = 3000; // Vorlauf beim gemeinsamen Start (Admin -> VP)
  var NOTICE_MS = 5000; // So lange bleibt "Das Gespräch beginnt jetzt." sichtbar
  var STORE_KEY = "ba-scenarios:" + role; // sessionStorage: überlebt Neuladen, nicht das Schließen des Tabs

  // ---------- Hilfsfunktionen ----------
  // Kurzform für getElementById
  function $(id) {
    return document.getElementById(id);
  }
  // Zeigt genau einen Screen und versteckt die anderen
  function show(id) {
    ["s-welcome", "s-start", "s-read", "s-talk", "s-break", "s-end"].forEach(function (s) {
      $(s).hidden = s !== id;
    });
  }
  // Baut für die eigenen Gegenstände je ein <li> mit Icon, Name und Hinweis in die Liste
  function fillItems(listEl) {
    listEl.innerHTML = "";
    myItems.forEach(function (it) {
      var li = document.createElement("li");
      var ic = document.createElement("div");
      ic.className = "icon";
      ic.innerHTML = (window.ICONS && window.ICONS[it.icon]) || "";
      var tx = document.createElement("div");
      tx.className = "text";
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
      listEl.appendChild(li);
    });
  }
  function peekTotal() {
    return peeks.reduce(function (a, p) {
      return a + p.dur;
    }, 0);
  }
  // Meldet Zustandsänderungen an remote.js (falls geladen) und sichert den Stand
  function emit() {
    save();
    if (typeof App.onChange === "function") App.onChange(getState());
  }

  // ---------- Einblendung ----------
  // Zeigt einen kurzen Hinweis über dem Inhalt. ms = 0: bleibt, bis hideNotice() aufgerufen wird.
  function showNotice(text, ms) {
    var el = $("notice");
    noticeTimers.forEach(clearTimeout);
    noticeTimers = [];
    el.textContent = text;
    el.classList.remove("fade");
    el.hidden = false;
    if (ms) {
      noticeTimers.push(
        setTimeout(function () {
          el.classList.add("fade");
        }, ms),
        setTimeout(function () {
          el.hidden = true;
        }, ms + 450),
      );
    }
  }
  function hideNotice() {
    noticeTimers.forEach(clearTimeout);
    noticeTimers = [];
    $("notice").hidden = true;
  }

  // ---------- Zwischenspeicher (sessionStorage) ----------
  // Speichert Archiv, laufenden Durchlauf und Zeitpunkte, damit Neuladen nichts verliert.
  function save() {
    try {
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          archive: archive,
          stage: stageKey,
          run: {
            stage: stageKey,
            key: scenarioKey,
            person: person,
            phase: phase,
            peeks: peeks,
            readStartedAt: readStartedAt,
            talkStartedAt: talkStartedAt,
          },
        }),
      );
    } catch (e) {}
  }
  function loadSaved() {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY));
    } catch (e) {
      return null;
    }
  }
  function getState() {
    return {
      stage: stageKey,
      scenario: scenarioKey,
      phase: phase,
      peeking: peeking,
      peekCount: peeks.length,
      peekTotal: peekTotal(),
    };
  }

  // ---------- Peek-Knopf ----------
  // Solange der Knopf gedrückt ist, sind die Gegenstände sichtbar.
  var btn = $("btn-peek");
  var peekList = $("items-peek");

  // Knopf gedrückt: Gegenstände aufdecken, Startzeit merken
  function peekStart(e) {
    if (e) e.preventDefault();
    if (peeking || phase !== "talk") return;
    peeking = true;
    peekT0 = performance.now();
    peekList.classList.remove("veiled");
    btn.classList.add("active");
    emit();
  }
  // Knopf losgelassen: Dauer berechnen, speichern, Gegenstände wieder verdecken
  function peekEnd() {
    if (!peeking) return;
    peeking = false;
    var now = performance.now();
    // Startzeit relativ zum Gesprächsbeginn (Fallback: relativ zum Peek selbst)
    var base = conversationStart === null ? peekT0 : conversationStart;
    peeks.push({ start: (peekT0 - base) / 1000, dur: (now - peekT0) / 1000 });
    peekList.classList.add("veiled");
    btn.classList.remove("active");
    emit();
  }
  // Laufenden Peek verwerfen (beim Wechsel/Zurücksetzen), ohne ihn zu speichern
  function peekAbort() {
    peeking = false;
    peekList.classList.add("veiled");
    btn.classList.remove("active");
  }

  // Maus/Touch: drücken = Peek an, loslassen/abbrechen/Finger rutscht weg = Peek aus
  btn.addEventListener("pointerdown", peekStart);
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    btn.addEventListener(ev, peekEnd);
  });
  btn.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  // Tastatur (Leertaste/Enter) verhält sich wie Gedrückthalten
  btn.addEventListener("keydown", function (e) {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) peekStart(e);
  });
  btn.addEventListener("keyup", function (e) {
    if (e.key === " " || e.key === "Enter") peekEnd();
  });
  // Fenster verliert Fokus (Tab-Wechsel): Peek sauber beenden
  window.addEventListener("blur", peekEnd);

  // ---------- Ablauf ----------
  // Lädt ein Szenario und setzt alles auf den Startscreen zurück.
  // Ein bereits begonnener Durchlauf wird vorher archiviert (fürs CSV).
  function loadScenario(key) {
    if (!SCENARIOS[key]) key = "desert";
    closeRun();

    scenarioKey = key;
    scenario = SCENARIOS[key];
    myItems = scenario.items[role];
    total = scenario.items.a.length + scenario.items.b.length;

    $("title").textContent = scenario.title;
    $("intro").textContent = scenario.intro;
    $("task").textContent =
      "Ihr könnt von euren insgesamt " +
      total +
      " Gegenständen nur " +
      TAKE +
      " mitnehmen. Jede Person hat " +
      myItems.length +
      " davon. Besprecht gemeinsam, welche " +
      TAKE +
      " ihr mitnehmt und warum. Ihr müsst euch am Ende einig sein.";
    $("start-hint").textContent =
      "Gleich siehst du deine " +
      myItems.length +
      " Gegenstände für " +
      READ_SECONDS +
      " Sekunden. Merk sie dir: Danach verschwinden sie. Zum Nachsehen gibt es dann unten einen Knopf, den du gedrückt halten kannst.";
    var countText = "Insgesamt gibt es " + total + " Gegenstände, " + TAKE + " dürfen mit.";
    $("count").textContent = countText;
    $("talk-count").textContent = countText;
    fillItems($("items-read"));
    fillItems($("items-peek"));

    var fill = $("bar-fill");
    fill.style.transition = "none";
    fill.style.transform = "scaleX(1)";

    show("s-start");
    emit();
  }

  // Beendet den laufenden Durchlauf (archiviert ihn fürs CSV, falls er begonnen wurde)
  // und setzt Timer und Zustand zurück.
  function closeRun() {
    clearTimeout(readTimer);
    cancelCountdown();
    hideNotice();
    peekAbort();
    if (phase !== "start") archive.push({ key: scenarioKey, peeks: peeks, person: person });
    phase = "start";
    peeks = [];
    conversationStart = null;
    readStartedAt = null;
    talkStartedAt = null;
  }

  // Wechselt den Schritt der Sitzung. Gespräche laden ihr Szenario, die übrigen Schritte zeigen eine Textseite.
  function setStage(key) {
    var st = stageByKey(key) || STAGES[0];
    closeRun();
    stageKey = st.key;
    // Schritt in der URL festhalten (Neuladen bleibt im selben Schritt)
    params.set("stage", stageKey);
    params.delete("scenario");
    try {
      history.replaceState(null, "", "?" + params.toString());
    } catch (e) {}
    renderSteps();
    if (st.scenario) {
      loadScenario(st.scenario);
    } else {
      show("s-" + st.key);
      emit();
    }
  }
  // Läuft gerade ein Gesprächs-Schritt? Nur dort haben Start, Überspringen und Neustart eine Bedeutung.
  function inTalkStage() {
    return !!stageByKey(stageKey).scenario;
  }
  // Leiste oben: aktueller Schritt hervorgehoben, erledigte und kommende Schritte dezent
  function renderSteps() {
    var cur = STAGES.indexOf(stageByKey(stageKey));
    Array.prototype.forEach.call($("steps").children, function (li, i) {
      li.classList.toggle("done", i < cur);
      li.classList.toggle("current", i === cur);
      if (i === cur) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
  }
  function buildSteps() {
    var ol = $("steps");
    ol.innerHTML = "";
    STAGES.forEach(function (st) {
      var li = document.createElement("li");
      li.textContent = st.label;
      ol.appendChild(li);
    });
  }

  // Lesephase starten: Gegenstände sichtbar, Balken läuft ab, danach automatisch Gespräch
  function startReading() {
    if (phase !== "start" || !inTalkStage()) return;
    cancelCountdown();
    beginRead(Date.now());
  }

  // Gemeinsamer Start: Admin schickt einen Zeitpunkt "at" (Date.now() des Admins).
  // Beide Seiten zeigen einen kurzen Countdown und starten dann gleichzeitig.
  // Das hängt nur von den Geräteuhren ab, nicht von der Übertragungszeit der Nachricht.
  // Ohne "at", bei zu großer Uhrabweichung oder bei verspäteter Nachricht geht es sofort bzw. nach COUNTDOWN_MS los.
  function startAt(at) {
    if (phase !== "start" || !inTalkStage()) return;
    var wait = typeof at === "number" ? at - Date.now() : 0;
    if (wait > 10000) wait = COUNTDOWN_MS; // Uhr dieses Geräts geht stark nach: Zeitpunkt nicht verwenden
    if (wait <= 0) {
      startReading();
      return;
    }
    cancelCountdown();
    var end = performance.now() + wait; // ab hier monotone Uhr
    function tick() {
      var left = end - performance.now();
      if (left <= 0) {
        startReading();
        return;
      }
      showNotice("Start in " + Math.ceil(left / 1000), 0);
    }
    tick();
    countdownTimer = setInterval(tick, 50);
  }
  function cancelCountdown() {
    if (countdownTimer === null) return;
    clearInterval(countdownTimer);
    countdownTimer = null;
    hideNotice();
  }

  // Lesephase ab einem Startzeitpunkt (Date.now()); nach Neuladen läuft sie mit der Restzeit weiter
  function beginRead(startedAt) {
    phase = "read";
    readStartedAt = startedAt;
    var remaining = Math.max(0, READ_SECONDS - (Date.now() - startedAt) / 1000);
    show("s-read");
    var fill = $("bar-fill");
    fill.style.transition = "none";
    fill.style.transform = "scaleX(" + remaining / READ_SECONDS + ")";
    // erzwingt Reflow, damit die Animation sauber startet
    void fill.offsetWidth;
    fill.style.transition = "transform " + remaining + "s linear";
    fill.style.transform = "scaleX(0)";
    readTimer = setTimeout(enterTalk, remaining * 1000);
    emit();
  }

  // Gesprächsphase: Gegenstände verdeckt, Zeitmessung für Peeks startet
  function enterTalk() {
    clearTimeout(readTimer);
    cancelCountdown();
    enterTalkAt(Date.now());
    showNotice("Das Gespräch beginnt jetzt.", NOTICE_MS);
  }
  // Gesprächsphase mit bekanntem Beginn (Date.now()); der Peek-Nullpunkt wird daraus abgeleitet
  function enterTalkAt(startedAt) {
    phase = "talk";
    talkStartedAt = startedAt;
    conversationStart = performance.now() - (Date.now() - startedAt);
    show("s-talk");
    emit();
  }

  // Nach Neuladen: gesicherten Durchlauf fortsetzen (Szenario ist schon geladen)
  function resume(run) {
    peeks = run.peeks || [];
    if (run.phase === "talk") {
      enterTalkAt(run.talkStartedAt || Date.now());
    } else if (run.phase === "read") {
      var readEnd = run.readStartedAt + READ_SECONDS * 1000;
      if (Date.now() >= readEnd) enterTalkAt(readEnd);
      else beginRead(run.readStartedAt);
    }
  }

  // Lesephase überspringen (nur aus start/read heraus sinnvoll)
  function skipToTalk() {
    if (phase === "talk" || !inTalkStage()) return;
    enterTalk();
  }

  // Aktuellen Task von vorn beginnen
  function reset() {
    if (inTalkStage()) loadScenario(scenarioKey);
  }

  // Zum nächsten Schritt der Sitzung (am Ende passiert nichts)
  function nextStage() {
    var i = STAGES.indexOf(stageByKey(stageKey));
    if (i < STAGES.length - 1) setStage(STAGES[i + 1].key);
  }

  $("btn-start").addEventListener("click", startReading);

  // ---------- Log (Umschalt + L) ----------
  // Erzeugt die CSV: eine Zeile pro Peek (Startzeit und Dauer in Sekunden).
  // Pro Durchlauf ohne Peek gibt es eine Zeile mit peek_nr = 0.
  function buildCsv() {
    var rows = ["person,scenario,role,peek_nr,start_s,dauer_s"];
    var runs = archive.slice();
    // Laufenden Durchlauf mitnehmen; im Startscreen nur, wenn sonst gar nichts vorliegt
    if (phase !== "start" || !runs.length) runs.push({ key: scenarioKey, peeks: peeks, person: person });
    runs.forEach(function (run) {
      var who = run.person === undefined ? person : run.person; // Person, mit der der Durchlauf aufgezeichnet wurde
      if (!run.peeks.length) {
        rows.push([who, run.key, role, 0, "", ""].join(","));
      } else {
        run.peeks.forEach(function (p, i) {
          rows.push([who, run.key, role, i + 1, p.start.toFixed(1), p.dur.toFixed(1)].join(","));
        });
      }
    });
    return rows.join("\n");
  }
  // Aktualisiert Zusammenfassung und CSV-Text im Log-Panel
  function refreshLog() {
    $("log-summary").textContent =
      "Person " +
      (person || "–") +
      ", " +
      stageByKey(stageKey).label +
      ", " +
      scenarioKey +
      ", Peeks: " +
      peeks.length +
      ", Gesamtdauer: " +
      peekTotal().toFixed(1) +
      " s";
    $("log-csv").value = buildCsv();
  }
  // Shift + L blendet das Log-Panel ein bzw. aus
  window.addEventListener("keydown", function (e) {
    if (e.shiftKey && (e.key === "L" || e.key === "l")) {
      var panel = $("log");
      panel.hidden = !panel.hidden;
      if (!panel.hidden) refreshLog();
    }
  });
  $("btn-close-log").addEventListener("click", function () {
    $("log").hidden = true;
  });
  // CSV in die Zwischenablage (mit Fallback für ältere Browser)
  $("btn-copy").addEventListener("click", function () {
    var ta = $("log-csv");
    ta.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).catch(function () {
        document.execCommand("copy");
      });
    } else {
      document.execCommand("copy");
    }
  });

  // ---------- Schnittstelle nach außen ----------
  var App = (window.App = {
    isAdmin: isAdmin,
    role: role,
    person: person,
    readSeconds: READ_SECONDS,
    stages: STAGES,
    setStage: setStage,
    next: nextStage,
    start: startAt, // optional mit Zeitpunkt (Date.now()-Wert) für gemeinsamen Start
    countdownMs: COUNTDOWN_MS,
    skip: skipToTalk,
    reset: reset,
    getState: getState,
    onChange: null, // wird von remote.js gesetzt
  });

  // ---------- Schutz vor versehentlichem Neuladen/Schließen ----------
  // Nur während einer laufenden Sitzung (Lese- oder Gesprächsphase). Der Browser zeigt dabei
  // seinen eigenen Standardtext, ein eigener Text ist nicht möglich.
  window.addEventListener("beforeunload", function (e) {
    if (phase === "start") return;
    e.preventDefault();
    e.returnValue = "";
  });

  document.title = "Aufgabe";

  // Gesicherten Stand aus sessionStorage holen (nach Neuladen), bevor setStage() ihn überschreibt
  var saved = loadSaved();
  var resumable = null;
  // Schritt: aus der URL (bleibt beim Neuladen erhalten), sonst gesichert, sonst Start
  var startStage = stageByKey(params.get("stage")) || (saved && stageByKey(saved.stage)) || STAGES[0];
  if (saved) {
    archive = saved.archive || [];
    var r = saved.run;
    if (r && r.phase && r.phase !== "start") {
      if (r.stage === startStage.key && r.key === startStage.scenario && r.person === person) {
        resumable = r; // gleicher Schritt, gleiche Person: weitermachen
      } else {
        archive.push({ key: r.key, peeks: r.peeks || [], person: r.person }); // sonst fürs CSV aufheben
      }
    }
  }
  buildSteps();
  setStage(startStage.key);
  if (resumable) resume(resumable);
})();
