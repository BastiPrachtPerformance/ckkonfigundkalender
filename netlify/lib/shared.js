const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const LEGACY_AVAILABILITY = require('./legacy-availability');

let blobsStore = null;
let blobLoadError = null;
let blobsInitialized = false;

// Netlify stellt den Blobs-Kontext erst beim Aufruf einer Function bereit.
// Deshalb darf getStore() nicht schon beim Laden dieses Moduls ausgefuehrt
// werden, sondern erst innerhalb der eigentlichen Anfrage.
function initializeBlobs() {
  if (blobsInitialized) return blobsStore;
  blobsInitialized = true;

  try {
    const { getStore } = require('@netlify/blobs');
    blobsStore = getStore('ck-konfigurator');
  } catch (error) {
    blobLoadError = error;
    console.warn('@netlify/blobs ist nicht verfuegbar.', error.message);
  }

  return blobsStore;
}

function prepareStorage(event) {
  if (event && event.blobs) {
    try {
      const { connectLambda } = require('@netlify/blobs');
      connectLambda(event);
      blobsInitialized = false;
      blobsStore = null;
      blobLoadError = null;
    } catch (error) {
      blobLoadError = error;
      console.warn('Netlify Blobs Lambda-Kontext konnte nicht geladen werden.', error.message);
    }
  }

  initializeBlobs();
}

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const FILES = {
  pricing: path.join(DATA_DIR, 'pricing.json'),
  requests: path.join(DATA_DIR, 'requests.json'),
  availability: path.join(DATA_DIR, 'availability.json')
};

const memoryData = {};
const memoryStore = {
  async get(key) {
    return memoryData[key] || null;
  },
  async set(key, value) {
    memoryData[key] = value;
  }
};

const fileStore = {
  async get(key) {
    const file = FILES[key];
    if (!file || !fs.existsSync(file)) return null;
    return fs.readFileSync(file, 'utf8');
  },
  async set(key, value) {
    const file = FILES[key];
    if (!file) return;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(file, value, 'utf8');
  }
};

function isNetlifyRuntime() {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function getStorageInfo() {
  initializeBlobs();

  if (blobsStore) {
    return {
      type: 'netlify-blobs',
      persistent: true,
      message: 'Netlify Blobs ist aktiv. Anfragen und Preise werden dauerhaft gespeichert.'
    };
  }

  if (!isNetlifyRuntime()) {
    return {
      type: 'local-files',
      persistent: true,
      message: 'Lokale JSON-Dateien sind aktiv. Das ist gut fuer Entwicklung und Tests.'
    };
  }

  return {
    type: 'memory',
    persistent: false,
    message: '@netlify/blobs ist im Deploy nicht verfuegbar. Netlify Functions koennen Daten dann nicht dauerhaft speichern.',
    error: blobLoadError ? blobLoadError.message : ''
  };
}

function store() {
  initializeBlobs();

  if (blobsStore) return blobsStore;
  if (!isNetlifyRuntime()) return fileStore;
  return memoryStore;
}

const PRICING_KEY = 'pricing';
const REQUESTS_KEY = 'requests';
const AVAILABILITY_KEY = 'availability';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

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
        photobox: { label: 'Fotobox', price: 350, note: '200-500 € pauschal' }
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
        photobox: { label: 'Fotobox', price: 350, note: '200-500 € pauschal' }
      }
    }
  }
};

function parseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function getPricing() {
  const data = parseJson(await store().get(PRICING_KEY), DEFAULT_PRICING);
  if (!data || !data.halls || !data.locations) return DEFAULT_PRICING;
  const migrated = {
    ...data,
    version: 3,
    settings: { ...DEFAULT_PRICING.settings, ...(data.settings || {}) },
    halls: { ...data.halls },
    locations: { ...data.locations }
  };
  if (!migrated.settings.calendlyUrl) {
    migrated.settings.calendlyUrl = DEFAULT_PRICING.settings.calendlyUrl;
  }
  Object.keys(migrated.locations).forEach((key) => {
    const fallbackRules = DEFAULT_PRICING.locations[key] && DEFAULT_PRICING.locations[key].rules;
    migrated.locations[key] = {
      ...migrated.locations[key],
      rules: { ...(fallbackRules || { minGuests: 1, maxGuests: 1000, minGuestsByDay: {} }), ...(migrated.locations[key].rules || {}) }
    };
  });
  return migrated;
}

async function savePricing(data) {
  data.version = 3;
  await store().set(PRICING_KEY, JSON.stringify(data));
}

async function getRequests() {
  const data = parseJson(await store().get(REQUESTS_KEY), []);
  return Array.isArray(data) ? data : [];
}

async function saveRequests(data) {
  await store().set(REQUESTS_KEY, JSON.stringify(data));
}

function cloneAvailability(data) {
  return JSON.parse(JSON.stringify(data));
}

