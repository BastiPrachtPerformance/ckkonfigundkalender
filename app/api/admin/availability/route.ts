import availabilitySource from "../../../../data/booking/availability.json";
import { ensureBookingTables, isAdminRequest, unauthorized } from "../../../../db/booking";

type HallKey = "event" | "garden";
type DateRow = { hall: HallKey; date: string; status: string; requestId?: string; source?: string; createdAt?: string; note?: string; name?: string; email?: string; phone?: string };
const legacy = availabilitySource as unknown as { locations: Record<HallKey, { blocked: string[]; reserved: string[] }> };

function validInput(body: Record<string, unknown>) {
  return ["event", "garden"].includes(String(body.location)) && /^\d{4}-\d{2}-\d{2}$/.test(String(body.date)) && ["reserved", "blocked"].includes(String(body.status));
}

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const database = await ensureBookingTables();
  const dynamic = await database.prepare(`SELECT d.hall, d.event_date AS date, d.status, d.request_id AS requestId,
    d.source, d.created_at AS createdAt, n.note, r.name, r.email, r.phone
    FROM booking_dates d
    LEFT JOIN booking_date_notes n ON n.hall = d.hall AND n.event_date = d.event_date
    LEFT JOIN booking_requests r ON r.id = d.request_id
    ORDER BY d.event_date`).all<DateRow>();
  const overrides = new Map((dynamic.results ?? []).map((row) => [`${row.hall}:${row.date}`, row]));
  const imported = (Object.keys(legacy.locations) as HallKey[]).flatMap((hall) => {
    const values = legacy.locations[hall];
    return [
      ...values.blocked.filter((date) => !overrides.has(`${hall}:${date}`)).map((date) => ({ id: `legacy-${hall}-${date}`, location: hall, date, status: "blocked", source: "legacy" })),
      ...values.reserved.filter((date) => !overrides.has(`${hall}:${date}`)).map((date) => ({ id: `legacy-${hall}-${date}`, location: hall, date, status: "reserved", source: "legacy" })),
    ];
  });
  const current = (dynamic.results ?? []).filter((row) => row.status !== "released").map((row) => ({ ...row, id: `${row.hall}-${row.date}`, location: row.hall }));
  return Response.json({ dates: [...imported, ...current].sort((a, b) => a.date.localeCompare(b.date)) });
}

export async function PUT(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const body = await request.json() as Record<string, unknown>;
  if (!validInput(body)) return Response.json({ error: "Saal, Datum oder Status sind ungültig." }, { status: 400 });
  const hall = String(body.location); const date = String(body.date); const status = String(body.status);
  const requestId = String(body.requestId ?? `admin-${hall}-${date}`).slice(0, 200);
  const source = String(body.source ?? "admin").slice(0, 50);
  const note = String(body.note ?? "").slice(0, 1500);
  const database = await ensureBookingTables();
  await database.batch([
    database.prepare("INSERT INTO booking_dates (hall, event_date, status, request_id, source) VALUES (?, ?, ?, ?, ?) ON CONFLICT(hall, event_date) DO UPDATE SET status = excluded.status, request_id = excluded.request_id, source = excluded.source").bind(hall, date, status, requestId, source),
    database.prepare("INSERT INTO booking_date_notes (hall, event_date, note, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(hall, event_date) DO UPDATE SET note = excluded.note, updated_at = CURRENT_TIMESTAMP").bind(hall, date, note),
  ]);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const url = new URL(request.url); const hall = url.searchParams.get("location") ?? ""; const date = url.searchParams.get("date") ?? "";
  if (!["event", "garden"].includes(hall) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Ungültiger Termin." }, { status: 400 });
  const database = await ensureBookingTables();
  await database.batch([
    database.prepare("INSERT INTO booking_dates (hall, event_date, status, request_id, source) VALUES (?, ?, 'released', '', 'admin') ON CONFLICT(hall, event_date) DO UPDATE SET status = 'released', request_id = '', source = 'admin'").bind(hall, date),
    database.prepare("DELETE FROM booking_date_notes WHERE hall = ? AND event_date = ?").bind(hall, date),
  ]);
  return Response.json({ ok: true });
}
