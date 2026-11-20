// Splitst Dodson-vermeldingen in brokken voor het vertalen, en vult vertaalde brokken aan.
// Gebruik:
//   node maak-lexiconbrokken.js [--grootte 150]      -> werk/lexicon/dodson-001.json ...
//   node maak-lexiconbrokken.js --proef 20 [--begin 79] [--uit werk/lexicon/dodson-proef2.json]
//                                                    -> proefbrok, gespreid over de lijst (standaard dodson-proef.json)
//   node maak-lexiconbrokken.js --aanvullen <nl.json> -> voegt bron en bron_en toe uit Dodson (script, geen model)
// Volgorde: alleen nummers die in de 112 vertaalde hoofdstukken voorkomen, op nummer.
// Een brok bevat per sleutel: translit, kort, lang (Engels, uit Dodson). Betacode-lemma blijft weg.
const fs = require('fs');
const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };

const veld = s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
const dodson = new Map();
for (const r of fs.readFileSync('data/lexicon/bron/dodson/dodson.csv', 'utf8').split(/\r?\n/).slice(1)) {
	const c = r.split('\t');
	if (c.length !== 5) continue;
	dodson.set('G' + parseInt(veld(c[0]), 10), { kort: veld(c[3]), lang: veld(c[4]) });
}

const aanvullen = arg('--aanvullen');
if (aanvullen) {
	const nl = JSON.parse(fs.readFileSync(aanvullen, 'utf8'));
	for (const [k, v] of Object.entries(nl)) {
		const d = dodson.get(k);
		if (!d) { console.error(`${k}: niet in Dodson`); process.exit(1); }
		v.bron = 'Dodson';
		v.bron_en = { kort: d.kort, lang: d.lang };
	}
	fs.writeFileSync(aanvullen, JSON.stringify(nl, null, 1) + '\n');
	console.log(`${Object.keys(nl).length} vermeldingen aangevuld met bron en bron_en.`);
	process.exit(0);
}

// de gebruikte nummers komen uit de grondtekst van de vertaalde hoofdstukken
const gebruikt = new Set();
for (const b of fs.readdirSync('data/bijbel').filter(x => !x.startsWith('.')))
	for (const f of fs.readdirSync('data/bijbel/' + b)) {
		const p = `data/grondtekst/nt/${b}/${f}`;
		if (!fs.existsSync(p)) continue;
		for (const v of JSON.parse(fs.readFileSync(p)).verzen) for (const w of v.woorden) if (w.strong) gebruikt.add(w.strong);
	}
const nummers = [...gebruikt].filter(k => dodson.has(k)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
const greek = JSON.parse(fs.readFileSync('data/lexicon/greek.json', 'utf8'));
const maak = k => ({ translit: (greek[k] || {}).translit || '', kort: dodson.get(k).kort, lang: dodson.get(k).lang });

const proef = arg('--proef');
if (proef) {
	const n = parseInt(proef, 10), stap = Math.floor(nummers.length / n), begin = parseInt(arg('--begin') || '0', 10);
	const pad = arg('--uit') || 'werk/lexicon/dodson-proef.json';
	const uit = {};
	for (let i = 0; i < n; i++) uit[nummers[begin + i * stap]] = maak(nummers[begin + i * stap]);
	fs.writeFileSync(pad, JSON.stringify(uit, null, 1) + '\n');
	console.log(`proefbrok met ${n} vermeldingen (elke ${stap}e) -> ${pad}`);
	process.exit(0);
}
const grootte = parseInt(arg('--grootte') || '150', 10);
let nr = 0;
for (let i = 0; i < nummers.length; i += grootte) {
	const uit = {};
	for (const k of nummers.slice(i, i + grootte)) uit[k] = maak(k);
	fs.writeFileSync(`werk/lexicon/dodson-${String(++nr).padStart(3, '0')}.json`, JSON.stringify(uit, null, 1) + '\n');
}
console.log(`${nummers.length} nummers in ${nr} brokken van ${grootte} -> werk/lexicon/`);
