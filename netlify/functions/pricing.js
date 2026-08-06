// GET /api/pricing – öffentlich, liefert die aktuelle Preisliste.
const { getPricing, prepareStorage, json, options } = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const pricing = await getPricing();
    return json(200, pricing);
  } catch (err) {
    console.error('pricing error', err);
    return json(500, { error: 'Preise konnten nicht geladen werden.' });
  }
};
