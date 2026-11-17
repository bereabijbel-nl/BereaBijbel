// Controleert vertaalde Strong-definities tegen de Engelse bron.
// Gebruik: node controleer-strong-vertaling.js <bron.json> <vertaling.json>...
// Elke vertaling wordt gecontroleerd tegen het bronbestand met dezelfde sleutels
// (bijv. data/lexicon/greek.json en data/lexicon/greek.nl.json).
// Controles: sleutel bestaat in de bron, getallen komen even vaak terug,
// {…}-groepen zijn onveranderd, de vertaling is niet leeg.
const fs = require('fs');

const [, , bronPad, ...vertalingPaden] = process.argv;
if (!bronPad || vertalingPaden.length === 0) {
	console.error('Gebruik: node controleer-strong-vertaling.js <bron.json> <vertaling.json>...');
	process.exit(2);
}

const bron = JSON.parse(fs.readFileSync(bronPad, 'utf-8'));
const tel = (tekst, regex) => {
	const m = new Map();
	for (const x of tekst.match(regex) || []) m.set(x, (m.get(x) || 0) + 1);
	return m;
};
const gelijk = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v);

let fouten = 0;
let totaal = 0;
for (const pad of vertalingPaden) {
	const vertaling = JSON.parse(fs.readFileSync(pad, 'utf-8'));
	for (const [sleutel, waarde] of Object.entries(vertaling)) {
		totaal++;
		const nl = typeof waarde === 'string' ? waarde : waarde && waarde.definitie;
		const b = bron[sleutel];
		if (!b) { console.log(`${sleutel}: staat niet in de bron`); fouten++; continue; }
		if (!nl || !nl.trim()) { console.log(`${sleutel}: lege vertaling`); fouten++; continue; }
		if (!gelijk(tel(b.definitie, /\d+/g), tel(nl, /\d+/g))) {
			console.log(`${sleutel}: getallen wijken af`); fouten++;
		}
		if (!gelijk(tel(b.definitie, /\{[^}]*\}/g), tel(nl, /\{[^}]*\}/g))) {
			console.log(`${sleutel}: {…}-groepen wijken af`); fouten++;
		}
	}
}
console.log(`${totaal} vermeldingen gecontroleerd, ${fouten} fout(en).`);
process.exit(fouten ? 1 : 0);
