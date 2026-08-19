import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("connects departure, four-day intercut, and return map", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const intercut = await readFile(new URL("../app/camilloff-intercut.tsx", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/camilloff-return-map.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /go\("camilloffIntercut"\)/);
  assert.match(page, /onComplete=\{\(\) => go\("camilloffReturn"\)\}/);
  assert.match(page, /allBeijingStopsVisited[\s\S]*go\("camilloffDeparture"\)/);
  assert.match(page, /"confession" \| "briefing" \| "leaving" \| "gone"/);
  assert.match(page, /轿游结束后，我回到卡米洛夫府邸/);
  assert.match(page, /Faça uma coisa\. Procure a família de Ti Chin-Fu/);
  assert.match(page, /第二天清早/);
  assert.doesNotMatch(page, /camilloffSalon|camilloffMeeting|generalaTopics|chooseCamilloff/);
  assert.doesNotMatch(page, /将军夫人的客厅|卡米洛夫的建议/);
  assert.match(page, /camilloffDeparture: musicCues\.oriental/);
  assert.match(page, /camilloffIntercut: musicCues\.oriental/);
  assert.match(page, /camilloffReturn: musicCues\.oriental/);
  assert.match(intercut, /印章与茶杯/);
  assert.match(intercut, /名单与扇子/);
  assert.match(intercut, /门槛与门扉/);
  assert.match(intercut, /消息与痕迹/);
  assert.match(intercut, /if \(progress >= 1\)/);
  assert.match(intercut, /watchAdvanced\.current = true;[\s\S]*advanceDay\(\);/);
  assert.match(intercut, /一只浅色手套仍搭在我座椅旁/);
  assert.match(map, /看向桌角的女士手套/);
  assert.match(map, /mapRoutes\.length/);
  assert.match(map, /const handDockPositions = \[/);
  assert.match(map, /\[30, 60, 2\]/);
  assert.match(map, /\[93, 18, -4\]/);
  assert.match(map, /handDockPositions\[mapStep\]/);
  assert.match(styles, /\.intercut-card\.is-yamen/);
  assert.match(styles, /watch-hand-invitation/);
  assert.match(styles, /\.space-globe \{[\s\S]*width: 84px;[\s\S]*height: 84px;/);
  assert.match(styles, /\.time-watch \{[\s\S]*width: 75px;[\s\S]*height: 84px;/);
  assert.match(styles, /repeating-conic-gradient\(from -1deg/);
  assert.match(styles, /\.watch-face::before/);
  assert.match(styles, /\.space-globe::before/);
  assert.match(styles, /width: min\(31%, 326px\)/);
  assert.match(styles, /\.departure-confession/);
  assert.doesNotMatch(styles, /stage-camilloffSalon|stage-camilloffMeeting/);

  await Promise.all(
    [1, 2, 3, 4].flatMap((day) => ["mansion", "yamen"].map((place) =>
      access(new URL(`../public/camilloff-day${day}-${place}.png`, import.meta.url)),
    )),
  );
});
