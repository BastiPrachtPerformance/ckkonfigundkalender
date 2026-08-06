// POST /api/admin/login – Admin-Login, liefert Token bei korrektem Passwort.
const { json, options, makeToken, ADMIN_PASSWORD, getStorageInfo, TOKEN_TTL_MS } = require('../lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { password } = JSON.parse(event.body || '{}');
    if (!ADMIN_PASSWORD) {
      return json(503, { error: 'Das Admin-Passwort ist noch nicht konfiguriert.' });
    }
    if (!password || password !== ADMIN_PASSWORD) {
      return json(401, { error: 'Falsches Passwort.' });
    }
    return json(200, {
      token: makeToken(),
      tokenTtlHours: Math.round(TOKEN_TTL_MS / 60 / 60 / 1000),
      passwordConfigured: true,
      usesDefaultPassword: false,
      storage: getStorageInfo()
    });
  } catch (err) {
    console.error('login error', err);
    return json(500, { error: 'Login fehlgeschlagen.' });
  }
};
