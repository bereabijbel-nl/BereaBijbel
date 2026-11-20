# Vertaalinstructie: Dodson-lexicon naar het Nederlands

Bron: Dodson Greek Lexicon (publiek domein, CC0). Gebruik dit bestand bij elk brok.

## Opdracht

Je krijgt een brok uit `werk/lexicon/dodson-NNN.json`: per Strong-nummer `translit`, `kort` (korte Engelse glos) en `lang` (langere Engelse omschrijving).

Lever een JSON-object met per sleutel precies twee velden:

```json
{ "G26": { "glos": "liefde", "definitie": "…" } }
```

- `glos`: vertaling van **alleen `kort`** (niet van `lang`), **1 tot 4 Nederlandse woorden**. Het eerste of belangrijkste woord eerst. Nooit langer dan vier woorden: kort af, laat bijzaken weg (die staan in `definitie`).
- Werkwoorden (Dodson schrijft "I say"): in de `glos` de onbepaalde wijs zonder "ik" ("zeggen, spreken"); in de `definitie` blijft de eerste persoon staan zoals in de bron ("ik zeg, spreek").
- Kies in de `glos` het woord dat even sterk is als de bron. Geen sterker of zwakker woord ("lust" blijft "lust", niet "wellust"). Voeg geen woord toe dat in `kort` niet staat.
- Dit is een voorstel voor besluit B3 en geldt tot de vertaler anders beslist.
- `definitie`: volledige vertaling van `lang`.

## Regels

1. **Trouw vertalen.** Geef weer wat Dodson schrijft. Voeg niets toe, laat niets weg, geen eigen uitleg of exegese.
2. **Getallen en verwijzingen ongewijzigd** (Strong-nummers, bijbelverwijzingen). Elk getal in `lang` komt even vaak terug in `definitie`.
3. **Accolades en haakjes** van de bron blijven staan.
4. **Eigennamen** blijven zoals Dodson ze schrijft.
5. **Geen Nederlandse Bijbelvertaling raadplegen of nabootsen**, ook de Statenvertaling niet (CLAUDE.md, absolute regel 1). Gewoon, helder Nederlands, B2.
6. **Geen Engelse restwoorden** in `glos` of `definitie` (geen "the", "of", "which", "i.e." enzovoort). Gebruik "d.w.z." voor "i.e.".
7. Niet vertalen en niet teruggeven: `translit`, `kort`, `lang`. `bron` en `bron_en` worden door een script toegevoegd.

## Afwerking (script, niet het model)

```
node pipeline/scripts/maak-lexiconbrokken.js --aanvullen data/lexicon/nl/dodson-NNN.json
node pipeline/scripts/controleer-strong-vertaling.js werk/lexicon/dodson-NNN.json data/lexicon/nl/dodson-NNN.json
```

Fout gemeld: hetzelfde brok herstellen, niet doorgaan.
