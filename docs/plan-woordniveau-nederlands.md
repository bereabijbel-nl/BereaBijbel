# Plan: woordniveau in het Nederlands

Status: voorstel, 2026-11-17. B2, B4, B7, B8 en B9 zijn besloten en staan in het beslislogboek.

Dit plan is geschreven om stap voor stap aan Claude Code (Sonnet 5) voor te leggen. Elk werkpakket heeft een eigen opdracht onderaan. Lees eerst `CLAUDE.md`.

---

## 1. De vraag in het kort

De site toont nu bij elk grondtekstwoord een Strong-nummer met een Engelse definitie uit 1890 en een lijst KJV-weergaven. We willen:

1. Alles in het Nederlands
2. Per woord precies laten zien hoe het in de BereaBijbel is vertaald
3. Per grondtekstwoord laten zien hoe het elders is vertaald

Daarbij drie vragen: is Strong nog het handigst, wat kan Claude Code doen, en hoe houden we het binnen het abonnement.

---

## 2. Het korte antwoord

### Strong blijft de sleutel, maar wordt niet meer de inhoud

Strong-nummers zijn de universele sleutel. Alle publiek-domeindata gebruikt ze (WLC, RP2018, concordantie), en bouwers kennen ze. Die sleutel houden we.

Maar het Strong-woordenboek is als inhoud zwak:

- **Eén nummer is geen betekenis.** G3056 (*logos*) dekt "woord", "rekenschap", "zaak" en "het Woord". Het nummer zegt niet welke betekenis hier geldt.
- **Soms één woord onder meerdere nummers.** Vormen van *eimi* ("zijn") staan deels onder eigen nummers (bijv. G2258 voor ἦν). De concordantie splitst dan wat één woord is.
- **Hebreeuwse voorvoegsels ontbreken.** In de WLC-data krijgt בְּ/רֵאשִׁית alleen H7225. Het voorzetsel בְּ ("in") heeft geen eigen plek. Dat moet wel, anders kun je niet laten zien waar "In" in Genesis 1:1 vandaan komt.
- **De definities zijn verouderd en KJV-gekleurd.** "Jehovah", "Chaldee", etymologische gissingen.
- **De KJV-weergaven zeggen niets over onze vertaling.**

### Het onderscheidende zit in de koppeling, niet in het woordenboek

Wat de bezoeker wil weten ("hoe is dit woord hier vertaald, en hoe elders") komt niet uit een lexicon. Het komt uit de **woordkoppeling**: per vers welk Nederlands woord bij welk grondtekstwoord hoort. Daaruit volgt per Strong-nummer automatisch een telling van alle weergaven. Dat is BereaBijbel-eigen data, CC0, en die heeft niemand anders in het Nederlands.

De Filemon-proef (`data/koppeling/phm/01.json` en `data/koppeling/weergaven.json`) laat zien dat dit werkt.

### Daarom drie lagen

| Laag | Vraag | Bron | Wie maakt het |
|---|---|---|---|
| A. Lexicon | Wat betekent dit woord in het algemeen? | Strong (1890), vertaald | Claude, in brokken, met scriptcontrole |
| B. Koppeling | Hoe is het **hier** vertaald? | Vertaling van de collega + grondtekst | Claude per hoofdstuk, scriptcontrole, steekproef door de vertaler |
| C. Weergaven | Hoe is het **elders** vertaald? | Berekend uit B | Script, geen model |

Daarnaast twee lagen die geen model nodig hebben:

| Laag | Wat | Wie |
|---|---|---|
| D. Morfologie in gewone taal | "werkwoord, aoristus, actief, 3e persoon enkelvoud" | Script met een vaste vertaaltabel |
| E. Vindplaatsen | Alle plaatsen van dit grondtaalwoord | Bestaat al (`data/grondtekst/concordantie.json`) |

**Prioriteit: B en C eerst, A daarna.** B en C maken de belofte "doorklikbare verantwoording per woord" waar. A is nuttig, maar BibleHub doet dat al (zie CLAUDE.md, weergaveniveaus).

---

## 3. Wat er al ligt

