import { adminConfigured, isAdminRequest, unauthorized } from "../../../../db/booking";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  return Response.json({ ok: true, storage: { persistent: true, type: "Dauerhafter Buchungsspeicher" }, usingDefaultPassword: !adminConfigured() });
}
