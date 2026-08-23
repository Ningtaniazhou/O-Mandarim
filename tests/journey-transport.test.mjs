import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("shows the five transport stages from Lisbon to Beijing", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /label: "火车"/);
  assert.match(page, /“锡兰号”邮船/);
  assert.match(page, /罗素公司小轮船/);
  assert.match(page, /平底船/);
  assert.match(page, /满洲小马/);
  assert.match(page, /route-transport-legend/);
  assert.doesNotMatch(page, /className="route-ship"/);
  assert.doesNotMatch(page, /下一程.*routeTransports/);
  assert.doesNotMatch(page, /<small>\{transport\.label\}<\/small>/);

  assert.match(styles, /journey-transport-train-v1\.webp/);
  assert.match(styles, /journey-transport-mail-steamer-v1\.webp/);
  assert.match(styles, /journey-transport-river-steamer-v1\.webp/);
  assert.match(styles, /journey-transport-flatboat-v1\.webp/);
  assert.match(styles, /journey-transport-pony-v1\.webp/);
  assert.match(styles, /transport-mail-steamer/);
  assert.match(styles, /transport-river-steamer/);
  assert.match(styles, /transport-flatboat/);
  assert.match(styles, /transport-pony/);

  await Promise.all([
    "train",
    "mail-steamer",
    "river-steamer",
    "flatboat",
    "pony",
  ].map((name) => access(new URL(`../public/journey-transport-${name}-v1.webp`, import.meta.url))));
});
