import { getD1 } from ".";

type RateLimitRow = { count: number; window_started: number };

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-nf-client-connection-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

async function hashKey(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function consumeRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  const database = getD1();
  await database.prepare(`CREATE TABLE IF NOT EXISTS request_rate_limits (
    scope TEXT NOT NULL,
    client_key TEXT NOT NULL,
    window_started INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (scope, client_key)
  )`).run();

  const clientKey = await hashKey(`${scope}:${clientAddress(request)}`);
  const result = await database.prepare(`INSERT INTO request_rate_limits (scope, client_key, window_started, count)
    VALUES (?, ?, unixepoch(), 1)
    ON CONFLICT(scope, client_key) DO UPDATE SET
      count = CASE WHEN window_started <= unixepoch() - ? THEN 1 ELSE count + 1 END,
      window_started = CASE WHEN window_started <= unixepoch() - ? THEN unixepoch() ELSE window_started END
    RETURNING count, window_started`
  ).bind(scope, clientKey, windowSeconds, windowSeconds).first<RateLimitRow>();

  const count = Number(result?.count ?? limit + 1);
  const retryAfter = Math.max(1, windowSeconds - (Math.floor(Date.now() / 1000) - Number(result?.window_started ?? 0)));
  return { allowed: count <= limit, retryAfter };
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { error: "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
