// Maakt één los HTML-bestand waarin een gekoppeld hoofdstuk te bekijken is (Grieks naast Nederlands).
// Alle gegevens zitten in het bestand: het werkt offline en kan per mail verstuurd worden.
// Gebruik: node maak-koppeling-html.js <boek> <hoofdstuk> "<titel>" <uitvoer.html>
// Voorbeeld: node pipeline/scripts/maak-koppeling-html.js phm 01 "Filemon 1" filemon-koppeling.html
// Leest data/koppeling/<boek>/<hoofdstuk>.json, data/bijbel/<boek>/<hoofdstuk>.json,
// data/grondtekst/nt/<boek>/<hoofdstuk>.json (of ot) en data/lexicon/*.json.
// Voer eerst bereken-weergaven.js uit, zodat data/koppeling/weergaven.json bestaat.
const fs = require('fs');
const path = require('path');

const [, , boek, hoofdstuk, titel, uitvoer] = process.argv;
if (!boek || !hoofdstuk || !titel || !uitvoer) {
	console.error('Gebruik: node maak-koppeling-html.js <boek> <hoofdstuk> "<titel>" <uitvoer.html>');
	process.exit(2);
}
const root = path.resolve(__dirname, '..', '..');
const lees = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf-8'));

const koppel = lees(`data/koppeling/${boek}/${hoofdstuk}.json`);
const vertaling = lees(`data/bijbel/${boek}/${hoofdstuk}.json`);
const testament = fs.existsSync(path.join(root, `data/grondtekst/nt/${boek}/${hoofdstuk}.json`)) ? 'nt' : 'ot';
const grond = lees(`data/grondtekst/${testament}/${boek}/${hoofdstuk}.json`);
const lexicon = lees(`data/lexicon/${testament === 'nt' ? 'greek' : 'hebrew'}.json`);
const weergaven = lees('data/koppeling/weergaven.json');

const SCHOON = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u;
const gebruikt = new Map();
const mist = [];
const lidwoorden = [];
const toevoegingen = [];
let aantalNl = 0;

const verzen = vertaling.verzen.map((v) => {
	const k = koppel.verzen.find((x) => x.vers === v.vers);
	const gv = grond.verzen.find((x) => x.vers === v.vers);
	const gedekt = new Set(k.koppeling.flatMap((x) => x.bron));

	const gr = gv.woorden.map((w, i) => {
		const g = { t: w.tekst, s: w.strong, m: w.morf || '', tr: (lexicon[w.strong] || {}).translit || '', unc: !gedekt.has(i) };
		(gebruikt.get(w.strong) || gebruikt.set(w.strong, new Set()).get(w.strong)).add(w.tekst);
		return g;
	});

	const nl = [];
	let idx = 0;
	for (const stuk of v.tekst.split(/\s+/).filter(Boolean)) {
		const [, pre, w, post] = stuk.match(SCHOON);
		if (!w) { nl.push({ txt: stuk }); continue; }
		const x = k.koppeling[idx];
		if (!x || x.nl !== w) throw new Error(`vers ${v.vers}: "${w}" komt niet overeen met koppeling "${x && x.nl}"`);
		nl.push({ k: idx, pre, w, post, type: x.type, bron: x.bron });
		idx++;
	}
	if (idx !== k.koppeling.length) throw new Error(`vers ${v.vers}: koppeling heeft meer woorden dan de tekst`);
	aantalNl += idx;

	gr.forEach((g, i) => {
		if (!g.unc) return;
		if (g.s === 'G3588') lidwoorden.push({ vers: v.vers, i });
		else mist.push({ vers: v.vers, t: g.t, s: g.s, tr: g.tr, context: v.tekst });
	});
	const t = k.koppeling.filter((x) => x.type === 'toevoeging').map((x) => x.nl);
	if (t.length) toevoegingen.push({ vers: v.vers, woorden: t, tekst: v.tekst });
	return { vers: v.vers, gr, nl };
});

const weergavenLijst = Object.entries(weergaven).map(([strong, w]) => ({
	strong,
	translit: (lexicon[strong] || {}).translit || '',
	vormen: [...(gebruikt.get(strong) || [])],
	totaal: w.totaal,
	weergaven: w.weergaven,
}));

const DATA = {
	titel: `${titel} – woordkoppeling`,
	ondertitel: `${verzen.length} verzen, ${aantalNl} Nederlandse woorden gekoppeld aan ${testament === 'nt' ? 'RP2018' : 'WLC'} · ${weergavenLijst.length} verschillende grondtekstwoorden`,
	verzen,
	weergaven: weergavenLijst,
	mist,
	lidwoorden,
	toevoegingen,
};

const sjabloon = fs.readFileSync(path.join(__dirname, 'koppeling-sjabloon.html'), 'utf-8');
// '<' en de twee Unicode-regeleinden escapen, zodat de gegevens nooit </script> kunnen bevatten.
const escape = (s) => s.split("<").join("\\u003c").split(String.fromCharCode(0x2028)).join("\\u2028").split(String.fromCharCode(0x2029)).join("\\u2029");
const json = escape(JSON.stringify(DATA));
fs.writeFileSync(uitvoer, sjabloon.replace('/*DATA*/null', () => json));
console.log(`Geschreven: ${uitvoer} (${Math.round(fs.statSync(uitvoer).size / 1024)} kB), ${mist.length} Griekse woorden zonder Nederlands (excl. lidwoorden), ${lidwoorden.length} lidwoorden, ${toevoegingen.length} verzen met toevoegingen`);
