// GET /api/health - nicht-sensibler Status des aktuellen Deploys.
const { getStorageInfo, json, options } = require('../lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const storage = getStorageInfo();

  return json(storage.persistent ? 200 : 503, {
    ok: storage.persistent,
    release: 'blob-lazy-init-v1',
    storage: {
      type: storage.type,
      persistent: storage.persistent
    }
  });
};
