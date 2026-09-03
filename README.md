# Pilot-owner Workorder

KISS web-app voor het vastleggen en melden van beperkt piloot-eigenaar onderhoud aan (motor)zweefvliegtuigen onder EASA Part-ML.

## Functies

- selectie van clubvliegtuig met type, fabrikant en serienummer;
- vliegtuigspecifieke pilot-owner taken uit het AMP;
- eenmalige lokale opslag van naam en SPL-nummer;
- afgeschermde vlootbeheerinstellingen;
- workordernummer, logboektekst, print/PDF en mailvoorstel.

## Clubdata aanpassen

De centrale voorbeeldconfiguratie staat in `data/club-config.json`. Elke registratie bevat een eigen lijst `tasks`. Plaats bij `ampText` de exacte taakomschrijving of taakreferentie uit het actuele AMP van dat vliegtuig.

De vlootbeheerder kan dezelfde gegevens in de app beheren en via **Exporteer JSON voor GitHub** een nieuwe `club-config.json` downloaden.

## Lokaal gebruiken

Serveer de map via een eenvoudige webserver; rechtstreeks openen als `file://` kan het laden van JSON blokkeren. Voor publicatie kopieert `npm run build` de statische bestanden naar `dist/`.

## Beveiliging

De huidige statische versie bewaart het beheerderswachtwoord als SHA-256-hash in de lokale browseropslag. Dit voorkomt normaal onbevoegd gebruik van het beheerscherm, maar is geen centrale accountbeveiliging.
