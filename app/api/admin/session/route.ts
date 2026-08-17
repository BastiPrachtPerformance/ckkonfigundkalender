import { adminConfigured, clearAdminCookie, isAdminRequest, unauthorized } from "../../../../db/booking";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  return Response.json({ ok: true, configured: adminConfigured(), storage: { persistent: true, type: "Dauerhafter Buchungsspeicher" } }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearAdminCookie(request) } });
}
