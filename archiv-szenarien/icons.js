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
})();
