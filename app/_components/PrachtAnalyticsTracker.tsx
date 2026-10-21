"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const TRACKER_SRC = "https://control.pracht-performance.de/index.php?action=website_tracker";
const SITE_ID = "f7391c204b1f25bd3db3b35960d68bc9";
const DISABLED_KEY = "ck-pracht-analytics-disabled-v1";

const PAGE_NAMES: Record<string, string> = {
  "/": "start",
  "/eventcenter": "eventcenter",
  "/garden": "garden",
  "/galerie": "galerie",
  "/belegungsplan": "belegungsplan",
  "/buchung": "beratung",
  "/kontakt": "kontakt",
  "/datenschutz": "datenschutz",
  "/impressum": "impressum",
  "/agb": "agb",
  "/barrierefreiheit": "barrierefreiheit",
};

declare global {
  interface Window {
    PrachtAnalyticsConsent?: boolean;
    doNotTrack?: string;
  }
}

function browserRestrictsTracking() {
  const navigatorWithGpc = window.navigator as Navigator & { globalPrivacyControl?: boolean };
  return navigatorWithGpc.globalPrivacyControl === true
    || window.navigator.doNotTrack === "1"
    || window.navigator.doNotTrack?.toLowerCase() === "yes"
    || window.doNotTrack === "1";
}

function setConsentSignal(allowed: boolean) {
  window.PrachtAnalyticsConsent = allowed;
  window.dispatchEvent(new CustomEvent("pracht:analytics-consent", { detail: allowed }));
}

function isDisabledByVisitor() {
  try {
    return window.localStorage.getItem(DISABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribeToPrivacyPreference(onChange: () => void) {
  window.addEventListener("pracht:analytics-preference", onChange);
  return () => window.removeEventListener("pracht:analytics-preference", onChange);
}

function startTracker(pageName: string) {
  // Set the explicit signal first; the tracker must not race its own first load.
  window.PrachtAnalyticsConsent = true;
  window.dispatchEvent(new CustomEvent("pracht:analytics-consent", { detail: true }));

  const existing = document.querySelector<HTMLScriptElement>("script[data-pracht-analytics]");
  if (existing) {
    existing.dataset.page = pageName;
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.referrerPolicy = "no-referrer";
  script.src = TRACKER_SRC;
  script.dataset.site = SITE_ID;
  script.dataset.page = pageName;
  script.dataset.prachtAnalytics = "true";
  document.head.appendChild(script);
}

export function PrachtAnalyticsTracker() {
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname ?? ""];

  useEffect(() => {
    if (!pageName || browserRestrictsTracking() || isDisabledByVisitor()) {
      setConsentSignal(false);
      return;
    }

    startTracker(pageName);
  }, [pageName]);

  return null;
}

export function PrachtAnalyticsPrivacyControl() {
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname ?? ""];
  const disabled = useSyncExternalStore(subscribeToPrivacyPreference, isDisabledByVisitor, () => false);

  const toggle = () => {
    if (disabled) {
      if (!pageName || browserRestrictsTracking()) return;
      try {
        window.localStorage.removeItem(DISABLED_KEY);
      } catch {
        // The setting applies for the current page when storage is unavailable.
      }
      window.dispatchEvent(new Event("pracht:analytics-preference"));
      startTracker(pageName);
      return;
    }

    try {
      window.localStorage.setItem(DISABLED_KEY, "true");
    } catch {
      // The tracker is still disabled for the current page.
    }
    window.dispatchEvent(new Event("pracht:analytics-preference"));
    setConsentSignal(false);
  };

  return <button className="privacy-settings-button" type="button" onClick={toggle}>
    Statistik {disabled ? "aktivieren" : "deaktivieren"}
  </button>;
}
