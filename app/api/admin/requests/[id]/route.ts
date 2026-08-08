import { ensureBookingTables, isAdminRequest, unauthorized } from "../../../../../db/booking";

const allowedStatuses = new Set(["neu", "kontaktiert", "bestätigt", "abgelehnt"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminRequest(request)) return unauthorized();
  const { id } = await params;
  const body = await request.json() as { status?: string };
  if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "Ungültiger Bearbeitungsstatus." }, { status: 400 });
  const database = await ensureBookingTables();
  const result = await database.prepare("UPDATE booking_requests SET status = ? WHERE id = ?").bind(body.status, id).run();
  if (!result.meta.changes) return Response.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
  return Response.json({ ok: true, id, status: body.status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminRequest(request)) return unauthorized();
  const { id } = await params;
  const database = await ensureBookingTables();
  await database.prepare("DELETE FROM booking_requests WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}
