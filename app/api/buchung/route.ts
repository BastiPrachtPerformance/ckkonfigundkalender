import { ensureBookingTables, getBookingPricing } from "../../../db/booking";
import availabilitySource from "../../../data/booking/availability.json";

type HallKey = "event" | "garden";
type PriceEntry = { label: string; price?: number; perGuest?: number };
type LocationPricing = {
  rules: { minGuests: number; maxGuests: number; minGuestsByDay: Record<string, number> };
  baseByDay: Record<string, number>;
  menu: Record<string, PriceEntry>;
  drinks: Record<string, PriceEntry>;
  midnight: Record<string, PriceEntry>;
  extras: Record<string, PriceEntry>;
};

const legacyAvailability = availabilitySource as unknown as {
  locations: Record<HallKey, { blocked: string[]; reserved: string[] }>;
};

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isLegacyBusy(hall: HallKey, date: string) {
  const dates = legacyAvailability.locations[hall];
  return dates.blocked.includes(date) || dates.reserved.includes(date);
}

function dayKey(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (day === 5) return "friday";
  if (day === 6) return "saturday";
  if (day === 0) return "sunday";
  return "weekday";
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function calculateTotal(pricing: { locations: Record<HallKey, LocationPricing> }, hall: HallKey, date: string, guestCount: number, configuration: Record<string, unknown>) {
  const location = pricing.locations[hall];
  const key = dayKey(date);
  const itemTotal = (entry?: PriceEntry) => entry ? (Number(entry.price) || 0) + (Number(entry.perGuest) || 0) * guestCount : 0;
  const selected = (group: "menu" | "drinks" | "midnight", fallback: string) => {
    const value = clean(configuration[group], 60) || fallback;
    return location[group][value];
  };
  const extras = Array.isArray(configuration.extras)
    ? configuration.extras.map((value) => clean(value, 60)).filter((value) => Boolean(location.extras[value]))
    : [];

  return Math.round(
    (Number(location.baseByDay[key]) || 0) +
    itemTotal(selected("menu", "standard")) +
    itemTotal(selected("drinks", "included")) +
    itemTotal(selected("midnight", "none")) +
    extras.reduce((sum, value) => sum + itemTotal(location.extras[value]), 0)
  );
}

export async function GET() {
  try {
    const database = await ensureBookingTables();
    const [dynamic, pricing] = await Promise.all([database.prepare(
      "SELECT hall, event_date AS date, status FROM booking_dates ORDER BY event_date"
    ).all<{ hall: HallKey; date: string; status: string }>(), getBookingPricing()]);

    const overrides = new Map((dynamic.results ?? []).map((entry) => [`${entry.hall}:${entry.date}`, entry]));

    const dates = (Object.keys(legacyAvailability.locations) as HallKey[]).flatMap((hall) => {
      const source = legacyAvailability.locations[hall];
      return [
        ...source.blocked.filter((date) => !overrides.has(`${hall}:${date}`)).map((date) => ({ hall, date, status: "blocked" })),
        ...source.reserved.filter((date) => !overrides.has(`${hall}:${date}`)).map((date) => ({ hall, date, status: "reserved" })),
      ];
    });

    return Response.json({ dates: [...dates, ...(dynamic.results ?? []).filter((entry) => entry.status !== "released")], pricing });
  } catch (error) {
    return Response.json({ error: "Der Belegungskalender konnte gerade nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = clean(body.name, 160);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 80);
    const eventDate = clean(body.date, 10);
    const hall = clean(body.hall, 20) as HallKey;
    const guestCount = Math.round(Number(body.guestCount));
    const notes = clean(body.notes, 1500);
    const configuration = body.configuration && typeof body.configuration === "object"
      ? body.configuration as Record<string, unknown>
      : {};

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !isDate(eventDate) || !["event", "garden"].includes(hall)) {
      return Response.json({ error: "Bitte prüfen Sie Name, E-Mail, Saal und Hochzeitsdatum." }, { status: 400 });
    }
    if (eventDate < new Date().toISOString().slice(0, 10)) {
      return Response.json({ error: "Bitte wählen Sie ein zukünftiges Hochzeitsdatum." }, { status: 400 });
    }
    const database = await ensureBookingTables();
    const existing = await database.prepare("SELECT status FROM booking_dates WHERE hall = ? AND event_date = ?").bind(hall, eventDate).first<{ status: string }>();
    if ((existing && existing.status !== "released") || (!existing && isLegacyBusy(hall, eventDate))) {
      return Response.json({ error: "Dieser Hochzeitstermin ist bereits belegt oder vorreserviert." }, { status: 409 });
    }

    const pricing = await getBookingPricing() as { locations: Record<HallKey, LocationPricing> };
    const location = pricing.locations[hall];
    const minimum = Number(location.rules.minGuestsByDay[dayKey(eventDate)] ?? location.rules.minGuests);
    if (!Number.isFinite(guestCount) || guestCount < minimum || guestCount > location.rules.maxGuests) {
      return Response.json({ error: `Für diesen Termin sind ${minimum} bis ${location.rules.maxGuests} Gäste möglich.` }, { status: 400 });
    }

    const total = calculateTotal(pricing, hall, eventDate, guestCount, configuration);
    const id = crypto.randomUUID();
    const code = `CK-${hall === "event" ? "E" : "G"}-${eventDate.replaceAll("-", "").slice(2)}-${id.slice(0, 4).toUpperCase()}`;
    const storedConfiguration = JSON.stringify({ ...configuration, notes, code, hall, date: eventDate, guestCount, dayKey: dayKey(eventDate) });
    await database.batch([
      database.prepare(
        "INSERT INTO booking_dates (hall, event_date, status, request_id, source) VALUES (?, ?, 'reserved', ?, 'customer') ON CONFLICT(hall, event_date) DO UPDATE SET status = 'reserved', request_id = excluded.request_id, source = 'customer', created_at = CURRENT_TIMESTAMP"
      ).bind(hall, eventDate, id),
      database.prepare(
        "INSERT INTO booking_requests (id, name, email, phone, event_date, hall, guest_count, configuration, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'neu')"
      ).bind(id, name, email, phone, eventDate, hall, guestCount, storedConfiguration, total),
    ]);

    return Response.json({ ok: true, id, code, total, date: eventDate }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE") || message.includes("unique")) {
      return Response.json({ error: "Dieser Hochzeitstermin wurde gerade vorreserviert. Bitte wählen Sie einen anderen Termin." }, { status: 409 });
    }
    return Response.json({ error: "Die Vorreservierung konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut." }, { status: 500 });
  }
}
