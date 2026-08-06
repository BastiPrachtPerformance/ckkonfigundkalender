const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const LEGACY_AVAILABILITY = require('./netlify/lib/legacy-availability');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin-Passwort (in Produktion über Umgebungsvariable setzbar)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname, {
  index: 'index.html',
  extensions: ['html']
}));

// ── Data files (JSON storage) ────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const PRICING_FILE = path.join(DATA_DIR, 'pricing.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const AVAILABILITY_FILE = path.join(DATA_DIR, 'availability.json');

// ── Default pricing (pro Location unterschiedlich) ───────────
const DEFAULT_PRICING = {
  version: 3,
  settings: {
    calendlyUrl: 'https://calendly.com/buchungen-ckeventcenter',
    bookingTitle: 'Jetzt Beratungsgespräch buchen',
    bookingText: 'Wählen Sie einen passenden Termin. Ihre Kontaktdaten werden automatisch an Calendly übergeben.',
    priceDisclaimer: 'Unverbindliche Schätzung. Das finale Angebot erhalten Sie im Beratungsgespräch.'
  },
  halls: {
    event: { name: 'CK Eventcenter', perks: 'Großer Saal, Bühne, LED Wall, Grundlicht', image: 'ckeventcenter.avif' },
    garden: { name: 'CKs Garden', perks: 'Garden Hall, viel Tageslicht, Terrasse', image: 'ckgarden2.avif' }
  },
  locations: {
    event: {
      rules: { minGuests: 1, maxGuests: 1000, minGuestsByDay: { saturday: 600 } },
      baseByDay: { friday: 2000, saturday: 5000, sunday: 2500, weekday: 0 },
      menu: {
        standard: { label: 'Standardpaket (5 Menüs, Getränke, Deko inkl.)', perGuest: 12, note: 'Dekoration, Geschirr, Knabberzeug, 5 Hauptspeisen, Getränkeflat, Brot, Personal' }
      },
      drinks: {
        included: { label: 'Getränkeflat inklusive', perGuest: 0 }
      },
      midnight: {
        none: { label: 'Keine Abendsuppe', price: 0 },
        soup: { label: 'Abendsuppe (pauschal)', price: 200 }
      },
      extras: {
        starter_person: { label: 'Vorspeise pro Person', perGuest: 3 },
        starter_platter: { label: 'Vorspeise Mitte / Platte', perGuest: 1 },
        buffet_upgrade: { label: 'Tischbuffet Hauptspeise Upgrade', perGuest: 5 },
        cake: { label: 'Torte', price: 200 },
        dessert: { label: 'Nachspeise (Baklava)', perGuest: 1 },
        photo_video: { label: 'Fotograf (150 Saalfotos) & Videograf', price: 750 },
        sparkles: { label: 'Fontänen & Bodennebel', price: 200 },
        fruit_center: { label: 'Obst Mitte', perGuest: 1 },
        candy_buffet: { label: 'Obst & Candy Buffet', perGuest: 4 },
        welcome_sign: { label: 'Willkommensschild', price: 200 },
        photobox: { label: 'Fotobox', price: 350, note: '200–500 € pauschal' }
      }
    },
    garden: {
      rules: { minGuests: 1, maxGuests: 300, minGuestsByDay: {} },
      baseByDay: { friday: 1500, saturday: 3500, sunday: 2000, weekday: 0 },
      menu: {
        standard: { label: 'Standardpaket (5 Menüs, Getränke, Deko inkl.)', perGuest: 10, note: 'Dekoration, Geschirr, Knabberzeug, 5 Hauptspeisen, Getränkeflat, Brot, Personal' }
      },
      drinks: {
        included: { label: 'Getränkeflat inklusive', perGuest: 0 }
      },
      midnight: {
        none: { label: 'Keine Abendsuppe', price: 0 },
        soup: { label: 'Abendsuppe (pauschal)', price: 150 }
      },
      extras: {
        starter_person: { label: 'Vorspeise pro Person', perGuest: 3 },
        starter_platter: { label: 'Vorspeise Mitte / Platte', perGuest: 1 },
        buffet_upgrade: { label: 'Tischbuffet Hauptspeise Upgrade', perGuest: 5 },
        cake: { label: 'Torte', price: 200 },
        dessert: { label: 'Nachspeise (Baklava)', perGuest: 1 },
        photo_video: { label: 'Fotograf (150 Saalfotos) & Videograf', price: 750 },
        sparkles: { label: 'Fontänen & Bodennebel', price: 200 },
        fruit_center: { label: 'Obst Mitte', perGuest: 1 },
        candy_buffet: { label: 'Obst & Candy Buffet', perGuest: 4 },
        welcome_sign: { label: 'Willkommensschild', price: 200 },
        photobox: { label: 'Fotobox', price: 350, note: '200–500 € pauschal' }
      }
    }
  }
};

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error('Error reading', file, err);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize / migrate data files
function loadPricing() {
  const data = readJson(PRICING_FILE, null);
  if (!data || !data.halls || !data.locations) {
    writeJson(PRICING_FILE, DEFAULT_PRICING);
    return DEFAULT_PRICING;
  }
  data.version = 3;
  data.settings = { ...DEFAULT_PRICING.settings, ...(data.settings || {}) };
  if (!data.settings.calendlyUrl) data.settings.calendlyUrl = DEFAULT_PRICING.settings.calendlyUrl;
  Object.keys(data.locations).forEach((key) => {
    const fallback = DEFAULT_PRICING.locations[key] && DEFAULT_PRICING.locations[key].rules;
    data.locations[key].rules = { ...(fallback || { minGuests: 1, maxGuests: 1000, minGuestsByDay: {} }), ...(data.locations[key].rules || {}) };
  });
  return data;
}

