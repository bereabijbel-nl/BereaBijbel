# Voortgang woordniveau

Plan: `docs/plan-woordniveau-nederlands.md`. Volgorde volgens §9: WP3 eerst.

Status per eenheid: **open** → **klaar** → **gecontroleerd** (scriptcontrole foutloos) → **nagekeken** (door de vertaler). Alles staat nu op open, tenzij anders vermeld.

Elke sessie begint met lezen van dit bestand.

## Besluiten

- [x] B1 Strong blijft de sleutel (bevestigd en vastgelegd 2026-11-17)
- [ ] B2 Woordenboek door een model vertalen (besloten, in logboek)
- [ ] B3 Nederlandse glos: **open**, formulering herschrijven voor Dodson, bevestigen bij start WP4
- [ ] B4 KJV-weergaven stap voor stap vervangen (besloten, in logboek)
- [x] B5 Claude koppelt, vertaler zet `gewogen` (bevestigd en vastgelegd 2026-11-17)
- [ ] B6 Lemmagroepen: **open** tot WP5
- [ ] B7 Alles vrij over te nemen (besloten, in logboek)
- [ ] B8 Licenties nagekeken (besloten, in logboek)
- [ ] B9 Hebreeuwse Strong-codering CC BY 4.0 (besloten, in logboek)
- [ ] B10 Woordenboekbronnen Dodson, Abbott-Smith, BDB (besloten, in logboek)

(B2, B4, B7, B8, B9 en B10 zijn al besloten en staan in het logboek; de vinkjes hier betekenen "uitgevoerd in code of data" en blijven leeg tot dat is gebeurd.)

## 1. WP3 — Woordkoppeling (eerst)

Hulpmiddelen
- [x] `pipeline/scripts/maak-koppelwerkblad.js` (getest op Filemon)
- [x] `pipeline/scripts/koppeling-uit-tekst.js` (getest op Filemon)
- [x] Filemon 1 opnieuw gekoppeld in de compacte notatie (`werk/koppeling/phm-01.txt`) en vergeleken met de proef uit git: 382 van 455 Nederlandse woorden identiek, zie "Resultaat Filemon" hieronder
- [x] Overzicht voor de collega: `werk/overzicht/filemon-1-koppeling.html`
- [ ] Steekproef Filemon door de vertaler

Hoofdstukken (112), in deze volgorde: eerst Filemon, dan Filippenzen, Kolossenzen, 1 en 2 Johannes, dan de grote boeken.

| Boek | Hoofdstukken | Stand |
|---|---|---|
| phm | 1 | gecontroleerd (opnieuw gekoppeld in compacte notatie, scriptcontrole foutloos); wacht op nakijken door de vertaler |
| php | 1–4 | alle 4 gecontroleerd (wachten op nakijken) |
| col | 1–4 | alle 4 gecontroleerd (wachten op nakijken) |
| 1jo | 1–5 | alle 5 gecontroleerd (wachten op nakijken) |
| 2jo | 1 | gecontroleerd (wacht op nakijken) |
| rom | 1–16 | alle 16 gecontroleerd (wachten op nakijken) |
| 1co | 1–16 | alle 16 gecontroleerd (wachten op nakijken) |
| mrk | 1–16 | alle 16 gecontroleerd (wachten op nakijken) |
| joh | 1–21 | alle 21 gecontroleerd (wachten op nakijken) |
| mat | 1–28 | alle 28 gecontroleerd (wachten op nakijken) |

Totaal: 1 + 4 + 4 + 5 + 1 + 16 + 16 + 16 + 21 + 28 = 112 hoofdstukken.

Per boek: steekproef door de vertaler, twee verzen per hoofdstuk, in de HTML-weergave.

Meldingen over de Nederlandse tekst: `werk/meldingen.md`.

### Lijst met vragen voor de vertaler (pas maken als de koppeling van het NT klaar is)

