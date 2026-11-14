// Vorlesen der Einstiegsfragen (window.QAudio). tts = speechSynthesis (de-DE), mp3 = audio/<ID>.mp3.
// iOS/Safari spielt Ton erst nach einer Berührung: unlock() läuft bei der ersten Berührung der Seite.
(function () {
  "use strict";
  var TTS_RATE = 0.95; // fest eingestellt, damit alle Versuchspersonen dasselbe hören
  var TTS_PITCH = 1;
  var TTS_VOLUME = 1;
  var SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

  var cfg = function () {
    return window.CONFIG || {};
  };
  var voice = null;
  var voiceChecked = false;
  var unlocked = false;
  var el = null; // ein gemeinsames Audio-Element für alle MP3s (bleibt unter iOS freigeschaltet)
  var current = null; // laufende Wiedergabe: { cancelled }

  function hasTts() {
    return typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  }
  function pickVoice() {
    var all = (hasTts() && window.speechSynthesis.getVoices()) || [];
    var de = all.filter(function (v) {
      return /^de([-_]|$)/i.test(v.lang || "");
    });
    if (!de.length) return null;
    var exact = de.filter(function (v) {
      return /^de[-_]DE$/i.test(v.lang);
    });
    return (exact.length ? exact : de)[0];
  }
  // iOS liefert die Stimmenliste oft erst verzögert (voiceschanged): bis zu timeoutMs warten
  function init(timeoutMs) {
    return new Promise(function (resolve) {
      if (!hasTts()) {
        voiceChecked = true;
        return resolve({ ok: false, message: "Sprachausgabe (speechSynthesis) wird von diesem Browser nicht unterstützt." });
      }
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        voiceChecked = true;
        voice = pickVoice();
        resolve(voice ? { ok: true, voice: voice.name + " (" + voice.lang + ")" } : { ok: false, message: "Keine deutsche Stimme (de-DE) auf diesem Gerät gefunden. iPad: Einstellungen > Bedienungshilfen > Gesprochene Inhalte > Stimmen > Deutsch." });
      }
      if (pickVoice()) return finish();
      window.speechSynthesis.addEventListener("voiceschanged", function () {
        if (pickVoice()) finish();
      });
      setTimeout(finish, timeoutMs || 4000);
    });
  }

  function audioEl() {
    if (!el) {
      el = new Audio();
      el.preload = "auto";
    }
    return el;
  }
  // Bei der ersten Berührung: stummes Audio und stumme Sprachausgabe starten, damit spätere Wiedergaben erlaubt sind
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      var a = audioEl();
      a.src = SILENT_WAV;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
    try {
      if (hasTts()) {
        var u = new window.SpeechSynthesisUtterance(".");
        u.volume = 0;
        u.lang = "de-DE";
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  function stop() {
    if (current) current.cancelled = true;
    try {
      if (hasTts()) window.speechSynthesis.cancel();
    } catch (e) {}
    try {
      if (el) el.pause();
    } catch (e) {}
  }

  function speakTts(text, token) {
    return new Promise(function (resolve, reject) {
      if (!hasTts()) return reject(new Error("tts nicht verfügbar"));
      var u = new window.SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      if (voice) u.voice = voice;
      u.rate = TTS_RATE;
      u.pitch = TTS_PITCH;
      u.volume = TTS_VOLUME;
      u.onend = function () {
        resolve("tts");
      };
      u.onerror = function (e) {
        if (token.cancelled || (e && (e.error === "canceled" || e.error === "interrupted"))) return resolve("tts");
        reject(new Error("tts: " + (e && e.error)));
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }
  function playMp3(id, token) {
    return new Promise(function (resolve, reject) {
      var a = audioEl();
      a.onended = function () {
        resolve("mp3");
      };
      a.onerror = function () {
        reject(new Error("mp3 nicht ladbar: audio/" + id + ".mp3"));
      };
      a.src = "audio/" + encodeURIComponent(id) + ".mp3";
      var p = a.play();
      if (p && p.catch) p.catch(reject);
    });
  }

  // Spielt eine Frage ab. Löst auf mit "tts" oder "mp3" (was tatsächlich lief). Fehlt die MP3, wird in der Konsole geloggt und per tts gesprochen.
  function speak(q) {
    stop();
    var token = { cancelled: false };
    current = token;
    var first = cfg().audio_mode === "mp3" ? playMp3(q.id, token) : speakTts(q.text, token);
    return first.catch(function (err) {
      if (cfg().audio_mode === "mp3") {
        console.warn("[audio] Fallback auf tts für " + q.id + ":", err && err.message);
        return speakTts(q.text, token);
      }
      throw err;
    });
  }

  window.QAudio = { init: init, unlock: unlock, speak: speak, stop: stop, voiceChecked: function () { return voiceChecked; } };
})();
