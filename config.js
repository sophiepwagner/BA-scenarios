// Einstellungen für die Einstiegsfragen. Wird vor app.js geladen (window.CONFIG).
window.CONFIG = {
  audio_mode: "off", // "off" = nur Text, "tts" = Sprachausgabe des Geräts, "mp3" = audio/<ID>.mp3 (fehlt die Datei, dann tts)
  show_text: true, // true = Fragetext steht auf dem Bildschirm; false = nicht anzeigen (dann audio_mode "tts"/"mp3" nötig)
  question_display_seconds: 0, // nur bei show_text:false: Text trotzdem so viele Sekunden einblenden (0 = nie)
  debug: false, // true oder ?debug=1: Fragetext wird dauerhaft eingeblendet
  talk_delay_ms: 1500, // Pause zwischen letzter Frage und der Situation-Seite
};
