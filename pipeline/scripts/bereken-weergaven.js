// Berekent per Strong-nummer hoe de BereaBijbel het grondtekstwoord heeft weergegeven.
// Dit is een telling over de woordkoppelingen, geen uitspraak van een model.
// Gebruik: node bereken-weergaven.js <uitvoer.json> <koppeling.json>...
// Voorbeeld: node bereken-weergaven.js data/koppeling/weergaven.json data/koppeling/phm/01.json
//
// Per Grieks of Hebreeuws woord (plaats in het vers):
//  - zijn er Nederlandse woorden van type 'woord' gekoppeld, dan vormen die samen de weergave;
//  - alleen 'segment'-woorden: de weergave is de uitdrukking, gemarkeerd als 'uitdrukking';
//  - geen enkel Nederlands woord: 'niet weergegeven' (veel lidwoorden, soms een echte omissie).
const fs = require('fs');
const path = require('path');

const [, , uitvoer, ...koppelPaden] = process.argv;
if (!uitvoer || koppelPaden.length === 0) {
	console.error('Gebruik: node bereken-weergaven.js <uitvoer.json> <koppeling.json>...');
	process.exit(2);
}
const lees = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));

const perStrong = {};
let verzenTotaal = 0;
for (const pad of koppelPaden) {
	const k = lees(pad);
	const norm = pad.replace(/\\/g, '/');
	const hoofdstuk = path.basename(norm);
	const boek = path.basename(path.dirname(norm));
	const wortel = norm.replace(/data\/koppeling\/.*$/, 'data/grondtekst/');
	const grondPad = ['nt', 'ot'].map((t) => `${wortel}${t}/${boek}/${hoofdstuk}`).find((p) => fs.existsSync(p));
	if (!grondPad) throw new Error('Geen grondtekst gevonden bij ' + pad);
	const grond = lees(grondPad);

	for (const v of k.verzen) {
		verzenTotaal++;
		const gv = grond.verzen.find((x) => x.vers === v.vers);
		gv.woorden.forEach((w, i) => {
			const woorden = v.koppeling.filter((x) => x.type === 'woord' && x.bron.includes(i)).map((x) => x.nl.toLowerCase());
			const segmenten = v.koppeling.filter((x) => x.type === 'segment' && x.bron.includes(i)).map((x) => x.nl.toLowerCase());
			let tekst, soort;
			// Een Nederlands woord dat twee keer naar dezelfde plaats verwijst (bijv. "ons ... ons") telt één keer.
			const uniek = (lijst) => lijst.filter((x, i) => lijst.indexOf(x) === i);
			if (woorden.length) { tekst = uniek(woorden).join(' '); soort = 'woord'; }
			else if (segmenten.length) { tekst = uniek(segmenten).join(' '); soort = 'uitdrukking'; }
			else { tekst = null; soort = 'niet weergegeven'; }

			const s = (perStrong[w.strong] ||= { totaal: 0, grondtekstvormen: {}, weergaven: {} });
			s.totaal++;
			s.grondtekstvormen[w.tekst] = (s.grondtekstvormen[w.tekst] || 0) + 1;
			const sleutel = (tekst ?? '(niet weergegeven)') + '|' + soort;
			const rec = (s.weergaven[sleutel] ||= { nl: tekst, soort, aantal: 0, vindplaatsen: [] });
			rec.aantal++;
			rec.vindplaatsen.push(`${boek} ${k.hoofdstuk}:${v.vers}`);
		});
	}
}

const uit = {};
for (const [strong, s] of Object.entries(perStrong).sort((a, b) => b[1].totaal - a[1].totaal)) {
	uit[strong] = {
		totaal: s.totaal,
		weergaven: Object.values(s.weergaven).sort((a, b) => b.aantal - a.aantal),
	};
}
fs.mkdirSync(path.dirname(uitvoer), { recursive: true });
fs.writeFileSync(uitvoer, JSON.stringify(uit, null, '\t'));
console.log(`${verzenTotaal} verzen, ${Object.keys(uit).length} Strong-nummers geschreven naar ${uitvoer}`);