| Onderdeel | Stand |
|---|---|
| `data/lexicon/greek.json` | 5.523 vermeldingen, Engels, ca. 415.000 tekens |
| `data/lexicon/hebrew.json` | 8.674 vermeldingen, Engels, ca. 610.000 tekens |
| `pipeline/prompts/strong-vertaling.md` | Vertaalinstructie met vaste termen |
| `docs/strong-proefbatch.md` | 50 vermeldingen proefvertaald, kwaliteit goed |
| `pipeline/scripts/controleer-strong-vertaling.js` | Controleert getallen, `{…}`-groepen, lege velden |
| `data/koppeling/phm/01.json` | Proefkoppeling Filemon, niet door een mens nagekeken |
| `pipeline/scripts/controleer-koppeling.js` | Harde controles op koppeling |
| `pipeline/scripts/bereken-weergaven.js` | Telt weergaven per Strong-nummer |
| `data/grondtekst/nt/` | RP2018 met Strong en morfologiecode per woord |
| `data/grondtekst/ot/` | WLC met Strong per woord, **`morf` is overal `null`** |
| `data/bijbel/` | Vertaald: mat, mrk, joh, rom, 1co, php, col, 1jo, 2jo, phm (112 hoofdstukken, 66.383 Griekse woorden) |

### Gevonden tegenstrijdigheden en gaten

1. `verwerk-strong-lexicon.js` zegt in de kop: *"Geen vertaling door een model"*. `strong-vertaling.md` doet precies dat. Dit moet een vastgelegd besluit worden (zie §4).
2. OT-morfologie ontbreekt: `verwerk-wlc.js` neemt het `morph`-attribuut niet over.
3. OT-voorvoegsels gaan verloren: `strongVan()` neemt alleen het laatste segment van het lemma.
4. De RP2018-tekst is zonder accenten en hoofdletters (`παυλος`). Voor weergave is een geaccentueerde vorm of lemma beter.
5. Het lexicon bevat geen lemma in Grieks of Hebreeuws schrift, alleen transliteratie.

---

## 4. Besluiten vooraf (voor het beslislogboek)

Deze punten eerst met de collega afstemmen en vastleggen in `docs/projectplan.md`, sectie 17. Daarna pas bouwen.

**B1. Strong blijft de sleutel.** Elk grondtekstwoord houdt zijn Strong-nummer. We voegen velden toe, we vervangen niets.

**B2. Lexicon vertalen met een model mag. (Besloten 2026-11-17.)**

De absolute regels gaan over de Bijbeltekst zelf (regel 1) en over tekstkritiek (regel 2). Een woordenboek vertalen valt daar niet onder. De oude kop van `verwerk-strong-lexicon.js` was strenger dan nodig. Wat overblijft zijn twee gewone kwaliteitseisen: de lezer moet kunnen nagaan wat Strong zelf schreef, en het model mag geen uitleg toevoegen. Daarom:
- Het blijft herkenbaar als "Strong (1890), vertaald". Geen eigen aanvullingen.
- Elke vertaalde vermelding heeft `bron_en` ernaast, zodat iedereen kan vergelijken.
- Scriptcontrole op elke vermelding, en een steekproef door een mens.
- Dit valt niet onder absolute regel 2 (tekstkritiek). Het is wel een `lexical_note`-bron, dus geen exegese toevoegen.
- Kop van `verwerk-strong-lexicon.js` aanpassen.

**B3. Een korte Nederlandse glos per vermelding.** Eén tot vier woorden, afgeleid uit Strongs eigen definitie. Dat is wat een bezoeker het meest gebruikt. Bij hover toont de site de glos; bij klikken de volledige definitie.

**B4. KJV-weergaven stap voor stap vervangen. (Besloten 2026-11-17.)** De live site toont nu bij `/strong/<nummer>` het blok "In de KJV vertaald als" (uit Strongs eigen woordenboek, publiek domein). Dat blijft staan zolang er voor dat Strong-nummer nog geen eigen weergaven zijn. Zodra een nummer in minstens één gekoppeld hoofdstuk voorkomt, toont de site "In de BereaBijbel vertaald als" en schuift de KJV-lijst naar een ingeklapt blok. Per woord, niet in één keer.

**B5. Koppeling door Claude, `gewogen` door de vertaler.** Claude maakt de woordkoppeling. Het veld `gewogen: true` zet alleen de vertaler, want dat is een vertaalbeslissing.

