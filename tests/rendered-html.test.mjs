import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the O Mandarim experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>O Mandarim · 交互叙事<\/title>/i);
  assert.match(html, /O MANDARIM/);
  assert.match(html, /TI-LI-TIM/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the complete narrative and its visual assets", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /A Página Fechada/);
  assert.match(page, /O Palácio-Prisão/);
  assert.match(page, /Ti Chin-Fu/);
  assert.match(page, /Camilloff/);
  assert.match(page, /Tien-Hó/);

  await Promise.all([
    access(new URL("../public/lisbon-room.png", import.meta.url)),
    access(new URL("../public/palace-ghost.png", import.meta.url)),
    access(new URL("../public/east-journey.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
