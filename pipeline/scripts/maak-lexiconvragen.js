// Maakt de lijst met vragen voor de vertaler uit de vertaalde Dodson-brokken, plus een steekproeflijst.
// Gebruik: node maak-lexiconvragen.js -> werk/lexicon/vragen-lexicon.csv en werk/lexicon/steekproef.md
const fs = require('fs');
const nl = {}, en = {};
for (let i = 1; i <= 22; i++) {
	const n = String(i).padStart(3, '0');
	Object.assign(nl, JSON.parse(fs.readFileSync(`data/lexicon/nl/dodson-${n}.json`)));
	Object.assign(en, JSON.parse(fs.readFileSync(`werk/lexicon/dodson-${n}.json`)));
}
const sleutels = Object.keys(nl);
const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
const rijen = [['sleutel', 'Engels (kort)', 'Nederlands (glos)', 'wat', 'soort', 'antwoord van de vertaler']];
const algemeen = [
	['(algemeen)', '', '', 'Besluit B3: vorm van de glos. Gebruikt is: 1 tot 4 woorden, alleen uit de korte Engelse glos; werkwoorden in de onbepaalde wijs zonder "ik" in de glos, met "ik" in de definitie zoals Dodson. Akkoord?', 'besluit'],
	['(algemeen)', '', '', 'Eigennamen staan in de glos zoals Dodson ze schrijft (Engelse vorm, bijv. Egypt, Andrew). Welke Nederlandse vorm geldt? data/namentabel.json bestaat niet.', 'besluit'],
	['G2651', '', '', 'In de bron staat "along", waarschijnlijk bedoeld als "alone". Vertaald als "langs", zoals de bron schrijft.', 'bronfout vermoed'],
	['G2787', '', '', 'Ark of the Covenant vertaald als "de Ark van het Verbond". Naamvorm bevestigen.', 'naam'],
	['(algemeen)', '', '', 'Is een glos die ingekort is tot vier woorden nog trouw aan de bron? Bij tientallen glossen heeft de controle een eerste, te lange vertaling laten inkorten (niet apart bijgehouden). Let hierop in de steekproef.', 'steekproef'],
];
for (const r of algemeen) rijen.push([r[0], r[1], r[2], r[3], r[4], '']);
const namen = sleutels.filter(k => /^[A-Z]/.test(en[k].kort) && !/^I /.test(en[k].kort) && /^[A-Z]/.test(nl[k].glos));
for (const k of namen) rijen.push([k, en[k].kort, nl[k].glos, 'Eigennaam, Engelse of onveranderde vorm. Nederlandse vorm?', 'eigennaam', '']);
fs.writeFileSync('werk/lexicon/vragen-lexicon.csv', '\uFEFF' + rijen.map(r => r.map(esc).join(';')).join('\r\n') + '\r\n');

// steekproef: 15 per tien brokken, vaste zaadwaarde voor herhaalbaarheid
let z = 12345; const rnd = () => (z = (z * 1103515245 + 12345) % 2147483648) / 2147483648;
const groepen = [[1, 10], [11, 20], [21, 22]];
let md = '# Steekproef lexicon (Dodson)\n\nPer tien brokken 15 willekeurige vermeldingen, naast het Engels. Vink af en noteer opmerkingen.\n';
for (const [a, b] of groepen) {
	const sl = sleutels.filter(k => { const nr = Math.floor(sleutels.indexOf(k) / 150) + 1; return nr >= a && nr <= b; });
	const kies = new Set(); while (kies.size < Math.min(15, sl.length)) kies.add(sl[Math.floor(rnd() * sl.length)]);
	md += `\n## Brok ${a} tot ${b}\n\n| | Sleutel | Engels (kort) | Glos | Definitie | Opmerking |\n|---|---|---|---|---|---|\n`;
	for (const k of kies) md += `| [ ] | ${k} | ${en[k].kort} | ${nl[k].glos} | ${nl[k].definitie.replace(/\|/g, '/')} | |\n`;
}
fs.writeFileSync('werk/lexicon/steekproef.md', md);
console.log(`${sleutels.length} vermeldingen; eigennamen ${namen.length}; regels in csv ${rijen.length - 1}`);
