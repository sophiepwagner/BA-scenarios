// Fernsteuerung: verbindet Admin-Seite (?admin=1) und VP-Seite über einen Raumcode (?room=...).
// Benötigt window.App (main.js), window.Sync (sync.js) und window.SCENARIOS (scenarios.js).
//
// Nachrichten:
//   Admin -> VP : { t: "cmd", action: "stage" | "start" | "skip" | "reset", stage?, at? }
//                 stage = Schritt der Sitzung (siehe STAGES in main.js)
//                 at = Startzeitpunkt (Date.now() des Admins) für den gemeinsamen Countdown bei "start"
//   Admin -> VP : { t: "ping" }  (VP antwortet sofort mit "hello")
//   VP -> Admin : { t: "hello" | "status", state: { stage, scenario, phase, peeking, peekCount, peekTotal } }
(function () {
  var params = new URLSearchParams(location.search);
  var isAdmin = App.isAdmin;
  var room = params.get("room");

  // Ohne Admin-Modus und ohne Raumcode bleibt die Seite eine normale Einzelseite
  if (!isAdmin && !room) return;

  // Admin ohne Raumcode: neuen erzeugen und in die URL schreiben
  if (!room) {
    room = Sync.rid().slice(0, 6);
    params.set("room", room);
    try {
      history.replaceState(null, "", "?" + params.toString());
    } catch (e) {}
  }

  var PHASES = { start: "Start", read: "Lesephase", talk: "Gespräch" };
  // VP meldet sich regelmäßig, damit der Admin Ausfälle erkennt.
  // Nicht zu oft: ntfy.sh begrenzt anonyme Anfragen (ca. 1 pro 5 s im Dauerbetrieb).
  var HEARTBEAT_MS = 10000;
  var STALE_MS = 25000; // so lange ohne Nachricht gilt die VP als nicht verbunden

  function $(id) {
    return document.getElementById(id);
  }

  // ---------- Admin ----------
  if (isAdmin) {
    var nav = $("admin");
    var tabs = $("a-tabs");
    var vpState = null; // letzter Status der VP
    var vpSeen = 0; // Zeitpunkt der letzten Nachricht der VP
    var netState = "…"; // Zustand der ntfy-Verbindung

    nav.hidden = false;

    var channel = Sync.open(
      room,
      function (msg) {
        if (msg.t === "hello" || msg.t === "status") {
          vpState = msg.state;
          vpSeen = Date.now();
          // Neue/neu geladene VP-Seite auf den aktuellen Schritt bringen
          if (msg.t === "hello" && vpState.stage !== App.getState().stage) {
            channel.send({ t: "cmd", action: "stage", stage: App.getState().stage });
          }
          render();
        }
      },
      function (state) {
        netState = state;
        // Verbindung steht (wieder): VP bitten, sich zu melden
        if (state === "online") channel.send({ t: "ping" });
        render();
      },
    );
    channel.send({ t: "ping" }); // Admin ist neu da: bereits geöffnete VP-Seiten melden sich sofort

    // Befehl an die VP schicken und gleichzeitig bei sich selbst ausführen
    // Beim Start bekommen beide Seiten einen gemeinsamen Zeitpunkt (Countdown, siehe main.js)
    function command(action, stage) {
      var msg = { t: "cmd", action: action, stage: stage };
      if (action === "start") msg.at = Date.now() + App.countdownMs;
      channel.send(msg);
      if (action === "stage") App.setStage(stage);
      else App[action](msg.at);
    }

    // Schritt-Buttons aus den Schritten der Sitzung erzeugen
    App.stages.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = st.label;
      b.dataset.key = st.key;
      b.addEventListener("click", function () {
        command("stage", st.key);
      });
      tabs.appendChild(b);
    });
    $("a-next").addEventListener("click", function () {
      var keys = App.stages.map(function (st) {
        return st.key;
      });
      var i = keys.indexOf(App.getState().stage);
      if (i < keys.length - 1) command("stage", keys[i + 1]);
    });

    $("a-start").addEventListener("click", function () {
      command("start");
    });
    $("a-skip").addEventListener("click", function () {
      command("skip");
    });
    $("a-reset").addEventListener("click", function () {
      command("reset");
    });

    // VP-Link: gleiche Seite, Rolle b, gleicher Raum, Lesezeit und VP-ID
    var personInput = $("a-person");
    personInput.value = App.person;
    $("a-link").addEventListener("click", function () {
      var p = new URLSearchParams();
      p.set("role", "b");
      p.set("room", room);
      p.set("t", App.readSeconds);
      if (personInput.value.trim()) p.set("person", personInput.value.trim());
      var link = location.origin + location.pathname + "?" + p.toString();
      var done = function () {
        $("a-link").textContent = "Kopiert!";
        setTimeout(function () {
          $("a-link").textContent = "VP-Link kopieren";
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(done, function () {
          window.prompt("VP-Link:", link);
        });
      } else {
        window.prompt("VP-Link:", link);
      }
    });

    $("a-room").textContent = "Raum " + room;

    // Anzeige aktualisieren: aktiver Schritt, VP-Status, Verbindung
    function stageOf(key) {
      return App.stages.filter(function (st) {
        return st.key === key;
      })[0];
    }
    function render() {
      var mine = App.getState();
      Array.prototype.forEach.call(tabs.children, function (b) {
        b.classList.toggle("active", b.dataset.key === mine.stage);
      });
      // Start, Überspringen und Neustart gibt es nur in den Gesprächen
      var talking = !!stageOf(mine.stage).scenario;
      ["a-start", "a-skip", "a-reset"].forEach(function (id) {
        $(id).disabled = !talking;
      });
      $("a-next").disabled = mine.stage === App.stages[App.stages.length - 1].key;
      var alive = vpState && Date.now() - vpSeen < STALE_MS;
      var el = $("a-vp");
      el.className = "vp-status " + (alive ? "on" : "off");
      if (!alive) {
        el.textContent = "VP: nicht verbunden";
      } else {
        var vpStage = stageOf(vpState.stage) || stageOf("welcome");
        var txt = "VP: " + vpStage.label;
        if (vpStage.scenario) txt += " · " + PHASES[vpState.phase];
        if (vpState.stage !== mine.stage) txt += " (anderer Schritt!)";
        if (vpState.peeking) txt += " · schaut gerade nach";
        else if (vpState.peekCount) txt += " · " + vpState.peekCount + "× nachgesehen";
        if (vpState.peekCount) txt += ", " + vpState.peekTotal.toFixed(1) + " s";
        el.textContent = txt;
      }
      $("a-net").textContent = "Netz: " + netState;
    }

    App.onChange = render; // eigene Änderungen (z. B. Lesephase endet) sofort anzeigen
    setInterval(render, 2000); // damit "nicht verbunden" auch ohne neue Nachricht erscheint
    render();
    return;
  }

  // ---------- VP ----------
  var link = Sync.open(
    room,
    function (msg) {
      if (msg.t === "ping") return report("hello");
      if (msg.t !== "cmd") return;
      handleCommand(msg);
    },
    function (state) {
      if (state === "online") report("hello"); // Verbindung steht: beim Admin anmelden
    },
  );

  function handleCommand(msg) {
    if (msg.action === "stage") App.setStage(msg.stage);
    else if (msg.action === "start") App.start(msg.at);
    else if (msg.action === "skip") App.skip();
    else if (msg.action === "reset") App.reset();
  }

  function report(type) {
    link.send({ t: type || "status", state: App.getState() });
  }
  App.onChange = function () {
    report("status");
  };
  setInterval(report, HEARTBEAT_MS);
  report("hello"); // Admin kennt uns noch nicht: Anmeldung samt aktuellem Zustand
})();
