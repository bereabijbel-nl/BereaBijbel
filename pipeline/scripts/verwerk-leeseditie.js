// Zet een aangeleverde leeseditie (markdown, "11-reader-edition*.md") om naar
// data/bijbel/<boek>/<hoofdstuk>.json.
//
// Gebruik: node verwerk-leeseditie.js <markdown-bestand> [output-map]
//
// De boekcode volgt uit de titel op de eerste regel ("# Matteüs").
// Formaat van de bron:
//   ## Matteüs 1
//   **1** Verstekst met markering.[^1]
//   [^1]: *Matteüs 1:7* – Noottekst
//
// Het script verandert geen woord van de vertaling. Voetnoten worden per
// hoofdstuk opnieuw genummerd. De bron geeft geen ankertekst, dus `anker` is null.
// Bestaande woordkoppelingen (`koppeling`) blijven alleen behouden als de
// verstekst ongewijzigd is. Het script stopt bij een afwijking en schrijft dan niets.

const fs = require('fs');
const path = require('path');

const [mdPad, uitvoerArg] = process.argv.slice(2);
if (!mdPad) {
	console.error('Gebruik: node verwerk-leeseditie.js <markdown-bestand> [output-map]');
	process.exit(1);
}

const REPO = path.join(__dirname, '..', '..');
const uitvoerRoot = path.resolve(uitvoerArg || path.join(REPO, 'data', 'bijbel'));
const kjvRoot = path.join(REPO, 'data', 'kjv');
const index = JSON.parse(fs.readFileSync(path.join(kjvRoot, 'index.json'), 'utf-8'));

