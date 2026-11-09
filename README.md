# Studienablauf auf dem Tablet

Kleine Seite, die Versuchspersonen (Vp) auf einem Tablet durch die Studie führt: Fragebogen vorher → Gespräch 1 → Fragebogen → Gespräch 2 → Fragebogen → Zwischenseite (Brustgurt) → Abschlussfragebogen → Ende. Die Fragebögen sind Tally-Formulare, die per iframe eingebettet werden. Reines HTML, CSS und JavaScript, kein Build-Schritt.

Die Seite kennt **weder die Bedingung (Teleprompter/Webcam) noch die Reihenfolge**. Die Verteilung übernimmt ein separates Skript, die Zuordnung `code → Reihenfolge` wird erst bei der Auswertung ergänzt. So weiß die Versuchsleiterin während der Sitzung nicht, welche Bedingung gerade läuft.

Vor jedem Gespräch gibt es eine eigene Seite mit Situation, Aufgabe und den 4 Gegenständen der Vp („Weiter“ geht zur STOPP-Seite). Gespräch 1 nutzt das Szenario `desert` (Autopanne in der Wüste), Gespräch 2 `cabin` (Eingeschneite Berghütte). Texte und Gegenstände stehen in `scenarios.js`, die Icons in `icons.js`. Welches Szenario zu welchem Gespräch gehört, steht in `app.js` (`SCENARIO_OF_G`).

Dateien: `index.html`, `style.css`, `app.js`, `scenarios.js`, `icons.js`. Der Ordner `archiv-szenarien/` enthält die frühere Szenario-Seite (Gegenstände, Peek-Knopf, Fernsteuerung). Sie wird von der neuen Seite nicht verwendet und kann gelöscht werden.

## Lokal starten

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/` öffnen (am Tablet: `http://<IP-des-Rechners>:8000/`).

## Auf GitHub Pages deployen

1. Repository auf GitHub pushen.
2. *Settings → Pages → Build and deployment*: Quelle „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
3. Nach kurzer Zeit ist die Seite unter `https://<nutzer>.github.io/<repo>/` erreichbar. Der Wake Lock (Display bleibt an) braucht HTTPS, das ist dort gegeben.

## Tally-IDs eintragen

In `app.js` ganz oben:

```js
var TALLY = {
  pre: "zENN9k",
  gespraech: "QoMe18",
  abschluss: "vXrrQD",
};
```

Die ID steht in der Tally-URL (`tally.so/r/<ID>`). In den Formularen müssen **Hidden Fields** mit genau diesen Namen angelegt sein:

| Formular | Hidden Fields |
|---|---|
| Vorher, Abschluss | `code` |
| Gespräch (wird nach beiden Gesprächen verwendet, derselbe Fragebogen) | `code`, `gespraech` |

`gespraech` ist `1` oder `2`. Nach dem Absenden eines Fragebogens (`Tally.FormSubmitted`) geht die Seite nach ca. 1,5 s automatisch weiter. Lädt ein Fragebogen nicht, erscheint unten ein kleiner „Weiter“-Knopf.

## Eine Sitzung starten

- **Über die URL (empfohlen):** `…/?code=b103a`
  - `code`: 5 Zeichen, klein (Buchstaben/Ziffern)
  - Die Startseite wird übersprungen, `code` verschwindet danach aus der Adresszeile.
- **Von Hand:** Seite ohne Parameter öffnen, Code eintragen, „Weiter“. Danach erscheint der Code groß mit der Frage „Stimmt dieser Code?“. Erst „Ja, Sitzung starten“ legt die Sitzung an, „Zurück“ erlaubt eine Korrektur. Ist das Log einer früheren Sitzung noch nicht gespeichert, steht dort ein Hinweis.

Der Fortschritt liegt im `localStorage` des Tablets. Ein Neuladen macht im selben Zustand weiter. Ein neuer Code startet eine neue Sitzung; Fortschritt und Log der alten Sitzung bleiben unter ihrem Code gespeichert.

**Nach dem Ende** gilt die Sitzung nicht mehr als aktiv: Öffnest du die Seite danach ohne `?code=…`, erscheint wieder die Startseite (und nicht die Endseite der letzten Person).

## Logs sichern

Die Logs liegen nur im Speicher des Tablets. Sie enthalten keine Bedingung und keine Reihenfolge, nur Code, Zustand, Gesprächsnummer und Zeitstempel.

- **Startseite → „Gespeicherte Sitzungen“:** Alle Sitzungen mit ihrem Stand und einem Status „Log gespeichert“ bzw. „**Log noch nicht gespeichert**“, jeweils mit Knöpfen für CSV und JSON. Das funktioniert auch nach dem Ende.
- **Endseite im Admin-Modus:** Ein Kasten „Log speichern (CSV + JSON)“ mit Statuszeile.

## Gespräch beenden

Auf dem dunklen Bildschirm „Gespräch läuft …“ muss „Gespräch ist beendet“ 2 Sekunden gedrückt gehalten werden (Fortschrittsring), damit nichts versehentlich beendet wird.

## Admin-Modus (nur Versuchsleiterin)

- Sichtbar mit `?admin=1` (z. B. `…/?admin=1`) oder per Tastenkombination `Strg+Alt+L`.
- **Log herunterladen**: CSV und JSON, Dateiname `log_<code>_<datum>.csv`. Spalten: `code, zustand, gespraech, ts_iso` (UTC, ms), `ts_epoch_ms, ereignis`. Die Reihenfolge ist nicht enthalten und wird bei der Auswertung über den Code ergänzt.
- **Zum Testen springen:** Mit „‹ Zurück“, „Weiter ›“ und der Auswahl in der Admin-Leiste kommst du zu jeder Seite (z. B. direkt zur Situation-Seite, zur STOPP-Seite oder zum dunklen Gespräch), ohne Fragebögen auszufüllen. Ohne laufende Sitzung wird dafür eine Testsitzung mit dem Code `test0` angelegt. Jeder Sprung steht im Log als `sprung_admin`.
- **Zeit pro Seite:** Die Admin-Leiste zeigt neben dem Code die aktuelle Seite und wie lange sie läuft (z. B. „Gespräch 1 · 5:12“). Das sieht nur der Admin-Modus, die Vp sieht nirgends einen Timer.
- **Szenarien:** Der Knopf „Szenarien“ zeigt beide Szenarien mit Beschreibung und den Gegenständen von Vp und Gesprächspartnerin (nur Admin, als Nachschlagewerk).
- **Zurücksetzen**: löscht Fortschritt und Log der aktuellen Sitzung (mit Rückfrage, vorher Log herunterladen).
- Den Admin-Modus nicht auf dem Tablet öffnen, solange die Vp davor sitzt.

Zustände im Log: `start, pre, sit1, pause1, talk1, fb1, sit2, pause2, talk2, fb2, done, post, end`. Ereignisse: `sitzung_gestartet`, `wechsel`, `form_abgesendet`, `weiter_manuell`, `neu_geladen`, `sprung_admin`.

## Tablet-Hinweise

Zoomen, Pull-to-Refresh, Textmarkieren und Kontextmenü sind abgeschaltet. Vor dem Verlassen/Neuladen warnt der Browser (`beforeunload`), solange eine Sitzung läuft. Der Wake Lock hält das Display an, wo der Browser ihn unterstützt (sonst ohne Fehlermeldung ignoriert).
