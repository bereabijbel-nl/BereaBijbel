// Zet de compacte koppelnotatie (WP3) om naar het JSON-formaat in data/koppeling/.
// Gebruik: node pipeline/scripts/koppeling-uit-tekst.js <boek> <hoofdstuk> [invoer.txt] [uitvoer.json]
// Standaard: werk/koppeling/<boek>-<hoofdstuk>.txt  ->  data/koppeling/<boek>/<hoofdstuk>.json
//
// Notatie, één regel per vers:
//   1| Paulus=0 gevangene=1 van~2 Christus=2 Jezus=3 en=4 ... onze=13 ...
//   woord=3     woordkoppeling met Grieks woord op plaats 3        (type woord)
//   woord=3,4   met meerdere Griekse woorden                        (type woord)
//   woord~3     hoort bij een uitdrukking of segment                (type segment)
//   woord~3,4   idem, bij meerdere Griekse woorden                  (type segment)
//   woord+      geen grondtekstequivalent                           (type toevoeging)
// Regels die met # beginnen: opmerking. Staat zo'n regel direct onder een versregel,
// dan wordt die als "opmerking" bij het vers bewaard (bijv. reden voor een ongekoppeld woord).
// Lege regels worden overgeslagen.
//
// Dit script controleert alleen de notatie. De inhoud (zelfde woorden als de vertaling,
// plaatsen binnen het vers) controleert controleer-koppeling.js.
const fs = require('fs');
const path = require('path');

const [, , boek, hfd, invoerArg, uitvoerArg] = process.argv;
if (!boek || !hfd) {
	console.error('Gebruik: node koppeling-uit-tekst.js <boek> <hoofdstuk> [invoer.txt] [uitvoer.json]');
	process.exit(2);
}
const hoofdstuk = hfd.padStart(2, '0');
const root = path.resolve(__dirname, '..', '..');
const invoer = invoerArg || path.join(root, 'werk', 'koppeling', `${boek}-${hoofdstuk}.txt`);
const uitvoer = uitvoerArg || path.join(root, 'data', 'koppeling', boek, `${hoofdstuk}.json`);

const BRON = process.env.KOPPELING_BRON ||
	'Woordkoppeling van de bestaande vertaling aan RP2018, gemaakt door Claude in de compacte notatie (werk/koppeling). Niet door een mens nagekeken.';

let fouten = 0;
const fout = (regel, bericht) => { console.error(`regel ${regel}: ${bericht}`); fouten++; };

const verzen = [];
const gezien = new Set();
let huidig = null;
const regels = fs.readFileSync(invoer, 'utf-8').split(/\r?\n/);

regels.forEach((rauw, i) => {
	const nr = i + 1;
	const regel = rauw.trim();
	if (!regel) return;
	if (regel.startsWith('#')) {
		if (huidig) huidig.opmerking = (huidig.opmerking ? huidig.opmerking + ' ' : '') + regel.replace(/^#\s*/, '');
		return;
	}
	const m = regel.match(/^(\d+)\|\s*(.*)$/);
	if (!m) { fout(nr, `verwacht "<vers>| woord=1 ...", gevonden "${regel.slice(0, 40)}"`); return; }
	const vers = Number(m[1]);
	if (gezien.has(vers)) fout(nr, `vers ${vers} komt twee keer voor`);
	gezien.add(vers);
	const koppeling = [];
	for (const tok of m[2].split(/\s+/).filter(Boolean)) {
		const t = tok.match(/^(.+?)(?:=([0-9,]*)|~([0-9,]*)|(\+))$/u);
		if (!t) { fout(nr, `vers ${vers}: onbegrijpelijk token "${tok}" (woord=3, woord=3,4, woord~3 of woord+)`); continue; }
		const [, nl, woordPl, segPl, plus] = t;
		if (plus) { koppeling.push({ nl, type: 'toevoeging', bron: [] }); continue; }
		const lijst = (woordPl !== undefined ? woordPl : segPl);
		const bron = lijst.split(',').map((s) => (s === '' ? NaN : Number(s)));
		if (!bron.length || bron.some((b) => !Number.isInteger(b))) { fout(nr, `vers ${vers}: ongeldige plaatsen bij "${tok}"`); continue; }
		if (new Set(bron).size !== bron.length) { fout(nr, `vers ${vers}: dubbele plaats bij "${tok}"`); continue; }
		koppeling.push({ nl, type: woordPl !== undefined ? 'woord' : 'segment', bron });
	}
	huidig = { vers, koppeling };
	verzen.push(huidig);
});

if (fouten) { console.error(`${fouten} notatiefout(en); niets geschreven.`); process.exit(1); }
verzen.sort((a, b) => a.vers - b.vers);

const uit = {
	boek,
	hoofdstuk: Number(hoofdstuk),
	bron: BRON,
	notatie: "bron = plaatsen (vanaf 0) in data/grondtekst/nt/<boek>/<hoofdstuk>.json, veld verzen[].woorden. 'gewogen' ontbreekt bewust: dat is een besluit van de vertaler.",
	verzen,
};
fs.mkdirSync(path.dirname(uitvoer), { recursive: true });
fs.writeFileSync(uitvoer, JSON.stringify(uit, null, '\t') + '\n');
console.log(`Geschreven: ${path.relative(root, uitvoer)} (${verzen.length} verzen, ${verzen.reduce((s, v) => s + v.koppeling.length, 0)} Nederlandse woorden)`);
