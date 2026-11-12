// Verwerkt de Robinson-Pierpont Byzantine Textform 2018 (byztxt/byzantine-majority-text,
// map csv-unicode/strongs/with-parsing/) naar data/grondtekst/nt/<boek>/<hoofdstuk>.json
// met Unicode Grieks (zonder accenten), Strong-nummer en morfologie.
//
// Gebruik: node verwerk-rp2018.js <bronmap-met-csv> [uitvoermap]
//   uitvoermap standaard: data/grondtekst/nt
//
// Woorden met twee mogelijke ontledingen ("woord 1234 {A} 5678 {B}") krijgen de
// eerste ontleding; de tweede wordt genegeerd (zie README in de bron, "Words with
// more than one parsing"). Het script stopt bij een regel die niet volledig te
// lezen is en schrijft dan niets.

const fs = require('fs');
const path = require('path');

// code (CLAUDE.md-conventie), bestandsnaam in de bron, boeknummer
const NT_BOEKEN = [
	['mat', 'MAT', 40], ['mrk', 'MAR', 41], ['luk', 'LUK', 42], ['joh', 'JOH', 43],
	['act', 'ACT', 44], ['rom', 'ROM', 45], ['1co', '1CO', 46], ['2co', '2CO', 47],
	['gal', 'GAL', 48], ['eph', 'EPH', 49], ['php', 'PHP', 50], ['col', 'COL', 51],
	['1th', '1TH', 52], ['2th', '2TH', 53], ['1ti', '1TI', 54], ['2ti', '2TI', 55],
	['tit', 'TIT', 56], ['phm', 'PHM', 57], ['heb', 'HEB', 58], ['jas', 'JAM', 59],
	['1pe', '1PE', 60], ['2pe', '2PE', 61], ['1jo', '1JO', 62], ['2jo', '2JO', 63],
	['3jo', '3JO', 64], ['jud', 'JUD', 65], ['rev', 'REV', 66],
];

const [bronDir, uitvoerArg] = process.argv.slice(2);
if (!bronDir) {
	console.error('Gebruik: node verwerk-rp2018.js <bronmap-met-csv> [uitvoermap]');
	process.exit(1);
}
const uitvoerDir = path.resolve(uitvoerArg || path.join(__dirname, '..', '..', 'data', 'grondtekst', 'nt'));

// woord, Strong (eventueel twee), morfologie, optioneel tweede ontleding
const TOKEN = /(\S+) (\d+)(?: \d+)? \{([^}]+)\}(?: \d+(?: \d+)? \{[^}]+\})?/g;

const fouten = [];
const uitvoer = [];
let nHoofdstukken = 0;
let nVerzen = 0;
let nWoorden = 0;

for (const [code, bestand, boeknummer] of NT_BOEKEN) {
	const pad = path.join(bronDir, bestand + '.csv');
	if (!fs.existsSync(pad)) {
		fouten.push(`${bestand}.csv ontbreekt.`);
		continue;
	}
	const regels = fs.readFileSync(pad, 'utf-8').replace(/\r\n/g, '\n').split('\n').slice(1);
	const hoofdstukken = new Map();
	for (const regel of regels) {
		if (!regel.trim()) continue;
		const m = regel.match(/^(\d+),(\d+),(.*)$/);
		if (!m) {
			fouten.push(`${bestand}: onleesbare regel: ${regel.slice(0, 50)}`);
			continue;
		}
		const h = Number(m[1]);
		const v = Number(m[2]);
		const rest = m[3];
		const woorden = [...rest.matchAll(TOKEN)].map((t) => ({ tekst: t[1], strong: 'G' + t[2], morf: t[3].trim() }));
		if (rest.replace(TOKEN, '').trim() !== '' || woorden.length === 0) {
			fouten.push(`${bestand} ${h}:${v}: tekst niet volledig te lezen.`);
			continue;
		}
		if (!hoofdstukken.has(h)) hoofdstukken.set(h, []);
		hoofdstukken.get(h).push({ vers: v, woorden });
		nWoorden += woorden.length;
	}
	for (const [h, verzen] of hoofdstukken) {
		verzen.sort((a, b) => a.vers - b.vers);
		uitvoer.push({ code, h, data: { boek: code, boeknummer, hoofdstuk: h, bron: 'RP2018 (byztxt)', verzen } });
		nHoofdstukken++;
		nVerzen += verzen.length;
	}
}

if (fouten.length > 0) {
	console.error(`FOUT: ${fouten.length} probleem(en), niets geschreven.`);
	for (const f of fouten.slice(0, 20)) console.error('  - ' + f);
	process.exit(1);
}

for (const { code, h, data } of uitvoer) {
	const map = path.join(uitvoerDir, code);
	fs.mkdirSync(map, { recursive: true });
	fs.writeFileSync(path.join(map, String(h).padStart(2, '0') + '.json'), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
console.log(`RP2018: ${nHoofdstukken} hoofdstukken, ${nVerzen} verzen, ${nWoorden} woorden -> ${uitvoerDir}`);
