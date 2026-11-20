// Maakt docs/kwaliteitsrapport.html over de woordkoppeling (WP7). Alleen tellingen, geen model.
// Gebruik: node pipeline/scripts/maak-kwaliteitsrapport.js
const fs = require('fs');
const BOEKNAAM = { mat: 'Mattheüs', mrk: 'Marcus', joh: 'Johannes', rom: 'Romeinen', '1co': '1 Korinthe', col: 'Kolossenzen', php: 'Filippenzen', phm: 'Filemon', '1jo': '1 Johannes', '2jo': '2 Johannes' };
const nl = JSON.parse(fs.readFileSync('data/lexicon/greek.nl.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const boeken = {}; const perStrong = {}; const weerg = {};
for (const b of fs.readdirSync('data/koppeling').filter(x => !x.includes('.'))) {
	const B = boeken[b] = { hfd: 0, grond: 0, gekoppeld: 0, woord: 0, segment: 0, toevoeging: 0 };
	for (const f of fs.readdirSync('data/koppeling/' + b).sort()) {
		const k = JSON.parse(fs.readFileSync(`data/koppeling/${b}/${f}`));
		const g = JSON.parse(fs.readFileSync(`data/grondtekst/nt/${b}/${f}`));
		B.hfd++;
		for (const v of k.verzen) {
			const gv = g.verzen.find(x => x.vers === v.vers);
			if (!gv) continue;
			const gebruikt = new Set();
			const perPlaats = {};
			for (const x of v.koppeling) {
				B[x.type]++;
				for (const p of x.bron) { gebruikt.add(p); if (x.type === 'woord') (perPlaats[p] = perPlaats[p] || []).push(x.nl.toLowerCase()); }
			}
			gv.woorden.forEach((w, i) => {
				B.grond++;
				if (gebruikt.has(i)) B.gekoppeld++;
				const s = w.strong; if (!s) return;
				const S = perStrong[s] = perStrong[s] || { n: 0, ongekoppeld: 0, vind: [] };
				S.n++;
				if (!gebruikt.has(i)) { S.ongekoppeld++; if (S.vind.length < 3) S.vind.push(`${b} ${g.hoofdstuk}:${v.vers}`); }
				const t = (perPlaats[i] || []).join(' ');
				if (t) { const W = weerg[s] = weerg[s] || new Set(); W.add(t); }
			});
		}
	}
}
const pct = (a, b) => b ? (100 * a / b).toFixed(1).replace('.', ',') + '%' : '–';
let rijenBoek = '', tot = { hfd: 0, grond: 0, gekoppeld: 0, woord: 0, segment: 0, toevoeging: 0 };
for (const b of Object.keys(boeken)) { const B = boeken[b]; for (const k in tot) tot[k] += B[k];
	rijenBoek += `<tr><td>${BOEKNAAM[b] || b}</td><td>${B.hfd}</td><td>${B.grond}</td><td>${pct(B.gekoppeld, B.grond)}</td><td>${B.woord}</td><td>${B.segment}</td><td>${B.toevoeging}</td></tr>\n`; }
rijenBoek += `<tr class="tot"><td>Totaal</td><td>${tot.hfd}</td><td>${tot.grond}</td><td>${pct(tot.gekoppeld, tot.grond)}</td><td>${tot.woord}</td><td>${tot.segment}</td><td>${tot.toevoeging}</td></tr>`;

const glos = s => (nl[s] && nl[s].glos) || '–';
const lid = new Set(['G3588']);
const ong = Object.entries(perStrong).filter(([s, v]) => !lid.has(s) && v.ongekoppeld > 0).sort((a, b) => b[1].ongekoppeld - a[1].ongekoppeld);
const ongTot = ong.reduce((a, [, v]) => a + v.ongekoppeld, 0);
const rijenOng = ong.slice(0, 40).map(([s, v]) => `<tr><td>${s}</td><td>${esc(glos(s))}</td><td>${v.ongekoppeld} van ${v.n}</td><td>${v.vind.join(', ')}</td></tr>`).join('\n');
const veel = Object.entries(weerg).filter(([s]) => perStrong[s].n >= 10).sort((a, b) => b[1].size - a[1].size).slice(0, 40);
const rijenVeel = veel.map(([s, w]) => `<tr><td>${s}</td><td>${esc(glos(s))}</td><td>${perStrong[s].n}</td><td>${w.size}</td><td>${esc([...w].slice(0, 6).join('; '))}${w.size > 6 ? '; …' : ''}</td></tr>`).join('\n');
const nrNl = Object.keys(nl).length;
const nummers = Object.keys(perStrong).length;
const datum = new Date().toISOString().slice(0, 10);
const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Kwaliteitsrapport woordkoppeling</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:60rem;margin:0 auto;padding:1rem 16px 3rem}table{border-collapse:collapse;width:100%;margin:.5rem 0 1.5rem}th,td{border:1px solid #ccc;padding:.3rem .5rem;text-align:left;font-size:.9rem}th{background:#f0f0f0}tr.tot td{font-weight:700}.scroll{overflow-x:auto}</style></head><body>
<h1>Kwaliteitsrapport woordkoppeling</h1>
<p>Gemaakt op ${datum} door <code>pipeline/scripts/maak-kwaliteitsrapport.js</code>. Alle getallen zijn tellingen uit de koppelingsbestanden. De koppeling is door Claude gemaakt en nog niet door een mens nagelopen.</p>
<h2>Koppeling per boek</h2><div class="scroll"><table><tr><th>Boek</th><th>Hoofdstukken</th><th>Griekse woorden</th><th>Gekoppeld</th><th>woord</th><th>segment</th><th>toevoeging</th></tr>
${rijenBoek}</table></div>
<p>Gekoppeld: het Griekse woord komt voor in de bron van minstens één Nederlands woord of segment. Lidwoorden die bewust niet zijn weergegeven tellen als ongekoppeld.</p>
<h2>Ongekoppelde woorden (mogelijke omissies)</h2>
<p>Zonder het lidwoord (G3588) zijn ${ongTot} Griekse woorden niet gekoppeld, verdeeld over ${ong.length} Strong-nummers. De 40 grootste:</p>
<div class="scroll"><table><tr><th>Strong</th><th>Glos</th><th>Niet gekoppeld</th><th>Eerste vindplaatsen</th></tr>
${rijenOng}</table></div>
<h2>Strong-nummers met veel verschillende weergaven</h2>
<p>Kandidaten voor het vertaalgeheugen of voor een vraag aan de vertaler. Alleen nummers met minstens 10 voorkomens. De weergave is de samengestelde Nederlandse tekst bij één Grieks woord, dus verbuigingen tellen apart.</p>
<div class="scroll"><table><tr><th>Strong</th><th>Glos</th><th>Voorkomens</th><th>Verschillende weergaven</th><th>Voorbeelden</th></tr>
${rijenVeel}</table></div>
<h2>Woordenboek</h2>
<p>${nrNl} van de ${nummers} Strong-nummers in de gekoppelde hoofdstukken hebben een Nederlandse glos en definitie (Dodson, vertaald door een model). Door een mens nagekeken: 0.</p>
</body></html>`;
fs.writeFileSync('docs/kwaliteitsrapport.html', html);
console.log(`boeken ${Object.keys(boeken).length}, hoofdstukken ${tot.hfd}, grondwoorden ${tot.grond}, gekoppeld ${pct(tot.gekoppeld, tot.grond)}, ongekoppeld zonder lidwoord ${ongTot}, nummers met veel weergaven ${veel.length}, lexicon ${nrNl}/${nummers}`);
