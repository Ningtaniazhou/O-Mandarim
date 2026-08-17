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

test("server-renders the Chinese O Mandarim experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>《满大人》· 交互叙事<\/title>/i);
  assert.match(html, /《满大人》/);
  assert.match(html, /序章/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the complete narrative and its visual assets", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /合上的书页/);
  assert.match(page, /里斯本俯首/);
  assert.match(page, /荒街上的黑衣人/);
  assert.match(page, /空无一人/);
  assert.match(page, /留给世人的话/);
  assert.match(page, /狄鑫福/);
  assert.match(page, /卡米洛夫/);
  assert.match(page, /Tien-Hó/);
  assert.match(page, /荒野上的路/);
  assert.match(page, /马匹已经跑得很远/);
  assert.match(page, /朱利奥神父/);
  assert.match(page, /神父捡到的弃婴/);
  assert.match(page, /狄鑫福和他的纸鸢始终没有再出现/);
  assert.match(page, /好吧，狄鑫福已经满意了/);
  assert.match(page, /地址之谜/);
  assert.match(page, /狄鑫福是在返程的船上突然重新出现的/);
  assert.doesNotMatch(page, /狄鑫福 · \{place\}/);
  assert.match(page, /来吧，特奥多罗，我的朋友/);
  assert.match(page, /No fundo da China existe um mandarim/);
  assert.match(page, /仔细翻阅旧书/);
  assert.match(page, /桌旁传来人声/);
  assert.match(page, /book: \{ act: "第一章 · 旧书", title: "发亮的字句", subtitle: "" \}/);
  assert.match(page, /看见一个秃顶的老头在我的床前俯下身/);
  assert.match(page, /<strong>黑蜡封缄的信<\/strong>/);
  assert.match(page, /搬入洛雷托豪宅/);
  assert.match(page, /我无法忽视……/);
  assert.doesNotMatch(page, /if \(stage === "ghost"\) setAvoidance\(""\)/);
  assert.match(page, /横陈在地的尸体却让享乐渐渐失去滋味/);
  assert.doesNotMatch(page, /door-ghost|横陈的黄袍尸身|门后的黄袍/);
  assert.match(page, /音乐、酒宴和彻夜狂欢只能暂时淹没罪疚/);
  assert.match(page, /用成把的金币匆忙办妥准备/);
  assert.match(page, /卡米洛夫派出的翻译萨托在此处迎接/);
  assert.match(page, /佟亲王带来的线索指向北京以北/);
  assert.match(page, /与萨托前往天河村/);
  assert.match(page, /洛雷托的一夜/);
  assert.match(page, /像罪恶的饰物一样从身上甩掉/);
  assert.match(page, /抛下这笔财产/);
  assert.match(page, /nunca mates o Mandarim/);
  assert.match(page, /Uma noite, recolhendo só por uma rua deserta/);
  assert.match(page, /Livra-me das minhas riquezas! Ressuscita o Mandarim!/);
  assert.match(page, /Não pode ser, meu prezado senhor, não pode ser/);
  assert.match(page, /Eu atirei-me aos seus pés numa suplicação abjecta/);
  assert.match(page, /又是他！阴魂不散！/);
  assert.match(page, /乞求/);
  assert.match(page, /supplicated/);
  assert.match(page, /ti-chin-fu-corpse-v3\.png/);
  assert.match(page, /devil-v1\.png/);
  assert.match(page, /bell-v1\.png/);
  assert.match(page, /返回上一页/);
  assert.match(page, /物件摘录/);
  assert.match(page, /进入故事世界/);
  assert.match(page, /返回故事世界/);
  assert.match(page, /一柄摇铃/);
  assert.match(page, /这是什么？/);
  assert.match(page, /还是不看见为好/);
  assert.match(page, /stageMusic/);
  assert.match(page, /handbell/);
  assert.match(page, /bellRung/);
  assert.match(page, /letterDecision/);
  assert.match(page, /collapsePhase/);
  assert.match(page, /bellSequence/);
  assert.match(page, /hasInspectedAll/);
  assert.match(page, /chooseAvoidance/);
  assert.match(page, /chooseCamilloff/);
  assert.match(page, /chooseLetterDecision/);
  assert.match(page, /resetRevisitableStage/);
  assert.match(page, /if \(next === "ghost"\) setAvoidance\(""\)/);
  assert.match(page, /if \(next === "beijing"\) setCamilloff\(""\)/);
  assert.match(page, /if \(next === "tienho"\) setAttackChoice\(""\)/);
  assert.match(page, /if \(next === "letter"\) setLetterDecision\(""\)/);
  assert.match(page, /setAvoidance\(choice\)/);
  assert.match(page, /setCamilloff\(choice\)/);
  assert.match(page, /setLetterDecision\(choice\)/);
  assert.match(page, /unsolved-investigation-v1\.ogg/);
  assert.match(page, /volume: 0\.74/);
  assert.match(page, /西尔维斯特/);
  assert.doesNotMatch(page, /狄青福|开启声音并翻开书页|原创程序化配乐|浏览器实时合成|翻到黄色高亮的书页|一个满大人死了|魔鬼 · 第|入住洛雷托的宫殿|看向镜子里的第四个人|小说直到上海才重新标出地点|哥萨克与译员萨托|原作让“后代”|选择“再寻找一次”并没有制造|特奥多罗只在脑中排演|原作没有给特奥多罗|原作提供的稳定出口|终局并不是“享受或悔恨”的二选一|告诫因此也沾染了自我开脱/);

  await Promise.all([
    access(new URL("../public/lisbon-room-v3.png", import.meta.url)),
    access(new URL("../public/palace-ghost.png", import.meta.url)),
    access(new URL("../public/east-journey.png", import.meta.url)),
    access(new URL("../public/pequim-embassy-v2.png", import.meta.url)),
    access(new URL("../public/intro-cover-v1.png", import.meta.url)),
    access(new URL("../public/inheritance-messenger-v1.png", import.meta.url)),
    access(new URL("../public/tienho-inn-v3.png", import.meta.url)),
    access(new URL("../public/mission-cloister-v4.png", import.meta.url)),
    access(new URL("../public/mission-cloister-v5.png", import.meta.url)),
    access(new URL("../public/wilderness-v1.png", import.meta.url)),
    access(new URL("../public/renounce-room-v1.png", import.meta.url)),
    access(new URL("../public/teodoro-desk-v1.png", import.meta.url)),
    access(new URL("../public/loreto-restored-v1.png", import.meta.url)),
    access(new URL("../public/devil-street-v1.png", import.meta.url)),
    access(new URL("../public/devil-vanished-v1.png", import.meta.url)),
    access(new URL("../public/testament-ending-v1.png", import.meta.url)),
    access(new URL("../public/ti-chin-fu-corpse-v3.png", import.meta.url)),
    access(new URL("../public/devil-v1.png", import.meta.url)),
    access(new URL("../public/bell-v1.png", import.meta.url)),
    access(new URL("../public/audio/unsolved-investigation-v1.ogg", import.meta.url)),
    access(new URL("../public/audio/apparitions-ball.mp3", import.meta.url)),
    access(new URL("../public/audio/i-swear-i-saw-it.ogg", import.meta.url)),
    access(new URL("../public/audio/the-journey-begins.ogg", import.meta.url)),
    access(new URL("../public/audio/pursuit.mp3", import.meta.url)),
    access(new URL("../public/audio/contemplation.mp3", import.meta.url)),
  ]);
});
