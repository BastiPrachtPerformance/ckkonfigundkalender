import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Netlify serves the updated admin UI before the existing API proxy", async () => {
  execFileSync(process.execPath, [fileURLToPath(new URL("build/prepare-netlify.mjs", root))]);
  const [config, source, published] = await Promise.all([
    read("netlify.toml"),
    read("public/verwaltung.html"),
    read("netlify/admin-calendar.html"),
  ]);
  assert.equal(published, source);
  assert.match(config, /command = "npm run build && node build\/prepare-netlify\.mjs"/);
  const rules = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[|$)/g)].map(([, section]) => ({
    from: section.match(/from = "([^"]+)"/)[1],
    to: section.match(/to = "([^"]+)"/)[1],
    status: Number(section.match(/status = (\d+)/)[1]),
    force: section.includes("force = true"),
  }));
  const firstMatch = (path) => rules.find((rule) => rule.from === path || rule.from === "/*");
  for (const path of ["/verwaltung", "/verwaltung/", "/verwaltung.html"]) {
    assert.deepEqual(firstMatch(path), { from: path, to: "/admin-calendar.html", status: 200, force: true });
  }
  for (const path of ["/api/admin/availability", "/api/admin/session", "/api/admin/login", "/api/buchung", "/"]) {
    assert.equal(firstMatch(path).to, "https://ck-eventcenter-bergkamen.bastiansch-95.chatgpt.site/:splat");
  }
});

test("holidays render through 2030 while existing reservations and notes stay intact", async () => {
  const html = await read("public/verwaltung.html");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const fixtures = [
    { location: "event", date: "2026-12-25", status: "reserved", customerName: "Bestehender Kunde", note: "Bestehende Notiz" },
    { location: "event", date: "2026-12-26", status: "blocked" },
    { location: "garden", date: "2026-12-26", status: "reserved", note: "Garden-Notiz" },
  ];
  const before = JSON.stringify(fixtures);
  const elements = new Map();
  const requests = [];
  const context = vm.createContext({
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, { innerHTML: "", textContent: "", value: "", classList: { add() {}, remove() {}, toggle() {} } });
        return elements.get(id);
      },
      querySelectorAll() { return []; },
    },
    async fetch(url, options) {
      requests.push({ url, method: options.method ?? "GET" });
      return { status: 200, ok: true, async json() { return { dates: fixtures }; } };
    },
    setTimeout,
    alert() { throw new Error("Unexpected alert"); },
    confirm() { throw new Error("Unexpected calendar mutation"); },
  });
  vm.runInContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  function render(year, month, hall = "event") {
    vm.runInContext(`month=new Date(${year},${month - 1},1);hall=${JSON.stringify(hall)};render()`, context);
    return elements.get("calendar").innerHTML;
  }
  function cell(markup, date) {
    return markup.match(new RegExp(`<button[^>]*data-date="${date}"[\\s\\S]*?<\\/button>`))?.[0] ?? "";
  }
  const december = render(2026, 12);
  assert.match(cell(december, "2026-12-25"), /class="day reserved/);
  assert.match(cell(december, "2026-12-25"), /class="holiday-label"[^>]*>1\. Weihnachtstag/);
  assert.match(cell(december, "2026-12-26"), /class="day busy/);
  assert.match(cell(december, "2026-12-26"), /class="holiday-label"[^>]*>2\. Weihnachtstag/);
  assert.match(cell(render(2026, 12, "garden"), "2026-12-26"), /class="day reserved/);
  for (const [year, month, day] of [[2026, 4, 6], [2027, 3, 29], [2028, 4, 17], [2029, 4, 2], [2030, 4, 22]]) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    assert.match(cell(render(year, month), date), /class="holiday-label"[^>]*>Ostermontag/);
    assert.match(cell(render(year, 1), `${year}-01-01`), /class="holiday-label"[^>]*>Neujahr/);
    assert.match(cell(render(year, 11), `${year}-11-01`), /class="holiday-label"[^>]*>Allerheiligen/);
  }
  assert.equal(JSON.stringify(fixtures), before);
  assert.ok(requests.length > 0);
  assert.ok(requests.every(({ method }) => method === "GET"));
});
