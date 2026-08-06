// PATCH/DELETE /api/admin/requests/:id – Admin: Status ändern oder Anfrage löschen.
// Wird über netlify.toml Redirect aufgerufen; die id wird in event.queryStringParameters.id übergeben.
const { getRequests, saveRequests, prepareStorage, getStorageInfo, json, options, isAdmin, unauthorized } = require('../lib/shared');

const ALLOWED_STATUS = new Set(['neu', 'kontaktiert', 'bestaetigt', 'bestätigt', 'abgelehnt']);

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (!isAdmin(event)) return unauthorized();

  const id = (event.queryStringParameters && event.queryStringParameters.id) || '';

  if (event.httpMethod === 'PATCH') {
    try {
      const storage = getStorageInfo();
      if (!storage.persistent) {
        return json(503, {
          error: 'Anfragen koennen aktuell nicht dauerhaft aktualisiert werden. Bitte Netlify Blobs im Deploy aktivieren und erneut deployen.',
          storage
        });
      }

      const body = JSON.parse(event.body || '{}');
      const status = body.status;
      if (status && !ALLOWED_STATUS.has(status)) {
        return json(400, { error: 'Ungueltiger Status.' });
      }
      const requests = await getRequests();
      const idx = requests.findIndex((r) => r.id === id);
      if (idx === -1) return json(404, { error: 'Anfrage nicht gefunden.' });
      requests[idx].status = status || requests[idx].status;
      requests[idx].updatedAt = new Date().toISOString();
      await saveRequests(requests);
      return json(200, requests[idx]);
    } catch (err) {
      console.error('update request error', err);
      return json(500, { error: 'Aktualisierung fehlgeschlagen.' });
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const storage = getStorageInfo();
      if (!storage.persistent) {
        return json(503, {
          error: 'Anfragen koennen aktuell nicht dauerhaft geloescht werden. Bitte Netlify Blobs im Deploy aktivieren und erneut deployen.',
          storage
        });
      }

      const requests = await getRequests();
      const filtered = requests.filter((r) => r.id !== id);
      if (filtered.length === requests.length) {
        return json(404, { error: 'Anfrage nicht gefunden.' });
      }
      await saveRequests(filtered);
      return json(200, { ok: true });
    } catch (err) {
      console.error('delete request error', err);
      return json(500, { error: 'Löschen fehlgeschlagen.' });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
