# Vastgepinde grondtekstversies

## Oude Testament — Westminster Leningrad Codex

- **Bron**: [openscriptures/morphhb](https://github.com/openscriptures/morphhb), map `wlc/`
- **Opgehaald**: 2026-09-11, van de `master`-branch
- **Tekst**: publiek domein (Christopher V. Kimball / tanach.us)
- **Morfologie- en Strong-laag**: **Creative Commons Attribution 4.0** (Daniel Owens, David Troidl) — dit is een licentienuance ten opzichte van wat elders in dit project als "publiek domein" is aangenomen. Naamsvermelding is vereist zolang deze laag gebruikt wordt. Zet een credit-regel op de site (bijv. bij "Over" of in de footer): "Morfologie en Strong-codering: Open Scriptures Hebrew Bible (CC BY 4.0)."
- **Versnummering**: omgezet van de Hebreeuwse naar de Engelse/KJV-hoofdstuk-en-versindeling met de officiële `VerseMap.xml` uit dezelfde bron. Zonder deze omzetting wijken minstens twee boeken (Joël, Maleachi) af in hoofdstuktelling.
- **Bekende restafwijking**: 6 van de 929 hoofdstukken (1 Koningen 18, 20, 22; Nehemia 7; Psalm 13; Jesaja 63) hebben een verschil van precies 1 vers ten opzichte van de KJV-telling, door halve-verssamenvoegingen die niet 1-op-1 in het datamodel passen. Zie de `VerseMap.xml`-vermeldingen met `type="partial"`.

## Nieuwe Testament — Robinson–Pierpont Byzantine Textform 2018 (RP2018)

- **Bron**: [byztxt/byzantine-majority-text](https://github.com/byztxt/byzantine-majority-text), map `csv-unicode/strongs/with-parsing/` (27 bestanden, `master`-branch)
- **Opgehaald**: 2026-11-12
- **Reden voor de wissel**: de aangeleverde vertaling is gemaakt uit RP2018 (ook `grondtekst_bron` in `data/bijbel/` zegt dat). De Elzevir-grondtekst op de site week in 15% van de verzen af van de vertaling en in Romeinen 14 en 16 ook in de versindeling (lofprijzing 14:24-26 in RP2018, 16:25-27 in Elzevir).
- **Licentie**: publiek domein ("All the code and text contained in this folder is in the Public Domain"), geen naamsvermeldingsplicht.
- **Tekst**: Unicode Grieks, kleine letters, zonder accenten en ademingen. Strong-nummer en morfologiecode per woord. Bij woorden met twee mogelijke ontledingen is de eerste overgenomen.
- **Omzetting**: `pipeline/scripts/verwerk-rp2018.js` naar `data/grondtekst/nt/<boek>/<hoofdstuk>.json`; 260 hoofdstukken, 7.953 verzen, 140.149 woorden.
- **Bekende afwijkingen ten opzichte van de KJV-telling**: Lucas 17:36, Handelingen 8:37, 15:34 en 24:7 bestaan niet in RP2018 (de KJV heeft ze wel). Romeinen 14 telt 26 verzen en Romeinen 16 telt 24 (KJV: 23 en 27).
- **Eerder**: Elzevir Textus Receptus (`byztxt/greektext-elzevir`, opgehaald 2026-09-11), omgezet met `pipeline/scripts/verwerk-elzevir.js`. Dat script blijft staan; de oude data staat in de Git-geschiedenis (commit vóór de wissel).

## Concordantie-index

`concordantie.json` (niet in git, of wel — zie `.gitignore`) is gegenereerd uit bovenstaande bestanden: voor elk Strong-nummer alle vindplaatsen (boek, hoofdstuk, vers, grondtaalwoord) in de hele Bijbel. Bij wijziging van de brondata opnieuw genereren met `pipeline/scripts/bouw-concordantie.js`.

## Demo-vuldata — KJV met Strong-nummers

- **Bron**: [CrossWire SWORD Project, module KJV 3.1](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=KJV) (2023-07-19), pakket `KJV.zip` (4 026 621 bytes)
- **Opgehaald**: 2026-10-07 van `crosswire.org/ftpmirror/pub/sword/packages/rawzip/KJV.zip`
- **Gebruik**: alleen in de demo, om bij een vindplaats het Engelse woord te markeren dat bij het Strong-nummer hoort. Zelfde schakelaar als `noindex` (`PUBLIC_INDEXABLE`); in productie wordt het niet getoond.
- **Licentie**: CrossWire: "hereby grants a general public license to use this text for any purpose"; distributielicentie GPL. Past niet vanzelf bij de CC0-regel voor onze data. Daarom staat het onveranderde `KJV.zip` apart in `pipeline/vuldata/` (met `NOTICE.md`, buiten `data/`) en de omgezette uitvoer (`data/kjv_strong/`) in `.gitignore`. In productiebuilds (`PUBLIC_INDEXABLE=true`) wordt het niet omgezet en niet getoond.
- **Omzetting**: `pipeline/scripts/verwerk-kjv-strong.js` (als argument `pipeline/vuldata/KJV.zip`; draait ook als `prebuild` van de site). Per vers een lijst van tekstdelen met hun Strong-nummers. Voetnoten en koppen vallen weg.
- **Controle**: alle 31 102 verzen sluiten aan op onze versindeling; in 293 verzen verschilt de tekst licht van `data/kjv` (leestekens, uitgavenverschil).


## Statenvertaling (naast de BereaBijbel)

- **Bron**: [CrossWire SWORD Project, module DutSVV 2.1.1](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=DutSVV) (2020-08-01), pakket `DutSVV.zip` (1 606 261 bytes)
- **Opgehaald**: 2026-10-07 van `crosswire.org/ftpmirror/pub/sword/packages/rawzip/DutSVV.zip`
- **Licentie**: "Public Domain" (volgens de module). Tekst gebaseerd op de elektronische editie van Statenvertaling online.
- **Gebruik**: alleen ter weergave in de tab "Bijbels" en bij de vindplaatsen, in de demo (zelfde schakelaar als de KJV). **Nooit in vertaalprompts** (CLAUDE.md, absolute regel 1).
- **Omzetting**: `pipeline/scripts/verwerk-staten.js` naar `data/staten/<boek>/<hoofdstuk>.json`. Voetnoten vallen weg.
- **Bekende restafwijking**: twee hoofdstukken hebben een ander versaantal dan de KJV-indeling (1 Samuël 23: 28 tegen 29; Handelingen 19: 40 tegen 41). Die worden niet getoond, omdat de versnummers daar zouden verspringen.

## Strong's woordenboeken (betekenissen bij een grondtekstwoord)

- **Bron**: [openscriptures/strongs](https://github.com/openscriptures/strongs): `greek/strongsgreek.dat` (989 987 bytes) en `hebrew/strongshebrew.dat` (1 456 344 bytes)
- **Opgehaald**: 2026-10-07, van de `master`-branch
- **Inhoud**: Strong's Exhaustive Concordance (1890), de woordenboeken van Grieks (5 624 nummers) en Hebreeuws (8 674). Engelstalig.
- **Licentie**: de woordenboeken van Strong zijn publiek domein, net als de oorspronkelijke e-tekst van Michael Grier. De gecorrigeerde uitgave van OpenScriptures (2008) behoudt die status en wordt vrijgegeven met een toestemmingstekst in MIT-stijl: "Copyright (c) 2008, OpenScriptures.org … The above copyright notice and this permission notice shall be included in all copies". De kop noemt dit "GPL 3.0", maar de tekst zelf is een MIT-toestemming. Die tegenstrijdigheid staat in de bron. Naamsvermelding: *Strong's Dictionaries, e-tekst van Michael Grier, gecorrigeerd door Ulrik Sandborg-Petersen, Weston Ruter en OpenScriptures.org*.
- **Bewust niet gebruikt**: de JSON-versie van OpenScriptures (`strongs-*-dictionary.js`) is CC-BY-SA; share-alike past niet bij onze CC0-data.
- **Omzetting**: `pipeline/scripts/verwerk-strong-lexicon.js` naar `data/lexicon/greek.json` en `hebrew.json` (5 523 en 8 674 vermeldingen; 101 Griekse nummers zijn in de bron "Not Used"). Per nummer: transliteratie, uitspraak, definitie en de weergaven in de KJV.
- **Taal**: Engels, niet vertaald door een model. Lexicale gegevens moeten verifieerbaar zijn in het woordenboek zelf (CLAUDE.md, notities).
- **Gebruik**: bij een aangeklikt grondtekstwoord (`Betekenissen`) en op de pagina `/strong/<nummer>`.