if (!fs.existsSync(REQUESTS_FILE)) writeJson(REQUESTS_FILE, []);

function loadAvailability() {
  return readJson(AVAILABILITY_FILE, JSON.parse(JSON.stringify(LEGACY_AVAILABILITY)));
}

function saveAvailability(data) {
  data.updatedAt = new Date().toISOString();
  writeJson(AVAILABILITY_FILE, data);
}

function availabilityRows(data, includePrivate = false) {
  const rows = [];
  Object.entries(data.locations || {}).forEach(([location, groups]) => {
    ['blocked', 'reserved'].forEach(status => (groups[status] || []).forEach(date => rows.push({ id: `legacy-${location}-${date}`, location, date, status, source: 'legacy' })));
  });
  (data.reservations || []).forEach(entry => {
    const row = { ...entry, source: entry.source || 'customer' };
    if (!includePrivate) ['name', 'email', 'phone', 'note', 'requestId'].forEach(key => delete row[key]);
    rows.push(row);
  });
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function setLocalWeddingDate(location, date, status, details = {}) {
  if (!['event', 'garden'].includes(location) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Ungültiges Hochzeitsdatum.');
  const data = loadAvailability();
  const existing = availabilityRows(data, true).find(row => row.location === location && row.date === date);
  if (status === 'reserved' && details.customer && existing) return null;
  const groups = data.locations[location] || (data.locations[location] = { blocked: [], reserved: [] });
  groups.blocked = (groups.blocked || []).filter(value => value !== date);
  groups.reserved = (groups.reserved || []).filter(value => value !== date);
  let dynamic = (data.reservations || []).find(row => row.location === location && row.date === date);
  if (dynamic) Object.assign(dynamic, details, { status, updatedAt: new Date().toISOString() });
  else if (details.customer) {
    dynamic = { id: crypto.randomUUID(), location, date, status, source: 'customer', ...details, createdAt: new Date().toISOString() };
    delete dynamic.customer;
    data.reservations = data.reservations || [];
    data.reservations.push(dynamic);
  } else groups[status].push(date);
  saveAvailability(data);
  return dynamic || { location, date, status, source: 'legacy' };
}

function releaseLocalWeddingDate(location, date) {
  const data = loadAvailability(), groups = data.locations[location];
  if (groups) {
    groups.blocked = (groups.blocked || []).filter(value => value !== date);
    groups.reserved = (groups.reserved || []).filter(value => value !== date);
  }
  data.reservations = (data.reservations || []).filter(row => !(row.location === location && row.date === date));
  saveAvailability(data);
}

// ── Auth helpers ──────────────────────────────────────────────
function makeToken() {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update('ck-admin-session').digest('hex');
}

function isAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token && token === makeToken();
}

function adminGuard(req, res, next) {
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Nicht autorisiert. Bitte am Admin einloggen.' });
  }
  next();
}

// ── Public API: Pricing ─────────────────────────────────────
app.get('/api/pricing', (req, res) => {
  res.json(loadPricing());
});

app.get('/api/availability', (req, res) => {
  const data = loadAvailability();
  res.json({ updatedAt: data.updatedAt || data.importedAt, dates: availabilityRows(data, false) });
});

