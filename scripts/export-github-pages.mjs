import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(projectRoot, "dist", "client");
const outputDir = path.join(projectRoot, "dist", "github-pages");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("static-export", `${Date.now()}`);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(clientDir, outputDir, { recursive: true });

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://ningtaniazhou.github.io/", {
    headers: { accept: "text/html" },
  }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static page render failed with HTTP ${response.status}`);
}

const html = (await response.text()).replaceAll(
  "http://localhost:3000",
  "https://ningtaniazhou.github.io",
);
if (!html.includes("《满大人》") || !html.includes("/_next/static/")) {
  throw new Error("Static page render is missing the game markup or client assets");
}

await writeFile(path.join(outputDir, "index.html"), html);
await writeFile(path.join(outputDir, ".nojekyll"), "");

const exported = await readFile(path.join(outputDir, "index.html"), "utf8");
if (!exported.includes("https://ningtaniazhou.github.io/og.webp")) {
  throw new Error("Static social metadata does not point at the GitHub Pages domain");
}

console.log(`GitHub Pages export ready at ${outputDir}`);
