// Pracht Control — vorgeschalteter Killswitch für CKEVENTCENTER.
// Die drei Werte werden ausschließlich als Functions-Umgebungsvariablen in Netlify gesetzt.

declare const Netlify: { env: { get(name: string): string | undefined } };

function page(title: string, text: string, status: number) {
  return new Response(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:#101712;color:#f6f1e8;font:16px Arial,sans-serif}main{max-width:680px}small{color:#d8b877;font-weight:700;letter-spacing:.12em}h1{font:400 clamp(2.8rem,8vw,6rem)/.9 Georgia,serif;margin:20px 0}p{color:#c9c4b9;line-height:1.65}</style><main><small>CK EVENTCENTER</small><h1>${title}</h1><p>${text}</p></main></html>`, { status, headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}

export default async (request: Request) => {
  const controlUrl = Netlify.env.get("PRACHT_CONTROL_URL");
  const siteId = Netlify.env.get("PRACHT_CONTROL_SITE_ID");
  const token = Netlify.env.get("PRACHT_CONTROL_TOKEN");
  const requestUrl = new URL(request.url);
  if (requestUrl.pathname === "/__pracht-control-config") {
    if (!controlUrl || !siteId) return new Response("Nicht konfiguriert", { status: 404, headers: { "cache-control": "no-store" } });
    return Response.json({ controlUrl, siteId }, { headers: { "cache-control": "no-store" } });
  }
  if (!controlUrl || !siteId || !token) return;

  try {
    const response = await fetch(`${controlUrl}/api/control-status?siteId=${encodeURIComponent(siteId)}`, { headers: { "x-pracht-control-token": token } });
    if (!response.ok) return;
    const { state } = await response.json() as { state?: string };
    if (state === "404") return page("Seite nicht gefunden.", "Diese Website ist derzeit nicht verfügbar.", 404);
    if (state === "Wartung") return page("Wir sind gleich wieder da.", "Diese Website wird gerade gewartet. Bitte versuche es in Kürze erneut.", 503);
  } catch {
    // Fail open: Bei einer Störung von Pracht Control bleibt die Website erreichbar.
  }
  return;
};

export const config = { path: "/*" };
