// Voegt de vertaalde Dodson-brokken (data/lexicon/nl/dodson-NNN.json) samen tot data/lexicon/greek.nl.json.
// Per Strong-nummer: glos, definitie, bron, bron_en, translit. Nummers zonder vertaling staan er niet in:
// daarvoor blijft Strong (data/lexicon/greek.json) de terugval. Gebruik: node voeg-lexicon-samen.js
const fs = require('fs');
const dir = 'data/lexicon/nl/';
const strong = JSON.parse(fs.readFileSync('data/lexicon/greek.json', 'utf8'));
const samen = {};
let dubbel = 0;
for (const f of fs.readdirSync(dir).filter(f => /^dodson-\d{3}\.json$/.test(f)).sort()) {
	for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(dir + f, 'utf8')))) {
		if (samen[k]) { dubbel++; continue; }
		samen[k] = { translit: (strong[k] || {}).translit || '', glos: v.glos, definitie: v.definitie, bron: v.bron, bron_en: v.bron_en };
	}
}
const uit = {};
for (const k of Object.keys(samen).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) uit[k] = samen[k];
fs.writeFileSync('data/lexicon/greek.nl.json', JSON.stringify(uit, null, 1) + '\n');
const zonder = Object.keys(strong).filter(k => !uit[k]).length;
const leeg = Object.values(uit).filter(v => !v.glos || !v.definitie || !v.bron || !v.bron_en).length;
console.log(`${Object.keys(uit).length} vermeldingen samengevoegd, ${dubbel} dubbel, ${leeg} onvolledig; ${zonder} Strong-nummers houden Strong als terugval.`);
