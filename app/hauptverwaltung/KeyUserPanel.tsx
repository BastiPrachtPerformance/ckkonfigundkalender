"use client";

import { FormEvent, useEffect, useState } from "react";

type ViewState = "loading" | "login" | "panel";

async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const result = await response.json().catch(() => ({})) as { error?: string; enabled?: boolean };
  if (!response.ok) throw new Error(result.error ?? "Die Anfrage konnte nicht ausgeführt werden.");
  return result;
}

export default function KeyUserPanel() {
  const [view, setView] = useState<ViewState>("loading");
  const [enabled, setEnabled] = useState(true);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadStatus() {
    await api("/api/hauptverwaltung/session");
    const status = await api("/api/hauptverwaltung/seitenstatus");
    setEnabled(status.enabled !== false);
    setView("panel");
  }

  useEffect(() => {
    let active = true;
    api("/api/hauptverwaltung/session")
      .then(() => api("/api/hauptverwaltung/seitenstatus"))
      .then((status) => {
        if (!active) return;
        setEnabled(status.enabled !== false);
        setView("panel");
      })
      .catch(() => {
        if (active) setView("login");
      });
    return () => { active = false; };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/hauptverwaltung/login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      await loadStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Anmeldung ist fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(nextEnabled: boolean) {
    if (!nextEnabled && !window.confirm("Die gesamte öffentliche Internetseite wirklich deaktivieren? Nur diese Hauptverwaltung bleibt erreichbar.")) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await api("/api/hauptverwaltung/seitenstatus", {
        method: "PUT",
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      setEnabled(result.enabled !== false);
      setMessage(nextEnabled ? "Die Internetseite ist wieder vollständig erreichbar." : "Die Internetseite wurde vollständig deaktiviert.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Status konnte nicht geändert werden.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/hauptverwaltung/session", { method: "DELETE" }).catch(() => undefined);
    setMessage("");
    setView("login");
  }

  if (view === "loading") {
    return <main className="keyuser-shell"><div className="keyuser-loading" role="status">Hauptverwaltung wird geladen …</div></main>;
  }

  if (view === "login") {
    return (
      <main className="keyuser-shell">
        <section className="keyuser-login-card">
          <img src="/ck-eventcenter-logo.png" alt="CK Eventcenter Bergkamen" />
          <p className="keyuser-kicker">Geschützter Systemzugang</p>
          <h1>Hauptverwaltung</h1>
          <form onSubmit={login}>
            <label htmlFor="keyuser-password">Passwort</label>
            <input id="keyuser-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="submit" disabled={busy}>{busy ? "Anmeldung läuft …" : "Sicher anmelden"}</button>
          </form>
          {message && <p className="keyuser-message error" role="alert">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="keyuser-shell">
      <section className="keyuser-panel">
        <header>
          <div><p className="keyuser-kicker">CK Eventcenter · Systemsteuerung</p><h1>Hauptverwaltung</h1></div>
          <button className="keyuser-logout" type="button" onClick={logout}>Abmelden</button>
        </header>
        <div className={`keyuser-status ${enabled ? "is-online" : "is-offline"}`}>
          <span className="keyuser-status-light" aria-hidden="true" />
          <div>
            <small>Aktueller Zustand</small>
            <h2>{enabled ? "Internetseite ist aktiv" : "Internetseite ist deaktiviert"}</h2>
            <p>{enabled ? "Alle Seiten, Buchungen und öffentlichen Bereiche sind erreichbar." : "Besucher erhalten ausschließlich „404 – Seite nicht verfügbar“. Nur diese Hauptverwaltung bleibt erreichbar."}</p>
          </div>
        </div>
        <div className="keyuser-switch-card">
          <div><p className="keyuser-kicker">Hauptschalter</p><h2>Gesamte Internetseite steuern</h2><p>Die Änderung wird sofort wirksam und bleibt dauerhaft gespeichert.</p></div>
          <button className={enabled ? "keyuser-disable" : "keyuser-enable"} type="button" disabled={busy} onClick={() => changeStatus(!enabled)}>
            {busy ? "Status wird geändert …" : enabled ? "Internetseite deaktivieren" : "Internetseite aktivieren"}
          </button>
        </div>
        {message && <p className="keyuser-message" role="status">{message}</p>}
      </section>
    </main>
  );
}
