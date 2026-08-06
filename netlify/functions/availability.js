// GET /api/availability – öffentliche Hochzeitsbelegung ohne Kontaktdaten.
const { getAvailability, availabilityRows, json, options } = require('../lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const data = await getAvailability();
    return json(200, { updatedAt: data.updatedAt || data.importedAt, dates: availabilityRows(data, false) });
  } catch (error) {
    console.error('availability error', error);
    return json(500, { error: 'Der Hochzeitskalender konnte nicht geladen werden.' });
  }
};
