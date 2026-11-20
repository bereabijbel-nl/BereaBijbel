// Controleert vertaalde Strong-definities tegen de Engelse bron.
// Gebruik: node controleer-strong-vertaling.js <bron.json> <vertaling.json>...
// Elke vertaling wordt gecontroleerd tegen het bronbestand met dezelfde sleutels
// (bijv. data/lexicon/greek.json en data/lexicon/greek.nl.json).
// Controles: sleutel bestaat in de bron, getallen komen even vaak terug,
// {…}-groepen zijn onveranderd, de vertaling is niet leeg.
// Lexiconbrokken (Dodson): als de vermelding een 'glos' heeft, gelden extra controles: glos van 1 tot 4 woorden,
// geen Engelse restwoorden in glos of definitie, 'bron' en 'bron_en' aanwezig. Als bron dient dan het brokbestand
// uit werk/lexicon/ (met 'lang' in plaats van 'definitie').
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

const ENGELS = ['the', 'which', 'i.e.', 'and', 'with', 'from', 'that', 'to', 'for', 'or', 'a', 'an', 'by', 'not', 'his', 'her', 'who', 'one'];
const engelseRest = t => (t.toLowerCase().replace(/\(\w\)/g, ' ').match(/[a-z.']+/g) || []).filter(w => ENGELS.includes(w));

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
		const brontekst = b.definitie ?? b.lang ?? '';
		if (waarde.glos !== undefined) {
			const n = String(waarde.glos).trim().split(/\s+/).filter(Boolean).length;
			if (n < 1 || n > 4) { console.log(`${sleutel}: glos heeft ${n} woorden (moet 1 tot 4)`); fouten++; }
			const rest = engelseRest(`${waarde.glos} ${nl}`);
			if (rest.length) { console.log(`${sleutel}: Engelse restwoorden: ${[...new Set(rest)].join(', ')}`); fouten++; }
			if (!waarde.bron) { console.log(`${sleutel}: bron ontbreekt`); fouten++; }
			if (!waarde.bron_en || !waarde.bron_en.kort || !waarde.bron_en.lang) { console.log(`${sleutel}: bron_en ontbreekt`); fouten++; }
		}
		if (!gelijk(tel(brontekst, /\d+/g), tel(nl, /\d+/g))) {
			console.log(`${sleutel}: getallen wijken af`); fouten++;
		}
		if (!gelijk(tel(brontekst, /\{[^}]*\}/g), tel(nl, /\{[^}]*\}/g))) {
			console.log(`${sleutel}: {…}-groepen wijken af`); fouten++;
		}
	}
}
console.log(`${totaal} vermeldingen gecontroleerd, ${fouten} fout(en).`);
process.exit(fouten ? 1 : 0);
