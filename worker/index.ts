/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { readSiteEnabled } from "../db/site-control";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function isHauptverwaltungRequest(pathname: string) {
  return pathname === "/hauptverwaltung"
    || pathname.startsWith("/hauptverwaltung/")
    || pathname.startsWith("/api/hauptverwaltung/")
    || pathname.startsWith("/_next/")
    || pathname === "/ck-eventcenter-logo.png"
    || pathname === "/favicon.svg";
}

function unavailableResponse() {
  return new Response(`<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>404 – Seite nicht verfügbar</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;color:#f3f0e4;background:#07110d;font-family:Arial,sans-serif;text-align:center}main{max-width:720px}span{display:inline-grid;place-items:center;width:76px;height:76px;border:1px solid #c9a75f;border-radius:50%;color:#c9a75f;font:italic 28px Georgia,serif}h1{margin:28px 0 12px;font:500 clamp(42px,8vw,82px)/.95 Georgia,serif;letter-spacing:-.045em}p{margin:0;color:rgba(255,255,255,.64);font-size:15px;line-height:1.7}</style></head>
<body><main><span>404</span><h1>Seite nicht verfügbar</h1><p>Diese Internetseite ist derzeit nicht erreichbar.</p></main></body></html>`, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://static.wixstatic.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src https://calendly.com https://*.calendly.com; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'self'; upgrade-insecure-requests");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (!isHauptverwaltungRequest(url.pathname)) {
      try {
        if (!await readSiteEnabled(env.DB)) return withSecurityHeaders(unavailableResponse());
      } catch (error) {
        console.error("Der Seitenstatus konnte nicht gelesen werden.", error);
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(imageResponse);
    }

    return withSecurityHeaders(await handler.fetch(request, env, ctx));
  },
};

export default worker;
