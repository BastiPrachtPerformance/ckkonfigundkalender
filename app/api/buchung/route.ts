import availabilitySource from "../../../data/booking/availability.json";
import { ensureBookingTables } from "../../../db/booking";

type HallKey = "event" | "garden";
type DateRow = { hall: HallKey; date: string; status: string };

const legacy = availabilitySource as unknown as {
  locations: Record<HallKey, { blocked: string[]; reserved: string[] }>;
};

export async function GET() {
  try {
    const database = await ensureBookingTables();
    const dynamic = await database.prepare(
      "SELECT hall, event_date AS date, status FROM booking_dates ORDER BY event_date",
    ).all<DateRow>();
    const overrides = new Map(
      (dynamic.results ?? []).map((row) => [`${row.hall}:${row.date}`, row]),
    );
    const imported = (Object.keys(legacy.locations) as HallKey[]).flatMap((hall) => {
      const values = legacy.locations[hall];
      return [
        ...values.blocked
          .filter((date) => !overrides.has(`${hall}:${date}`))
          .map((date) => ({ location: hall, date, status: "blocked" })),
        ...values.reserved
          .filter((date) => !overrides.has(`${hall}:${date}`))
          .map((date) => ({ location: hall, date, status: "reserved" })),
      ];
    });
    const current = (dynamic.results ?? [])
      .filter((row) => row.status !== "released")
      .map((row) => ({ location: row.hall, date: row.date, status: row.status }));

    return Response.json({
      dates: [...imported, ...current].sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch {
    return Response.json({ error: "Der Belegungsplan ist momentan nicht erreichbar." }, { status: 503 });
  }
}