async function getAvailability() {
  const stored = parseJson(await store().get(AVAILABILITY_KEY), null);
  if (!stored || !stored.locations) return cloneAvailability(LEGACY_AVAILABILITY);
  stored.reservations = Array.isArray(stored.reservations) ? stored.reservations : [];
  return stored;
}

async function saveAvailability(data) {
  data.version = 1;
  data.updatedAt = new Date().toISOString();
  await store().set(AVAILABILITY_KEY, JSON.stringify(data));
}

function availabilityRows(data, includePrivate = false) {
  const rows = [];
  Object.entries(data.locations || {}).forEach(([location, groups]) => {
    ['blocked', 'reserved'].forEach((status) => {
      (groups[status] || []).forEach((date) => rows.push({
        id: `legacy-${location}-${date}`,
        location,
        date,
        status,
        source: 'legacy'
      }));
    });
  });
  (data.reservations || []).forEach((entry) => {
    const row = { ...entry, source: entry.source || 'customer' };
    if (!includePrivate) {
      delete row.name;
      delete row.email;
      delete row.phone;
      delete row.note;
      delete row.requestId;
    }
    rows.push(row);
  });
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function validWeddingDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

async function reserveWeddingDate(input) {
  const location = String(input.location || '');
  const date = String(input.date || '');
  if (!['event', 'garden'].includes(location) || !validWeddingDate(date)) {
    const error = new Error('Ungültige Location oder ungültiges Hochzeitsdatum.');
    error.code = 'INVALID_DATE';
    throw error;
  }
  const data = await getAvailability();
  const occupied = availabilityRows(data, true).find((row) => row.location === location && row.date === date);
  if (occupied) {
    const error = new Error('Dieser Hochzeitstermin ist bereits belegt oder vorreserviert.');
    error.code = 'DATE_UNAVAILABLE';
    throw error;
  }
  const reservation = {
    id: crypto.randomUUID(),
    location,
    date,
    status: 'reserved',
    source: input.source || 'customer',
    requestId: input.requestId || '',
    name: String(input.name || '').slice(0, 200),
    email: String(input.email || '').slice(0, 200),
    phone: String(input.phone || '').slice(0, 100),
    note: String(input.note || '').slice(0, 1000),
    createdAt: new Date().toISOString()
  };
  data.reservations.push(reservation);
  await saveAvailability(data);
  return reservation;
}

async function setWeddingDateStatus(input) {
  const location = String(input.location || '');
  const date = String(input.date || '');
  const status = String(input.status || '');
  if (!['event', 'garden'].includes(location) || !validWeddingDate(date) || !['reserved', 'blocked'].includes(status)) {
    throw new Error('Ungültige Kalenderdaten.');
  }
  const data = await getAvailability();
  const groups = data.locations[location] || (data.locations[location] = { blocked: [], reserved: [] });
  groups.blocked = (groups.blocked || []).filter((value) => value !== date);
  groups.reserved = (groups.reserved || []).filter((value) => value !== date);
  const dynamic = (data.reservations || []).find((row) => row.location === location && row.date === date);
  if (dynamic) {
    dynamic.status = status;
    dynamic.updatedAt = new Date().toISOString();
    if (input.note !== undefined) dynamic.note = String(input.note || '').slice(0, 1000);
  } else {
    groups[status].push(date);
  }
  await saveAvailability(data);
  return availabilityRows(data, true).find((row) => row.location === location && row.date === date);
}

async function releaseWeddingDate(location, date) {
  const data = await getAvailability();
  const groups = data.locations[location];
  if (groups) {
    groups.blocked = (groups.blocked || []).filter((value) => value !== date);
    groups.reserved = (groups.reserved || []).filter((value) => value !== date);
  }
  data.reservations = (data.reservations || []).filter((row) => !(row.location === location && row.date === date));
  await saveAvailability(data);
}

function sign(value) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update(value).digest('hex');
}

function makeToken() {
  const issuedAt = Date.now();
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const received = parts[2] || '';
  if (received.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return false;

  const issuedAt = Number(parts[0]);
  return Number.isFinite(issuedAt) && Date.now() - issuedAt <= TOKEN_TTL_MS;
}

function isAdmin(event) {
  const headers = event.headers || {};
  const auth = headers.authorization || headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyToken(token);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function options() {
  return { statusCode: 204, headers: json(200, {}).headers, body: '' };
}

function unauthorized() {
  return json(401, { error: 'Nicht autorisiert. Bitte erneut am Admin einloggen.' });
}

module.exports = {
  DEFAULT_PRICING,
  getPricing,
  savePricing,
  getRequests,
  saveRequests,
  getAvailability,
  saveAvailability,
  availabilityRows,
  reserveWeddingDate,
  setWeddingDateStatus,
  releaseWeddingDate,
  prepareStorage,
  getStorageInfo,
  json,
  options,
  isAdmin,
  makeToken,
  ADMIN_PASSWORD,
  TOKEN_TTL_MS,
  unauthorized
};
