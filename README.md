# Pilot-owner Workorder

KISS web-app voor het vastleggen en melden van beperkt piloot-eigenaar onderhoud aan (motor)zweefvliegtuigen onder EASA Part-ML.

## Functies

- selectie van clubvliegtuig met type, fabrikant en serienummer;
- Nederlandse pilot-owner taken uit de centrale clublijst;
- verplichte selectie uit de vaste lijst piloot-eigenaren;
- eenmalige lokale opslag van de gekozen naam en het SPL-nummer;
- afgeschermde vlootbeheerinstellingen;
- workordernummer, logboektekst, print/PDF en mailvoorstel.

## Clubdata aanpassen

De centrale configuratie staat in `data/club-config.json` en bevat de vliegtuigen, de verplichte lijst piloot-eigenaren en de Nederlandse pilot-owner taken. De oorspronkelijke Engelse taaktekst is per taak als `sourceEnglish` bewaard voor controleerbaarheid.

De vlootbeheerder kan dezelfde gegevens in de app beheren en via **Exporteer JSON voor GitHub** een nieuwe `club-config.json` downloaden.

## Lokaal gebruiken

Serveer de map via een eenvoudige webserver; rechtstreeks openen als `file://` kan het laden van JSON blokkeren. Voor publicatie kopieert `npm run build` de statische bestanden naar `dist/`.

## Beveiliging

De huidige statische versie bewaart het beheerderswachtwoord als SHA-256-hash in de lokale browseropslag. Dit voorkomt normaal onbevoegd gebruik van het beheerscherm, maar is geen centrale accountbeveiliging.
