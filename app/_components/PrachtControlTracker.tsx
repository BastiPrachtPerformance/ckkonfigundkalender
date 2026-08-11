"use client";

import { useEffect } from "react";

const CONTROL_ORIGIN = "https://pracht-performance.de";

export function PrachtControlTracker() {
  useEffect(() => {
    if (location.pathname.startsWith("/hauptverwaltung") || location.pathname.startsWith("/verwaltung")) return;
    let active = true;

    const start = async () => {
      const response = await fetch(`${CONTROL_ORIGIN}/api/control-config?domain=${encodeURIComponent(location.hostname)}`);
      if (!response.ok || !active) return;
      const config = await response.json() as { siteId?: string; eventEndpoint?: string };
      if (!config.siteId || !config.eventEndpoint || !active) return;

      const send = (event: "page_view" | "contact_click" | "form_submit") => {
        void fetch(config.eventEndpoint!, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId: config.siteId, event }), keepalive: true }).catch(() => undefined);
      };

      send("page_view");
      const onClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const link = target?.closest<HTMLAnchorElement>("a[href]");
        if (link && /^(tel:|mailto:|https:\/\/wa\.me\/)/i.test(link.href)) send("contact_click");
      };
      const onSubmit = () => send("form_submit");
      document.addEventListener("click", onClick);
      document.addEventListener("submit", onSubmit);
      return () => {
        document.removeEventListener("click", onClick);
        document.removeEventListener("submit", onSubmit);
      };
    };

    let cleanup: (() => void) | undefined;
    void start().then((stop) => { cleanup = stop; }).catch(() => undefined);
    return () => { active = false; cleanup?.(); };
  }, []);

  return null;
}
