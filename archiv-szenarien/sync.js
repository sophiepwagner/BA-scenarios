// Kleine Nachrichtenverbindung zwischen Admin- und VP-Seite.
// Zwei Wege laufen parallel, doppelte Nachrichten werden über eine ID aussortiert:
//   1. BroadcastChannel: Tabs im selben Browser, funktioniert komplett offline.
//   2. ntfy.sh (öffentlicher Pub/Sub-Dienst, Server-Sent Events): für zwei verschiedene Geräte.
// Der Raumcode ist Teil des Kanalnamens. Über ntfy laufen nur Steuer- und Statusnachrichten
// (Task, Phase, Peek an/aus), keine Personendaten außer der VP-ID im Link.
//
// Benutzung:
//   var ch = Sync.open("abc123", function (msg) { ... }, function (state) { ... });
//   ch.send({ t: "cmd", action: "start" });
window.Sync = (function () {
  var NTFY = "https://ntfy.sh/";

  function rid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function open(room, onMessage, onState) {
    var me = rid(); // eigene Absender-ID, um Echos der eigenen Nachrichten zu ignorieren
    var topic = "ba-scenarios-" + room;
    var seen = {}; // bereits verarbeitete Nachrichten-IDs
    var closed = false;
    var es = null;
    var bc = null;

    function deliver(msg) {
      if (!msg || msg.from === me || seen[msg.id]) return;
      seen[msg.id] = true;
      onMessage(msg);
    }

    // Weg 1: BroadcastChannel (gleicher Browser)
    if (typeof BroadcastChannel === "function") {
      bc = new BroadcastChannel(topic);
      bc.onmessage = function (e) {
        deliver(e.data);
      };
    }

    // Weg 2: ntfy.sh (andere Geräte). EventSource verbindet sich bei Abbruch selbst neu.
    if (typeof EventSource === "function") {
      es = new EventSource(NTFY + topic + "/sse");
      es.onopen = function () {
        if (onState) onState("online");
      };
      es.onerror = function () {
        if (onState && !closed) onState("offline");
      };
      es.onmessage = function (e) {
        try {
          var outer = JSON.parse(e.data);
          deliver(JSON.parse(outer.message));
        } catch (err) {}
      };
    }

    function send(msg) {
      msg.id = rid();
      msg.from = me;
      seen[msg.id] = true;
      if (bc) bc.postMessage(msg);
      // Body ist ein einfacher String, so entsteht kein CORS-Preflight
      fetch(NTFY + topic, { method: "POST", body: JSON.stringify(msg) }).catch(function () {});
    }

    function close() {
      closed = true;
      if (es) es.close();
      if (bc) bc.close();
    }

    return { send: send, close: close };
  }

  return { open: open, rid: rid };
})();
