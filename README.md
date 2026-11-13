# Studienablauf auf dem Tablet

Eine kleine statische Website (reines HTML, CSS und JavaScript, **kein Build, kein Backend**), die Versuchspersonen (Vp) in einer Studie zu Zoom-Gesprächen durch den gesamten Ablauf führt: Fragebögen, zwei Gespräche mit je einer Aufgabe und einen Abschluss. Sie läuft auf einem Tablet neben dem Zoom-Monitor. Die Vp bedient nur das Tablet und wechselt nie den Tab. Die Fragebögen sind Tally-Formulare, die per iframe eingebettet sind.

## Inhalt

1. [Auf einen Blick](#auf-einen-blick)
2. [Der Ablauf](#der-ablauf)
3. [Setup](#setup)
4. [Eine Sitzung durchführen](#eine-sitzung-durchführen)
5. [Admin-Modus](#admin-modus)
6. [Daten und Log](#daten-und-log)
7. [Anpassen](#anpassen)
8. [Projektstruktur](#projektstruktur)
9. [Fehlerbehebung](#fehlerbehebung)

## Auf einen Blick

- **Wer bedient was:** Die Vp tippt sich allein durch die Seite. Die Versuchsleiterin öffnet die Seite, gibt das Tablet weiter und greift nur im Notfall ein (Admin-Modus).
- **Bedingung und Reihenfolge kennt die Seite nicht.** Welche Bedingung (Teleprompter oder Webcam) in welchem Gespräch läuft, steuert der separate Experiment-Controller (Repo `bachelorarbeit`, Ordner `Camera Controller`, siehe dessen README). Die Zuordnung `code → Reihenfolge` wird erst bei der Auswertung ergänzt. Die Versuchsleiterin weiß dadurch während der Sitzung nicht, welche Bedingung läuft, und im Log steht sie auch nicht.
- **Keine Verbindung zum Controller.** Die Seite und der Controller kennen sich nicht. Den Zeitpunkt, wann die Kamera an- und ausgeht, bestimmt die Versuchsleiterin per Hotkey (F9/F10) im Controller. Die Seite zeigt vor jedem Gespräch nur einen Countdown als Hinweis für die Vp. Jedes Tablet läuft für sich.
- **VP-ID:** Der Controller liest den persönlichen Code der Vp aus der Tally-Einreichung des Fragebogens „Vorher“ (Hidden Field `code`). Das Feld muss in diesem Formular deshalb vorhanden sein.
- **Kein Tracking.** Die einzige externe Abhängigkeit ist Tally (`tally.so`) für die Fragebögen.
- **Sprache:** Deutsch, Ansprache „du“, die Gesprächspartnerin heißt „Gesprächspartnerin“.

## Der Ablauf

| # | Seite | Was die Vp sieht und tut | Weiter geht es |
|---|---|---|---|
| 1 | **Willkommen** | Gibt ihren persönlichen Code ein (5 Zeichen). | „Weiter“, dann Bestätigung („Stimmt dein Code?“) |
| 2 | **Fragebogen „Vorher“** (Tally) | Füllt den Fragebogen aus. | „Weiter“ nach dem Absenden |
| 3 | **Situation und Gegenstände** (Gespräch 1) | Liest Situation, Aufgabe und ihre 4 Gegenstände. | „Weiter“ |
| 4 | **STOPP-Seite** | Wartet, sagt der Gesprächspartnerin Bescheid, dass sie bereit ist. | „Ich bin bereit“ |
| **Countdown** (5 s, `COUNTDOWN_S` in `app.js`) | Liest „Schau jetzt auf den Monitor“. Nur ein Hinweis, er löst nichts aus (die Kamera schaltet die Versuchsleiterin per Hotkey im Controller). | automatisch, danach Gespräch |
| 5 | **Gespräch läuft** (dunkel, kein Timer) | Führt das Gespräch, schaut nicht aufs Tablet. | „Gespräch beendet – weiter zum Fragebogen“ tippen |
| 6 | **Fragebogen zum Gespräch** (Tally, `gespraech=1`) | Füllt den Fragebogen aus. | „Weiter“ nach dem Absenden |
| 7–10 | dasselbe für **Gespräch 2** (zweites Szenario, `gespraech=2`) | | |
| 11 | **Geschafft** | Hinweis auf den letzten Fragebogen. | „Weiter“ |
| 12 | **Abschlussfragebogen** (Tally) | Füllt den Fragebogen aus. | „Weiter“ nach dem Absenden |
| 13 | **Ende** | „Vielen Dank für deine Teilnahme!“ | – |

- **Ablauf-Leiste oben:** Fünf Segmente (Start, Gespräch 1, Gespräch 2, Rückblick, Fertig) zeigen, wo die Vp gerade ist. Auf der Startseite und im dunklen Gespräch ist sie ausgeblendet.
- **Notfall-Weiter:** Lädt ein Fragebogen nicht (kein Netz), erscheint ein „Weiter“-Knopf nur im Admin-Modus.
- **Fragebögen:** Es gibt kein automatisches Weiterspringen. Nach dem Absenden bleibt die letzte Tally-Seite sichtbar, erst dann erscheint unten „Weiter“.
- **Szenarien:** Gespräch 1 ist „Autopanne in der Wüste“, Gespräch 2 „Eingeschneite Berghütte“. Jede Person hat 4 von 8 Gegenständen, zusammen wählt man 5 aus. Die Gegenstände der Vp stehen auf der Situation-Seite, die der Gesprächspartnerin nur im Admin-Modus.
- **Nach dem Ende** gilt die Sitzung nicht mehr als aktiv. Wer die Seite danach öffnet, sieht wieder „Willkommen“ für die nächste Person.

## Status für den Controller

Die Seite meldet an den Experiment-Controller (Terminal der Versuchsleiterin), wo die Vp gerade ist. Das ist **nur eine Anzeige** und steuert nichts.

- **Was gesendet wird:** Schrittname (z. B. `count1`), Gesprächsnummer und Zeitstempel, bei jedem Seitenwechsel und alle 120 s als Heartbeat. **Nie** Code, Sitzungs-ID, Antworten oder die Bedingung.
- **Wohin:** An den öffentlichen Dienst ntfy.sh, Kanal `STATUS_TOPIC` oben in `app.js`. Der Controller liest denselben Kanal (Umgebungsvariable `STATUS_TOPIC`, siehe dessen README).
- **Ausfall:** Fehler (kein Netz, Dienst down) werden verschluckt und beeinflussen den Ablauf nie.
- **Im Admin-Modus** (`?admin=1`) wird nichts gesendet, damit dein Laptop den Status der Vp nicht stört.
- **Abschalten:** `STATUS_TOPIC` in `app.js` auf `""` setzen.
- Der Kanalname steht im öffentlichen Repo. Wer ihn kennt, kann nur die Schrittnamen lesen oder falsche senden. Es sind keine personenbezogenen Daten enthalten.

## Setup

### 1. Tally-Formulare vorbereiten

Drei Formulare werden verwendet:

| Zweck | Formular-ID | Hidden Fields |
|---|---|---|
| Vorher | `zENN9k` | `code`, optional `sitzung` |
| Gespräch (wird nach beiden Gesprächen geöffnet) | `QoMe18` | `code`, `gespraech`, optional `sitzung` |
| Abschluss | `vXrrQD` | `code`, optional `sitzung` |

- In jedem Formular die Hidden Fields mit **genau diesen Namen** anlegen (Tally: Formular bearbeiten → Hidden Fields).
- `code` ist der persönliche Code der Vp, `gespraech` ist `1` oder `2`.
- `sitzung` ist eine eindeutige ID, die die Seite pro Durchlauf erzeugt. Sie ist optional, hilft aber, falls zwei Personen denselben Code haben (siehe [Daten und Log](#daten-und-log)).
- Da die Seite den Code schon als Hidden Field mitgibt, braucht das Formular „Vorher“ keine eigene Frage nach dem Code. Sonst tippt die Vp ihn zweimal.
- Das Absenden-Event von Tally steuert das automatische Weitergehen. Ein „Vielen Dank“-Text im Formular ist nur kurz sichtbar.

### 2. Formular-IDs eintragen

Die IDs stehen ganz oben in `app.js`:

```js
var TALLY = {
  pre: "zENN9k",
  gespraech: "QoMe18", // wird nach Gespräch 1 und 2 verwendet
  abschluss: "vXrrQD",
};
```

Die ID steht in der Tally-URL (`tally.so/r/<ID>`).

### 3. Lokal testen

Im Projektordner:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/` öffnen. Am Tablet im selben WLAN: `http://<IP-des-Rechners>:8000/`.

Zum Durchklicken ohne Fragebögen: Admin-Modus (`http://localhost:8000/?admin=1`) und die Sprung-Auswahl unten links. Achtung: Die Fragebögen sind die echten Formulare, Antworten, die du dort absendest, landen in deinen echten Tally-Daten.

### 4. Auf GitHub Pages veröffentlichen

1. Repository auf GitHub pushen.
2. *Settings → Pages → Build and deployment*: Quelle „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
3. Nach kurzer Zeit ist die Seite unter `https://<nutzer>.github.io/<repo>/` erreichbar. Wichtig: Diese Adresse (HTTPS) am Tablet verwenden, denn der Wake Lock (Display bleibt an) braucht HTTPS.

### 5. Tablet einrichten

- **Normalen Browser-Tab nutzen, keinen privaten Modus.** Fortschritt und Log liegen im `localStorage` und gehen im privaten Modus beim Schließen verloren.
- **Uhrzeit und Zeitzone prüfen** (automatisch einstellen). Das Log speichert die Tablet-Zeit, die du später mit Aufnahmen oder anderen Geräten abgleichst.
- **Normal in Safari öffnen** (nicht als Web-App vom Home-Bildschirm), damit die Safari-Leiste zum Neuladen sichtbar bleibt. Ein früher angelegtes Home-Bildschirm-Symbol löschen, es hat einen eigenen Speicher getrennt von Safari. Wake Lock am iPad testen.
- **Tablet sperren,** damit nichts versehentlich verlassen wird: iPad „Geführter Zugriff“, Android „Bildschirmfixierung“. Das lässt sich nicht aus der Seite heraus lösen.
- **Töne aus, Helligkeit mittel,** die Seite spielt keine Töne.
- Seite einmal vom Tablet aus testen, bevor die erste Vp kommt (Fragebögen laden, Halten-Knopf, Display bleibt an).

## Eine Sitzung durchführen

**Vorher**
1. Seite ohne `?admin=1` öffnen. Es erscheint „Willkommen“.
2. Das Tablet der Vp geben. Diese gibt ihren persönlichen Code selbst ein, bestätigt ihn und startet damit die Sitzung.

**Während der Sitzung**
- Die Vp bedient das Tablet allein. Neuladen ist unkritisch: Die Seite macht an derselben Stelle weiter, der Browser warnt vorher.
- Bei einem Problem (z. B. hängt ein Fragebogen) öffnest du am Tablet `?admin=1` und springst mit „Weiter ›“ zur nächsten Seite. Dann die Vp wieder allein lassen. Den Admin-Modus am besten nicht öffnen, solange die Vp davor sitzt.

**Nachher**
1. Nach dem Ende `?admin=1` öffnen.
2. **Log sichern:** Auf der Startseite stehen unter „Gespeicherte Sitzungen“ alle Sitzungen mit dem Status „Log gespeichert“ oder „Log noch nicht gespeichert“, daneben CSV- und JSON-Knöpfe.
3. Danach kann die nächste Person beginnen.

## Admin-Modus

Aktivieren mit `?admin=1` hinter der Adresse oder mit `Strg+Alt+L` (nur mit Tastatur). Ohne diese Einstellung sieht die Vp keinen dieser Bereiche.

| Bereich | Was er kann |
|---|---|
| **Leiste unten** | Start, ‹ ›, Auswahl zum Springen zu jeder Seite, Zeit auf der aktuellen Seite (z. B. „Gespräch 1 · 5:12“), Szenarien, Log (CSV, JSON), Zurücksetzen |
| **Szenarien** | Übersicht beider Szenarien mit Gegenständen von Vp und Gesprächspartnerin |
| **Situation-Seiten** | Gelber Kasten mit den Gegenständen der Gesprächspartnerin unter denen der Vp |
| **Startseite** | Liste „Gespeicherte Sitzungen“ mit Log-Status und Download |
| **Endseite** | Kasten „Log speichern (CSV + JSON)“ mit Statuszeile |

- **Springen** zu jeder Seite legt ohne laufende Sitzung eine Testsitzung mit dem Code `test0` an. Jeder Sprung steht im Log als `sprung_admin`.
- **Zurücksetzen** löscht Fortschritt und Log der aktuellen Sitzung (mit Rückfrage). Vorher das Log herunterladen.
- Die Tablet-Seite der Vp und dein Admin-Fenster sind **nicht verbunden**. Es gibt keine Fernsteuerung.

## Daten und Log

Alles liegt im `localStorage` des Tablets (Schlüssel `studie:<sitzung>:state`, `:log`, `:saved`). Es gibt keinen Server und keine Übertragung. **Die Logs gehen verloren, wenn der Browser-Speicher geleert wird.** Deshalb nach jeder Sitzung sichern.

**Eindeutige Sitzungs-ID:** Persönliche Codes sind nicht eindeutig (z. B. bei Codes aus Anfangsbuchstaben und letzten Ziffern kann es Doppelte geben). Die Seite speichert deshalb alles unter einer zufälligen Sitzungs-ID, die als Hidden Field `sitzung` an Tally geht und im Log steht. So lassen sich auch zwei Personen mit gleichem Code trennen.

**Log-Dateien:** `log_<code>_<datum>.csv` und `.json`. Spalten:

| Spalte | Inhalt |
|---|---|
| `sitzung` | eindeutige Sitzungs-ID |
| `code` | persönlicher Code der Vp |
| `zustand` | Seite, siehe unten |
| `gespraech` | `1` oder `2` (leer außerhalb der Gespräche) |
| `ts_iso` | Zeitstempel, ISO-8601, UTC, mit Millisekunden |
| `ts_epoch_ms` | derselbe Zeitpunkt als Unix-Zeit in Millisekunden |
| `ereignis` | `sitzung_gestartet`, `wechsel`, `form_abgesendet`, `weiter_manuell`, `neu_geladen`, `sprung_admin`, `countdown_ende` |

Zustände: `start`, `pre`, `sit1`, `pause1`, `count1`, `talk1`, `fb1`, `sit2`, `pause2`, `count2`, `talk2`, `fb2`, `done`, `post`, `end`.

**Reihenfolge und Bedingung** stehen weder im Log noch in den Tally-Daten. Sie werden bei der Auswertung über den Code (bzw. die Sitzungs-ID) ergänzt.

## Anpassen

| Was | Wo |
|---|---|
| Formular-IDs | `app.js`, Konstante `TALLY` |
| Länge des Countdowns vor dem Gespräch | `app.js`, `COUNTDOWN_S` |
| Status für den Controller (Kanal, Heartbeat) | `app.js`, `STATUS_TOPIC`, `STATUS_URL`, `HEARTBEAT_S` |
| Zeit bis zum Fallback-Knopf (Fragebogen lädt nicht) | `app.js`, `IFRAME_TIMEOUT_MS` |
| Beschriftung der Ablauf-Leiste | `app.js`, Liste `STEPS` |
| Welches Szenario in welchem Gespräch läuft | `app.js`, `SCENARIO_OF_G` |
| Anzahl mitzunehmender Gegenstände | `app.js`, `TAKE` |
| Szenario-Texte und Gegenstände (Name, Hinweis, Bild) | `scenarios.js` |
| Bilder der Gegenstände | `icons.js` (SVG, je Gegenstand ein Eintrag) |
| Texte auf Willkommen-, STOPP-, Geschafft- und Ende-Seite | `index.html` |
| Farben, Schriftgrößen, Abstände | `style.css` (Variablen oben) |

In `scenarios.js` hat jedes Szenario Gegenstände für die Rollen `a` (Gesprächspartnerin) und `b` (Versuchsperson). `plane` und `island` sind vorhanden, aber nicht im Ablauf.

## Projektstruktur

```
index.html        Seitenaufbau, alle Screens
style.css         Gestaltung (hell; dunkel nur im Gespräch)
app.js            Ablauf, Tally-Einbettung, Log, Admin-Modus
scenarios.js      Szenarien und Gegenstände
icons.js          Bilder der Gegenstände (SVG)
archiv-szenarien/ frühere Szenario-Seite, wird nicht verwendet
```

## Fehlerbehebung

| Problem | Ursache und Lösung |
|---|---|
| Die Seite zeigt eine alte Version | Browser-Zwischenspeicher. Hart neu laden (Cmd+Shift+R) oder ein privates Fenster zum Prüfen nutzen. |
| Ein Fragebogen lädt nicht | Internet und Erreichbarkeit von `tally.so` prüfen. Nach spätestens 20 Sekunden erscheint unten der „Weiter“-Knopf. |
| Nach dem Absenden geht es nicht weiter | Tally hat das Absenden nicht gemeldet. Im Admin-Modus „Weiter ›“ tippen. Prüfen, ob die Formular-ID stimmt. |
| Display geht aus | Wake Lock wird nur über HTTPS und in aktuellen Browsern unterstützt. Auf GitHub Pages testen, Bildschirmsperre des Tablets lang einstellen. |
| Fortschritt weg nach Neustart | Privater Modus oder gelöschter Browser-Speicher. Normalen Tab verwenden, Logs nach jeder Sitzung sichern. |
| Zwei Personen mit gleichem Code | Über die Spalte `sitzung` bzw. das Hidden Field `sitzung` in Tally unterscheiden. |
