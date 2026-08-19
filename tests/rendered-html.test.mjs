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
  assert.doesNotMatch(html, /序章/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the complete narrative and its visual assets", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const curtain = await readFile(new URL("../app/beijing-curtain-scene.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /合上的书页/);
  assert.match(page, /里斯本俯首/);
  assert.match(page, /荒街上的黑衣人/);
  assert.match(page, /空无一人/);
  assert.match(page, /留给世人的话/);
  assert.match(page, /狄鑫福/);
  assert.match(page, /卡米洛夫/);
  assert.match(page, /轿中北京/);
  assert.match(page, /城门之前/);
  assert.match(page, /红绸轿子/);
  assert.match(page, /紫禁城/);
  assert.doesNotMatch(page, /鞑靼城/);
  assert.match(page, /老百姓的街巷/);
  assert.doesNotMatch(page, /华人街区/);
  assert.match(page, /将军夫人的客厅/);
  assert.match(page, /王国内政部/);
  assert.match(page, /圣克拉拉旧货市场/);
  assert.match(page, /将军夫人的客厅/);
  assert.match(page, /卡米洛夫的建议/);
  assert.match(page, /前往卡米洛夫府邸/);
  assert.match(page, /第二天去见卡米洛夫将军/);
  assert.match(page, /自从来到北京，我再没有看见狄鑫福与纸鸢/);
  assert.match(page, /beijingDestination/);
  assert.match(page, /beijingVisited/);
  assert.match(page, /generalaTopics/);
  assert.match(curtain, /起轿/);
  assert.doesNotMatch(page, /beijingDismounted/);
  assert.match(page, /pequim-litter-interior-v1\.png/);
  assert.doesNotMatch(page, /beijingDrift|reposeInterrupted|文人服饰|隐逸之亭/);
  assert.match(page, /Tien-Hó/);
  assert.match(page, /荒野上的路/);
  assert.match(page, /马匹已经跑得很远/);
  assert.match(page, /朱利奥神父/);
  assert.match(page, /神父捡到的弃婴/);
  assert.match(page, /狄鑫福和他的纸鸢始终没有再出现/);
  assert.match(page, /好吧，狄鑫福已经满意了/);
  assert.match(page, /地址之谜/);
  assert.match(page, /狄鑫福是在返程的船上突然重新出现的/);
  assert.match(page, /return: "\/lisbon-room-v3\.png"/);
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
  assert.match(page, /线索指向北京以北、越过长城后的天河村/);
  assert.match(page, /告别卡米洛夫，前往天河村/);
  assert.match(page, /外国魔鬼/);
  assert.match(page, /从官府到乞丐/);
  assert.match(page, /地方官也在暗中主持这场抢掠/);
  assert.match(page, /洛雷托的一夜/);
  assert.match(page, /像罪恶的饰物一样从身上甩掉/);
  assert.match(page, /抛下这笔财产/);
  assert.match(page, /nunca mates o Mandarim/);
  assert.match(page, /<button className="final-book-action" onClick=\{turnFinalBookCover\}>翻开<\/button>/);
  assert.match(page, /<button className="final-book-action" onClick=\{closeFinalBook\}>合上<\/button>/);
  assert.doesNotMatch(page, /翻开封面|《满大人》· 扉页/);
  assert.match(page, /Uma noite, recolhendo só por uma rua deserta/);
  assert.match(page, /Livra-me das minhas riquezas! Ressuscita o Mandarim!/);
  assert.match(page, /Não pode ser, meu prezado senhor, não pode ser/);
  assert.match(page, /Eu atirei-me aos seus pés numa suplicação abjecta/);
  assert.match(page, /又是他！阴魂不散！/);
  assert.match(page, /乞求/);
  assert.match(page, /title: "无法撤销的交易", subtitle: ""/);
  assert.doesNotMatch(page, /title: "不能"/);
  assert.match(page, /supplicated/);
  assert.match(page, /ti-chin-fu-corpse-v3\.png/);
  assert.match(page, /devil-v1\.png/);
  assert.match(page, /bell-v1\.png/);
  assert.match(page, /返回上一页/);
  assert.match(page, /物件摘录/);
  assert.match(page, /进入故事世界/);
  assert.match(page, /返回故事世界/);
  assert.match(page, /一柄摇铃/);
  assert.match(page, /className=\{`corpse-toggle \$\{revealed \? "is-dismiss" : "is-question"\}`\}/);
  assert.match(page, /\{revealed \? "×" : "\?"\}/);
  assert.match(page, /显出狄鑫福的尸体/);
  assert.match(page, /让狄鑫福退回虚影/);
  assert.doesNotMatch(page, /这是什么？|还是不看见为好/);
  assert.match(page, /const corpsePresenceStages: Stage\[\] = \["ghost", "return", "reckoning", "renounce", "prison", "devilReturn", "devilDialogue", "supplication", "testament"\]/);
  assert.doesNotMatch(page, /LateCorpsePresence|late-ti-corpse/);
  assert.match(page, /stageMusic/);
  assert.match(page, /handbell/);
  assert.match(page, /bellRung/);
  assert.match(page, /letterDecision/);
  assert.match(page, /collapsePhase/);
  assert.match(page, /bellSequence/);
  assert.match(styles, /bell-cinematic-swing/);
  assert.match(styles, /corpse-question-escalate 9s/);
  assert.match(styles, /@keyframes corpse-question-escalate/);
  assert.match(styles, /\.stage-devilReturn \.ti-figure/);
  assert.match(styles, /\.stage-prison \.ti-figure/);
  assert.match(styles, /\.stage-supplication \.ti-figure/);
  assert.match(styles, /\.stage-testament \.ti-figure/);
  assert.doesNotMatch(styles, /late-ti-corpse/);
  assert.doesNotMatch(styles, /bell-cinematic-grow/);
  assert.doesNotMatch(styles, /scale\(7\.6\)/);
  assert.doesNotMatch(styles, /\.devil-final span\s*\{[^}]*font:\s*700 9px/s);
  assert.match(page, /hasInspectedAll/);
  assert.match(page, /chooseAvoidance/);
  assert.match(page, /chooseCamilloff/);
  assert.match(page, /chooseLetterDecision/);
  assert.match(page, /resetRevisitableStage/);
  assert.match(page, /if \(next === "ghost"\) setAvoidance\(""\)/);
  assert.match(page, /if \(next === "beijing"\) \{/);
  assert.match(page, /setBeijingVisited\(\[\]\)/);
  assert.match(page, /if \(next === "tienho"\) setAttackChoice\(""\)/);
  assert.match(page, /if \(next === "letter"\) setLetterDecision\(""\)/);
  assert.match(page, /setAvoidance\(choice\)/);
  assert.match(page, /setCamilloff\(choice\)/);
  assert.match(page, /setLetterDecision\(choice\)/);
  assert.match(page, /unsolved-investigation-v1\.ogg/);
  assert.match(page, /volume: 0\.74/);
  assert.match(page, /西尔维斯特/);
  assert.doesNotMatch(page, /setInheritanceOpened\(true\); setGhostRevealed\(true\)/);
  assert.doesNotMatch(page, /stage === "inheritance" && inheritanceOpened/);
  assert.match(page, /拆开卡米洛夫的信/);
  assert.doesNotMatch(page, /拆开卡米洛夫的附言/);
  assert.match(page, /这封信里居然涉及两个死去的狄鑫福，两个在贫困中挣扎的家庭/);
  assert.match(page, /回到洛雷托 <span>→<\/span>/);
  assert.doesNotMatch(page, /回到洛雷托写下遗嘱/);
  assert.match(page, /testament-study-v2\.png/);
  assert.match(page, /特奥多罗最后的意愿/);
  assert.match(page, /悉数遗赠予魔鬼/);
  assert.doesNotMatch(page, /《满大人》· 扉页/);
  assert.match(page, /只有双手每日挣来的面包才真正甘美：千万别杀害满大人/);
  assert.match(styles, /will-unfold/);
  assert.match(styles, /book-rise/);
  assert.match(styles, /page-open/);
  assert.doesNotMatch(page, /狄青福|开启声音并翻开书页|原创程序化配乐|浏览器实时合成|翻到黄色高亮的书页|一个满大人死了|魔鬼 · 第|入住洛雷托的宫殿|看向镜子里的第四个人|小说直到上海才重新标出地点|哥萨克与译员萨托|原作让“后代”|选择“再寻找一次”并没有制造|特奥多罗只在脑中排演|原作没有给特奥多罗|原作提供的稳定出口|终局并不是“享受或悔恨”的二选一|告诫因此也沾染了自我开脱/);

  await Promise.all([
    access(new URL("../public/lisbon-room-v3.png", import.meta.url)),
    access(new URL("../public/palace-ghost.png", import.meta.url)),
    access(new URL("../public/east-journey.png", import.meta.url)),
    access(new URL("../public/pequim-embassy-v2.png", import.meta.url)),
    access(new URL("../public/pequim-repose-v1.png", import.meta.url)),
    access(new URL("../public/pequim-arrival-v1.png", import.meta.url)),
    access(new URL("../public/pequim-tartar-city-v1.png", import.meta.url)),
    access(new URL("../public/pequim-chinese-quarter-v1.png", import.meta.url)),
    access(new URL("../public/pequim-litter-interior-v1.png", import.meta.url)),
    access(new URL("../public/ministry-office-awake-v1.png", import.meta.url)),
    access(new URL("../public/ministry-office-dozing-v1.png", import.meta.url)),
    access(new URL("../public/feira-da-ladra-v1.png", import.meta.url)),
    access(new URL("../public/camilloff-meeting-v1.png", import.meta.url)),
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
    access(new URL("../public/testament-study-v2.png", import.meta.url)),
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
