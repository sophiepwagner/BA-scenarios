// Inhalte der Szenarien. Wird vor main.js geladen und über window.SCENARIOS gelesen.
// Pro Szenario: Titel, Einleitung und je 4 Gegenstände für Rolle a und b.
// "icon" verweist auf einen Schlüssel in window.ICONS.
window.SCENARIOS = {
  plane: {
    title: "Flugzeugabsturz im Dschungel",
    intro:
      "Euer Kleinflugzeug ist über dem Dschungel abgestürzt. Ihr seid beide unverletzt, aber weit entfernt von jeder Siedlung. Das Wrack ist unbrauchbar, ihr müsst es verlassen.",
    items: {
      a: [
        { icon: "filter", name: "Wasserfilter", note: "Pumpe, filtert ca. 100 Liter" },
        { icon: "flaregun", name: "Leuchtpistole", note: "3 Schuss" },
        { icon: "compass", name: "Kompass", note: "funktioniert, keine Karte" },
        { icon: "cans", name: "Dosenessen", note: "6 Dosen, ohne Öffner" },
      ],
      b: [
        { icon: "machete", name: "Machete", note: "groß und scharf" },
        { icon: "firstaid", name: "Erste-Hilfe-Set", note: "Standard-Ausstattung" },
        { icon: "satphone", name: "Satellitentelefon", note: "Akku bei ca. 20 %" },
        { icon: "mosquitonet", name: "Moskitonetz", note: "für eine Person" },
      ],
    },
  },
  island: {
    title: "Schiffbruch auf einer einsamen Insel",
    intro:
      "Euer Schiff ist gesunken. Ihr habt euch auf eine unbewohnte Insel gerettet und konntet einige Dinge aus dem Wrack bergen. Die Insel liegt abseits der üblichen Schifffahrtsrouten.",
    items: {
      a: [
        { icon: "fishing", name: "Angelset", note: "Angel, Haken, Schnur" },
        { icon: "sunscreen", name: "Sonnencreme", note: "LSF 50, eine große Tube" },
        { icon: "seamap", name: "Seekarte", note: "die Insel ist nicht eingezeichnet" },
        { icon: "rope", name: "Seil", note: "20 Meter, reißfest" },
      ],
      b: [
        { icon: "water", name: "Trinkwasser", note: "5 Liter in Kanistern" },
        { icon: "binoculars", name: "Fernglas", note: "gute Qualität" },
        { icon: "blanket", name: "Rettungsdecke", note: "silber-gold beschichtet" },
        { icon: "matches", name: "Streichhölzer", note: "Schachtel, ein Teil nass" },
      ],
    },
  },
  desert: {
    title: "Autopanne in der Wüste",
    intro:
      "Euer Auto ist auf einer einsamen Wüstenstraße liegengeblieben und lässt sich nicht reparieren. Ihr seid unverletzt. Die nächste Straße mit Verkehr ist etwa 40 Kilometer entfernt, es ist früher Nachmittag und 38 Grad heiß. Ihr könnt beim Auto bleiben oder losgehen.",
    items: {
      a: [
        { icon: "mirror", name: "Signalspiegel", note: "handtellergroß" },
        { icon: "sunhat", name: "Sonnenhut", note: "breite Krempe" },
        { icon: "tarp", name: "Zeltplane", note: "3 x 3 Meter" },
        { icon: "flashlight", name: "Taschenlampe", note: "" },
      ],
      b: [
        { icon: "bottles", name: "Wasserflaschen", note: "4 Flaschen à 1 Liter" },
        { icon: "radio", name: "Funkgerät", note: "" },
        { icon: "sweater", name: "Wollpullover", note: "" },
        { icon: "dates", name: "Datteln", note: "2 kg, getrocknet" },
      ],
    },
  },
  cabin: {
    title: "Eingeschneite Berghütte",
    intro:
      "Ein Schneesturm hat euch in einer abgelegenen Berghütte eingeschlossen. Die Straße ist unpassierbar, die Rettung kommt voraussichtlich in drei Tagen. Die Hütte ist ausgekühlt, draußen sind es minus zehn Grad. Ihr habt nur das, was ihr bei euch habt.",
    items: {
      a: [
        { icon: "woodpile", name: "Brennholz", note: "" },
        { icon: "stove", name: "Gaskocher", note: "" },
        { icon: "sleepingbag", name: "Schlafsäcke", note: "2 Stück" },
        { icon: "candles", name: "Kerzen", note: "10 Stück" },
      ],
      b: [
        { icon: "noodles", name: "Nudeln", note: "2 kg" },
        { icon: "powerbank", name: "Powerbank", note: "" },
        { icon: "snowshoes", name: "Schneeschuhe", note: "ein Paar" },
        { icon: "axe", name: "Axt", note: "scharf, schwerer Griff" },
      ],
    },
  },
};
