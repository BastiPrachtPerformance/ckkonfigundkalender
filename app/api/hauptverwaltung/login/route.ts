import { createKeyUserToken, keyUserConfigured, keyUserCookie, matchesKeyUserPassword } from "../../../../db/keyuser";

export async function POST(request: Request) {
  if (!keyUserConfigured()) {
    return Response.json({ error: "Der Zugang zur Hauptverwaltung ist noch nicht eingerichtet." }, { status: 503 });
  }
  const body = await request.json() as { password?: string };
  if (!await matchesKeyUserPassword(body.password ?? "")) {
    return Response.json({ error: "Das Passwort ist nicht korrekt." }, { status: 401 });
  }
  const token = await createKeyUserToken();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": keyUserCookie(token, request) } });
}
