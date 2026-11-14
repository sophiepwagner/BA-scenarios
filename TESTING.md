# Technikprobe: Einstiegsfragen auf dem iPad

Vorher am Rechner: `npm install`, dann `npm test` (JS-Tests) und `python3 -m unittest discover -s tests -v` (Python-Tests und Blinding-Check). Alles muss grün sein.

Es gibt **keine VP-Nummern und keinen Plan**: Die Fragen ergeben sich aus dem 5-stelligen Code, den die Versuchsperson selbst eingibt. Zum Üben einen festen Testcode nehmen, z. B. `abc12`. Erwartete Fragen dafür (mit `?debug=1` sichtbar):
Gespräch 1: S1-3, S2-6. Gespräch 2: S1-1, S2-1. (Mit `n_questions: 3` in `config.js` kommt je eine Frage der Stufe 3 dazu: S3-1 bzw. S3-3.)

## Checkliste

1. **Ablauf:** Seite auf GitHub Pages öffnen (`?debug=1` anhängen für die Probe), Code `abc12` eingeben, bis „STOPP“ gehen. Nach „Ich bin bereit“ kommt sofort Frage 1 („Frage 1 von 2“, ruhiges Symbol). Nach der letzten Frage und „Weiter“ erscheint nach ca. 1,5 s „Gespräch läuft“. Kein Countdown mehr.
2. **Ton erst nach Tippen:** Ton startet nicht vorher, aber bei „Ich bin bereit“. Bei jeder weiteren Frage („Nächste Frage“) zuverlässig? Safari-Tab vorher nicht stumm geschaltet, iPad-Stummschalter/Lautstärke prüfen.
3. **Stimme:** Deutsche Stimme vorhanden und verständlich? Kommt ein roter Hinweis „Keine deutsche Stimme“, dann am iPad unter Einstellungen > Bedienungshilfen > Gesprochene Inhalte > Stimmen > Deutsch eine Stimme laden. Lautstärke passend?
4. **Zoom mit Kabine:** Hört die Person in der Kabine die Frage? Echo oder Doppelton, weil das Mikrofon den iPad-Ton aufnimmt? Wenn ja: Lautstärke senken oder Kopfhörer testen.
5. **„Frage nochmal hören“** (klein, unter dem Weiter-Knopf): spielt dieselbe Frage erneut. Im Log (Admin, CSV) stehen `frage_nochmal_1x:<ID>`, `frage_nochmal_2x:<ID>` usw.
6. **Kein Ruhemodus:** Auto-Sperre am iPad auf „Nie“ (Einstellungen > Anzeige & Helligkeit) und eine ganze Sitzung durchlaufen lassen.
7. **Unterschiedliche Fragen:** Zwei verschiedene Codes geben (meist) unterschiedliche Fragen. Derselbe Code gibt in Gespräch 1 und 2 verschiedene Fragen. Ein Code wird bei jedem Durchlauf gleich zugeordnet.
8. **Kein Fragetext, keine Kondition:** Ohne `?debug=1` steht nirgends Fragetext auf dem Bildschirm. Im Seitenquelltext und in `data/*.json` steht nichts zur Kondition. (`question_display_seconds` bleibt 0.)
9. **Controller-Log:** Nach einer Sitzung enthält `Camera Controller/logs/session_<code>.json` den Eintrag `questions` (`block1`, `block2`, `assigned_at`). Im Terminal des Controllers erscheint bei den Einstiegsfragen „→ jetzt F9“. Im Seiten-Log (Admin) stehen `fragen_zugewiesen:…`, `frage_gestellt:<ID>`, `fragen_ende`.
10. **Reload mitten in den Fragen:** Seite neu laden (Warnung bestätigen). Dieselbe Frage („Frage 2 von 2“) bleibt stehen, es kommt **kein** Ton von selbst (iOS erlaubt das nicht). Mit „Frage nochmal hören“ kommt dieselbe Frage; danach geht es normal weiter.
11. **mp3-Modus (nur falls genutzt):** In `config.js` `audio_mode: "mp3"`, Dateien als `audio/<ID>.mp3` (z. B. `audio/S1-3.mp3`). Fehlt eine Datei, spricht die Seite per Sprachausgabe (Safari-Konsole: „Fallback auf tts“).

## Offene Punkte, die nur auf dem Gerät klärbar sind

- Spricht das iPad mit der gewählten Stimme und `rate 0.95` natürlich genug? (feste Werte oben in `audio.js`)
- Die Stimme kann je nach iPad/iOS-Version anders klingen. Alle Versuchspersonen sollten dasselbe iPad nutzen.
- Beim ersten Ton nach dem Laden kann es kurz verzögert sein.
