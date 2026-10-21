"use client";

import { useEffect, useMemo, useState } from "react";

type HallKey = "event" | "garden";
type BusyDate = { location: HallKey; date: string; status: string };

const halls: Record<HallKey, string> = { event: "CK Eventcenter", garden: "CK Garden" };
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AvailabilityCalendar() {
  const today = useMemo(() => new Date(), []);
  const [hall, setHall] = useState<HallKey>("event");
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [dates, setDates] = useState<BusyDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDates() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/buchung", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { dates?: BusyDate[] };
      setDates(Array.isArray(data.dates) ? data.dates : []);
    } catch {
      setError("Der Belegungsplan konnte gerade nicht geladen werden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/buchung", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ dates?: BusyDate[] }>;
      })
      .then((data) => {
        if (active) setDates(Array.isArray(data.dates) ? data.dates : []);
      })
      .catch(() => {
        if (active) setError("Der Belegungsplan konnte gerade nicht geladen werden. Bitte versuchen Sie es erneut.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const busy = new Set(dates.filter((entry) => entry.location === hall).map((entry) => entry.date));
  const currentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(month);

  return (
    <section className="public-availability" aria-labelledby="availability-title">
      <div className="availability-heading">
        <div><p className="section-label">Hochzeitstermine</p><h2 id="availability-title">Wann möchten Sie<br /><em>heiraten?</em></h2></div>
        <p>Wählen Sie eine Location und prüfen Sie, welche Hochzeitstermine aktuell noch frei sind. Der Kalender dient der ersten Orientierung.</p>
      </div>
      <div className="availability-shell">
        <div className="availability-tabs" role="tablist" aria-label="Location auswählen">
          {(Object.keys(halls) as HallKey[]).map((key) => <button key={key} type="button" role="tab" aria-selected={hall === key} className={hall === key ? "active" : ""} onClick={() => setHall(key)}>{halls[key]}</button>)}
        </div>
        <div className="availability-toolbar">
          <button type="button" aria-label="Vorheriger Monat" disabled={currentMonth} onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>←</button>
          <strong>{monthLabel}</strong>
          <button type="button" aria-label="Nächster Monat" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>→</button>
        </div>
        {error ? <div className="availability-error"><p>{error}</p><button type="button" onClick={() => void loadDates()}>Erneut versuchen</button></div> : <>
          <div className={`availability-calendar${loading ? " loading" : ""}`} aria-busy={loading}>
            {weekdays.map((day) => <span className="availability-weekday" key={day}>{day}</span>)}
            {Array.from({ length: leading }, (_, index) => <span className="availability-blank" key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const key = dateKey(year, monthIndex, day);
              const past = new Date(year, monthIndex, day, 23, 59, 59) < today;
              const unavailable = loading || past || busy.has(key);
              return <div key={key} className={`availability-day ${past ? "past" : unavailable ? "unavailable" : "free"}`} aria-label={`${day}. ${monthLabel}: ${unavailable ? "nicht verfügbar" : "frei"}`}><strong>{day}</strong><small>{past ? "vorbei" : unavailable ? "belegt" : "frei"}</small></div>;
            })}
          </div>
          <div className="availability-legend"><span><i className="free" />Frei</span><span><i className="unavailable" />Nicht verfügbar</span></div>
        </>}
      </div>
      <div className="availability-cta"><div><p className="kicker">Ihr Wunschtermin ist frei?</p><h3>Dann lernen wir uns kennen.</h3></div><a className="solid-button" href="/buchung" data-pracht-event="anfrage">Beratungsgespräch buchen <span>↗</span></a></div>
    </section>
  );
}
