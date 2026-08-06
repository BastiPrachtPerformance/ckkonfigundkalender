// GET /api/admin/requests – Admin: alle Anfragen abrufen.
const { getRequests, prepareStorage, json, options, isAdmin, unauthorized } = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (!isAdmin(event)) return unauthorized();
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const requests = await getRequests();
    return json(200, requests);
  } catch (err) {
    console.error('admin requests error', err);
    return json(500, { error: 'Anfragen konnten nicht geladen werden.' });
  }
};