const regels = fs.readFileSync(mdPad, 'utf-8').replace(/\r\n/g, '\n').split('\n');
const titel = (regels[0].match(/^# (.+)$/) || [])[1];
// De bron gebruikt NBV-achtige namen, de index de namen van de bestaande site.
const ALIAS = { 'Matteüs': 'mat', '1 Korintiërs': '1co', Marcus: 'mrk' };
const boek = index.find((b) => b.naam_nl === titel || b.code === ALIAS[titel]);
if (!boek) {
	console.error(`Onbekend boek in titel: ${titel}`);
	process.exit(1);
}

const fouten = [];
const waarschuwingen = [];
const noten = new Map(); // nr -> { ref, tekst }
const verzen = []; // { h, v, ruw }
let h = 0;

for (let i = 1; i < regels.length; i++) {
	const r = regels[i];
	let m;
	if ((m = r.match(/^## (.+) (\d+)$/))) {
		h = Number(m[2]);
		if (m[1] !== titel) fouten.push(`Regel ${i + 1}: kop noemt ${m[1]}, verwacht ${titel}.`);
	} else if ((m = r.match(/^\*\*(\d+)\*\* (.+)$/))) {
		verzen.push({ h, v: Number(m[1]), ruw: m[2].trim() });
	} else if ((m = r.match(/^\[\^(\d+)\]: \*([^*]+?)\* – (.+)$/))) {
		const nr = Number(m[1]);
		if (noten.has(nr)) fouten.push(`Noot ${nr} komt twee keer voor.`);
		noten.set(nr, { ref: m[2], tekst: m[3].trim() });
	} else if (/^\*\*\d+\*\*/.test(r) || /^\[\^/.test(r)) {
		fouten.push(`Regel ${i + 1}: onverwacht formaat: ${r.slice(0, 60)}`);
	}
}

const gebruikt = new Set();
const perHoofdstuk = new Map();
const gezien = new Set();
for (const v of verzen) {
	const sleutel = `${v.h}:${v.v}`;
	if (gezien.has(sleutel)) fouten.push(`Vers ${sleutel} komt twee keer voor.`);
	gezien.add(sleutel);

	const markeringen = [...v.ruw.matchAll(/\[\^(\d+)\]/g)].map((m) => Number(m[1]));
	const tekst = v.ruw
		.replace(/\[\^\d+\]/g, '')
		.replace(/\s{2,}/g, ' ')
		.replace(/\s+([.,;:!?])/g, '$1')
		.trim();
	const voetnoten = [];
	for (const nr of markeringen) {
		const noot = noten.get(nr);
		if (!noot) {
			fouten.push(`Vers ${sleutel}: markering [^${nr}] heeft geen noot.`);
			continue;
		}
		gebruikt.add(nr);
		if (!noot.ref.endsWith(`${v.h}:${v.v}`)) {
			waarschuwingen.push(`Noot ${nr} noemt "${noot.ref}", de markering staat in ${sleutel}. Markering is aangehouden.`);
		}
		voetnoten.push({ anker: null, tekst: noot.tekst });
	}
	if (!perHoofdstuk.has(v.h)) perHoofdstuk.set(v.h, []);
	perHoofdstuk.get(v.h).push({ vers: v.v, tekst, voetnoten });
}
for (const nr of noten.keys()) if (!gebruikt.has(nr)) fouten.push(`Noot ${nr} heeft geen markering.`);

for (let c = 1; c <= boek.hoofdstukken; c++) {
	const lijst = perHoofdstuk.get(c);
	if (!lijst) {
		fouten.push(`Hoofdstuk ${c} ontbreekt.`);
		continue;
	}
	lijst.sort((a, b) => a.vers - b.vers);
	lijst.forEach((v, i) => {
		if (v.vers !== i + 1) fouten.push(`Hoofdstuk ${c}: versnummer ${i + 1} verwacht, ${v.vers} gevonden.`);
	});
	const kjvBestand = path.join(kjvRoot, boek.code, String(c).padStart(2, '0') + '.json');
	if (fs.existsSync(kjvBestand)) {
		const n = JSON.parse(fs.readFileSync(kjvBestand, 'utf-8')).verzen.length;
		if (n !== lijst.length) waarschuwingen.push(`Hoofdstuk ${c}: ${lijst.length} verzen, KJV heeft er ${n}.`);
	}
}
for (const c of perHoofdstuk.keys()) if (c < 1 || c > boek.hoofdstukken) fouten.push(`Hoofdstuk ${c} bestaat niet.`);

if (fouten.length > 0) {
	console.error(`FOUT: ${fouten.length} probleem(en), niets geschreven.`);
	for (const f of fouten) console.error('  - ' + f);
	process.exit(1);
}

const map = path.join(uitvoerRoot, boek.code);
fs.mkdirSync(map, { recursive: true });
let nV = 0;
let nN = 0;
let behouden = 0;
for (const [c, lijst] of [...perHoofdstuk.entries()].sort((a, b) => a[0] - b[0])) {
	const bestand = path.join(map, String(c).padStart(2, '0') + '.json');
	let oud = null;
	if (fs.existsSync(bestand)) oud = JSON.parse(fs.readFileSync(bestand, 'utf-8'));
	let teller = 0;
	const uit = {
		boek: boek.code,
		boeknummer: boek.nummer,
		hoofdstuk: c,
		bron: 'BereaBijbel',
		grondtekst_bron: (oud && oud.grondtekst_bron) || 'RP2018',
		verzen: lijst.map((v) => {
			const o = { vers: v.vers, tekst: v.tekst };
			if (v.voetnoten.length > 0) o.voetnoten = v.voetnoten.map((n) => ({ nr: ++teller, ...n }));
			const ov = oud && oud.verzen.find((x) => x.vers === v.vers);
			if (ov && ov.koppeling) {
				if (ov.tekst === v.tekst) {
					o.koppeling = ov.koppeling;
					behouden++;
				} else {
					waarschuwingen.push(`${boek.code} ${c}:${v.vers}: tekst gewijzigd, woordkoppeling vervallen.`);
				}
			}
			return o;
		}),
	};
	nN += teller;
	nV += lijst.length;
	fs.writeFileSync(bestand, JSON.stringify(uit, null, 2) + '\n', 'utf-8');
}
console.log(`${boek.naam_nl} (${boek.code}): ${perHoofdstuk.size} hoofdstukken, ${nV} verzen, ${nN} voetnoten, ${behouden} koppelingen behouden`);
for (const w of waarschuwingen) console.log('  ! ' + w);
