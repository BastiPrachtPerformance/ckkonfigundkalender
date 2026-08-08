import { env } from "cloudflare:workers";
import { getD1 } from ".";
import defaultPricing from "../data/booking/pricing.json";

const PRICING_KEY = "pricing";
const encoder = new TextEncoder();

export async function ensureBookingTables() {
  const database = getD1();
  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS booking_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      hall TEXT NOT NULL,
      event_date TEXT NOT NULL,
      status TEXT DEFAULT 'reserved' NOT NULL,
      request_id TEXT NOT NULL,
      source TEXT DEFAULT 'customer' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_dates_hall_event_date ON booking_dates (hall, event_date)"),
    database.prepare(`CREATE TABLE IF NOT EXISTS booking_requests (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '' NOT NULL,
      event_date TEXT NOT NULL,
      hall TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      configuration TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'neu' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS booking_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS booking_date_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      hall TEXT NOT NULL,
      event_date TEXT NOT NULL,
      note TEXT DEFAULT '' NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_date_notes_hall_event_date ON booking_date_notes (hall, event_date)"),
  ]);
  return database;
}

export async function getBookingPricing() {
  const database = await ensureBookingTables();
  const row = await database.prepare("SELECT value FROM booking_settings WHERE key = ?").bind(PRICING_KEY).first<{ value: string }>();
  if (!row?.value) return structuredClone(defaultPricing);
  try { return JSON.parse(row.value); } catch { return structuredClone(defaultPricing); }
}

export async function saveBookingPricing(value: unknown) {
  const database = await ensureBookingTables();
  await database.prepare(
    "INSERT INTO booking_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
  ).bind(PRICING_KEY, JSON.stringify(value)).run();
  return value;
}

export async function resetBookingPricing() {
  const database = await ensureBookingTables();
  await database.prepare("DELETE FROM booking_settings WHERE key = ?").bind(PRICING_KEY).run();
  return structuredClone(defaultPricing);
}

function runtimeSecrets() {
  const values = env as unknown as { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string };
  return {
    password: values.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "",
    secret: values.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function matchesAdminPassword(value: string) {
  const expected = runtimeSecrets().password;
  if (!expected || !value) return false;
  const [left, right] = await Promise.all([digest(value), digest(expected)]);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function signature(payload: string) {
  const secret = runtimeSecrets().secret;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return btoa(String.fromCharCode(...signed)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function createAdminToken() {
  const payload = `${Date.now() + 12 * 60 * 60 * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await signature(payload)}`;
}

export async function isAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await signature(payload);
  return Boolean(expected) && expected === parts[2];
}

export function unauthorized() {
  return Response.json({ error: "Nicht autorisiert. Bitte erneut anmelden." }, { status: 401 });
}

export function adminConfigured() {
  const values = runtimeSecrets();
  return Boolean(values.password && values.secret);
}
