import { env } from "cloudflare:workers";
import { getD1 } from ".";
import defaultPricing from "../data/booking/pricing.json";

const PRICING_KEY = "pricing";
const encoder = new TextEncoder();
const ADMIN_COOKIE_NAME = "ck_admin_session";
const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

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

type PricingEntry = { label?: unknown; price?: unknown; perGuest?: unknown; note?: unknown };

function validPriceEntry(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const entry = value as PricingEntry;
  const validAmount = (amount: unknown) => amount === undefined || (typeof amount === "number" && Number.isFinite(amount) && amount >= 0);
  return typeof entry.label === "string"
    && entry.label.trim().length > 0
    && entry.label.length <= 200
    && validAmount(entry.price)
    && validAmount(entry.perGuest)
    && (entry.note === undefined || (typeof entry.note === "string" && entry.note.length <= 500));
}

export function validBookingPricing(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const pricing = value as Record<string, unknown>;
  const halls = pricing.halls as Record<string, unknown> | undefined;
  const locations = pricing.locations as Record<string, unknown> | undefined;
  const settings = pricing.settings as Record<string, unknown> | undefined;
  if (!halls || !locations || !settings) return false;
  if (typeof settings.calendlyUrl !== "string" || typeof settings.bookingTitle !== "string" || typeof settings.bookingText !== "string" || typeof settings.priceDisclaimer !== "string") return false;
  try {
    const calendly = new URL(settings.calendlyUrl);
    if (calendly.protocol !== "https:" || !/(^|\.)calendly\.com$/i.test(calendly.hostname)) return false;
  } catch {
    return false;
  }
  return ["event", "garden"].every((hall) => {
    const hallInfo = halls[hall] as Record<string, unknown> | undefined;
    const location = locations[hall] as Record<string, unknown> | undefined;
    const rules = location?.rules as Record<string, unknown> | undefined;
    const base = location?.baseByDay as Record<string, unknown> | undefined;
    if (!hallInfo || typeof hallInfo.name !== "string" || !location || !rules || !base) return false;
    const min = Number(rules.minGuests); const max = Number(rules.maxGuests);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < min || max > 5000) return false;
    if (!["friday", "saturday", "sunday", "weekday"].every((day) => Number.isFinite(Number(base[day])) && Number(base[day]) >= 0)) return false;
    return ["menu", "drinks", "midnight", "extras"].every((group) => {
      const entries = location[group] as Record<string, unknown> | undefined;
      return entries && Object.keys(entries).length > 0 && Object.values(entries).every(validPriceEntry);
    });
  });
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

async function constantTimeTextEqual(leftValue: string, rightValue: string) {
  const [left, right] = await Promise.all([digest(leftValue), digest(rightValue)]);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
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
  const payload = `${Date.now() + ADMIN_SESSION_SECONDS * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await signature(payload)}`;
}

function readCookie(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const value = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));
  return value?.slice(ADMIN_COOKIE_NAME.length + 1) ?? "";
}

export async function isAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : readCookie(request);
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await signature(payload);
  return Boolean(expected) && await constantTimeTextEqual(parts[2], expected);
}

export function adminCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_SECONDS}${secure}`;
}

export function clearAdminCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function unauthorized() {
  return Response.json({ error: "Nicht autorisiert. Bitte erneut anmelden." }, { status: 401 });
}

export function adminConfigured() {
  const values = runtimeSecrets();
  return Boolean(values.password && values.secret);
}
