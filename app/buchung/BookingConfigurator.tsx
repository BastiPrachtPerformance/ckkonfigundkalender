"use client";

import { useEffect, useMemo, useState } from "react";

type HallKey = "event" | "garden";
type DayKey = "friday" | "saturday" | "sunday" | "weekday";
type PriceEntry = { label: string; note?: string; price?: number; perGuest?: number };
type LocationPricing = {
  rules: { minGuests: number; maxGuests: number; minGuestsByDay: Record<string, number> };
  baseByDay: Record<DayKey, number>;
  menu: Record<string, PriceEntry>;
  drinks: Record<string, PriceEntry>;
  midnight: Record<string, PriceEntry>;
  extras: Record<string, PriceEntry>;
};
type Pricing = {
  settings: { calendlyUrl: string; bookingTitle: string; bookingText: string; priceDisclaimer: string };
  halls: Record<HallKey, { name: string; perks: string; image: string }>;
  locations: Record<HallKey, LocationPricing>;
};
type BusyDate = { hall: HallKey; date: string; status: "blocked" | "reserved" };

const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const dayLabels: Record<DayKey, string> = { friday: "Freitag", saturday: "Samstag", sunday: "Sonntag", weekday: "Montag bis Donnerstag" };
const hallImages: Record<HallKey, string> = { event: "/buchung-event.avif", garden: "/buchung-garden.avif" };

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function getDayKey(value: string): DayKey {
  const day = new Date(`${value}T12:00:00`).getDay();
  if (day === 5) return "friday";
  if (day === 6) return "saturday";
  if (day === 0) return "sunday";
  return "weekday";
}

