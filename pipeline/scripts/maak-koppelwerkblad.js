// Maakt een klein werkblad om een hoofdstuk te koppelen (WP3).
// Per vers: de Griekse woorden (plaats, woord, Strong, morfologie) en de Nederlandse verstekst.
// Gebruik: node pipeline/scripts/maak-koppelwerkblad.js <boek> <hoofdstuk>
// Voorbeeld: node pipeline/scripts/maak-koppelwerkblad.js phm 01
// Uitvoer: op het scherm én in werk/werkblad/<boek>-<hoofdstuk>.txt
// Leest alleen data/grondtekst/nt/<boek>/<hoofdstuk>.json en data/bijbel/<boek>/<hoofdstuk>.json.
const fs = require('fs');
const path = require('path');

const [, , boek, hfd] = process.argv;
if (!boek || !hfd) {
	console.error('Gebruik: node maak-koppelwerkblad.js <boek> <hoofdstuk>');
	process.exit(2);
}
const hoofdstuk = hfd.padStart(2, '0');
const root = path.resolve(__dirname, '..', '..');
const lees = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf-8'));

const grond = lees(`data/grondtekst/nt/${boek}/${hoofdstuk}.json`);
const vertaling = lees(`data/bijbel/${boek}/${hoofdstuk}.json`);

// Dezelfde splitsing als controleer-koppeling.js: spaties, daarna leestekens aan de randen weg.
const schoon = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

const regels = [];
regels.push(`# Werkblad ${boek} ${Number(hoofdstuk)} — GR: plaats(vanaf 0) woord Strong morfologie. NL: de woorden zoals de koppeling ze moet hebben.`);
for (const v of vertaling.verzen) {
	const gv = grond.verzen.find((x) => x.vers === v.vers);
	if (!gv) throw new Error(`vers ${v.vers}: geen grondtekst`);
	regels.push('');
	regels.push(`vers ${v.vers}`);
	regels.push('GR: ' + gv.woorden.map((w, i) => `${i} ${w.tekst} ${w.strong} ${w.morf || '-'}`).join(' | '));
	regels.push('NL: ' + v.tekst);
	regels.push('WOORDEN: ' + v.tekst.split(/\s+/).map(schoon).filter(Boolean).join(' '));
}
const tekst = regels.join('\n') + '\n';

const uitMap = path.join(root, 'werk', 'werkblad');
fs.mkdirSync(uitMap, { recursive: true });
const uitPad = path.join(uitMap, `${boek}-${hoofdstuk}.txt`);
fs.writeFileSync(uitPad, tekst);
process.stdout.write(tekst);
console.error(`Geschreven: ${path.relative(root, uitPad)}`);