**B6. Lemma-groepering.** Een klein bestand `data/lexicon/lemmagroepen.json` dat vormnummers aan hun hoofdlemma koppelt (bijv. G2258 → G1510). De concordantie en de weergaventelling kunnen dan per lemma tonen, met de losse nummers nog zichtbaar.

**B7. Alles op de site moet vrij over te nemen zijn. (Besloten 2026-11-17.)** Daarom geen STEPBible-data (TAGNT/TAHOT, CC BY 4.0) en geen OpenScriptures-JSON van Strong (CC BY-SA). Hun aanpak (uitgebreide Strong-nummers, gesplitste voorvoegsels) mogen we wel zelf nabouwen op publiek-domeindata.

**B8. Licenties nagekeken (2026-11-17, door Claude).**

| Bron | Licentie | Gevolg |
|---|---|---|
| WLC-tekst (morphhb) | publiek domein | geen probleem |
| WLC lemma's en morfologie (morphhb) | **CC BY 4.0** | zie B9 |
| RP2018 met Strong en morfologie | publiek domein | geen probleem |
| Strong Grieks, XML-versie (`greek/StrongsGreekDictionaryXML_1.4`) | "Public Domain -- Copy Freely" | bron voor het Griekse lemma (bijv. ἀγάπη) in WP1a |
| Strong Hebreeuws, XML-versie (`hebrew/StrongHebrewG.xml`) | Strong publiek domein, **TWOT-verwijzingen © 1980 Moody Bible Institute** | lemma overnemen, TWOT-velden weglaten |
| Strong `.dat`-bestanden (huidige bron) | publiek domein, MIT-stijl toestemming OpenScriptures | geen probleem, naamsvermelding houden |

**B9. Hebreeuwse Strong-codering is CC BY 4.0. (Besloten 2026-11-17: optie a.)** De Strong-nummers bij elk OT-woord komen uit de lemmalaag van morphhb. Die is vrij over te nemen, ook commercieel, maar met naamsvermelding. Dat is niet CC0. Een publiek-domeinalternatief met Strong per Hebreeuws woord is niet bekend. Opties:
- (a) Accepteren als enige uitzondering, apart gelabeld en met credit-regel. Alle eigen BereaBijbel-data blijft CC0.
- (b) Zelf een Hebreeuwse Strong-codering maken. Groot werk, hoort niet in fase 1.

Gekozen: optie (a). De naamsvermelding en de uitleg staan op `/over#licenties`, in de footer, bij OT-verzen, op `/strong/H…` en in de hoofdstuk-API. Nieuwe weergaven van OT-data (WP1b, WP6) moeten de naamsvermelding meenemen.

---

## 5. Wat de bezoeker per woord ziet

Na dit plan toont een klik op een grondtekstwoord:

```
χάρις  (charis)                                 G5485
genade                                          ← glos (laag A)

Hier vertaald als:  "genade"                    ← koppeling (laag B)
Vorm:  zelfstandig naamwoord, nominatief,       ← morfologie (laag D)
       enkelvoud, vrouwelijk

In de BereaBijbel elders vertaald als:          ← weergaven (laag C)
  genade        142×   Rom 1:7, Rom 3:24, …
  dank            6×   Rom 6:17, 1Ko 15:57, …
  gunst           3×   …
  (nog niet vertaalde boeken: 23 vindplaatsen)

Betekenis volgens Strong (1890):                ← lexicon (laag A)
  van 5463; welwillendheid, …
  [toon Engelse bron]

Alle 156 vindplaatsen →                         ← concordantie (laag E)
```

Andersom werkt het ook: klik je op een Nederlands woord, dan lichten de grondtekstwoorden op waar het uit komt. Bij `segment` licht de hele groep op, bij `toevoeging` staat "geen grondtekstequivalent".

---

## 6. Werkpakketten

Volgorde is bewust. Elk pakket levert iets op dat los te controleren is.

### WP1 — Datafundament repareren (script, geen model)

**1a. Grieks lemma en accenten**
- Lees het lemma in Grieks en Hebreeuws schrift in uit de XML-versies van `openscriptures/strongs` (zie B8). Voeg `lemma` toe aan `greek.json` en `hebrew.json`. Neem uit het Hebreeuwse XML-bestand **geen** TWOT-gegevens over.
- Controleer of `byztxt/byzantine-majority-text` ook een geaccentueerde uitgave heeft. Zo ja: veld `tekst_acc` toevoegen naast `tekst`. Zo nee: lemma gebruiken voor weergave, en dat vastleggen.

