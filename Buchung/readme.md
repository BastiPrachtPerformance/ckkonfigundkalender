# CK Konfigurator & Admin Panel

Neu aufgebauter Event-Konfigurator mit geschuetztem Admin Panel, Calendly-Terminbuchung, Netlify Functions und dauerhafter Speicherung ueber Netlify Blobs.

## Funktionen

- Mobil optimierter Konfigurator fuer Location, Termin, Gaeste, Catering und Extras
- Sofortige, transparente Preisschaetzung
- Konfigurierbare Mindest- und Maximalzahlen je Location und Wochentag
- Anfrageverwaltung mit Status, Detailansicht und CSV-Export
- Vollstaendige Preisverwaltung fuer Miete, Menues, Getraenke, Mitternachtsoptionen und Extras
- Calendly-Link und Kundentexte direkt im Admin pflegbar
- Direkte Calendly-Einbettung nach dem Speichern der Konfiguration, inklusive vorausgefuelltem Namen und E-Mail
- Eigener Hochzeit-Belegungskalender fuer CK Eventcenter und CKs Garden
- Import der bisher belegten und vorreservierten Termine vom alten Belegungskalender (Stand 06.08.2026)
- Kunden koennen nur freie Hochzeitstermine waehlen und sofort vorreservieren
- Admin kann Vorreservierungen vollstaendig blockieren oder Termine wieder freigeben

## Wichtig fuer Netlify

Am stabilsten ist ein Deploy ueber GitHub/GitLab/Bitbucket. Netlify fuehrt dann `npm install` aus und installiert `@netlify/blobs`. Bei reinem Drag-and-drop kann die Blob-Abhaengigkeit fehlen; dann koennen Functions Daten nicht dauerhaft speichern.

In Netlify unter **Site configuration -> Environment variables** setzen:

```text
ADMIN_PASSWORD=ein-eigenes-sicheres-passwort
```

Lokal wird das Admin-Passwort aus der nicht versionierten Datei `.env.local` geladen. Im Netlify-Livebetrieb muss derselbe Wert als geschuetzte Umgebungsvariable `ADMIN_PASSWORD` hinterlegt werden.

## Seiten

- Konfigurator: `/`
- Admin: `/admin`

Der Calendly-Link `https://calendly.com/buchungen-ckeventcenter` ist bereits hinterlegt. Calendly wird ausschliesslich fuer Beratungsgespraeche verwendet. Hochzeitstermine werden getrennt davon im eigenen Bereich **Hochzeitskalender** verwaltet.

Der Adminbereich zeigt vor dem Login nur die Loginseite. Die sensiblen Daten liegen nicht im HTML, sondern hinter den geschuetzten Admin-API-Endpunkten.

## Daten

- Preise: Netlify Blob `pricing`
- Anfragen: Netlify Blob `requests`

Lokal werden als Fallback die JSON-Dateien im Ordner `data/` verwendet. Auf Netlify wird ein nicht dauerhafter Speicher nicht mehr als Erfolg behandelt: neue Anfragen und Preisupdates melden dann klar, dass Netlify Blobs fehlt.

## Lokal starten

```bash
npm install
npx netlify dev
```

Alternativ fuer die alte Express-Entwicklung:

```bash
npm install
npm start
```

## API

- `GET /api/pricing`
- `POST /api/requests`
- `POST /api/admin/login`
- `GET /api/admin/session`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id`
- `DELETE /api/admin/requests/:id`
- `GET /api/admin/pricing`
- `PUT /api/admin/pricing`
- `POST /api/admin/pricing/reset`
