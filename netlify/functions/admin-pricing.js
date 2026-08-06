// GET/PUT /api/admin/pricing – Admin: Preise abrufen oder vollständig ersetzen.
const { getPricing, savePricing, prepareStorage, getStorageInfo, json, options, isAdmin, unauthorized } = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();

  if (!isAdmin(event)) return unauthorized();

  if (event.httpMethod === 'GET') {
    try {
      const pricing = await getPricing();
      return json(200, pricing);
    } catch (err) {
      console.error('get pricing error', err);
      return json(500, { error: 'Preise konnten nicht geladen werden.' });
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const storage = getStorageInfo();
      if (!storage.persistent) {
        return json(503, {
          error: 'Preise koennen aktuell nicht dauerhaft gespeichert werden. Bitte Netlify Blobs im Deploy aktivieren und erneut deployen.',
          storage
        });
      }

      const incoming = JSON.parse(event.body || 'null');
      if (!incoming || typeof incoming !== 'object') {
        return json(400, { error: 'Ungültige Preisdaten.' });
      }
      await savePricing(incoming);
      return json(200, incoming);
    } catch (err) {
      console.error('save pricing error', err);
      return json(500, { error: 'Speichern fehlgeschlagen.' });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
