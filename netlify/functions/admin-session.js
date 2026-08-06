const { json, options, isAdmin, unauthorized, prepareStorage, getStorageInfo, ADMIN_PASSWORD, TOKEN_TTL_MS } = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  if (!isAdmin(event)) return unauthorized();

  return json(200, {
    ok: true,
    tokenTtlHours: Math.round(TOKEN_TTL_MS / 60 / 60 / 1000),
    passwordConfigured: Boolean(ADMIN_PASSWORD),
    usesDefaultPassword: false,
    storage: getStorageInfo()
  });
};