// ── Public API: Submit request ──────────────────────────────
app.post('/api/requests', (req, res) => {
  const { name, email, phone, date, message, config, configCode, total } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name und E-Mail sind erforderlich.' });
  }

  const requests = readJson(REQUESTS_FILE, []);
  const newRequest = {
    id: crypto.randomUUID(),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    phone: String(phone || '').slice(0, 100),
    date: String(date || '').slice(0, 50),
    message: String(message || '').slice(0, 2000),
    config: config || null,
    configCode: configCode || null,
    total: Number(total) || 0,
    status: 'neu',
    createdAt: new Date().toISOString()
  };

  if (date && config && config.hall) {
    const reservation = setLocalWeddingDate(String(config.hall), String(date), 'reserved', {
      customer: true,
      requestId: newRequest.id,
      name: newRequest.name,
      email: newRequest.email,
      phone: newRequest.phone,
      note: newRequest.message
    });
    if (!reservation) return res.status(409).json({ error: 'Dieser Hochzeitstermin ist bereits belegt oder vorreserviert.', code: 'DATE_UNAVAILABLE' });
    newRequest.reservationId = reservation.id;
    newRequest.reservationStatus = 'reserved';
  }

  requests.unshift(newRequest);
  writeJson(REQUESTS_FILE, requests);
  res.status(201).json({ ok: true, id: newRequest.id, reservation: newRequest.reservationId ? { date: newRequest.date, status: 'reserved' } : null });
});

// ════════════════════════════════════════════════════════════
// ADMIN API (passwortgeschützt)
// ════════════════════════════════════════════════════════════

// Admin-Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Das Admin-Passwort ist noch nicht konfiguriert.' });
  }
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }
  res.json({ token: makeToken() });
});

// Admin: aktive Sitzung und lokaler Speicherstatus
app.get('/api/admin/session', adminGuard, (req, res) => {
  res.json({
    ok: true,
    tokenTtlHours: null,
    passwordConfigured: Boolean(ADMIN_PASSWORD),
    usesDefaultPassword: false,
    storage: { persistent: true, type: 'local-json' }
  });
});

// Admin: get all requests
app.get('/api/admin/requests', adminGuard, (req, res) => {
  const requests = readJson(REQUESTS_FILE, []);
  res.json(requests);
});

// Admin: update request status
app.patch('/api/admin/requests/:id', adminGuard, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const requests = readJson(REQUESTS_FILE, []);
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Anfrage nicht gefunden.' });
  requests[idx].status = status || requests[idx].status;
  requests[idx].updatedAt = new Date().toISOString();
  writeJson(REQUESTS_FILE, requests);
  res.json(requests[idx]);
});

// Admin: delete request
app.delete('/api/admin/requests/:id', adminGuard, (req, res) => {
  const { id } = req.params;
  const requests = readJson(REQUESTS_FILE, []);
  const filtered = requests.filter(r => r.id !== id);
  if (filtered.length === requests.length) {
    return res.status(404).json({ error: 'Anfrage nicht gefunden.' });
  }
  writeJson(REQUESTS_FILE, filtered);
  res.json({ ok: true });
});

// Admin: get pricing
app.get('/api/admin/pricing', adminGuard, (req, res) => {
  res.json(loadPricing());
});

// Admin: update pricing (full replace)
app.put('/api/admin/pricing', adminGuard, (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Ungültige Preisdaten.' });
  }
  incoming.version = 3;
  writeJson(PRICING_FILE, incoming);
  res.json(incoming);
});

// Admin: reset pricing to defaults
app.post('/api/admin/pricing/reset', adminGuard, (req, res) => {
  writeJson(PRICING_FILE, DEFAULT_PRICING);
  res.json(DEFAULT_PRICING);
});

// Serve admin.html for /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`\n  CK Konfigurator Server läuft auf http://localhost:${PORT}`);
  console.log(`  Admin-Bereich:           http://localhost:${PORT}/admin`);
  console.log(`  Admin-Passwort:          ${ADMIN_PASSWORD ? 'konfiguriert' : 'FEHLT'}\n`);
});

app.get('/api/admin/availability', adminGuard, (req, res) => {
  const data = loadAvailability();
  res.json({ updatedAt: data.updatedAt || data.importedAt, dates: availabilityRows(data, true) });
});

app.put('/api/admin/availability', adminGuard, (req, res) => {
  try {
    const { location, date, status, note } = req.body || {};
    if (!['reserved', 'blocked'].includes(status)) return res.status(400).json({ error: 'Ungültiger Status.' });
    res.json(setLocalWeddingDate(String(location), String(date), status, { note: String(note || '').slice(0, 1000) }));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/availability', adminGuard, (req, res) => {
  releaseLocalWeddingDate(String(req.query.location || ''), String(req.query.date || ''));
  res.json({ ok: true });
});