Besluit van de gebruiker: de lijst (alleen "vraag voor de vertaler", bij voorkeur als CSV met een kolom voor het antwoord) wordt pas gemaakt als alles wat er nu is klaar is (Marcus, Johannes, Mattheüs). Tot dan blijven de vragen in `werk/meldingen.md`. Neem dan ook deze losse punten mee, die nog niet in de meldingen staan:

- `data/namentabel.json` bestaat niet. Eigennamen zijn bij het koppelen niet gecontroleerd (vermeld door de agent voor 1 Korinthe 13–16).
- "HEER" in hoofdletters staat in citaten voor κύριος (bijvoorbeeld 1 Korinthe 1:31, 10:26, 14:21). De projectconventie noemt "HEERE" voor het Tetragrammaton en "Heere" voor adonay. Vraag: welke schrijfwijze geldt in citaten uit het OT?
- ἀδελφοί is overal als "broeders en zusters" gekoppeld (`en~ zusters=`). Het Grieks heeft alleen één woord; "en zusters" is eigenlijk een toevoeging. Vraag: koppelen als `~` (zoals nu) of als `+`?
- Het Nederlands heeft hetzelfde Griekse woord op verschillende plekken verschillend vertaald (bijvoorbeeld βίος, δικαιόω, κατεργάζομαι, παρθένος, ἐξουσία). De losse gevallen staan in de meldingen onder de soort "controle 9: consistentie".
- Tekstvarianten zijn alleen gesignaleerd ("vermoeden, niet nagegaan"). Het bewijs moet uit een machineleesbaar apparaat komen (absolute regel 2).
- Mattheüs 5:22: de voetnoot in de Nederlandse tekst verwijst naar "veel Nederlandse Bijbels" en lijkt niet uit een apparaat te komen. Dat botst met absolute regel 1 en 2. Vraag: herschrijven of schrappen? (gemeld door de agent bij Mattheüs 5-8; niet zelf nagegaan)
- Mattheüs 5:23/24, Marcus 10:29/30 en Johannes 7:21/22: de Nederlandse versgrens valt niet samen met het Grieks.

### Stand 2026-11-17 (doorgewerkt zonder nakijken)

Op verzoek is doorgewerkt terwijl de collega Filemon nog niet heeft nagekeken. Klaar en scriptmatig foutloos: phm 1, php 1–4, col 1–4, 2jo 1, 1jo 1–5, rom 1–16, 1co 1–16, mrk 1–16, joh 1–21, mat 1–28. De koppeling van het NT is hiermee compleet (112 hoofdstukken). Volgende stap: de lijst met vragen voor de vertaler (CSV).

Risico: de afspraken in de notatie (`=` / `~` / `+`) zijn nog niet goedgekeurd. Keurt de collega ze af, dan moeten de hoofdstukken hierboven worden omgezet. Dat kan met een script op de .txt-bestanden in `werk/koppeling/`.

Overzichten voor de collega: `werk/overzicht/*.html` (één per hoofdstuk).

### Resultaat Filemon (2026-11-17)

- Werkwijze: `maak-koppelwerkblad.js phm 01` -> koppelen in `werk/koppeling/phm-01.txt` -> `koppeling-uit-tekst.js phm 01` -> `controleer-koppeling.js`. Eerste poging foutloos.
- Afspraak in de notatie: `=` voor het woord dat de betekenis draagt, `~` voor hulpwerkwoorden, voorzetsels bij een naamval, een onderwerp dat in de werkwoordsvorm zit en uitdrukkingsdelen, `+` zonder Grieks equivalent.
- Verschil met de proef: 44 woorden verschillen alleen in type (vooral `woord` of `segment` bij meerwoordsuitdrukkingen), 29 ook in plaats. In de proef waren er meer `toevoeging` (65 tegen 50): de nieuwe koppeling koppelt voegwoorden en hulpwerkwoorden bij participia en infinitieven (omdat, hoewel, om, zou) aan het Griekse werkwoord.
- `data/koppeling/weergaven.json` is opnieuw berekend.
- Nieuwe koppeling: 304 woord, 101 segment, 50 toevoeging. Proef: 275 woord, 115 segment, 65 toevoeging.
- Ongekoppelde Griekse woorden die geen lidwoord zijn: dezelfde acht in beide versies (zie meldingen).
- Onafhankelijkheid: de eerste twee verzen van de oude proef waren al in beeld voordat het koppelen begon. De rest is zonder die proef gemaakt.

