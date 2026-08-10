import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
const COOKIE_NAME = "ck_hauptverwaltung";
const SESSION_SECONDS = 8 * 60 * 60;

function runtimeSecrets() {
  const values = env as unknown as {
    KEYUSER_PASSWORD?: string;
    KEYUSER_SESSION_SECRET?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
  };
  const adminPassword = values.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
  const adminSecret = values.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "";
  return {
    password: values.KEYUSER_PASSWORD ?? process.env.KEYUSER_PASSWORD ?? adminPassword,
    secret: values.KEYUSER_SESSION_SECRET ?? process.env.KEYUSER_SESSION_SECRET ?? (adminSecret ? `${adminSecret}:hauptverwaltung` : ""),
  };
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function constantTimeEqual(leftValue: string, rightValue: string) {
  const [left, right] = await Promise.all([digest(leftValue), digest(rightValue)]);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function matchesKeyUserPassword(value: string) {
  const expected = runtimeSecrets().password;
  return Boolean(expected && value) && constantTimeEqual(value, expected);
}

async function signature(payload: string) {
  const secret = runtimeSecrets().secret;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return btoa(String.fromCharCode(...signed)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function createKeyUserToken() {
  const payload = `${Date.now() + SESSION_SECONDS * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await signature(payload)}`;
}

function readCookie(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const value = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return value?.slice(COOKIE_NAME.length + 1) ?? "";
}

export async function isKeyUserRequest(request: Request) {
  const parts = readCookie(request).split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await signature(payload);
  return Boolean(expected) && constantTimeEqual(parts[2], expected);
}

export function keyUserCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearKeyUserCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function keyUserConfigured() {
  const values = runtimeSecrets();
  return Boolean(values.password && values.secret);
}

export function keyUserUnauthorized() {
  return Response.json({ error: "Nicht autorisiert. Bitte erneut anmelden." }, { status: 401 });
}

