# CK Eventcenter – Website, Konfigurator und Verwaltung

Die Anwendung enthält die öffentliche CK-Eventcenter-Website, den Hochzeitskonfigurator, den Belegungskalender und die geschützten Verwaltungsbereiche.

## Wichtige Seiten

- `/buchung` – Hochzeit konfigurieren, Datum vorreservieren und anschließend Calendly öffnen
- `/belegungsplan` – Einstieg zum Hochzeitskalender
- `/verwaltung` – Preise, Regeln, Anfragen und Hochzeitstermine verwalten
- `/hauptverwaltung` – gesamte öffentliche Seite aktivieren oder deaktivieren

## Betrieb

Die strukturierten Daten werden in der über `.openai/hosting.json` angebundenen D1-Datenbank gespeichert. Netlify dient als vorgeschaltete Domain und leitet die Requests an die veröffentlichte Anwendung weiter.

Erforderliche Laufzeitvariablen:

```text
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Optional kann die Hauptverwaltung getrennte Zugangsdaten verwenden:

```text
KEYUSER_PASSWORD
KEYUSER_SESSION_SECRET
```

## Lokale Entwicklung

Voraussetzung ist Node.js ab Version 22.13.

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

Nach Änderungen an `db/schema.ts` wird eine neue Migration mit `npm run db:generate` erzeugt.