**1b. Hebreeuwse morfologie en voorvoegsels**
- `verwerk-wlc.js`: neem `morph` over.
- Splits woorden met `/` in morfemen. Elk morfeem krijgt een eigen plek met eigen Strong-nummer (voorvoegsels hebben in morphhb lettercodes zoals `b`, `c`, `d`; maak daar vaste pseudo-sleutels van, bijv. `H-b` = voorzetsel בְּ).
- Houd een veld `woord` bij zodat de site de morfemen weer als één woord kan tonen.
- Concordantie opnieuw bouwen.

**Klaar als:** Genesis 1:1 heeft zeven woorden en tien morfemen, elk met Strong en morfologie. Bestaande NT-data is onveranderd.

### WP2 — Morfologie in gewone taal (script, één keer met Claude ontwerpen)

- Er zijn 1.055 verschillende Griekse morfcodes in de NT-data. Die volgen een vast systeem (Robinson-codes).
- Schrijf `pipeline/scripts/morfologie-nl.js`: een functie die een code ontleedt en Nederlandse uitleg geeft. Geen tabel van 1.055 regels, maar regels per onderdeel (woordsoort, tijd, genus, modus, naamval, getal, geslacht, persoon).
- Zelfde voor Hebreeuwse morphhb-codes.
- Termen: Nederlandse schoolgrammatica waar die bestaat (onderwerp, lijdend voorwerp), met de vakterm erbij waar het Nederlands geen equivalent heeft (aoristus, mediaal, piël).
- Uitvoer: `data/lexicon/morfologie-nl.json` met alle voorkomende codes uitgeschreven, zodat de site niet hoeft te rekenen.

**Klaar als:** elke code in de data een uitleg heeft, het script een lijst onbekende codes geeft (moet leeg zijn), en de collega 30 willekeurige regels heeft goedgekeurd.

### WP3 — Woordkoppeling per hoofdstuk (Claude, de kern)

Dit is het grootste en belangrijkste werk. 112 hoofdstukken, ruim 66.000 Griekse woorden.

**Compacte notatie om het abonnement te sparen.** Het huidige koppelingsformaat is per Nederlands woord een JSON-object van ca. 8 regels. Dat kost veel uitvoer. Laat Claude in plaats daarvan per vers één regel schrijven:

```
1| Paulus=0 gevangene=1 van~2 Christus=2 Jezus=3 en=4 Timotheüs=5 de=6 broeder=7 aan~8 Filemon=8 onze=13 geliefde=10 medearbeider=12
```

| Teken | Betekenis | `type` |
|---|---|---|
| `woord=3` | woordkoppeling met Grieks woord op plaats 3 | `woord` |
| `woord=3,4` | met meerdere Griekse woorden | `woord` |
| `woord~3` | hoort bij een uitdrukking/segment | `segment` |
| `woord+` | geen grondtekstequivalent | `toevoeging` |

Een script (`pipeline/scripts/koppeling-uit-tekst.js`) zet dit om naar het bestaande JSON-formaat. Daarna draait `controleer-koppeling.js`. Dit scheelt naar schatting 80 procent uitvoer.

**Wat Claude per hoofdstuk meekrijgt** (via een script dat een werkblad maakt, niet door zelf grote bestanden te lezen):

```
vers 1
GR: 0 παυλος G3972 N-NSM | 1 δεσμιος G1198 N-NSM | 2 χριστου G5547 N-GSM | …
NL: Paulus, gevangene van Christus Jezus, en Timotheüs, de broeder, …
```

Plus de glos per Strong-nummer zodra WP4 klaar is (helpt bij moeilijke gevallen).

**Regels voor Claude:**
- Verzin nooit een koppeling. Twijfel → `segment`. Geen equivalent → `toevoeging`.
- Een Grieks woord mag ongekoppeld blijven (lidwoorden). Het controlescript meldt die; Claude zet onder het vers een korte reden als het geen lidwoord is.
- Lees geen andere Nederlandse vertaling (absolute regel 1).
- Pas de Nederlandse tekst nooit aan. Klopt iets niet, dan een melding in `meldingen.md`, niet zelf corrigeren.

