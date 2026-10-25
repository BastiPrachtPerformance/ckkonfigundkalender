# CK Eventcenter – Website, Belegungskalender und Verwaltung

Die Anwendung enthält die öffentliche CK-Eventcenter-Website, den Hochzeits-Belegungskalender, die Calendly-Beratung und die geschützten Verwaltungsbereiche.

## Wichtige Seiten

- `/buchung` – persönliches Beratungsgespräch direkt über Calendly buchen
- `/belegungsplan` – Einstieg zum Hochzeitskalender
- `/verwaltung` – Hochzeitstermine, Kundendaten und interne Notizen verwalten
- `/hauptverwaltung` – gesamte öffentliche Seite aktivieren oder deaktivieren

## Betrieb

Die strukturierten Daten werden in der über `.openai/hosting.json` angebundenen D1-Datenbank gespeichert. Netlify liefert die Admin-Kalenderoberfläche unter `/verwaltung`, `/verwaltung/` und `/verwaltung.html` direkt aus diesem Repository aus. Beim Build kopiert `build/prepare-netlify.mjs` dafür `public/verwaltung.html` in das Netlify-Veröffentlichungsverzeichnis.

Alle übrigen Seiten und die bestehenden `/api/`-Endpunkte werden weiterhin an die veröffentlichte Anwendung weitergeleitet. Die Datenbank, Zugangsdaten und gespeicherten Termine werden durch einen Deploy der Admin-Oberfläche nicht ersetzt oder migriert. Die gezielten Admin-Regeln müssen in `netlify.toml` vor der allgemeinen Proxy-Regel stehen.

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
