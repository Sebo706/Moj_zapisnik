# Môj zápisník

Jednoduchá osobná webová aplikácia na úlohy, poznámky, nákupy a nápady. Táto prvá verzia používa iba vymyslené skúšobné údaje. Neobsahuje prihlasovanie, externú databázu, platené API ani pripojenie k e-mailu alebo inej službe.

## Spustenie

1. Dvakrát kliknite na `Spustit.cmd`.
2. Nechajte otvorené okno spúšťača.
3. V prehliadači otvorte http://localhost:4174.
4. Server zastavíte pomocou Ctrl+C v jeho okne.

Spúšťač použije bezplatný Node.js dostupný v prostredí Codex. Neinštaluje žiadne balíky. Osobný a výrobný zápisník môžu bežať súčasne: výrobný používa port 4173, osobný port 4174.

## Čo aplikácia obsahuje

- Dnešný prehľad s prioritnými a otvorenými úlohami.
- Rýchle pridanie hlasom, fotografiou alebo písaním.
- Typy Úloha, Poznámka, Nákup a Nápad.
- Kategórie Osobné, Rodina, Domácnosť, Práca, Nákupy, Zdravie, Financie a Cestovanie.
- Lokálne pravidlá, ktoré z textu navrhnú typ, kategóriu, prioritu, miesto a termín.
- Vyhľadávanie, filtre, úpravu, označenie Hotovo a opätovné otvorenie.
- Samostatnú obrazovku Nápady.
- Jednotlivé aj hromadné zdieľanie textu; fotografia sa pridá, ak to zariadenie podporuje.
- Ikonu MZ pripravenú pre pridanie na plochu telefónu.

## Praktický test

1. Na obrazovke Dnes rozbaľte ďalšie položky a jednu označte ako Hotovo.
2. Otvorte Nový a zadajte: „Dôležité: zajtra ráno zavolať zubárovi.“
3. Skontrolujte návrh: Úloha, Zdravie, Vysoká, Lekár, zajtrajší dátum a 08:00.
4. Cez Upraviť údaje zmeňte kategóriu alebo termín a záznam uložte.
5. Vytvorte „Kúpiť mlieko dnes cestou domov.“ Aplikácia navrhne Nákup, Nákupy a Obchod.
6. Vytvorte „Nápad: cez víkend naplánovať rodinný výlet.“ Položka sa uloží medzi Nápady.
7. Pridajte necitlivú skúšobnú fotografiu, obnovte stránku a fotografiu znova otvorte.
8. Vo Všetkých záznamoch vyskúšajte filtre, hľadanie, jednotlivé zdieľanie a Vybrať všetky.

## Ukladanie a obmedzenia

Záznamy a zmenšené fotografie sa ukladajú bezplatne do IndexedDB v danom prehliadači. Osobný zápisník používa vlastné úložisko `moj-zapisnik`, takže sa nemieša s výrobnou aplikáciou. Obnovenie stránky údaje nezmaže. Vymazanie údajov webu, súkromné prehliadanie alebo nedostatok miesta ich však môže odstrániť; záloha a synchronizácia zatiaľ nie sú súčasťou aplikácie.

Hlas skúša iba miestne rozpoznávanie slovenčiny dostupné v zariadení. Ak ho prehliadač nepodporuje, zostáva písanie. Aplikácia nič nesťahuje a nezapína serverové rozpoznávanie.

Automatické zaradenie používa jednoduché slovenské kľúčové slová. Rozumie výrazom dnes, zajtra, pozajtra, dňom týždňa, platným dátumom, času, slovám ráno a večer. Návrh sa dá vždy ručne opraviť.

Zdieľanie otvorí systémovú ponuku zariadenia, kde používateľ sám vyberie e-mail alebo chat. Ak ponuka nie je dostupná, text sa skopíruje. Aplikácia sama nič neposiela ani sa nepripája k účtom.

## Súbory

- `index.html` – základ aplikácie a navigácia.
- `css/styles.css` – mobilný a počítačový vzhľad.
- `js/app.js` – obrazovky, záznamy, fotografie, hlas a zdieľanie.
- `js/recognition.js` – osobné pravidlá rozpoznávania.
- `js/storage.js` – samostatné lokálne úložisko.
- `js/demo-data.js` – vymyslené príklady.
- `js/icons.js` – lokálne ovládacie ikony.
- `assets/icons/` a `manifest.webmanifest` – ikona MZ a nastavenie pridania na plochu.
- `server.cjs` a `Spustit.cmd` – lokálne spustenie.
- `tests/verify.cjs` – automatická kontrola hlavných funkcií.