**Controle:**
1. `controleer-koppeling.js` moet foutloos zijn
2. Ongekoppelde niet-lidwoorden komen in een lijst voor de vertaler. Soms is dat een echte omissie in de vertaling. Dat is waardevolle bijvangst
3. Steekproef: de collega controleert per boek twee verzen per hoofdstuk in de bestaande HTML-weergave (`maak-koppeling-html.js`)

**Volgorde:** eerst Filemon opnieuw in de compacte notatie (vergelijken met de bestaande proef), dan Filippenzen, Kolossenzen, 1 en 2 Johannes, dan de grote boeken.

### WP4 — Lexicon vertalen (Claude, in brokken)

- Script `pipeline/scripts/maak-lexiconbrokken.js` splitst de lexica in brokken van 150 vermeldingen: `werk/lexicon/greek-001.json` … Alleen sleutel, `definitie` en `translit` erin, niets anders.
- Claude vertaalt één brok tegelijk naar `data/lexicon/nl/greek-001.json`:
  ```json
  { "G26": { "glos": "liefde", "definitie": "van 25; liefde, d.w.z. …" } }
  ```
- Direct daarna `controleer-strong-vertaling.js` op dat brok. Fout → zelfde brok herstellen, niet doorgaan.
- Uitbreiden van de controle: glos aanwezig en maximaal vier woorden; geen Engelse restwoorden uit een lijst (`the`, `of`, `which`, `i.e.`); aantal puntkomma's gelijk.
- Samenvoegscript maakt `greek.nl.json` en `hebrew.nl.json`.

**Omvang:** ca. 37 Griekse en 58 Hebreeuwse brokken, samen 95.

**Volgorde:** eerst alleen de Strong-nummers die in de 112 vertaalde hoofdstukken voorkomen (ca. 3.000 Griekse). Dan de rest van het Grieks. Hebreeuws pas als het OT in beeld komt.

**Steekproef:** de collega leest per tien brokken vijftien willekeurige vermeldingen naast het Engels. Bijhouden in `werk/lexicon/steekproef.md`.

### WP5 — Weergaven berekenen (script)

- `bereken-weergaven.js` draait over alle koppelingen, niet alleen Filemon.
- Uitbreiden met lemma-groepering (B6).
- Normalisatie: tel "genade" en "Genade" samen; houd verbuigingen apart ("liefde"/"liefdes" niet automatisch samenvoegen; dat wordt anders een verborgen beslissing).
- Uitvoer per Strong-nummer, opgesplitst per boek zodat de site niet één groot bestand laadt.

### WP6 — Site (Claude Code, gewone ontwikkeling)

- Woordpaneel zoals in §5
- Tweerichtingsmarkering Nederlands ↔ grondtekst
- `/strong/[nummer]` toont glos, NL-definitie, eigen weergaven, morfologievormen, vindplaatsen
- KJV-weergaven stap voor stap vervangen door eigen weergaven, per Strong-nummer (B4)
- Concordantie op `/strong/<nummer>` in Bijbelvolgorde. Nu staan de boeken alfabetisch (1 Korinthe, 1 Johannes, 1 Petrus …), terwijl de code ervan uitgaat dat de volgorde al klopt
- API: `/api/lexicon/G5485.json`, `/api/koppeling/rom/01.json`, `/api/weergaven/G5485.json`
- Bronvermelding op elke Strong-pagina: "Definitie: Strong (1890), vertaald door BereaBijbel. Weergaven: berekend uit de BereaBijbel."

### WP7 — Kwaliteitsrapport (script)

Eén pagina, opnieuw te genereren, voor de vertaler en voor reviewers:

- Percentage grondtekstwoorden gekoppeld, per boek
- Aantal `segment` en `toevoeging`, per boek
- Lijst ongekoppelde niet-lidwoorden (mogelijke omissies)
- Strong-nummers met veel verschillende weergaven (kandidaten voor het vertaalgeheugen)
- Lexicon: aantal vertaald, aantal door een mens nagekeken

Dit is ook een goed demonstratiestuk richting Wycliffe en andere partijen.

---

## 7. Werken binnen het abonnement

Geen Batch API, dus het werk moet in sessies passen. Uitvoertokens zijn het duurst.

### Principes

