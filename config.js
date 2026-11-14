// Einstellungen für die Einstiegsfragen. Wird vor app.js geladen (window.CONFIG).
window.CONFIG = {
  n_questions: 2, // Fragen pro Gespräch: 2 (Stufe 1+2) oder 3 (Stufe 1+2+3)
  audio_mode: "tts", // "tts" = Sprachausgabe des Geräts, "mp3" = audio/<ID>.mp3 (fehlt die Datei, dann automatisch tts)
  question_display_seconds: 0, // 0 = Fragetext nie anzeigen (Normalbetrieb, wegen Eye-Tracker)
  debug: false, // true oder ?debug=1: Fragetext wird dauerhaft eingeblendet
  talk_delay_ms: 1500, // Pause zwischen letzter Frage und der Seite "Gespräch läuft"
};
