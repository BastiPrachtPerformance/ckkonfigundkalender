import { clearKeyUserCookie, isKeyUserRequest, keyUserUnauthorized } from "../../../../db/keyuser";

export async function GET(request: Request) {
  if (!await isKeyUserRequest(request)) return keyUserUnauthorized();
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearKeyUserCookie(request) } });
}
