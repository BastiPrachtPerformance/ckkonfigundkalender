import { ensureBookingTables, isAdminRequest, unauthorized } from "../../../../db/booking";

type RequestRow = {
  id: string; name: string; email: string; phone: string; event_date: string; hall: string;
  guest_count: number; configuration: string; total: number; status: string; created_at: string;
};

function present(row: RequestRow) {
  let saved: Record<string, unknown> = {};
  try { saved = JSON.parse(row.configuration); } catch { saved = {}; }
  const config = { ...saved, hall: row.hall, date: row.event_date, guestCount: row.guest_count };
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    date: row.event_date, message: String(saved.notes ?? ""), config,
    configCode: String(saved.code ?? ""), total: row.total, status: row.status, createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const database = await ensureBookingTables();
  const result = await database.prepare("SELECT * FROM booking_requests ORDER BY created_at DESC").all<RequestRow>();
  return Response.json((result.results ?? []).map(present));
}
