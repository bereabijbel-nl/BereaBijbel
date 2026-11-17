// Controleert woordkoppelingen van een vertaald hoofdstuk (stap 8, deterministisch).
// Gebruik: node controleer-koppeling.js <koppeling.json> <vertaling.json> <grondtekst.json>
// Voorbeeld: node controleer-koppeling.js data/koppeling/phm/01.json data/bijbel/phm/01.json data/grondtekst/nt/phm/01.json
//
// Harde fouten (exitcode 1):
//  - de Nederlandse woorden in de koppeling zijn niet precies die van de vertaling, in dezelfde volgorde
//  - een plaats (bron) wijst buiten het Griekse vers
//  - type toevoeging heeft toch een bron, of type woord/segment heeft er geen
//  - een vers uit de vertaling ontbreekt
// Meldingen (geen fout): Griekse woorden die door geen enkel Nederlands woord worden gedekt.
// Dat zijn kandidaten voor "omissie" (controle 1 van de criticus) of voor bewust weggelaten lidwoorden.
const fs = require('fs');

const [, , koppelPad, vertalingPad, grondPad] = process.argv;
if (!koppelPad || !vertalingPad || !grondPad) {
	console.error('Gebruik: node controleer-koppeling.js <koppeling.json> <vertaling.json> <grondtekst.json>');
	process.exit(2);
}
const lees = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const koppel = lees(koppelPad);
const vertaling = lees(vertalingPad);
const grond = lees(grondPad);

const schoon = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const woordenVan = (tekst) => tekst.split(/\s+/).map(schoon).filter(Boolean);

let fouten = 0;
const fout = (vers, bericht) => { console.log(`vers ${vers}: FOUT ${bericht}`); fouten++; };
const stat = { woord: 0, segment: 0, toevoeging: 0, grieks: 0, ongedekt: 0 };
const ongedekt = [];

const koppelPerVers = new Map((koppel.verzen || []).map((v) => [v.vers, v]));
for (const v of vertaling.verzen) {
	const k = koppelPerVers.get(v.vers);
	const gv = grond.verzen.find((x) => x.vers === v.vers);
	if (!k) { fout(v.vers, 'geen koppeling'); continue; }
	if (!gv) { fout(v.vers, 'geen grondtekst'); continue; }

	const verwacht = woordenVan(v.tekst);
	const gevonden = k.koppeling.map((x) => x.nl);
	if (verwacht.join(' ') !== gevonden.join(' ')) {
		const i = verwacht.findIndex((w, j) => w !== gevonden[j]);
		fout(v.vers, `Nederlandse woorden wijken af bij positie ${i + 1}: vertaling "${verwacht[i]}", koppeling "${gevonden[i]}"`);
	}

	const gedekt = new Set();
	for (const x of k.koppeling) {
		if (!['woord', 'segment', 'toevoeging'].includes(x.type)) fout(v.vers, `onbekend type bij "${x.nl}"`);
		stat[x.type] = (stat[x.type] || 0) + 1;
		if (x.type === 'toevoeging' && x.bron.length) fout(v.vers, `toevoeging "${x.nl}" heeft een bron`);
		if (x.type !== 'toevoeging' && !x.bron.length) fout(v.vers, `"${x.nl}" is ${x.type} maar heeft geen bron`);
		for (const b of x.bron) {
			if (!Number.isInteger(b) || b < 0 || b >= gv.woorden.length) fout(v.vers, `"${x.nl}" wijst naar plaats ${b}, buiten het vers`);
			else gedekt.add(b);
		}
	}
	gv.woorden.forEach((w, i) => {
		stat.grieks++;
		if (!gedekt.has(i)) { stat.ongedekt++; ongedekt.push(`${v.vers}:${i} ${w.tekst} (${w.strong})`); }
	});
}

console.log(`Nederlandse woorden: woord ${stat.woord}, segment ${stat.segment}, toevoeging ${stat.toevoeging}`);
console.log(`Griekse woorden: ${stat.grieks}, door geen Nederlands woord gedekt: ${stat.ongedekt}`);
if (ongedekt.length) console.log('Ongedekt (vers:plaats woord Strong):\n  ' + ongedekt.join('\n  '));
console.log(`${fouten} fout(en).`);
process.exit(fouten ? 1 : 0);
