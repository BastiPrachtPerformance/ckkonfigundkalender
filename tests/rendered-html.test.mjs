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
  for (const hall of ["event", "garden"]) {
    const dates = [...availability.locations[hall].blocked, ...availability.locations[hall].reserved];
    assert.equal(new Set(dates).size, dates.length, `${hall} enthält doppelte Termine`);
    for (const value of dates) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
      const [year, month, day] = value.split("-").map(Number);
      assert.equal(new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10), value);
    }
  }
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
  assert.match(publicCalendar, /Nicht verfügbar/);
  assert.doesNotMatch(publicCalendar, /Vorreservieren|reservieren/);
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
