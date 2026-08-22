import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("rescues the ministry documents, dreams, and room focus into the main story", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /关于走廊灯油定额之呈报/);
  assert.match(page, /公文纸左侧页边距统一办法/);
  assert.match(page, /雨伞架编号复核清册/);
  assert.match(page, /officeDocumentsRead\.length === officeDocuments\.length && officeDozed/);
  assert.match(page, /officeDreamsBursting/);
  assert.match(page, />下班 <span>→<\/span>/);
  assert.match(page, /三份公文均已抄写完毕/);
  assert.match(page, /还是不看为好/);
  assert.doesNotMatch(page, /展开桌上的公文|轻点戳破梦境|读完三份公文，并至少做过一次白日梦|让房间自己说话/);

  assert.match(styles, /url\("\/dream-cloud\.png"\)/);
  assert.match(styles, /@keyframes office-dream-burst/);
  assert.match(styles, /\.office-document-hotspots/);
  assert.match(styles, /\.stage-room \.scene-hotspot:nth-child\(2\)/);

  await access(new URL("../public/dream-cloud.png", import.meta.url));
});
