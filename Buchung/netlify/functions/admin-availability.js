// GET/PUT/DELETE /api/admin/availability – Hochzeitstermine verwalten.
const {
  getAvailability,
  availabilityRows,
  setWeddingDateStatus,
  releaseWeddingDate,
  prepareStorage,
  getStorageInfo,
  json,
  options,
  isAdmin,
  unauthorized
} = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (!isAdmin(event)) return unauthorized();
  try {
    if (event.httpMethod === 'GET') {
      const data = await getAvailability();
      return json(200, { updatedAt: data.updatedAt || data.importedAt, dates: availabilityRows(data, true) });
    }
    if (!getStorageInfo().persistent) return json(503, { error: 'Der Kalender kann aktuell nicht dauerhaft gespeichert werden.' });
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const entry = await setWeddingDateStatus(body);
      return json(200, entry);
    }
    if (event.httpMethod === 'DELETE') {
      const query = event.queryStringParameters || {};
      await releaseWeddingDate(String(query.location || ''), String(query.date || ''));
      return json(200, { ok: true });
    }
    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('admin availability error', error);
    return json(400, { error: error.message || 'Kalenderänderung fehlgeschlagen.' });
  }
};
