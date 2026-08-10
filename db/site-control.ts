import { getD1 } from ".";

const SITE_ENABLED_KEY = "site_enabled";

async function ensureSettingsTable(database: D1Database) {
  await database.prepare(`CREATE TABLE IF NOT EXISTS booking_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`).run();
}

export async function readSiteEnabled(database: D1Database = getD1()) {
  const row = await database.prepare(
    "SELECT value FROM booking_settings WHERE key = ?"
  ).bind(SITE_ENABLED_KEY).first<{ value: string }>();

  if (!row?.value) return true;
  try {
    return JSON.parse(row.value) !== false;
  } catch {
    return row.value !== "false";
  }
}

export async function writeSiteEnabled(enabled: boolean, database: D1Database = getD1()) {
  await ensureSettingsTable(database);
  await database.prepare(
    "INSERT INTO booking_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
  ).bind(SITE_ENABLED_KEY, JSON.stringify(enabled)).run();
  return enabled;
}
