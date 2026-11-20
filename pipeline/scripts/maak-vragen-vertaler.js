// Maakt werk/vragen-vertaler.csv uit werk/meldingen.md en de losse punten in werk/voortgang.md.
// Regels: losse punten, per Strong-nummer een samenvatting van inconsistente weergave, en alle
// meldingen met soort "vraag voor de vertaler". Scheidingsteken ; en BOM, zodat Excel het goed opent.
const fs = require('fs');
const md = fs.readFileSync('werk/meldingen.md', 'utf8').split(/\r?\n/);
const voortgang = fs.readFileSync('werk/voortgang.md', 'utf8').split(/\r?\n/);

const rijen = []; let boek = '', hfd = '', slecht = 0;
for (const l of md) {
	const h = l.match(/^## (.+?)\s+(\d+)\s*$/);
	if (h) { boek = h[1]; hfd = h[2]; continue; }
	if (!l.startsWith('|') || /^\|\s*(Vers|-)/.test(l)) continue;
	const c = l.replace(/^\||\|\s*$/g, '').split('|').map(s => s.trim());
	if (c.length !== 4) { slecht++; continue; }
	rijen.push({ boek, hfd, vers: c[0], grieks: c[1], wat: c[2], soort: c[3] });
}
const vragen = rijen.filter(r => /^vraag voor de vertaler/i.test(r.soort));

// losse punten
const start = voortgang.findIndex(l => l.startsWith('### Lijst met vragen voor de vertaler'));
const losse = [];
for (let i = start + 1; i < voortgang.length && !voortgang[i].startsWith('###'); i++)
	if (voortgang[i].startsWith('- ')) losse.push(voortgang[i].slice(2).replace(/`/g, ''));

// inconsistente weergave per Strong-nummer (soort noemt controle 9) of per Grieks woord zonder nummer
const groepen = new Map();
for (const r of vragen.filter(r => /controle 9/.test(r.soort))) {
	const sl = r.grieks.match(/G\d+/g);
	const sleutels = sl ? sl : [r.grieks.replace(/\(.*?\)/g, '').trim()];
	for (const k of sleutels) {
		if (!groepen.has(k)) groepen.set(k, { grieks: r.grieks.replace(/\(.*$/, '').trim(), plekken: [], wat: [] });
		const g = groepen.get(k);
		g.plekken.push(`${r.boek} ${r.hfd}:${r.vers}`); g.wat.push(r.wat);
	}
}
const ontdubbeld = [...groepen].filter(([, g]) => g.plekken.length > 1).sort((a, b) => b[1].plekken.length - a[1].plekken.length);

const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
const uit = [['boek', 'hoofdstuk', 'vers', 'Grieks', 'wat', 'soort', 'antwoord van de vertaler']];
for (const t of losse) uit.push(['(los punt)', '', '', '', t, 'los punt', '']);
for (const [k, g] of ontdubbeld) uit.push(['(meerdere)', '', g.plekken.slice(0, 6).join(', ') + (g.plekken.length > 6 ? ` … (${g.plekken.length} plekken)` : ''), `${g.grieks} (${k})`, `Zelfde woord, ${g.plekken.length} meldingen over verschillende weergave. Eerste: ${g.wat[0]}`, 'woord: inconsistent', '']);
for (const r of vragen) uit.push([r.boek, r.hfd, r.vers, r.grieks, r.wat, r.soort, '']);
fs.writeFileSync('werk/vragen-vertaler.csv', '\uFEFF' + uit.map(r => r.map(esc).join(';')).join('\r\n') + '\r\n');
console.log(`tabelrijen ${rijen.length}, overgeslagen (niet 4 kolommen) ${slecht}; vragen ${vragen.length}; losse punten ${losse.length}; woordregels ${ontdubbeld.length}`);
console.log(ontdubbeld.slice(0, 12).map(([k, g]) => `${g.grieks} ${k} x${g.plekken.length}`).join(' | '));
