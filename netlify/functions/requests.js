// POST /api/requests – öffentlich, neue Anfrage speichern.
const { getRequests, saveRequests, reserveWeddingDate, releaseWeddingDate, prepareStorage, getStorageInfo, json, options } = require('../lib/shared');

exports.handler = async (event) => {
  prepareStorage(event);
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const storage = getStorageInfo();
    if (!storage.persistent) {
      return json(503, {
        error: 'Anfragen koennen aktuell nicht dauerhaft gespeichert werden. Bitte Netlify Blobs im Deploy aktivieren und erneut deployen.',
        storage
      });
    }

    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, date, message, config, configCode, total } = body;

    if (!name || !email) {
      return json(400, { error: 'Name und E-Mail sind erforderlich.' });
    }

    const requests = await getRequests();
    const id =
      (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() :
      'req-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);

    const newRequest = {
      id,
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      phone: String(phone || '').slice(0, 100),
      date: String(date || '').slice(0, 50),
      message: String(message || '').slice(0, 2000),
      config: config || null,
      configCode: configCode || null,
      total: Number(total) || 0,
      status: 'neu',
      createdAt: new Date().toISOString()
    };

    let reservation = null;
    if (date && config && config.hall) {
      try {
        reservation = await reserveWeddingDate({
          location: config.hall,
          date,
          requestId: id,
          name,
          email,
          phone,
          note: message,
          source: 'customer'
        });
        newRequest.reservationId = reservation.id;
        newRequest.reservationStatus = 'reserved';
      } catch (error) {
        if (error.code === 'DATE_UNAVAILABLE') return json(409, { error: error.message, code: error.code });
        throw error;
      }
    }

    try {
      requests.unshift(newRequest);
      await saveRequests(requests);
    } catch (error) {
      if (reservation) await releaseWeddingDate(reservation.location, reservation.date);
      throw error;
    }
    return json(201, { ok: true, id: newRequest.id, reservation: reservation ? { date: reservation.date, status: reservation.status } : null });
  } catch (err) {
    console.error('create request error', err);
    return json(500, { error: 'Anfrage konnte nicht gespeichert werden: ' + (err && err.message ? err.message : String(err)) });
  }
};