1. **Scripts doen het zware lezen.** Claude leest nooit `greek.json`, `concordantie.json` of een heel boek. Een script maakt een klein werkblad, Claude leest alleen dat.
2. **Compacte uitvoer.** Zie de koppelingsnotatie in WP3. Scripts zetten om naar JSON.
3. **Eén eenheid per opdracht.** Eén brok of één hoofdstuk. Dan controle. Dan pas de volgende.
4. **Voortgang in een bestand.** `werk/voortgang.md` met per brok en hoofdstuk: open / klaar / gecontroleerd / nagekeken. Elke sessie begint met lezen van dat bestand. Zo maakt het niet uit als een limiet halverwege valt.
5. **`/clear` tussen eenheden.** Context opnieuw opbouwen is goedkoper dan een lange sessie die alle vorige brokken meesleept.
6. **Sonnet voor het werk, Opus alleen bij vastlopen.** Bijvoorbeeld als een hoofdstuk na twee pogingen nog fouten geeft.
7. **Commit per eenheid.** Klein, terug te draaien. Bericht in het Nederlands, imperatief: "voeg koppeling rom 3 toe".

### Ritueel per sessie

```
1. Lees CLAUDE.md en werk/voortgang.md
2. Lees de opdracht in pipeline/prompts/<werkpakket>.md
3. Pak de eerste open eenheid
4. Maak het werkblad met het script
5. Doe de eenheid
6. Draai de controle; herstel tot foutloos
7. Werk voortgang.md bij en commit
8. Stop, of ga door met de volgende eenheid als de gebruiker dat zegt
```

### Grove schatting

Moeilijk te voorspellen, want limieten verschillen per abonnement. Als richting:

| Werk | Eenheden | Per sessie (orde) |
|---|---|---|
| Lexicon Grieks, vertaalde woorden eerst | ca. 20 brokken | 3 tot 6 brokken |
| Lexicon rest Grieks | ca. 17 brokken | 3 tot 6 brokken |
| Koppeling | 112 hoofdstukken | 2 tot 5 hoofdstukken (kort) of 1 (lang, bijv. Matteüs 26) |
| Lexicon Hebreeuws | 58 brokken | later |

Meet na de eerste vijf eenheden wat het werkelijk kost en stel de brokgrootte bij.

---

## 8. Risico's

| Risico | Maatregel |
|---|---|
| Koppeling ziet er precies uit maar is soms fout | Steekproef door de vertaler; `segment` liever dan een gegokte woordkoppeling; banner "door Claude gekoppeld, steekproefsgewijs nagekeken" tot alles is nagekeken |
| Model voegt exegese toe aan Strong-definitie | Instructie + `bron_en` altijd zichtbaar + steekproef |
| Glos wordt een verkapte vertaalbeslissing | Glos komt uit Strongs definitie, niet uit onze vertaling. Weergaven staan er los naast |
| Dezelfde fout in honderden brokken | Na brok 1 en brok 5 eerst steekproef, dan pas doorwerken |
| Vertaling verandert na koppeling | Koppeling krijgt een hash van de verstekst; script meldt als die niet meer klopt |
| Onopgemerkt Nederlandse vertalingen in de context | Absolute regel 1 in elke opdracht herhalen; contaminatiecheck (stap 10) ook op glossen draaien |

---

## 9. Volgorde in één oogopslag

1. Besluiten B1–B9 vastleggen (B2, B4, B7, B8 en B9 zijn gedaan)
2. WP1 datafundament
3. WP2 morfologie
4. WP3 koppeling Filemon opnieuw → vergelijken → kleine boeken
5. WP4 lexicon, alleen vertaalde woorden
6. WP5 weergaven over alles wat gekoppeld is
7. WP6 site
8. WP3 en WP4 afmaken
9. WP7 rapport

Na stap 7 is er een complete demonstratie voor de kleine boeken. Dat is het moment om het aan reviewers te laten zien.

---

## 10. Opdrachten voor Claude Code (Sonnet 5)

Elke opdracht is los te plakken. Begin elke sessie met de eerste regel.

### Opdracht 0 — voorbereiding

> Lees `CLAUDE.md` en `docs/plan-woordniveau-nederlands.md`. Maak `werk/voortgang.md` aan met alle werkpakketten en eenheden uit §6 als checklist. Pas de kop van `pipeline/scripts/verwerk-strong-lexicon.js` aan volgens besluit B2. B2, B4, B7, B8 en B9 staan al in het beslislogboek. Voeg de overige besluiten uit §4 alleen toe als ik ze hieronder bevestig: [lijst]. Wijzig verder niets.

