import { isKeyUserRequest, keyUserUnauthorized } from "../../../../db/keyuser";
import { readSiteEnabled, writeSiteEnabled } from "../../../../db/site-control";

export async function GET(request: Request) {
  if (!await isKeyUserRequest(request)) return keyUserUnauthorized();
  return Response.json({ enabled: await readSiteEnabled() });
}

export async function PUT(request: Request) {
  if (!await isKeyUserRequest(request)) return keyUserUnauthorized();
  const body = await request.json() as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") {
    return Response.json({ error: "Der gewünschte Seitenstatus ist ungültig." }, { status: 400 });
  }
  return Response.json({ enabled: await writeSiteEnabled(body.enabled) });
}
