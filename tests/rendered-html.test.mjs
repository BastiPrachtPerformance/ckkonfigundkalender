import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("build output and required public assets exist", async () => {
  await Promise.all([
    access(new URL("dist/server/index.js", root)),
    access(new URL("public/ck-eventcenter-logo.png", root)),
    access(new URL("public/buchung-event.avif", root)),
    access(new URL("public/buchung-garden.avif", root)),
    access(new URL("public/verwaltung.html", root)),
  ]);
});

test("booking data contains valid, unique dates and complete pricing", async () => {
  const [availability, pricing] = await Promise.all([
    read("data/booking/availability.json").then(JSON.parse),
    read("data/booking/pricing.json").then(JSON.parse),
  ]);

  for (const hall of ["event", "garden"]) {
    const dates = [...availability.locations[hall].blocked, ...availability.locations[hall].reserved];
    assert.equal(new Set(dates).size, dates.length, `${hall} enthält doppelte Termine`);
    for (const value of dates) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
      const [year, month, day] = value.split("-").map(Number);
      const parsed = new Date(Date.UTC(year, month - 1, day));
      assert.equal(parsed.toISOString().slice(0, 10), value, `${value} ist kein gültiges Datum`);
    }
    assert.ok(pricing.halls[hall]);
    assert.ok(pricing.locations[hall]);
  }
  assert.match(pricing.settings.calendlyUrl, /^https:\/\/calendly\.com\//);
});

test("reservation and deletion logic preserve calendar integrity", async () => {
  const [bookingRoute, deleteRoute] = await Promise.all([
    read("app/api/buchung/route.ts"),
    read("app/api/admin/requests/[id]/route.ts"),
  ]);

  assert.match(bookingRoute, /consumeRateLimit\(request, "booking-submit"/);
  assert.match(bookingRoute, /INSERT INTO booking_dates[^\n]+VALUES \(\?, \?, 'reserved', \?, 'customer'\)"/);
  assert.doesNotMatch(bookingRoute, /DO UPDATE SET status = 'reserved'/);
  assert.doesNotMatch(bookingRoute, /releaseExpiredReservations|RESERVATION_HOURS|expiresAt/);
  assert.match(deleteRoute, /UPDATE booking_dates SET status = 'released'/);
  assert.match(deleteRoute, /DELETE FROM booking_requests/);
});

test("customer-facing legal pages contain operational information, not starter placeholders", async () => {
  const [privacy, terms, imprint, booking] = await Promise.all([
    read("app/datenschutz/page.tsx"),
    read("app/agb/page.tsx"),
    read("app/impressum/page.tsx"),
    read("app/buchung/BookingConfigurator.tsx"),
  ]);

  assert.doesNotMatch(`${privacy}\n${terms}`, /Mustertext|vor der endgültigen Veröffentlichung|rechtlich vervollständigt/i);
  assert.match(privacy, /Calendly/);
  assert.match(privacy, /manuell freigegeben/);
  assert.match(terms, /unverbindliche Schätzungen/);
  assert.match(imprint, /§ 5 DDG/);
  assert.match(booking, /Datenschutzerklärung/);
});
