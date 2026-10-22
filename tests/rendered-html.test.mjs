import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("build output and required public assets exist", async () => {
  await Promise.all([
    access(new URL("dist/server/index.js", root)),
    access(new URL("public/ck-eventcenter-logo.png", root)),
    access(new URL("public/verwaltung.html", root)),
  ]);
});

test("imported occupancy data contains valid, unique dates", async () => {
  const availability = JSON.parse(await read("data/booking/availability.json"));
  const expectedRangeCounts = {
    event: { blocked: 63, reserved: 8 },
    garden: { blocked: 91, reserved: 8 },
  };
  for (const hall of ["event", "garden"]) {
    const dates = [...availability.locations[hall].blocked, ...availability.locations[hall].reserved];
    assert.equal(new Set(dates).size, dates.length, `${hall} enthält doppelte Termine`);
    for (const value of dates) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
      const [year, month, day] = value.split("-").map(Number);
      assert.equal(new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10), value);
    }
    for (const status of ["blocked", "reserved"]) {
      const inScreenshotRange = availability.locations[hall][status].filter((date) => date >= "2026-10-19" && date <= "2027-09-30");
      assert.equal(inScreenshotRange.length, expectedRangeCounts[hall][status]);
    }
  }
  assert.ok(availability.locations.event.reserved.includes("2026-10-23"));
  assert.ok(availability.locations.garden.reserved.includes("2027-09-23"));
  assert.ok(!availability.locations.event.blocked.includes("2026-10-26"));
  assert.ok(!availability.locations.garden.blocked.includes("2026-10-19"));
});

test("public booking API is read-only and exposes no pricing", async () => {
  const route = await read("app/api/buchung/route.ts");
  assert.match(route, /export async function GET/);
  assert.doesNotMatch(route, /export async function POST/);
  assert.doesNotMatch(route, /getBookingPricing|calculateTotal|booking_requests/);
});

test("consultation page embeds the configured Calendly calendar", async () => {
  const [booking, publicCalendar] = await Promise.all([
    read("app/buchung/page.tsx"),
    read("app/belegungsplan/AvailabilityCalendar.tsx"),
  ]);
  assert.match(booking, /https:\/\/calendly\.com\/buchungen-ckeventcenter/);
  assert.match(booking, /<iframe/);
  assert.match(publicCalendar, /statusByDate/);
  assert.match(publicCalendar, /status === "reserved" \? "reserved"/);
  assert.match(publicCalendar, /Reserviert/);
  assert.match(publicCalendar, /Belegt/);
});

test("admin calendar stores optional customer details and notes", async () => {
  const [admin, route, bookingDb] = await Promise.all([
    read("public/verwaltung.html"),
    read("app/api/admin/availability/route.ts"),
    read("db/booking.ts"),
  ]);
  assert.match(admin, /customerName/);
  assert.match(admin, /Interne Notiz/);
  assert.doesNotMatch(admin, /Preise & Regeln|Konfigurator öffnen/);
  assert.match(route, /booking_date_details/);
  assert.match(bookingDb, /CREATE TABLE IF NOT EXISTS booking_date_details/);
});

test("legal and contact pages describe the current booking flow", async () => {
  const [privacy, terms, contact] = await Promise.all([
    read("app/datenschutz/page.tsx"),
    read("app/agb/page.tsx"),
    read("app/kontakt/page.tsx"),
  ]);
  assert.match(privacy, /Calendly/);
  assert.match(terms, /kein Hochzeitstermin reserviert/);
  assert.match(contact, /Beratung buchen/);
  assert.doesNotMatch(`${privacy}\n${terms}\n${contact}`, /Konfigurator|Preisschätzung/);
});

test("site logos always return to the active domain root", async () => {
  const chrome = await read("app/_components/SiteChrome.tsx");
  const homepageLinks = chrome.match(/href="\/" target="_top"/g) ?? [];
  assert.equal(homepageLinks.length, 2);
  assert.doesNotMatch(chrome, /href="https:\/\/www\.ckeventcenter\.de\//);
});

test("gallery image 11 is labeled CK Eventcenter", async () => {
  const galleryPage = await read("app/galerie/page.tsx");
  assert.match(galleryPage, /index === 10 \? "CK Eventcenter"/);
});