## 2. WP1 — Datafundament

- [ ] 1a. Lemma in Grieks en Hebreeuws schrift (Strong-XML; Dodson geeft het Griekse lemma ook, vergelijken)
- [ ] 1a. Geaccentueerde RP2018 gecontroleerd (melden voor iets te wijzigen)
- [ ] 1b. `verwerk-wlc.js`: `morph` overnemen
- [ ] 1b. Hebreeuwse voorvoegsels als morfemen splitsen
- [ ] 1b. Concordantie opnieuw bouwen; Genesis 1:1 als controle (zeven woorden, tien morfemen)

## 3. WP2 — Morfologie in gewone taal

- [ ] Alle morfcodes verzamelen
- [ ] `pipeline/scripts/morfologie-nl.js`
- [ ] `data/lexicon/morfologie-nl.json`
- [ ] Lijst onbekende codes is leeg
- [ ] 30 willekeurige regels nagekeken door de vertaler

## 4. WP4 — Woordenboek (na WP3)

- [ ] B3 bevestigen en herschrijven
- [x] Dekking Dodson ten opzichte van RP2018 gemeten: alle 3.165 nummers gedekt (2026-11-20)
- [x] `pipeline/scripts/maak-lexiconbrokken.js`
- [x] `controleer-strong-vertaling.js` uitgebreid (glos 1–4 woorden, geen Engelse restwoorden, `bron_en`)
- [x] 4a. Dodson, de 3.165 nummers uit de 112 vertaalde hoofdstukken: 22 brokken vertaald, controle 0 fouten, nog niet nagelezen (steekproef en vragen: werk/lexicon/)
- [ ] 4a. Dodson, rest van het Grieks
- [ ] 4b. Abbott-Smith: proef op 50 vermeldingen, daarna doorwerken
- [x] Samenvoegscript `greek.nl.json` (pipeline/scripts/voeg-lexicon-samen.js)
- [ ] Steekproef per tien brokken in `werk/lexicon/steekproef.md`
- [ ] 4c. BDB (Hebreeuws), pas bij het OT

Brokken (aantal en grootte bepalen na de dekkingsmeting en de eerste vijf brokken): nog niet aangemaakt.

## 5. WP5 — Weergaven berekenen

- [ ] B6 besluiten
- [ ] `bereken-weergaven.js` over alle koppelingen
- [ ] Normalisatie (hoofdletters samen, verbuigingen apart)
- [ ] Uitvoer per Strong-nummer, per boek

## 6. WP6 — Site

- [ ] Woordpaneel (§5 van het plan): glos en NL-definitie uit greek.nl.json getoond (2026-11-20); weergaven en morfologie nog niet
- [ ] Tweerichtingsmarkering Nederlands ↔ grondtekst
- [ ] `/strong/[nummer]` uitbreiden: glos, NL-definitie en Engelse bron (uitklapbaar) staan er; eigen weergaven nog niet
- [ ] KJV-weergaven per nummer vervangen (B4)
- [ ] Concordantie in Bijbelvolgorde
- [ ] API: lexicon, koppeling, weergaven
- [ ] Bronvermelding op elke Strong-pagina; naamsvermelding voor CC BY-onderdelen
- [ ] Controle in de preview: Filemon en een hoofdstuk zonder koppeling

## 7. Hoofdstukken en brokken afmaken

- [ ] WP4 rest van het Grieks
- [ ] WP4 Hebreeuws (BDB) bij het OT

## 8. WP7 — Kwaliteitsrapport

- [x] `pipeline/scripts/maak-kwaliteitsrapport.js` → `docs/kwaliteitsrapport.html` (2026-11-20)