export function BookingConfigurator({ pricing }: { pricing: Pricing }) {
  const [step, setStep] = useState(0);
  const [hall, setHall] = useState<HallKey>("event");
  const [date, setDate] = useState("");
  const [guestCount, setGuestCount] = useState(150);
  const [menu, setMenu] = useState("standard");
  const [drinks, setDrinks] = useState("included");
  const [midnight, setMidnight] = useState("none");
  const [extras, setExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busyDates, setBusyDates] = useState<BusyDate[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<{ code: string; total: number } | null>(null);

  const location = pricing.locations[hall];
  const selectedDay = date ? getDayKey(date) : "friday";
  const minimumGuests = Number(location.rules.minGuestsByDay[selectedDay] ?? location.rules.minGuests);

  useEffect(() => {
    let active = true;
    fetch("/api/buchung")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (active) setBusyDates(data.dates ?? []); })
      .catch(() => { if (active) setMessage("Der Kalender konnte gerade nicht vollständig geladen werden."); })
      .finally(() => { if (active) setLoadingCalendar(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (date && busyDates.some((entry) => entry.hall === hall && entry.date === date)) setDate("");
  }, [hall, busyDates, date]);

  useEffect(() => {
    if (guestCount < minimumGuests) setGuestCount(minimumGuests);
    if (guestCount > location.rules.maxGuests) setGuestCount(location.rules.maxGuests);
  }, [minimumGuests, location.rules.maxGuests, guestCount]);

  const total = useMemo(() => {
    const itemTotal = (item?: PriceEntry) => item ? (Number(item.price) || 0) + (Number(item.perGuest) || 0) * guestCount : 0;
    return (Number(location.baseByDay[selectedDay]) || 0)
      + itemTotal(location.menu[menu])
      + itemTotal(location.drinks[drinks])
      + itemTotal(location.midnight[midnight])
      + extras.reduce((sum, key) => sum + itemTotal(location.extras[key]), 0);
  }, [location, selectedDay, menu, drinks, midnight, extras, guestCount]);

  const summaryRows = [
    ["Saal", pricing.halls[hall].name],
    ["Hochzeit", date ? formatDate(date) : "Noch nicht gewählt"],
    ["Gäste", String(guestCount)],
    ["Grundpreis", formatEuro(Number(location.baseByDay[selectedDay]) || 0)],
    ["Verpflegung", location.menu[menu]?.label ?? "–"],
    ["Zusatzleistungen", extras.length ? extras.map((key) => location.extras[key]?.label).join(", ") : "Keine"],
  ];

  function selectDate(value: string) {
    setDate(value);
    const key = getDayKey(value);
    const minimum = Number(location.rules.minGuestsByDay[key] ?? location.rules.minGuests);
    setGuestCount((current) => Math.max(current, minimum));
    setMessage("");
  }

  function next() {
    setMessage("");
    if (step === 1 && !date) {
      setMessage("Bitte wählen Sie zuerst einen freien Hochzeitstermin.");
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    document.querySelector(".configurator-shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    setMessage("");
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage("Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse ein.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/buchung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, date, hall, guestCount, notes,
          configuration: { menu, drinks, midnight, extras },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Die Vorreservierung ist fehlgeschlagen.");
      setReservation({ code: data.code, total: data.total });
      setMessage("");
      setBusyDates((current) => [...current, { hall, date, status: "reserved" }]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Vorreservierung ist fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  const calendlyUrl = reservation
    ? `${pricing.settings.calendlyUrl}?hide_gdpr_banner=1&background_color=faf8ef&text_color=07110d&primary_color=c9a75f&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&a1=${encodeURIComponent(reservation.code)}`
    : "";

  return (
    <section className="configurator-shell" aria-label="Hochzeitstermin konfigurieren">
      <div className="configurator-progress" aria-label={`Schritt ${step + 1} von 5`}>
        {["Saal", "Datum", "Genuss", "Details", "Beratung"].map((label, index) => (
          <button type="button" key={label} className={index <= step ? "active" : ""} onClick={() => index < step && setStep(index)} disabled={index > step}>
            <span>0{index + 1}</span><b>{label}</b>
          </button>
        ))}
      </div>

      <div className="configurator-grid">
        <div className="configurator-panel">
          {step === 0 && <div className="configurator-step">
            <p className="kicker">Schritt 01 / Saal</p>
            <h2>Wo soll Ihr Fest<br /><em>Geschichte schreiben?</em></h2>
            <div className="hall-choices">
              {(Object.keys(pricing.halls) as HallKey[]).map((key) => <button type="button" key={key} className={`hall-choice ${hall === key ? "selected" : ""}`} onClick={() => { setHall(key); setExtras([]); }}>
                <img src={hallImages[key]} alt={pricing.halls[key].name} />
                <span><small>{key === "event" ? "Bis 1.000 Gäste" : "Bis 300 Gäste"}</small><strong>{pricing.halls[key].name}</strong><em>{pricing.halls[key].perks}</em></span>
              </button>)}
            </div>
          </div>}

          {step === 1 && <div className="configurator-step">
            <p className="kicker">Schritt 02 / Hochzeitsdatum</p>
            <h2>Wann beginnt<br /><em>Ihr für immer?</em></h2>
            <Calendar month={calendarMonth} setMonth={setCalendarMonth} hall={hall} busyDates={busyDates} selected={date} onSelect={selectDate} loading={loadingCalendar} />
            <div className="guest-field"><label htmlFor="guestCount">Anzahl der Gäste</label><div><button type="button" onClick={() => setGuestCount(Math.max(minimumGuests, guestCount - 10))}>−</button><input id="guestCount" type="number" min={minimumGuests} max={location.rules.maxGuests} value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} /><button type="button" onClick={() => setGuestCount(Math.min(location.rules.maxGuests, guestCount + 10))}>+</button></div><small>{selectedDay === "saturday" && hall === "event" ? "Samstags gilt im CK Eventcenter eine Mindestzahl von 600 Gästen." : `Möglich sind ${minimumGuests} bis ${location.rules.maxGuests} Gäste.`}</small></div>
          </div>}

          {step === 2 && <div className="configurator-step">
            <p className="kicker">Schritt 03 / Genuss</p>
            <h2>Was dürfen wir<br /><em>für Sie servieren?</em></h2>
            <OptionGroup title="Menü" items={location.menu} selected={[menu]} onChange={setMenu} guestCount={guestCount} />
            <OptionGroup title="Getränke" items={location.drinks} selected={[drinks]} onChange={setDrinks} guestCount={guestCount} />
            <OptionGroup title="Mitternacht" items={location.midnight} selected={[midnight]} onChange={setMidnight} guestCount={guestCount} />
          </div>}

          {step === 3 && <div className="configurator-step">
            <p className="kicker">Schritt 04 / Details</p>
            <h2>Die Momente<br /><em>dazwischen.</em></h2>
            <OptionGroup title="Zusatzleistungen" items={location.extras} selected={extras} multiple onChange={(key) => setExtras((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} guestCount={guestCount} />
            <label className="booking-notes">Wünsche und Hinweise<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Was sollten wir für Ihren besonderen Tag noch wissen?" /></label>
          </div>}

          {step === 4 && <div className="configurator-step final-step">
            <p className="kicker">Schritt 05 / Vorreservierung</p>
            <h2>Jetzt wird es<br /><em>wirklich.</em></h2>
            {!reservation ? <>
              <p className="step-copy">Mit dem Absenden wird Ihr Hochzeitstermin vorreserviert. Danach wählen Sie direkt den passenden Termin für Ihr persönliches Beratungsgespräch.</p>
              <div className="booking-contact-fields">
                <label>Name *<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
                <label>E-Mail *<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
                <label>Telefon<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>
                <label>Hochzeitsdatum<input value={date ? formatDate(date) : ""} readOnly /></label>
              </div>
              <button className="reservation-button" type="button" disabled={submitting} onClick={submit}>{submitting ? "Wird vorreserviert …" : "Datum vorreservieren & Beratung wählen"}<span>↗</span></button>
            </> : <div className="reservation-success">
              <span>Datum vorreserviert</span><h3>{formatDate(date)}</h3><p>Ihre Buchungsnummer: <strong>{reservation.code}</strong></p><p>Ihre Zusammenstellung ist bei uns eingegangen. Wählen Sie jetzt Ihren Beratungstermin.</p>
              <div className="calendly-frame"><iframe src={calendlyUrl} title="Beratungsgespräch auswählen" /></div>
            </div>}
          </div>}

          {message && <p className="booking-message" role="alert">{message}</p>}
          {!reservation && <div className="configurator-navigation">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Zurück</button>
            {step < 4 && <button type="button" className="next" onClick={next}>Weiter <span>→</span></button>}
          </div>}
        </div>

        <aside className="configuration-summary">
          <p className="kicker">Ihre Zusammenstellung</p>
          <div className="summary-hall"><span>{hall === "event" ? "01" : "02"}</span><strong>{pricing.halls[hall].name}</strong></div>
          <dl>{summaryRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="summary-total"><span>Geschätzter Preis</span><strong>{formatEuro(reservation?.total ?? total)}</strong></div>
          <p>{pricing.settings.priceDisclaimer}</p>
        </aside>
      </div>
    </section>
  );
}

function OptionGroup({ title, items, selected, multiple = false, onChange, guestCount }: { title: string; items: Record<string, PriceEntry>; selected: string[]; multiple?: boolean; onChange: (key: string) => void; guestCount: number }) {
  return <fieldset className="option-group"><legend>{title}</legend><div>{Object.entries(items).map(([key, item]) => {
    const active = selected.includes(key);
    const price = (Number(item.price) || 0) + (Number(item.perGuest) || 0) * guestCount;
    return <button type="button" key={key} className={active ? "selected" : ""} onClick={() => onChange(key)} aria-pressed={active}>
      <span>{active ? "✓" : multiple ? "+" : "○"}</span><strong>{item.label}</strong><small>{price ? `${item.perGuest ? `${formatEuro(item.perGuest)} je Gast` : formatEuro(price)}` : "Inklusive"}</small>{item.note && <em>{item.note}</em>}
    </button>;
  })}</div></fieldset>;
}

function Calendar({ month, setMonth, hall, busyDates, selected, onSelect, loading }: { month: Date; setMonth: (date: Date) => void; hall: HallKey; busyDates: BusyDate[]; selected: string; onSelect: (date: string) => void; loading: boolean }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const cells = Array.from({ length: firstOffset + dayCount }, (_, index) => index < firstOffset ? null : index - firstOffset + 1);

  return <div className="booking-calendar">
    <div className="calendar-heading"><button type="button" aria-label="Vorheriger Monat" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>←</button><strong>{months[monthIndex]} {year}</strong><button type="button" aria-label="Nächster Monat" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>→</button></div>
    <div className="calendar-grid">{weekdays.map((day) => <span className="weekday" key={day}>{day}</span>)}{cells.map((day, index) => {
      if (!day) return <span className="empty" key={`empty-${index}`} />;
      const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const busy = busyDates.find((entry) => entry.hall === hall && entry.date === value);
      const unavailable = value < today || Boolean(busy) || loading;
      return <button type="button" key={value} className={`${busy?.status ?? "free"} ${selected === value ? "selected" : ""}`} disabled={unavailable} onClick={() => onSelect(value)} aria-label={`${value}${busy ? ", nicht verfügbar" : ", verfügbar"}`}>{day}</button>;
    })}</div>
    <div className="calendar-legend"><span><i className="free" />Frei</span><span><i className="reserved" />Vorreserviert</span><span><i className="blocked" />Belegt</span></div>
    {selected && <p className="selected-wedding-date">Gewählt: <strong>{formatDate(selected)}</strong></p>}
  </div>;
}
