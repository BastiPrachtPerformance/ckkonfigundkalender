// POST /api/admin/pricing/reset – Admin: Preise auf Standard zurücksetzen.
const { DEFAULT_PRICING, savePricing, getStorageInfo, json, options, isAdmin, unauthorized } = require('../lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return options();
  if (!isAdmin(event)) return unauthorized();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const storage = getStorageInfo();
    if (!storage.persistent) {
      return json(503, {
        error: 'Preise koennen aktuell nicht dauerhaft gespeichert werden. Bitte Netlify Blobs im Deploy aktivieren und erneut deployen.',
        storage
      });
    }

    await savePricing(DEFAULT_PRICING);
    return json(200, DEFAULT_PRICING);
  } catch (err) {
    console.error('reset pricing error', err);
    return json(500, { error: 'Zurücksetzen fehlgeschlagen.' });
  }
};
