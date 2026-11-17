# Vertaalinstructie: Strong's woordenboek naar het Nederlands

Gebruik dit bestand aan het begin van elke werksessie. Het zorgt dat elke dag dezelfde regels gelden.

## Opdracht

Vertaal het veld `definitie` van elke vermelding in `data/lexicon/greek.json` en `data/lexicon/hebrew.json` van het Engels naar het Nederlands.

Bron: Strong's Dictionaries (1890), e-tekst van Michael Grier, gecorrigeerd door Ulrik Sandborg-Petersen, Weston Ruter en OpenScriptures.org.

## Regels

1. **Trouw vertalen.** Geef weer wat Strong schrijft. Voeg niets toe, laat niets weg, verbeter niets en geef geen eigen uitleg of exegese. Lexicale gegevens moeten verifieerbaar zijn in het woordenboek zelf.
2. **Getallen en verwijzingen ongewijzigd.** Elk nummer in de brontekst (`from 1909 and 5055`) komt precies zo terug.
3. **Accolades en kleine tekens ongewijzigd.** `{o-no'}`, `;Onow` en dergelijke blijven staan.
4. **Eigennamen blijven zoals Strong ze schrijft** (`Ænĕas`, `Barnabas`, `Jehovah`). Plaats- en volkstypen worden vertaald (`a place in Palestine` wordt `een plaats in Palestina`).
5. **Geen Nederlandse Bijbelvertaling raadplegen of nabootsen.** Ook niet de Statenvertaling (CLAUDE.md, absolute regel 1). Gebruik gewoon, helder Nederlands op B2-niveau.
6. **Niet vertalen:** `translit`, `uitspraak` en `kjv` (de KJV-weergaven). Die blijven zoals ze zijn.
7. **Korte, nuchtere zinnen.** Houd de puntkomma's en haakjes van Strong aan, zodat de structuur herkenbaar blijft.

## Vaste termen

| Strong | Nederlands |
|---|---|
| a primitive root | een oerwortel |
| a primitive word / a primary word | een oerwoord |
| of uncertain derivation | van onzekere afleiding |
| of uncertain affinity | van onzekere verwantschap |
| of foreign derivation | van vreemde afkomst |
| of Hebrew origin | van Hebreeuwse oorsprong |
| of Chaldee origin | van Chaldeeuwse oorsprong |
| i.e. | d.w.z. |
| figuratively | figuurlijk |
| literally | letterlijk |
| specially / specifically | in het bijzonder |
| especially | vooral |
| properly | eigenlijk |
| by implication | bij implicatie |
| by extension | bij uitbreiding |
| (Aramaic) corresponding to N | (Aramees) overeenkomend met N |
| from N | van N |
| or (shortened) / or (fully) | of (verkort) / of (voluit) |
| prolonged from | verlengd van |
| a variation for | een variatie op |
| the same as | hetzelfde als |
| plural / singular | meervoud / enkelvoud |
| neuter / feminine | onzijdig / vrouwelijk |
| middle voice | mediaal (middenvorm) |
| causatively | causatief |
| by Hebraism | bij hebraïsme |
| an Israelite | een Israëliet |
| a place in Palestine | een plaats in Palestina |
| a Christian | een christen |
| (the) self-Existent or Eternal | (de) Zelfbestaande of Eeuwige |

Komt er een term voor die hier niet staat en die vaker terugkomt, voeg hem dan toe vóór je verdergaat.

## Controle na elke ronde

- Alle getallen uit de brontekst staan in de vertaling (zelfde aantal per getal).
- Alle `{…}`-groepen uit de brontekst staan er onveranderd in.
- Elke sleutel uit de bron heeft een vertaling, niet meer en niet minder.
- Uitvoer is geldig JSON.

## Uitvoer

- `data/lexicon/greek.nl.json` en `data/lexicon/hebrew.nl.json`, met dezelfde sleutels als de bron (`G1`, `H1`).
- Per sleutel: `{ "definitie": "…" }`.
- Een sleutel die al in het bestand staat, is klaar. De volgende sessie gaat verder bij de eerste sleutel die ontbreekt.
- De Engelse bestanden worden nooit aangepast.
