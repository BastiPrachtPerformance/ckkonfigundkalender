import { adminConfigured, adminCookie, createAdminToken, matchesAdminPassword } from "../../../../db/booking";
import { consumeRateLimit, rateLimitResponse } from "../../../../db/rate-limit";

export async function POST(request: Request) {
  if (!adminConfigured()) return Response.json({ error: "Der Verwaltungszugang ist noch nicht eingerichtet." }, { status: 503 });
  const rateLimit = await consumeRateLimit(request, "admin-login", 10, 15 * 60);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);
  const body = await request.json() as { password?: string };
  if (!await matchesAdminPassword(body.password ?? "")) {
    return Response.json({ error: "Das Passwort ist nicht korrekt." }, { status: 401 });
  }
  const token = await createAdminToken();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": adminCookie(token, request) } });
}
