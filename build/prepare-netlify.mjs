import { copyFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
await mkdir(new URL("netlify/", root), { recursive: true });
await copyFile(
  new URL("public/verwaltung.html", root),
  new URL("netlify/admin-calendar.html", root),
);
console.log("Netlify admin calendar prepared.");
