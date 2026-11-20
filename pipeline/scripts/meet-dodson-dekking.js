// Meet welke Strong-nummers uit de vertaalde hoofdstukken een Dodson-vermelding hebben.
// Gebruik: node meet-dodson-dekking.js  -> schrijft werk/dodson-dekking.json
const fs = require('fs');
const dodson = new Set();
for (const r of fs.readFileSync('data/lexicon/bron/dodson/dodson.csv', 'utf8').split(/\r?\n/).slice(1)) {
	const m = r.match(/^"(\d+)"/);
	if (m) dodson.add('G' + parseInt(m[1], 10));
}
const tel = new Map(); let hfd = 0;
for (const b of fs.readdirSync('data/bijbel').filter(x => !x.startsWith('.')))
	for (const f of fs.readdirSync('data/bijbel/' + b)) {
		const p = `data/grondtekst/nt/${b}/${f}`;
		if (!fs.existsSync(p)) continue;
		hfd++;
		for (const v of JSON.parse(fs.readFileSync(p)).verzen)
			for (const w of v.woorden) if (w.strong) tel.set(w.strong, (tel.get(w.strong) || 0) + 1);
	}
const ontbreekt = [...tel].filter(([k]) => !dodson.has(k)).sort((a, b) => b[1] - a[1]);
const greek = JSON.parse(fs.readFileSync('data/lexicon/greek.json', 'utf8'));
fs.writeFileSync('werk/dodson-dekking.json', JSON.stringify({ hoofdstukken: hfd, dodson: dodson.size, nummers: tel.size, ontbreekt: ontbreekt.map(([k, n]) => ({ strong: k, aantal: n, in_strong_lexicon: !!greek[k] })) }, null, 1));
const voorkomens = [...tel.values()].reduce((a, b) => a + b, 0);
const mv = ontbreekt.reduce((a, [, n]) => a + n, 0);
console.log(`hoofdstukken ${hfd}; Dodson-vermeldingen ${dodson.size}; nummers ${tel.size}; gedekt ${tel.size - ontbreekt.length}; zonder vermelding ${ontbreekt.length}; woordvoorkomens ${voorkomens}, daarvan ongedekt ${mv}`);
console.log('top ongedekt:', ontbreekt.slice(0, 8).map(([k, n]) => k + '(' + n + ')').join(' '));