### Opdracht WP1a

> Lees `CLAUDE.md`, het plan §6 WP1a en `werk/voortgang.md`. Zoek in de OpenScriptures Strong-bron het lemma in Grieks en Hebreeuws schrift en voeg veld `lemma` toe aan `data/lexicon/*.json` via `verwerk-strong-lexicon.js`. Controleer of RP2018 een geaccentueerde uitgave heeft en meld wat je vindt voordat je iets aan `verwerk-rp2018.js` verandert. Werk `VERSIONS.md` bij als je een nieuwe bron gebruikt.

### Opdracht WP1b

> Lees `CLAUDE.md`, het plan §6 WP1b en besluiten B8 en B9. Pas `verwerk-wlc.js` aan: neem `morph` over en splits woorden met `/` in morfemen met eigen Strong-sleutel. Laat de NT-data ongemoeid. Bouw de concordantie opnieuw. Laat Genesis 1:1 zien als controle.

### Opdracht WP2

> Lees `CLAUDE.md` en het plan §6 WP2. Verzamel met een script alle morfcodes in `data/grondtekst/`. Schrijf `pipeline/scripts/morfologie-nl.js` dat elke code ontleedt naar helder Nederlands op B2-niveau, met vakterm waar nodig. Geen tabel per code, wel regels per onderdeel. Schrijf `data/lexicon/morfologie-nl.json`. Geef 30 willekeurige voorbeelden voor controle door de vertaler.

### Opdracht WP3 — één hoofdstuk koppelen

> Lees `CLAUDE.md`, het plan §6 WP3 en `werk/voortgang.md`. Pak het eerste open hoofdstuk. Maak het werkblad met `node pipeline/scripts/maak-koppelwerkblad.js <boek> <hoofdstuk>`. Koppel elk vers in de compacte notatie naar `werk/koppeling/<boek>-<hoofdstuk>.txt`. Zet om met `koppeling-uit-tekst.js` en draai `controleer-koppeling.js`. Herstel tot foutloos. Raadpleeg geen enkele andere Nederlandse vertaling. Wijzig de Nederlandse tekst nooit; meld problemen in `werk/meldingen.md`. Werk voortgang bij en commit. Stop daarna.
>
> (Als de scripts `maak-koppelwerkblad.js` en `koppeling-uit-tekst.js` nog niet bestaan: schrijf die eerst, test ze op Filemon, en stop.)

### Opdracht WP4 — één lexiconbrok

> Lees `CLAUDE.md`, `pipeline/prompts/strong-vertaling.md`, het plan §6 WP4 en `werk/voortgang.md`. Pak het eerste open brok in `werk/lexicon/`. Vertaal naar `data/lexicon/nl/<zelfde naam>` met per sleutel `glos` (1–4 woorden, uit Strongs definitie) en `definitie`. Draai `controleer-strong-vertaling.js` op dit brok en herstel tot foutloos. Werk voortgang bij en commit. Stop daarna, of ga door met het volgende brok als ik "door" zeg.
>
> (Eerste keer: schrijf eerst `maak-lexiconbrokken.js` en breid de controle uit volgens WP4. Begin met de Strong-nummers die in `data/bijbel/` voorkomen.)

### Opdracht WP5

> Lees `CLAUDE.md` en het plan §6 WP5. Breid `bereken-weergaven.js` uit: alle koppelingen, lemma-groepering uit `data/lexicon/lemmagroepen.json`, uitvoer per Strong-nummer. Stel `lemmagroepen.json` samen uit Strongs eigen verwijzingen (bijv. "imperfect van 1510") en toon de lijst voor controle.

### Opdracht WP6

> Lees `CLAUDE.md` en het plan §5 en §6 WP6. Bouw het woordpaneel en de tweerichtingsmarkering op de hoofdstukpagina, en breid `/strong/[nummer]` uit. Vervang de KJV-weergaven per Strong-nummer zodra er eigen weergaven zijn (B4). Controleer in de preview op Filemon en op een hoofdstuk zonder koppeling (dat moet netjes terugvallen).

### Opdracht WP7

> Lees het plan §6 WP7. Schrijf `pipeline/scripts/maak-kwaliteitsrapport.js` dat `docs/kwaliteitsrapport.html` maakt.
