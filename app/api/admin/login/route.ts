import { adminConfigured, createAdminToken, matchesAdminPassword } from "../../../../db/booking";

export async function POST(request: Request) {
  if (!adminConfigured()) return Response.json({ error: "Der Verwaltungszugang ist noch nicht eingerichtet." }, { status: 503 });
  const body = await request.json() as { password?: string };
  if (!await matchesAdminPassword(body.password ?? "")) {
    return Response.json({ error: "Das Passwort ist nicht korrekt." }, { status: 401 });
  }
  return Response.json({ token: await createAdminToken() });
}
