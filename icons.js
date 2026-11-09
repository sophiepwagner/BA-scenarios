// Reine Daten: ein Inline-SVG-Icon pro Gegenstand, abrufbar über window.ICONS[icon-name]
(function () {
  // Gemeinsamer SVG-Rahmen (64x64, Linienstil); "inner" ist der Icon-spezifische Inhalt
  function svg(inner) {
    return (
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      inner +
      "</svg>"
    );
  }
  window.ICONS = {
    machete: svg(
      '<g transform="rotate(35 32 32)">' +
        '<path class="t" d="M28 6 L28 42 L40 42 C42 28 38 14 28 6 Z"/>' +
        '<rect class="c" x="28" y="42" width="12" height="14" rx="3"/>' +
        '<path d="M26 42 H42"/></g>',
    ),
    firstaid: svg(
      '<path d="M24 18 V14 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 V18"/>' +
        '<rect class="t" x="8" y="18" width="48" height="34" rx="6"/>' +
        '<path class="as" d="M32 27 v16 M24 35 h16" stroke-width="3.5"/>',
    ),
    satphone: svg(
      '<path d="M36 18 L46 7"/>' +
        '<circle class="a" cx="46.5" cy="6.5" r="2.5"/>' +
        '<rect class="t" x="22" y="18" width="22" height="40" rx="4"/>' +
        '<rect class="c" x="26" y="23" width="14" height="10" rx="1.5"/>' +
        '<circle class="k" cx="28" cy="42" r="1.4"/><circle class="k" cx="33" cy="42" r="1.4"/><circle class="k" cx="38" cy="42" r="1.4"/>' +
        '<circle class="k" cx="28" cy="49" r="1.4"/><circle class="k" cx="33" cy="49" r="1.4"/><circle class="k" cx="38" cy="49" r="1.4"/>',
    ),
    mosquitonet: svg(
      '<path d="M32 4 V9"/>' +
        '<path class="t" d="M32 9 L10 50 H54 Z"/>' +
        '<path d="M20.5 30 H43.5 M15 40 H49 M32 9 L24 50 M32 9 L40 50"/>' +
        '<path d="M6 55 H58"/>',
    ),
    water: svg(
      '<rect class="t" x="14" y="16" width="36" height="40" rx="5"/>' +
        '<path d="M22 16 V13 a3 3 0 0 1 3 -3 h4"/>' +
        '<rect class="c" x="36" y="8" width="9" height="8" rx="2"/>' +
        '<path class="c" d="M32 26 C32 26 24 35 24 41 a8 8 0 0 0 16 0 C40 35 32 26 32 26 Z"/>',
    ),
    binoculars: svg(
      '<rect class="c" x="12" y="12" width="12" height="9" rx="2"/>' +
        '<rect class="c" x="40" y="12" width="12" height="9" rx="2"/>' +
        '<rect class="t" x="8" y="21" width="20" height="32" rx="7"/>' +
        '<rect class="t" x="36" y="21" width="20" height="32" rx="7"/>' +
        '<rect class="c" x="26" y="30" width="12" height="10" rx="2"/>' +
        '<circle cx="18" cy="46" r="4"/><circle cx="46" cy="46" r="4"/>',
    ),
    blanket: svg(
      '<path class="g" d="M10 20 L50 12 L54 46 L14 52 Z"/>' +
        '<path d="M24 17.5 L28 50 M37 15 L41 48"/>' +
        '<path class="as" d="M53 3 v7 M49.5 6.5 h7"/>',
    ),
    matches: svg(
      '<path d="M22 36 L46 12" stroke-width="3"/>' +
        '<circle class="a" cx="47.5" cy="10.5" r="4.5"/>' +
        '<rect class="t" x="8" y="34" width="36" height="20" rx="3"/>' +
        '<path d="M8 42 H44"/>',
    ),
    filter: svg(
      '<path d="M32 22 V10 M24 10 H40"/>' +
        '<rect class="t" x="20" y="22" width="24" height="34" rx="4"/>' +
        '<path d="M26 36 H38 M26 44 H38"/>' +
        '<path d="M44 46 q10 0 10 -10 v-4"/>',
    ),
    flaregun: svg(
      '<path class="t" d="M34 32 L40 54 H52 L46 32"/>' +
        '<rect class="t" x="6" y="18" width="38" height="14" rx="3"/>' +
        '<path d="M26 32 v6 a5 5 0 0 0 10 0 v-6"/>' +
        '<path class="as" d="M49 25 H60 M48 18 L57 13 M48 32 L57 37"/>',
    ),
    compass: svg(
      '<circle class="c" cx="32" cy="32" r="24"/>' +
        '<path d="M32 10 v4 M32 50 v4 M10 32 h4 M50 32 h4"/>' +
        '<path class="a" d="M32 16 L38 32 L26 32 Z"/>' +
        '<path class="t" d="M32 48 L38 32 L26 32 Z"/>' +
        '<circle class="k" cx="32" cy="32" r="2"/>',
    ),
    cans: svg(
      '<path class="t" d="M16 18 V48 a16 5 0 0 0 32 0 V18"/>' +
        '<path class="a" d="M16 28 a16 5 0 0 0 32 0 V40 a16 5 0 0 1 -32 0 Z"/>' +
        '<ellipse class="c" cx="32" cy="18" rx="16" ry="5"/>' +
        '<path d="M16 28 a16 5 0 0 0 32 0 M16 40 a16 5 0 0 0 32 0"/>',
    ),
    fishing: svg(
      '<path d="M8 56 L48 10" stroke-width="3"/>' +
        '<circle class="t" cx="21" cy="41" r="5.5"/>' +
        '<path d="M48 10 q10 4 8 16 v14"/>' +
        '<path d="M56 40 v6 a4 4 0 0 1 -8 0"/>',
    ),
    sunscreen: svg(
      '<rect class="c" x="25" y="6" width="14" height="8" rx="2"/>' +
        '<path class="t" d="M22 14 H42 L40 52 H24 Z"/>' +
        '<rect class="t" x="24" y="52" width="16" height="5"/>' +
        '<circle class="a" cx="32" cy="32" r="4"/>' +
        '<path d="M32 24 v3 M32 37 v3 M24 32 h3 M37 32 h3"/>',
    ),
    seamap: svg(
      '<path class="t" d="M8 14 L24 10 L40 16 L56 12 V50 L40 54 L24 48 L8 52 Z"/>' +
        '<path d="M24 10 V48 M40 16 V54"/>' +
        '<path d="M11 32 q2.5 -3 5 0 t5 0 M27 26 q2.5 -3 5 0 t5 0 M43 38 q2.5 -3 5 0 t5 0"/>',
    ),
    rope: svg(
      '<circle cx="30" cy="32" r="22" stroke-width="3.5"/>' +
        '<circle cx="30" cy="32" r="14" stroke-width="3.5"/>' +
        '<circle class="t" cx="30" cy="32" r="6" stroke-width="3.5"/>' +
        '<path d="M52 32 q8 6 2 18" stroke-width="3.5"/>',
    ),

    /* ---- Wüste ---- */
    mirror: svg(
      '<g transform="rotate(-12 28 38)">' +
        '<rect class="t" x="12" y="20" width="32" height="36" rx="3"/>' +
        '<rect class="c" x="17" y="25" width="22" height="26" rx="1.5"/>' +
        '<path d="M22 45 L34 31"/></g>' +
        '<path class="as" d="M48 20 L57 11 M52 29 L61 27 M44 12 L46 3"/>',
    ),
    sunhat: svg(
      '<ellipse class="c" cx="32" cy="42" rx="27" ry="7"/>' +
        '<path class="t" d="M19 42 C19 16 45 16 45 42 C38 45 26 45 19 42 Z"/>' +
        '<path class="as" d="M19.5 34 C27 37.5 37 37.5 44.5 34" stroke-width="3"/>',
    ),
    tarp: svg(
      '<path class="t" d="M8 50 L32 12 L56 50 Z"/>' +
        '<path class="c" d="M25 50 L32 31 L39 50 Z"/>' +
        '<path d="M4 54 H60"/>' +
        '<path d="M8 50 L3 56 M56 50 L61 56"/>',
    ),
    flashlight: svg(
      '<path class="c" d="M20 18 H44 L40 30 H24 Z"/>' +
        '<rect class="t" x="24" y="30" width="16" height="26" rx="3"/>' +
        '<circle class="a" cx="32" cy="41" r="2.5"/>' +
        '<path class="as" d="M32 10 V4 M20 12 L14 6 M44 12 L50 6"/>',
    ),
    bottles: svg(
      '<g><path class="t" d="M18 14 V21 C18 25 12 26 12 32 V54 a2 2 0 0 0 2 2 H26 a2 2 0 0 0 2 -2 V32 C28 26 22 25 22 21 V14"/>' +
        '<rect class="c" x="17" y="8" width="6" height="6" rx="1.5"/><path d="M12 40 H28"/></g>' +
        '<g transform="translate(24 0)"><path class="t" d="M18 14 V21 C18 25 12 26 12 32 V54 a2 2 0 0 0 2 2 H26 a2 2 0 0 0 2 -2 V32 C28 26 22 25 22 21 V14"/>' +
        '<rect class="c" x="17" y="8" width="6" height="6" rx="1.5"/><path d="M12 40 H28"/></g>',
    ),
    radio: svg(
      '<rect class="c" x="37" y="6" width="5" height="16" rx="1.5"/>' +
        '<rect class="t" x="18" y="20" width="28" height="38" rx="4"/>' +
        '<path d="M24 29 H40 M24 34 H40 M24 39 H40"/>' +
        '<circle class="a" cx="32" cy="49" r="3"/>',
    ),
    sweater: svg(
      '<path class="t" d="M22 10 L10 18 L6 40 L16 42 L18 30 V54 H46 V30 L48 42 L58 40 L54 18 L42 10 C38 15 26 15 22 10 Z"/>' +
        '<path d="M18 48 H46"/>',
    ),
    dates: svg(
      '<path class="t" d="M17 24 C19 12 45 12 47 24 Z"/>' +
        '<path class="t" d="M17 24 C12 34 10 44 12 52 C13 55 17 56 20 56 H44 C47 56 51 55 52 52 C54 44 52 34 47 24 Z"/>' +
        '<path class="as" d="M17 24 H47" stroke-width="3"/>' +
        '<ellipse class="a" cx="26" cy="40" rx="5" ry="3" transform="rotate(-25 26 40)"/>' +
        '<ellipse class="a" cx="38" cy="44" rx="5" ry="3" transform="rotate(20 38 44)"/>' +
        '<ellipse class="a" cx="31" cy="50" rx="5" ry="3" transform="rotate(-10 31 50)"/>',
    ),

    /* ---- Berghütte ---- */
    woodpile: svg(
      '<circle class="t" cx="20" cy="44" r="10"/><circle cx="20" cy="44" r="4"/>' +
        '<circle class="t" cx="44" cy="44" r="10"/><circle cx="44" cy="44" r="4"/>' +
        '<circle class="t" cx="32" cy="26" r="10"/><circle cx="32" cy="26" r="4"/>' +
        '<path d="M6 55 H58"/>',
    ),
    stove: svg(
      '<rect class="t" x="22" y="40" width="20" height="16" rx="3"/>' +
        '<rect class="c" x="28" y="34" width="8" height="6" rx="1"/>' +
        '<ellipse class="c" cx="32" cy="31" rx="12" ry="4"/>' +
        '<path class="a" d="M32 12 C27 18 28 23 32 27 C36 23 37 18 32 12 Z"/>' +
        '<path d="M20 30 L15 26 M44 30 L49 26"/>',
    ),
    sleepingbag: svg(
      '<path class="t" d="M20 8 H44 a6 6 0 0 1 6 6 V50 a6 6 0 0 1 -6 6 H20 a6 6 0 0 1 -6 -6 V14 a6 6 0 0 1 6 -6 Z"/>' +
        '<ellipse class="c" cx="32" cy="16" rx="10" ry="6"/>' +
        '<path d="M32 22 V56 M16 34 H48 M16 45 H48"/>',
    ),
    candles: svg(
      '<rect class="t" x="10" y="30" width="12" height="26" rx="2"/>' +
        '<rect class="t" x="26" y="22" width="12" height="34" rx="2"/>' +
        '<rect class="t" x="42" y="34" width="12" height="22" rx="2"/>' +
        '<path d="M16 30 V27 M32 22 V19 M48 34 V31"/>' +
        '<path class="a" d="M16 18 c-3 4 -2 7 0 8 c2 -1 3 -4 0 -8 Z"/>' +
        '<path class="a" d="M32 10 c-3 4 -2 7 0 8 c2 -1 3 -4 0 -8 Z"/>' +
        '<path class="a" d="M48 22 c-3 4 -2 7 0 8 c2 -1 3 -4 0 -8 Z"/>',
    ),
    noodles: svg(
      '<path d="M24 14 L21 5 M32 14 V3 M40 14 L43 5"/>' +
        '<rect class="t" x="16" y="14" width="32" height="42" rx="3"/>' +
        '<path d="M16 22 H48"/>' +
        '<rect class="c" x="22" y="28" width="20" height="22" rx="2"/>' +
        '<path d="M27 31 V47 M32 31 V47 M37 31 V47"/>',
    ),
    powerbank: svg(
      '<rect class="t" x="14" y="12" width="36" height="42" rx="6"/>' +
        '<circle class="k" cx="23" cy="20" r="1.8"/><circle class="k" cx="30" cy="20" r="1.8"/><circle class="k" cx="37" cy="20" r="1.8"/>' +
        '<path class="a" d="M34 28 L25 40 H32 L29 50 L39 37 H32 Z"/>',
    ),
    snowshoes: svg(
      '<ellipse class="c" cx="32" cy="32" rx="14" ry="24"/>' +
        '<path d="M32 8 V56 M20 21 H44 M18 32 H46 M20 43 H44"/>' +
        '<rect class="t" x="25" y="27" width="14" height="12" rx="3"/>',
    ),
    axe: svg(
      '<g transform="rotate(-25 32 32)">' +
        '<path d="M34 14 V58" stroke-width="4"/>' +
        '<path class="t" d="M26 14 H37 L48 9 V31 L37 26 H26 Z"/></g>',
    ),
  };

  // ---------- Detaillierte Illustrationen für die Gegenstände der Szenarien "desert" und "cabin" ----------
  // Eigenes Format: 96x96, mit Hintergrundkreis, Farbverläufen, Schatten, Glanzlichtern und Texturen.
  // Die Farben stehen direkt in den Formen (keine CSS-Klassen nötig).
  var INK = "#232b38"; // Konturfarbe
  var BG = { desert: "#fbeccb", cabin: "#dcebfa" }; // Hintergrundkreis je Szenario
  function pic(bg, defs, inner) {
    return (
      '<svg viewBox="0 0 96 96" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      "<defs>" + defs + "</defs>" +
      '<circle cx="48" cy="48" r="46" fill="' + bg + '" stroke="none"/>' +
      inner +
      "</svg>"
    );
  }
  // Linearer Farbverlauf von oben nach unten (vertikal) oder schräg
  function grad(id, a, b, dir) {
    var d = dir === "h" ? 'x1="0" y1="0" x2="1" y2="0"' : dir === "d" ? 'x1="0" y1="0" x2="1" y2="1"' : 'x1="0" y1="0" x2="0" y2="1"';
    return '<linearGradient id="' + id + '" ' + d + '><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';
  }
  // Inhalt um die Mitte skalieren, damit nichts über den Hintergrundkreis hinausragt
  function fit(inner, sc) {
    return '<g transform="translate(48 48) scale(' + sc + ') translate(-48 -48)">' + inner + "</g>";
  }
  // Zackenkante für Tütenränder: n Zacken, Richtung dir (1 = nach rechts, -1 = nach links)
  function zig(n, dir) {
    var d = "";
    for (var i = 0; i < n; i++) d += " l" + 3 * dir + " " + (i % 2 ? 3 : -3);
    return d;
  }
  var thin = ' stroke-width="1.6"';
  var hair = ' stroke-width="1"';
  var none = ' stroke="none"';
  function sparkle(cx, cy, r, fill) {
    var q = r * 0.22;
    return (
      '<path d="M' + cx + " " + (cy - r) + " L" + (cx + q) + " " + (cy - q) + " L" + (cx + r) + " " + cy + " L" + (cx + q) + " " + (cy + q) +
      " L" + cx + " " + (cy + r) + " L" + (cx - q) + " " + (cy + q) + " L" + (cx - r) + " " + cy + " L" + (cx - q) + " " + (cy - q) + ' Z" fill="' + fill + '"' + thin + "/>"
    );
  }

  // Wasserflasche, Mittelpunkt x = cx
  function bottle(cx) {
    var l = cx - 12, r = cx + 12;
    var body =
      "M" + (cx - 6) + " 22 H" + (cx + 6) + " V34 C" + (cx + 6) + " 38 " + r + " 40 " + r + " 48 V80 a5 5 0 0 1 -5 5 H" +
      (cx - 7) + " a5 5 0 0 1 -5 -5 V48 C" + l + " 40 " + (cx - 6) + " 38 " + (cx - 6) + " 34 Z";
    var water = "M" + l + " 50 H" + r + " V80 a5 5 0 0 1 -5 5 H" + (cx - 7) + " a5 5 0 0 1 -5 -5 Z";
    return (
      '<path d="' + body + '" fill="#eaf6ff"/>' +
      '<path d="' + water + '" fill="url(#g-water)"' + none + "/>" +
      '<path d="M' + l + " 50 q6 -3 12 0 t12 0" + '" stroke="#fff" stroke-width="1.6"/>' +
      '<path d="M' + (cx - 8) + ' 54 V80" stroke="#fff" stroke-width="3" opacity=".85"/>' +
      '<rect x="' + l + '" y="60" width="24" height="14" fill="#fff"' + thin + "/>" +
      '<path d="M' + (cx - 8) + " 65 H" + (cx + 8) + " M" + (cx - 8) + " 69.5 H" + (cx + 3) + '" stroke="#2f6fe0" stroke-width="2"/>' +
      '<circle cx="' + (cx + 8) + '" cy="45" r="1.4" fill="#fff"' + none + "/>" +
      '<circle cx="' + (cx - 3) + '" cy="82" r="1.1" fill="#fff"' + none + "/>" +
      '<path d="' + body + '"/>' +
      '<rect x="' + (cx - 7) + '" y="13" width="14" height="9" rx="2" fill="#2f6fe0"/>' +
      '<path d="M' + (cx - 3.5) + " 14.5 V20.5 M" + cx + " 14.5 V20.5 M" + (cx + 3.5) + ' 14.5 V20.5" stroke="#9cbcf5" stroke-width="1.2"/>'
    );
  }
  // Datteln: eine Frucht mit Falten und Glanz
  function date(cx, cy, rot) {
    return (
      '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ')">' +
      '<ellipse rx="11" ry="7" fill="url(#g-date)"/>' +
      '<path d="M-7 -2.5 Q0 0.5 7 -2.5 M-7.5 1.5 Q0 4.5 7.5 1.5" stroke="#3f200d" stroke-width="1" fill="none"/>' +
      '<ellipse cx="-3.5" cy="-3" rx="4.5" ry="1.5" fill="#c98a55"' + none + ' opacity=".9"/></g>'
    );
  }
  // Baumstamm von vorn (Schnittfläche mit Jahresringen, Rissen und Rinde)
  function log(cx, cy) {
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="15.5" fill="#8f5a30"/>' +
      '<path d="M' + (cx - 15.5) + " " + cy + " h-2 M" + (cx + 15.5) + " " + cy + " h2 M" + cx + " " + (cy - 15.5) + " v-2 M" + cx + " " + (cy + 15.5) +
      ' v2" stroke="#8f5a30" stroke-width="1.4"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#e8bd86"' + thin + "/>" +
      '<circle cx="' + cx + '" cy="' + cy + '" r="7.5" fill="none" stroke="#c99660" stroke-width="1.3"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="none" stroke="#c99660" stroke-width="1.2"/>' +
      '<path d="M' + cx + " " + cy + " L" + (cx + 9) + " " + (cy - 5) + " M" + cx + " " + cy + " L" + (cx - 8) + " " + (cy + 6) +
      '" stroke="#b9854f" stroke-width="1.1"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="1.5" fill="#b9854f"' + none + "/>"
    );
  }
  // Kerze mit Flamme und Leuchten: x = linke Kante, top = Oberkante des Wachses
  function candle(x, top, color, shade) {
    var cx = x + 7;
    return (
      '<circle cx="' + cx + '" cy="' + (top - 12) + '" r="13" fill="url(#g-glow)"' + none + "/>" +
      '<rect x="' + x + '" y="' + top + '" width="14" height="' + (76 - top) + '" rx="2" fill="' + color + '"/>' +
      '<rect x="' + (x + 9) + '" y="' + (top + 1) + '" width="4" height="' + (74 - top) + '" fill="' + shade + '"' + none + "/>" +
      '<ellipse cx="' + cx + '" cy="' + (top + 1) + '" rx="7" ry="2" fill="' + shade + '"' + thin + "/>" +
      '<path d="M' + (x + 1) + " " + (top + 1) + " v7 a2 2 0 0 0 4 0 v-6 M" + (x + 9) + " " + (top + 2) + " v4 a1.6 1.6 0 0 0 3.2 0 v-3" + '" fill="' + shade + '"' + thin + "/>" +
      '<path d="M' + cx + " " + (top + 1) + " v-6" + '" stroke-width="1.8"/>' +
      '<path d="M' + cx + " " + (top - 24) + " C" + (cx + 7) + " " + (top - 16) + " " + (cx + 8) + " " + (top - 10) + " " + cx + " " + (top - 5) +
      " C" + (cx - 8) + " " + (top - 10) + " " + (cx - 7) + " " + (top - 16) + " " + cx + " " + (top - 24) + ' Z" fill="#f2994a"/>' +
      '<path d="M' + cx + " " + (top - 16) + " C" + (cx + 3.5) + " " + (top - 12) + " " + (cx + 3.5) + " " + (top - 9) + " " + cx + " " + (top - 7) +
      " C" + (cx - 3.5) + " " + (top - 9) + " " + (cx - 3.5) + " " + (top - 12) + " " + cx + " " + (top - 16) + ' Z" fill="#ffe08a"' + none + "/>"
    );
  }
  // Schlafsack (Mumienform) von oben, lokale Koordinaten um (0,0)
  function mummy(color, dark, light) {
    var shape = "M-12 -26 A12 12 0 0 1 12 -26 L19 -14 C21 6 17 24 11 34 Q0 40 -11 34 C-17 24 -21 6 -19 -14 Z";
    return (
      '<path d="' + shape + '" fill="' + color + '"/>' +
      '<g clip-path="url(#cp-mummy)" fill="none">' +
      '<path d="M-24 -8 Q0 -3 24 -8 M-24 3 Q0 8 24 3 M-24 14 Q0 19 24 14 M-24 25 Q0 30 24 25" stroke="' + dark + '" stroke-width="1.6"/>' +
      '<path d="M-19 -14 C-21 6 -17 24 -11 34 L-6 36 C-12 20 -15 4 -13 -14 Z" fill="' + light + '" stroke="none" opacity=".55"/></g>' +
      '<path d="' + shape + '"/>' +
      '<ellipse cx="0" cy="-26" rx="7.5" ry="8.5" fill="' + dark + '"' + thin + "/>" +
      '<ellipse cx="0" cy="-26" rx="4.5" ry="5.5" fill="' + light + '"' + none + "/>" +
      '<path d="M0 -17 V34" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<rect x="-2.6" y="-16" width="5.2" height="7" rx="1.6" fill="#f2c94c"' + thin + "/>"
    );
  }

  var NEW = {
    // ----- Wüste -----
    mirror: pic(
      BG.desert,
      grad("g-mir-frame", "#f0d27a", "#b98a2c") + grad("g-mir-glass", "#cfe9fb", "#7fb9ea", "d"),
      '<path d="M62 8 L60 16 M74 18 L81 14 M76 32 L85 33" stroke="#f2b705" stroke-width="3"/>' +
        '<g transform="rotate(-35 46 50)">' +
        '<path d="M40 62 C40 70 42 78 41 86 a5 5 0 0 0 5 5 a5 5 0 0 0 5 -5 C50 78 52 70 52 62 Z" fill="url(#g-mir-frame)"/>' +
        '<path d="M42 72 H50 M42 78 H50" stroke="#9a6f1c" stroke-width="1.4"/>' +
        '<ellipse cx="46" cy="40" rx="25" ry="29" fill="url(#g-mir-frame)"/>' +
        '<ellipse cx="46" cy="40" rx="20" ry="24" fill="url(#g-mir-glass)"' + thin + "/>" +
        '<g fill="#fff"' + none + '><ellipse cx="38" cy="31" rx="8" ry="3.6" opacity=".95"/><ellipse cx="44" cy="28" rx="6" ry="3.6" opacity=".95"/>' +
        '<ellipse cx="55" cy="44" rx="7" ry="3" opacity=".9"/><ellipse cx="50" cy="47" rx="5" ry="2.8" opacity=".9"/></g>' +
        '<path d="M30 54 L47 20 H53 L36 58 Z" fill="#fff"' + none + ' opacity=".6"/>' +
        '<path d="M46 5 q-3 -3 0 -5 M38 7 l-3 -2 M54 7 l3 -2" stroke="#9a6f1c" stroke-width="1.2" fill="none" opacity="0"/></g>' +
        sparkle(72, 24, 13, "#fff2a8"),
    ),
    sunhat: pic(
      BG.desert,
      grad("g-hat", "#f8e3a3", "#e2b957") + grad("g-brim", "#efd083", "#d2a64a"),
      '<ellipse cx="48" cy="64" rx="38" ry="12" fill="url(#g-brim)"/>' +
        '<ellipse cx="48" cy="64" rx="29" ry="8.5" fill="none" stroke="#b98a35" stroke-width="1.2"/>' +
        '<ellipse cx="48" cy="64" rx="20" ry="5.5" fill="none" stroke="#b98a35" stroke-width="1.2"/>' +
        '<path d="M28 62 C28 36 36 26 48 26 C60 26 68 36 68 62 Z" fill="url(#g-hat)"/>' +
        '<path d="M34 38 C37 50 38 56 38 61 M42 31 C44 43 45 52 45 62 M54 31 C53 43 52 52 52 62 M62 38 C60 50 59 56 59 61" stroke="#c99b3d" stroke-width="1.3"/>' +
        '<path d="M30 54 C42 61 54 61 66 54 L67 62 C55 68 41 68 29 62 Z" fill="#d1495b"/>' +
        '<path d="M60 58 L72 54 L70 66 Z" fill="#b53a4a"' + thin + "/>" +
        '<path d="M40 30 C44 28 48 27 52 28" stroke="#fff" stroke-width="2.4" opacity=".6"/>' +
        '<path d="M14 66 C26 76 70 76 82 66" stroke="#b98a35" stroke-width="1.6"/>',
    ),
    tarp: pic(
      BG.desert,
      grad("g-tarp", "#5bb5b0", "#2f8782", "d"),
      '<path d="M24 14 V80 M74 34 V80" stroke="#8a6a43" stroke-width="3.4"/>' +
        '<path d="M16 80 H34 M64 80 H84" stroke="#8a6a43" stroke-width="2.4"/>' +
        '<path d="M24 22 L74 42 L82 70 L14 66 Z" fill="url(#g-tarp)"/>' +
        '<path d="M50 32 L74 42 L82 70 L52 68 Z" fill="#256e6a" opacity=".55"' + none + "/>" +
        '<path d="M30 34 L40 62 M40 38 L50 64 M58 52 L72 54" stroke="#fff" stroke-width="1.4" opacity=".45"/>' +
        '<path d="M24 22 L74 42 L82 70 L14 66 Z"/>' +
        '<path d="M14 66 L8 76 M82 70 L88 78" stroke-width="1.6"/>' +
        '<circle cx="24" cy="22" r="3.2" fill="#f2c94c"' + thin + "/>" +
        '<circle cx="74" cy="42" r="3.2" fill="#f2c94c"' + thin + "/>" +
        '<circle cx="82" cy="70" r="3.2" fill="#f2c94c"' + thin + "/>" +
        '<circle cx="14" cy="66" r="3.2" fill="#f2c94c"' + thin + "/>",
    ),
    flashlight: pic(
      BG.desert,
      grad("g-body", "#ee7a52", "#b84a24") + grad("g-head", "#8a96a8", "#4f5b6c") + '<linearGradient id="g-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3a0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></linearGradient>',
      fit(
        '<g transform="rotate(-30 48 48)">' +
          '<path d="M72 36 L96 22 V74 L72 60 Z" fill="url(#g-beam)"' + none + "/>" +
          '<rect x="8" y="40" width="38" height="16" rx="4" fill="url(#g-body)"/>' +
          '<path d="M14 40 V56 M20 40 V56 M26 40 V56 M32 40 V56" stroke="#8f3817" stroke-width="2"/>' +
          '<rect x="34" y="36.5" width="9" height="5" rx="2" fill="#d9dee6"' + thin + "/>" +
          '<rect x="44" y="37" width="6" height="22" rx="2" fill="#c1c9d4"/>' +
          '<path d="M50 34 L70 28 V68 L50 62 Z" fill="url(#g-head)"/>' +
          '<ellipse cx="70" cy="48" rx="5" ry="20" fill="#fff6bf"/>' +
          '<ellipse cx="70" cy="48" rx="2.6" ry="12" fill="#fff" ' + none + ' opacity=".9"/>' +
          '<path d="M52 38 L62 35" stroke="#fff" stroke-width="1.6" opacity=".5"/></g>',
        0.88,
      ),
    ),
    bottles: pic(BG.desert, grad("g-water", "#b6defc", "#5aaef0"), fit(bottle(32) + bottle(64), 0.92)),
    radio: pic(
      BG.desert,
      grad("g-radio", "#3b4d6b", "#222d42"),
      '<rect x="55" y="6" width="7" height="24" rx="3" fill="#2b3340"/><path d="M57 11 H60 M57 15 H60 M57 19 H60" stroke="#6b7686" stroke-width="1.2"/>' +
        '<rect x="33" y="14" width="8" height="14" rx="2" fill="#f2994a"/><path d="M35 17 V25 M38 17 V25" stroke="#b86a22" stroke-width="1.2"/>' +
        '<rect x="22" y="40" width="7" height="16" rx="3" fill="#f2994a"/>' +
        '<rect x="27" y="26" width="42" height="62" rx="9" fill="url(#g-radio)"/>' +
        '<rect x="32" y="31" width="32" height="15" rx="3" fill="#2a374d"' + thin + "/>" +
        '<path d="M36 35 H60 M36 39 H60 M36 43 H60" stroke="#8fa3c4" stroke-width="1.6"/>' +
        '<rect x="32" y="50" width="32" height="13" rx="2.5" fill="#a7e8c8"' + thin + "/>" +
        '<text x="48" y="60" font-size="8.5" font-weight="700" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" fill="#1e6b4a" stroke="none">CH 3</text>' +
        '<g fill="#8fa3c4"' + none + '><circle cx="39" cy="71" r="2.7"/><circle cx="48" cy="71" r="2.7"/><circle cx="57" cy="71" r="2.7"/>' +
        '<circle cx="39" cy="79" r="2.7"/><circle cx="48" cy="79" r="2.7" fill="#d1495b"/><circle cx="57" cy="79" r="2.7"/></g>',
    ),
    sweater: pic(
      BG.desert,
      grad("g-wool", "#ec8d72", "#cc664a"),
      '<path d="M32 20 L15 33 L6 60 L21 65 L28 51 V84 H68 V51 L75 65 L90 60 L81 33 L64 20 C58 29 38 29 32 20 Z" fill="url(#g-wool)"/>' +
        '<path d="M28 76 H68 V84 H28 Z" fill="#b75840"' + thin + "/>" +
        '<path d="M6 60 L21 65 L19 72 L4 67 Z M90 60 L75 65 L77 72 L92 67 Z" fill="#b75840"' + thin + "/>" +
        '<path d="M37 34 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8 q4 4 0 8 M48 34 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8 q4 4 0 8 M59 34 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8 q4 4 0 8" stroke="#f6bba8" stroke-width="1.8"/>' +
        '<path d="M32 20 C38 29 58 29 64 20" fill="#b75840" stroke-width="2.4"/>' +
        '<path d="M35 22 C40 28 56 28 61 22" stroke="#e9967f" stroke-width="1.3"/>' +
        '<path d="M32 78 V83 M38 78 V83 M44 78 V83 M50 78 V83 M56 78 V83 M62 78 V83 M12 62 L10 69 M16 63 L14 70 M84 62 L86 69 M80 63 L82 70" stroke="#8f4630" stroke-width="1.3"/>' +
        '<path d="M20 38 L12 58" stroke="#f6bba8" stroke-width="2.4" opacity=".6"/>',
    ),
    dates: pic(
      BG.desert,
      grad("g-date", "#8a4b25", "#4f2610") + grad("g-bowl", "#d9a06a", "#a86a38") + grad("g-leaf", "#6fcf8f", "#2f9a5c", "d"),
      '<path d="M60 34 C62 20 74 12 90 14 C82 18 76 26 74 38 Z" fill="url(#g-leaf)"/>' +
        '<path d="M62 34 C70 26 78 20 88 15" stroke="#1f7a47" stroke-width="1.2"/>' +
        date(33, 42, -22) + date(61, 41, 20) + date(47, 36, -4) + date(26, 50, 12) + date(69, 50, -14) + date(47, 47, 6) +
        '<path d="M16 52 H80 C80 71 67 84 48 84 C29 84 16 71 16 52 Z" fill="url(#g-bowl)"/>' +
        '<path d="M22 60 C32 78 64 78 74 60" stroke="#e6bb8a" stroke-width="2"/>' +
        '<path d="M26 66 C34 80 62 80 70 66 M34 72 C40 80 56 80 62 72" stroke="#9b5f30" stroke-width="1.1"/>' +
        '<path d="M16 52 H80" stroke-width="3"/>',
    ),
    // ----- Berghütte -----
    woodpile: pic(
      BG.cabin,
      "",
      '<path d="M14 82 H82" stroke="#8a6a43" stroke-width="2"/>' + log(31, 66) + log(65, 66) + log(48, 38),
    ),
    stove: pic(
      BG.cabin,
      grad("g-can", "#5aa9ec", "#2a78c2", "h") + '<radialGradient id="g-flame" cx="0.5" cy="0.6" r="0.6"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>',
      '<circle cx="48" cy="20" r="17" fill="url(#g-flame)"' + none + "/>" +
        '<path d="M48 4 C58 14 59 22 48 29 C37 22 38 14 48 4 Z" fill="#f2994a"/>' +
        '<path d="M48 14 C54 19 54 24 48 28 C42 24 42 19 48 14 Z" fill="#ffe08a"' + none + "/>" +
        '<path d="M30 38 L24 31 M66 38 L72 31 M48 38 V30" stroke-width="2.4"/>' +
        '<path d="M28 38 H68" stroke-width="3.4"/>' +
        '<ellipse cx="48" cy="40" rx="18" ry="5" fill="#59636f"/>' +
        '<rect x="45" y="43" width="6" height="8" fill="#6b7686"/>' +
        '<rect x="39" y="49" width="18" height="7" rx="2" fill="#aab3bf"/>' +
        '<path d="M42 49 V56 M46 49 V56 M50 49 V56 M54 49 V56" stroke="#6b7686" stroke-width="1"/>' +
        '<rect x="32" y="55" width="32" height="30" rx="6" fill="url(#g-can)"/>' +
        '<rect x="32" y="62" width="32" height="15" fill="#fff"' + thin + "/>" +
        '<path d="M36 67 H60 M36 72 H50" stroke="#2a78c2" stroke-width="2"/>' +
        '<circle cx="58" cy="72" r="2.4" fill="#f2994a"' + hair + "/>" +
        '<path d="M37 58 V83" stroke="#fff" stroke-width="2.4" opacity=".55"/>' +
        '<rect x="66" y="50" width="8" height="5" rx="1.5" fill="#f2994a"/>',
    ),
    sleepingbag: pic(
      BG.cabin,
      '<clipPath id="cp-mummy"><path d="M-12 -26 A12 12 0 0 1 12 -26 L19 -14 C21 6 17 24 11 34 Q0 40 -11 34 C-17 24 -21 6 -19 -14 Z"/></clipPath>',
      '<g transform="translate(30 50) rotate(-9) scale(.9)">' + mummy("#5b8def", "#3a6fd0", "#a9c4f8") + "</g>" +
        '<g transform="translate(66 50) rotate(9) scale(.9)">' + mummy("#e0533d", "#bf3d2a", "#f4a393") + "</g>",
    ),
    candles: pic(
      BG.cabin,
      '<radialGradient id="g-glow"><stop offset="0" stop-color="#ffe08a" stop-opacity=".75"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>' + grad("g-brass", "#e6c36a", "#a97f2c"),
      '<path d="M16 80 H80" stroke="#8a6a43" stroke-width="2"/>' +
        '<path d="M20 76 H76 L72 84 H24 Z" fill="url(#g-brass)"/>' +
        candle(21, 46, "#fff4d6", "#f0dcae") +
        candle(41, 36, "#ffe9a8", "#eccf7a") +
        candle(61, 50, "#fff4d6", "#f0dcae"),
    ),
    noodles: pic(
      BG.cabin,
      grad("g-bag", "#fff8dc", "#f7e6a6", "h"),
      '<path d="M24 16' + zig(16, 1) + ' V80' + zig(16, -1) + ' Z" fill="url(#g-bag)"/>' +
        '<rect x="30" y="22" width="36" height="24" rx="4" fill="#fffdf3"' + thin + "/>" +
        '<g fill="#f2c94c" stroke="#b9902a" stroke-width="1">' +
        '<rect x="33" y="25" width="13" height="5" rx="2.2" transform="rotate(-18 39 27)"/><rect x="48" y="24" width="13" height="5" rx="2.2" transform="rotate(14 54 26)"/>' +
        '<rect x="34" y="32" width="13" height="5" rx="2.2" transform="rotate(12 40 34)"/><rect x="49" y="32" width="13" height="5" rx="2.2" transform="rotate(-20 55 34)"/>' +
        '<rect x="35" y="39" width="13" height="5" rx="2.2" transform="rotate(-10 41 41)"/><rect x="50" y="39" width="13" height="5" rx="2.2" transform="rotate(18 56 41)"/></g>' +
        '<rect x="24" y="50" width="48" height="19" fill="#d1495b"/>' +
        '<text x="48" y="64" font-size="12" font-weight="800" text-anchor="middle" font-family="system-ui,Arial,sans-serif" letter-spacing="1" fill="#fff" stroke="none">PASTA</text>' +
        '<path d="M32 74 H64" stroke="#d6bd6a" stroke-width="1.6"/>' +
        '<path d="M28 24 V70" stroke="#fff" stroke-width="2.4" opacity=".6"/>',
    ),
    powerbank: pic(
      BG.cabin,
      grad("g-pb", "#fbfcfe", "#d3dae5", "d"),
      '<rect x="31" y="19" width="40" height="64" rx="9" fill="#8e9bb0"/>' +
        '<rect x="28" y="14" width="40" height="64" rx="9" fill="url(#g-pb)"/>' +
        '<path d="M28 33 H68 V23 a9 9 0 0 0 -9 -9 H37 a9 9 0 0 0 -9 9 Z" fill="#3b4a60"/>' +
        '<g' + none + '><circle cx="37" cy="23" r="2.5" fill="#5be39a"/><circle cx="45" cy="23" r="2.5" fill="#5be39a"/><circle cx="53" cy="23" r="2.5" fill="#5be39a"/><circle cx="61" cy="23" r="2.5" fill="#c3cad6"/></g>' +
        '<path d="M52 37 L40 56 H48 L44 72 L58 52 H50 Z" fill="#f2c94c"/>' +
        '<path d="M32 40 V72" stroke="#fff" stroke-width="3" opacity=".9"/>' +
        '<rect x="41" y="74" width="14" height="4" rx="1.5" fill="#6b7686"' + thin + "/>",
    ),
    snowshoes: pic(
      BG.cabin,
      '<clipPath id="cp-ss"><path d="M0 -36 C20 -36 26 -14 18 6 C14 16 8 26 4 36 H-4 C-8 26 -14 16 -18 6 C-26 -14 -20 -36 0 -36 Z"/></clipPath>',
      ["translate(30 48) rotate(-10) scale(.72)", "translate(66 48) rotate(10) scale(.72)"]
        .map(function (t) {
          return (
            '<g transform="' + t + '">' +
            '<path d="M0 -36 C20 -36 26 -14 18 6 C14 16 8 26 4 36 H-4 C-8 26 -14 16 -18 6 C-26 -14 -20 -36 0 -36 Z" fill="#f4ead2"/>' +
            '<g clip-path="url(#cp-ss)" stroke="#b9854f" stroke-width="1.8" fill="none">' +
            '<path d="M-30 -30 L30 30 M-30 -14 L30 46 M-30 2 L30 62 M-12 -40 L30 2 M6 -40 L30 -16"/>' +
            '<path d="M30 -30 L-30 30 M30 -14 L-30 46 M30 2 L-30 62 M12 -40 L-30 2 M-6 -40 L-30 -16"/></g>' +
            '<path d="M0 -36 C20 -36 26 -14 18 6 C14 16 8 26 4 36 H-4 C-8 26 -14 16 -18 6 C-26 -14 -20 -36 0 -36 Z" stroke="#8a5a33" stroke-width="4"/>' +
            '<rect x="-14" y="-10" width="28" height="8" rx="3" fill="#e0533d"/><rect x="-11" y="4" width="22" height="8" rx="3" fill="#e0533d"/>' +
            '<rect x="-4" y="-11" width="8" height="10" rx="2" fill="#f2c94c"' + thin + "/></g>"
          );
        })
        .join(""),
    ),
    axe: pic(
      BG.cabin,
      grad("g-steel", "#c9d2de", "#8793a5", "d") + grad("g-wood", "#cc9660", "#9a6a3a", "h"),
      fit(
        '<g transform="rotate(35 48 48)">' +
          '<rect x="43" y="6" width="10" height="86" rx="5" fill="url(#g-wood)"/>' +
          '<path d="M46 22 V84 M50 30 V88" stroke="#7c5230" stroke-width="1.1"/>' +
          '<rect x="42" y="62" width="12" height="22" rx="3" fill="#6b4a2d"/>' +
          '<path d="M42 66 H54 M42 71 H54 M42 76 H54 M42 81 H54" stroke="#3f2a16" stroke-width="1.2"/>' +
          '<path d="M53 11 L73 4 C84 20 84 40 73 56 L53 48 Z" fill="url(#g-steel)"/>' +
          '<path d="M73 4 C84 20 84 40 73 56" stroke="#f1f5fa" stroke-width="3"/>' +
          '<path d="M58 16 L60 40" stroke="#fff" stroke-width="2.2" opacity=".85"/>' +
          '<rect x="36" y="12" width="9" height="30" rx="2" fill="#7a8698"/>' +
          '<path d="M38 18 H43 M38 24 H43" stroke="#a9b3c2" stroke-width="1.2"/></g>',
        0.84,
      ),
    ),
  };
  // Die neuen Illustrationen ersetzen die einfachen Linien-Icons gleichen Namens
  for (var k in NEW) window.ICONS[k] = NEW[k];
})();
