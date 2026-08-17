import { createKeyUserToken, keyUserConfigured, keyUserCookie, matchesKeyUserPassword } from "../../../../db/keyuser";
import { consumeRateLimit, rateLimitResponse } from "../../../../db/rate-limit";

export async function POST(request: Request) {
  if (!keyUserConfigured()) {
    return Response.json({ error: "Der Zugang zur Hauptverwaltung ist noch nicht eingerichtet." }, { status: 503 });
  }
  const rateLimit = await consumeRateLimit(request, "keyuser-login", 10, 15 * 60);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);
  const body = await request.json() as { password?: string };
  if (!await matchesKeyUserPassword(body.password ?? "")) {
    return Response.json({ error: "Das Passwort ist nicht korrekt." }, { status: 401 });
  }
  const token = await createKeyUserToken();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": keyUserCookie(token, request) } });
}
