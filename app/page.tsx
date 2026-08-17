"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "intro"
  | "room"
  | "book"
  | "bell"
  | "refusalEnding"
  | "inheritance"
  | "luxury"
  | "ghost"
  | "map"
  | "beijing"
  | "tienho"
  | "mission"
  | "letter"
  | "return"
  | "renounce"
  | "humiliation"
  | "prison";

type HotspotItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  translation: string;
};

const routes = [
  ["里斯本", "你离开宫殿；死者先一步登船。"],
  ["马赛", "特奥多罗包下整艘名为“锡兰号”的邮船，从马赛向东方启航。"],
  ["上海", "“锡兰号”的航行平静而单调；小说直到上海才重新标出地点。"],
  ["天津", "从上海沿河乘罗素公司的小轮船抵达天津。"],
  ["通州", "卡米洛夫派出的哥萨克与译员萨托在这里迎接。"],
  ["北京", "城门在最后一道夕阳离开天坛塔楼时关闭。"],
];

const stageInfo: Record<Stage, { act: string; title: string; subtitle: string }> = {
  intro: { act: "序章", title: "未响的铃", subtitle: "一声轻响" },
  room: { act: "第一章 · 里斯本", title: "特奥多罗的房间", subtitle: "一个贫穷的小职员" },
  book: { act: "第一章 · 旧书", title: "发亮的字句", subtitle: "《灵魂的裂缝》" },
  bell: { act: "第一章 · 诱惑", title: "魔鬼的提议", subtitle: "桌上的铃" },
  refusalEnding: { act: "特别结局", title: "合上的书页", subtitle: "拒绝诱惑" },
  inheritance: { act: "第二章 · 财富", title: "陌生人的遗产", subtitle: "" },
  luxury: { act: "第三章 · 黄金", title: "洛雷托的盛宴", subtitle: "百万富翁" },
  ghost: { act: "第三章 · 亡者", title: "宴席上的客人", subtitle: "狄鑫福" },
  map: { act: "第四章 · 远行", title: "向东方去", subtitle: "从里斯本到北京" },
  beijing: { act: "第五章 · 北京", title: "卡米洛夫的办法", subtitle: "赎罪的官僚程序" },
  tienho: { act: "第六章 · 远东", title: "天河村", subtitle: "客栈外的人群" },
  mission: { act: "第六章 · 远东", title: "修道院的清晨", subtitle: "获救，却未获宽恕" },
  letter: { act: "第七章 · 远东", title: "地址不存在", subtitle: "消失的家族" },
  return: { act: "第七章 · 返航", title: "死者同行", subtitle: "从中国返回欧洲" },
  renounce: { act: "第八章 · 里斯本", title: "放弃一切", subtitle: "重返贫穷" },
  humiliation: { act: "第八章 · 里斯本", title: "贫穷的代价", subtitle: "社会的惩罚" },
  prison: { act: "正篇结局", title: "奢华的牢笼", subtitle: "无法撤销的交易" },
};

const musicCues = {
  mystery: { src: "/audio/mystery-dark.mp3", volume: 0.24 },
  ballroom: { src: "/audio/apparitions-ball.mp3", volume: 0.2 },
  haunting: { src: "/audio/i-swear-i-saw-it.ogg", volume: 0.23 },
  journey: { src: "/audio/the-journey-begins.ogg", volume: 0.22 },
  pursuit: { src: "/audio/pursuit.mp3", volume: 0.2 },
  contemplation: { src: "/audio/contemplation.mp3", volume: 0.25 },
} as const;

const stageMusic: Record<Stage, { src: string; volume: number }> = {
  intro: musicCues.mystery,
  room: musicCues.mystery,
  book: musicCues.mystery,
  bell: musicCues.mystery,
  refusalEnding: musicCues.mystery,
  inheritance: musicCues.ballroom,
  luxury: musicCues.ballroom,
  ghost: musicCues.haunting,
  map: musicCues.journey,
  beijing: musicCues.journey,
  tienho: musicCues.pursuit,
  mission: musicCues.contemplation,
  letter: musicCues.contemplation,
  return: musicCues.haunting,
  renounce: musicCues.haunting,
  humiliation: musicCues.haunting,
  prison: musicCues.haunting,
};

const refusalLines = [
  "你把良心称作原则，不过是因为今晚的价钱还没有说得足够具体。",
  "别急着自豪，我亲爱的先生。饥饿很会替哲学修改措辞。",
];

const sceneHotspots: Partial<Record<Stage, HotspotItem[]>> = {
  room: [
    { id: "lamp", label: "绿色灯罩", x: 5, y: 48, translation: "绿色灯罩在蜡烛周围投下一片半明半暗。" },
    { id: "folio", label: "旧书", x: 24, y: 65, translation: "古老庄严的字体、被虫蛀的黄纸、修道院式的厚重装帧，还有夹在那一页的绿色丝带——都令我着迷！" },
    { id: "bell", label: "铃与法语词典", x: 42, y: 59, translation: "铃安安静静地放在我面前的一本法语词典上。" },
    { id: "lottery", label: "彩票", x: 55, y: 71, translation: "我每晚向悲苦圣母祈求这一切，还购买彩票。" },
    { id: "madonna", label: "圣母像", x: 65, y: 60, translation: "床头挂着一幅悲苦圣母石版画，那是母亲留下的。" },
  ],
  luxury: [
    { id: "gold-bed", label: "金床", x: 63, y: 67, translation: "我的床以铺满錾花金片的床沿闻名欧洲，趣味夸张而野蛮。" },
    { id: "decanter", label: "酒与水晶", x: 78, y: 59, translation: "世上有勃艮第葡萄酒，例如一八五八年的罗曼尼·康帝和一八六一年的香贝丹。" },
    { id: "coins", label: "金币", x: 86, y: 72, translation: "我感到整个世界都在脚下——像一头餍足的狮子般打了个哈欠。" },
    { id: "door-ghost", label: "横陈的黄袍尸身", x: 48, y: 42, translation: "他横卧在门槛，或横陈在金床上——那肥胖的身躯拖着黑辫，穿着黄袍，怀中抱着纸鸢。" },
  ],
  beijing: [
    { id: "robe", label: "文人服饰", x: 25, y: 81, translation: "我从此应当打扮成一个富有的中国文人。" },
    { id: "map", label: "天河村路线图", x: 53, y: 71, translation: "热心的卡米洛夫手持铅笔，已在地图上标出我前往天河村的路线！" },
    { id: "tea", label: "茶具", x: 70, y: 62, translation: "面对这一切，您只有一个‘茶’字可用。太少了。" },
    { id: "dossiers", label: "档案", x: 78, y: 82, translation: "数百名书吏昼夜执笔，在宣纸上写满报告，脸色日渐苍白。" },
    { id: "sabre", label: "卡米洛夫的军刀", x: 86, y: 63, translation: "做一件事吧。去寻找狄鑫福的家人……" },
  ],
  tienho: [
    { id: "arrow", label: "箭与破洞", x: 15, y: 28, translation: "一块石头从我身旁飞来，击穿了窗格上的油纸；随后一支箭呼啸而过。" },
    { id: "money-case", label: "钱袋", x: 25, y: 78, translation: "可是，大人，至少保住您宝贵的性命！" },
    { id: "carts", label: "行李车", x: 61, y: 58, translation: "人群仍不满足，咆哮起来。" },
    { id: "pony", label: "马匹", x: 65, y: 78, translation: "我扑向那匹马，一把抓住它的鬃毛。" },
  ],
  mission: [
    { id: "bandage", label: "绷带", x: 22, y: 80, translation: "两位遣使会神父正慢慢清洗我的耳朵。" },
    { id: "well", label: "井与滑轮", x: 42, y: 45, translation: "井上的滑轮缓慢作响；晨祷的钟声响了起来。" },
    { id: "breviary", label: "《日课经》", x: 66, y: 75, translation: "我把一卷英格兰银行钞票放在他的《日课经》上，那书正翻到《贫穷福音》的一页。" },
    { id: "letter", label: "卡米洛夫的信", x: 83, y: 83, translation: "关于狄鑫福的遗孀和家人，事情弄错了。" },
    { id: "found-child", label: "拾得儿", x: 89, y: 56, translation: "他发现她赤裸着被遗弃在路旁，眼看就要死去。" },
  ],
  renounce: [
    { id: "old-coat", label: "旧外套", x: 68, y: 55, translation: "我穿着一件磨旧的短外套，重新租下马克斯太太家的那个房间。" },
    { id: "copy-paper", label: "抄写纸", x: 34, y: 78, translation: "我弯着背回到机关，请求恢复每月二万雷斯的薪水。" },
    { id: "bank-ledger", label: "银行账簿", x: 51, y: 69, translation: "他的千万财富如今闲置在银行里，原封未动，但事实上仍然属于我！" },
  ],
  humiliation: [
    { id: "newspaper", label: "报纸", x: 55, y: 72, translation: "报纸以胜利般的讥讽嘲弄我的穷困。" },
    { id: "window", label: "里斯本的窗口", x: 12, y: 30, translation: "里斯本毫不迟疑地重新匍匐在我脚下。" },
    { id: "bell-again", label: "仍在桌上的铃", x: 43, y: 59, translation: "把我从财富中解救出来！让满大人复活！把贫穷的安宁还给我！" },
  ],
  prison: [
    { id: "mirror", label: "镜中宴会", x: 80, y: 28, translation: "贵族像面对暴君般亲吻我的手指；教士像供奉偶像般向我献香。" },
    { id: "devil", label: "魔鬼的回答", x: 17, y: 47, translation: "不行，我尊贵的先生，不行……" },
    { id: "testament", label: "遗嘱", x: 67, y: 76, translation: "我在遗嘱中把千万财富留给魔鬼；它们本来就属于他。" },
    { id: "last-page", label: "最后一页", x: 47, y: 77, translation: "永远不要杀死满大人！" },
  ],
};

function useSound() {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const players = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const activePlayer = useRef(0);
  const currentTrack = useRef("");
  const currentVolume = useRef(0.22);
  const fadeFrame = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!context.current) {
      const AudioCtx = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      context.current = new AudioCtx();
      master.current = context.current.createGain();
      master.current.gain.value = 0;
      master.current.connect(context.current.destination);
    }
    void context.current.resume();
    return context.current;
  };

  const ensurePlayers = () => {
    if (typeof window === "undefined") return null;
    if (!players.current[0] || !players.current[1]) {
      players.current = [new Audio(), new Audio()];
      players.current.forEach((player) => {
        if (!player) return;
        player.loop = true;
        player.preload = "auto";
        player.volume = 0;
      });
    }
    return players.current as [HTMLAudioElement, HTMLAudioElement];
  };

  const cancelFade = () => {
    if (fadeFrame.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(fadeFrame.current);
      fadeFrame.current = null;
    }
  };

  const fade = (incoming: HTMLAudioElement, outgoing: HTMLAudioElement | null, target: number, duration = 1200) => {
    cancelFade();
    const started = performance.now();
    const outgoingStart = outgoing?.volume ?? 0;
    const step = (now: number) => {
      const ratio = Math.min((now - started) / duration, 1);
      incoming.volume = target * ratio;
      if (outgoing) outgoing.volume = outgoingStart * (1 - ratio);
      if (ratio < 1) {
        fadeFrame.current = window.requestAnimationFrame(step);
      } else {
        fadeFrame.current = null;
        if (outgoing) {
          outgoing.pause();
          outgoing.currentTime = 0;
        }
      }
    };
    fadeFrame.current = window.requestAnimationFrame(step);
  };

  const playTrack = (src: string, volume: number) => {
    const audioPlayers = ensurePlayers();
    if (!audioPlayers) return;
    currentVolume.current = volume;
    if (currentTrack.current === src) {
      const active = audioPlayers[activePlayer.current];
      if (enabledRef.current && active.paused) {
        void active.play().then(() => fade(active, null, volume, 500)).catch(() => undefined);
      }
      return;
    }

    const outgoing = audioPlayers[activePlayer.current];
    const nextIndex = activePlayer.current === 0 ? 1 : 0;
    const incoming = audioPlayers[nextIndex];
    incoming.pause();
    incoming.src = src;
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.load();
    currentTrack.current = src;
    activePlayer.current = nextIndex;

    if (!enabledRef.current) {
      outgoing.pause();
      return;
    }
    void incoming.play().then(() => fade(incoming, outgoing, volume)).catch(() => undefined);
  };

  const tone = (frequency: number, duration = 0.8, volume = 0.12, delay = 0, type: OscillatorType = "sine") => {
    const ctx = ensure();
    if (!ctx || !master.current || !enabledRef.current) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    oscillator.connect(gain);
    gain.connect(master.current);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.05);
  };

  const bell = () => {
    [523.25, 783.99, 1046.5, 1567.98].forEach((frequency, i) =>
      tone(frequency, 2.8 - i * 0.35, 0.3 / (i + 1), i * 0.025),
    );
  };

  const thud = () => {
    tone(88, 0.32, 0.22);
    tone(55, 0.52, 0.16, 0.08);
  };

  const setAudio = (next: boolean) => {
    const ctx = ensure();
    const audioPlayers = ensurePlayers();
    enabledRef.current = next;
    setEnabled(next);
    if (master.current && ctx) {
      master.current.gain.cancelScheduledValues(ctx.currentTime);
      master.current.gain.setTargetAtTime(next ? 0.72 : 0, ctx.currentTime, 0.04);
    }
    if (!audioPlayers) return;
    const active = audioPlayers[activePlayer.current];
    if (next && active.src) {
      active.volume = 0;
      void active.play().then(() => fade(active, null, currentVolume.current, 650)).catch(() => undefined);
    } else if (!next) {
      cancelFade();
      audioPlayers.forEach((player) => {
        player.pause();
        player.volume = 0;
      });
    }
  };

  const toggle = () => setAudio(!enabledRef.current);
  const enable = () => setAudio(true);

  return { enabled, enable, playTrack, tone, bell, thud, toggle };
}

function TiChinFu({ intensity = 1, revealed, onInspect }: { intensity?: number; revealed: boolean; onInspect: () => void }) {
  return (
    <button
      className={`ti-figure ${revealed ? "is-revealed" : "is-silhouette"}`}
      style={{ "--ti-opacity": String(Math.min(0.28 + intensity * 0.2, 0.94)) } as React.CSSProperties}
      onClick={onInspect}
      aria-label={revealed ? "还是不看见为好" : "这是什么？"}
    >
      {/* A raw img keeps the transparent corpse cutout portable in the edge build. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ti-chin-fu-corpse-v3.png" alt="狄鑫福身穿黄绸、仰卧而死，冷臂抱着纸鸢" />
      <span>{revealed ? "还是不看见为好" : "这是什么？"}</span>
    </button>
  );
}

function DevilFigure() {
  return (
    <figure className="devil-figure" aria-label="魔鬼：黑衣、高礼帽、黑手套，双手按在雨伞柄上">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/devil-v1.png" alt="身穿黑衣、戴高礼帽、双手戴黑手套并按着雨伞柄的魔鬼" />
    </figure>
  );
}

function BilingualQuote({ pt, zh, compact = false, className = "" }: { pt: string; zh: string; compact?: boolean; className?: string }) {
  return (
    <blockquote className={`source-inline bilingual-quote ${compact ? "compact" : ""} ${className}`}>
      <span lang="pt">“{pt}”</span>
      <span className="quote-translation">“{zh}”</span>
    </blockquote>
  );
}

function SourceSlip({ item }: { item: HotspotItem }) {
  return (
    <aside className="source-slip" aria-live="polite">
      <div><span>物件摘录</span><b>{item.label}</b></div>
      <blockquote>“{item.translation}”</blockquote>
    </aside>
  );
}

function HotspotLayer({ items, visited, active, onSelect }: { items: HotspotItem[]; visited: string[]; active?: string; onSelect: (item: HotspotItem) => void }) {
  return (
    <div className="hotspot-layer" aria-label="场景中的可检查物件">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={`scene-hotspot ${visited.includes(item.id) ? "is-visited" : ""} ${active === item.id ? "is-active" : ""}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          onClick={() => onSelect(item)}
          aria-label={`检查：${item.label}`}
        >
          <i>{String(index + 1).padStart(2, "0")}</i><span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [transitioning, setTransitioning] = useState(false);
  const [roomFinds, setRoomFinds] = useState<string[]>([]);
  const [refusals, setRefusals] = useState(0);
  const [inheritanceOpened, setInheritanceOpened] = useState(false);
  const [chosenLuxuries, setChosenLuxuries] = useState<string[]>([]);
  const [avoidance, setAvoidance] = useState("");
  const [routeIndex, setRouteIndex] = useState(0);
  const [camilloff, setCamilloff] = useState("");
  const [attackChoice, setAttackChoice] = useState("");
  const [searchAgain, setSearchAgain] = useState(false);
  const [letterClues, setLetterClues] = useState<string[]>([]);
  const [returnStops, setReturnStops] = useState<string[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [visualFinds, setVisualFinds] = useState<Partial<Record<Stage, string[]>>>({});
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [ghostRevealed, setGhostRevealed] = useState(false);
  const [stageHistory, setStageHistory] = useState<Stage[]>([]);
  const sound = useSound();

  const info = stageInfo[stage];
  const isEast = ["map", "beijing", "tienho", "mission", "letter"].includes(stage);
  const backgrounds: Record<Stage, string> = {
    intro: "/lisbon-room-v2.png",
    room: "/lisbon-room-v2.png",
    book: "/lisbon-room-v2.png",
    bell: "/lisbon-room-v2.png",
    refusalEnding: "/lisbon-room-v2.png",
    inheritance: "/lisbon-room-v2.png",
    luxury: "/palace-ghost.png",
    ghost: "/palace-ghost.png",
    map: "/east-journey.png",
    beijing: "/pequim-embassy-v2.png",
    tienho: "/tienho-inn-v2.png",
    mission: "/mission-cloister-v2.png",
    letter: "/mission-cloister-v2.png",
    return: "/east-journey.png",
    renounce: "/lisbon-room-v2.png",
    humiliation: "/lisbon-room-v2.png",
    prison: "/palace-ghost.png",
  };
  const background = backgrounds[stage];
  const ghostIntensity = stage === "inheritance" && inheritanceOpened ? 1 : stage === "luxury" ? chosenLuxuries.length : ["ghost", "return", "renounce", "humiliation", "prison"].includes(stage) ? 3 : 0;
  const currentHotspots = sceneHotspots[stage] ?? [];
  const currentVisited = visualFinds[stage] ?? [];

  const go = (next: Stage) => {
    setTransitioning(true);
    setStageHistory((history) => [...history, stage]);
    window.setTimeout(() => {
      setStage(next);
      setSelectedHotspot(null);
      setGhostRevealed(false);
      setTransitioning(false);
    }, 280);
  };

  const goBack = () => {
    const previous = stageHistory.at(-1);
    if (!previous) return;
    setTransitioning(true);
    setStageHistory((history) => history.slice(0, -1));
    window.setTimeout(() => {
      setStage(previous);
      setSelectedHotspot(null);
      setGhostRevealed(false);
      setTransitioning(false);
    }, 280);
  };

  const reset = () => {
    setStage("intro");
    setRoomFinds([]);
    setRefusals(0);
    setInheritanceOpened(false);
    setChosenLuxuries([]);
    setAvoidance("");
    setRouteIndex(0);
    setCamilloff("");
    setAttackChoice("");
    setSearchAgain(false);
    setLetterClues([]);
    setReturnStops([]);
    setVisualFinds({});
    setSelectedHotspot(null);
    setGhostRevealed(false);
    setStageHistory([]);
  };

  const progress = useMemo(() => {
    const order: Stage[] = ["intro", "room", "book", "bell", "inheritance", "luxury", "ghost", "map", "beijing", "tienho", "mission", "letter", "return", "renounce", "humiliation", "prison"];
    const value = order.indexOf(stage);
    return Math.max(2, ((value < 0 ? 2 : value + 1) / order.length) * 100);
  }, [stage]);

  useEffect(() => {
    const cue = stageMusic[stage];
    sound.playTrack(cue.src, cue.volume);
    // Track transitions follow narrative stages; the sound controller persists between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const inspectHotspot = (item: HotspotItem) => {
    const existing = visualFinds[stage] ?? [];
    if (!existing.includes(item.id)) {
      setVisualFinds({ ...visualFinds, [stage]: [...existing, item.id] });
      if (stage === "room") setRoomFinds([...roomFinds, item.id]);
      if (stage === "luxury") setChosenLuxuries([...chosenLuxuries, item.id]);
    }
    setSelectedHotspot(item);
    sound.tone(246.94 + existing.length * 18, 0.55, 0.12, 0, "triangle");
  };

  const refuse = () => {
    sound.tone(122 - refusals * 12, 0.8, 0.08);
    if (refusals >= 2) {
      setRefusals(3);
      go("refusalEnding");
    } else {
      setRefusals(refusals + 1);
    }
  };

  const ringBell = () => {
    sound.bell();
    go("inheritance");
  };

  const chooseAttack = (choice: string) => {
    setAttackChoice(choice);
    setShake(true);
    sound.thud();
    window.setTimeout(() => setShake(false), 650);
  };

  return (
    <main className={`game-shell stage-${stage} ${transitioning ? "is-transitioning" : ""} ${shake ? "is-shaking" : ""}`}>
      <div className="scene-image" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      <div className="scene-vignette" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />

      <header className="topbar">
        <div className="navigation-actions">
          <button className="wordmark" onClick={reset} aria-label="回到游戏封面">《满大人》<span>· 交互叙事</span></button>
          {stageHistory.length > 0 && <button className="back-button" onClick={goBack}>← 返回上一页</button>}
        </div>
        <div className="top-actions">
          <button className={`sound-button ${sound.enabled ? "is-on" : ""}`} onClick={sound.toggle} aria-label={sound.enabled ? "关闭音乐和音效" : "打开音乐和音效"} title={sound.enabled ? "关闭音乐和音效" : "打开音乐和音效"}>
            <span aria-hidden="true">{sound.enabled ? "♪" : "♪̸"}</span><b>{sound.enabled ? "声音：开" : "开启声音"}</b>
          </button>
          <button className="icon-button" onClick={() => setInfoOpen(true)} aria-label="作品说明" title="作品说明">i</button>
        </div>
      </header>

      {stage !== "intro" && (
        <div className="progress-track" aria-label={`故事进度 ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {currentHotspots.length > 0 && (
        <HotspotLayer items={currentHotspots} visited={currentVisited} active={selectedHotspot?.id} onSelect={inspectHotspot} />
      )}

      <section className={`scene-card ${isEast ? "scene-card-east" : ""}`} aria-live="polite">
        <div className="scene-kicker">{info.act}</div>
        <h1>{stage === "intro" ? "《满大人》" : info.title}</h1>
        {info.subtitle && <div className="scene-pt">{info.subtitle}</div>}
        {selectedHotspot && <SourceSlip item={selectedHotspot} />}

        {stage === "intro" && (
          <div className="intro-content">
            <p className="lede">一只铃，一条从里斯本通往北京的航线，<br />以及一笔永远无法还清的债。</p>
            <button className="primary-action bell-action" onClick={() => { sound.enable(); go("room"); }}>
              <span>翻开书页</span>
            </button>
            <p className="edition-note">根据埃萨·德·凯罗斯的小说改编 · 中文交互版</p>
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body">
            <BilingualQuote pt="Eu chamo-me Teodoro — e fui amanuense do Ministério do Reino." zh="我叫特奥多罗——曾是王国内政部的一名抄写员。" />
            <p>每周，特奥多罗弯着背替国家誊写恭敬的公文；每月二万雷斯。夜晚，他回到孔塞桑巷一百零六号，让祷告、彩票和旧书替自己想象幸福。</p>
            <div className="hotspot-index">
              {(sceneHotspots.room ?? []).map((item) => (
                <button key={item.id} className={roomFinds.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{roomFinds.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {roomFinds.length >= 3 && (
              <button className="primary-action" onClick={() => go("book")}>仔细翻阅旧书 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "book" && (
          <div className="scene-body book-scene">
            <article className="book-leaf featured-book-page">
              <span>《灵魂的裂缝》</span>
              <blockquote lang="pt">«No fundo da China existe um mandarim mais rico que todos os reis de que a fábula ou a história contam. Dele nada conheces, nem o nome, nem o semblante, nem a seda de que se veste. Para que tu herdes os seus cabedais infindáveis, basta que toques essa campainha, posta a teu lado, sobre um livro. Ele soltará apenas um suspiro, nesses confins da Mongólia. Será então um cadáver: e tu verás a teus pés mais ouro do que pode sonhar a ambição de um avaro. Tu, que me lês e és um homem mortal, tocarás tu a campainha?»</blockquote>
              <p>“中国深处有一个满大人，比传说或历史中的所有国王都更富有。你对他一无所知：不知道他的名字、容貌，也不知道他身穿怎样的绸缎。要继承他无穷无尽的财产，只须摇响放在你身旁一本书上的这只铃。他只会在遥远的蒙古边地发出一声叹息。随后他便成为一具尸体，而你脚下的黄金将多得超出守财奴的野心所能梦想。正在读我的你，也是一个凡人——你会摇响铃吗？”</p>
            </article>
            <button className="primary-action" onClick={() => { sound.tone(164.81, 0.8, 0.08, 0, "triangle"); go("bell"); }}>听见桌子另一侧的声音 <span>→</span></button>
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <div className="devil-dialogue-card">
              <span>魔鬼</span>
              <p className="devil-final-line">“来吧，特奥多罗，我的朋友，伸出手来，摇响铃，做个强者！”</p>
            </div>
            {refusals > 0 && refusals < 3 && (
              <div className="devil-reply">
                <span>魔鬼</span>
                <p>“{refusalLines[refusals - 1]}”</p>
              </div>
            )}
            <div className="bell-choice">
              <button className="bell-object" onClick={ringBell} aria-label="摇铃">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bell-v1.png" alt="一只精致的十九世纪黄铜手铃" />
              </button>
              <div className="choice-stack">
                <button className="choice-button dangerous" onClick={ringBell}><span>摇铃</span></button>
                <button className="choice-button" onClick={refuse}><span>拒绝</span></button>
              </div>
            </div>
          </div>
        )}

        {stage === "refusalEnding" && (
          <div className="scene-body ending-body refusal-body">
            <div className="ending-mark">I</div>
            <p className="ending-label">特别结局 · 合上的书页</p>
            <blockquote className="ending-quote">“好极了，我亲爱的朋友。你没有摇铃。你保住了良心——也保住了贫困。合上书吧；明天我们再谈谈它们各自的价钱。”</blockquote>
            <p className="original-note">魔鬼退回页缝。你赢得了今晚；他拥有所有明天。<br />（以上为游戏原创台词，并非艾萨原文。）</p>
            <button className="primary-action" onClick={reset}>重新打开书页</button>
          </div>
        )}

        {stage === "inheritance" && (
          <div className="scene-body">
            {!inheritanceOpened ? (
              <div className="sealed-letter">
                <button onClick={() => { setInheritanceOpened(true); sound.tone(329.63, 0.9, 0.08); }}>
                  <span className="wax-seal">T</span>
                  <strong>一封有公证印章的信</strong>
                  <small>拆开</small>
                </button>
              </div>
            ) : (
              <>
                <BilingualQuote pt="Pobre Ti Chin-Fu!... Estava no seu jardim, sossegado, armando, para o lançar ao ar, um papagaio de papel..." zh="可怜的狄鑫福！……他本来安静地待在花园里，正扎着一只准备放飞的纸鸢……" />
                <p>铃声之后，魔鬼第一次说出死者的名字。狄鑫福身穿黄绸，倒在溪边的草地上，怀中仍抱着尚未放飞的纸鸢。</p>
                <div className="money-number">106,000 <small>孔托雷斯</small></div>
                <BilingualQuote compact pt="São cento e seis mil contos, senhor!... da herança depositada do mandarim Ti Chin-Fu!" zh="是十万六千孔托，先生！……那是满大人狄鑫福存下的遗产！" />
                <button className="primary-action" onClick={() => go("luxury")}>搬入洛雷托豪宅 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <BilingualQuote pt="Então começou a minha vida de milionário." zh="于是，我的百万富翁生活开始了。" />
            <p>洛雷托宫殿的金床、酒器和金币把巨款变成可触摸的快感；门后的黄袍却让享乐逐渐失去滋味。</p>
            <div className="hotspot-index">
              {(sceneHotspots.luxury ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 3 && (
              <button className="primary-action" onClick={() => { sound.tone(110, 2.4, 0.08); go("ghost"); }}>看向镜子里的第四个人 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "ghost" && (
          <div className="scene-body ghost-scene">
            <BilingualQuote pt="ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços... Era o mandarim Ti Chin-Fu!" zh="他不是横卧在门槛上，就是横陈在金床上——那肥胖的身躯拖着黑辫，穿着黄袍，怀中抱着纸鸢……正是满大人狄鑫福！" />
            <p>狄鑫福不是站立的抽象光影。他是一具横陈的尸身：肥胖的老文人，白色长髭遮住嘴唇，黑辫拖在身后，黄绸包裹着朝上的肚腹，冰冷的双臂仍抱着纸鸢。</p>
            {!ghostRevealed ? (
              <p className="discovery-count">尸影尚未显出原貌。</p>
            ) : !avoidance ? (
              <>
                <BilingualQuote compact pt="Tinha eliminado a criatura, de longe, com uma campainha... eu assassinara um velho!" zh="我从远方用一只铃除掉了这个人……我杀死了一个老人！" />
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setAvoidance("pleasure")}><span>加倍享乐</span><small>让音乐盖过铃声</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("church")}><span>求助教会</span><small>为死者购买弥撒</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("charity")}><span>慷慨捐赠</span><small>把利息叫作慈善</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "乐队演奏得更响。狄鑫福不需要耳朵。" : avoidance === "church" ? "神父答应祈祷，却不能替你解释财富的来源。" : "你的名字刻上医院的石墙；死者的名字仍无人念出。"}</p>
                <BilingualQuote compact pt="Partiria para Pequim; descobriria a família de Ti Chin-Fu..." zh="我要去北京；找到狄鑫福的家人……" />
                <button className="primary-action" onClick={() => { setRouteIndex(0); go("map"); }}>登上去往中国的轮船 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <BilingualQuote pt="Anelei, suspirei por pisar a terra da China!... pus a proa ao Oriente." zh="我渴望着、叹息着，想要踏上中国的土地！……于是船头转向东方。" />
            <p>邮船名为“锡兰号”，并不是一次锡兰停靠；从上海以后，旅程转入河流、驳船、陆路和外交接待。</p>
            <div className="route" role="img" aria-label={`航线进度：${routes[routeIndex][0]}`}>
              <div className="route-line"><span style={{ width: `${(routeIndex / (routes.length - 1)) * 100}%` }} /></div>
              {routes.map((stop, index) => (
                <button key={stop[0]} className={`route-stop ${index <= routeIndex ? "is-reached" : ""} ${index === routeIndex ? "is-current" : ""}`} style={{ left: `${(index / (routes.length - 1)) * 100}%` }} onClick={() => index <= routeIndex && setRouteIndex(index)} aria-label={stop[0]}>
                  <i /><span>{stop[0]}</span>
                </button>
              ))}
              <div className="route-ship" style={{ left: `${(routeIndex / (routes.length - 1)) * 100}%` }} aria-hidden="true">▰</div>
            </div>
            <div className="travel-caption"><strong>{routes[routeIndex][0]}</strong><span>{routes[routeIndex][1]}</span></div>
            {routeIndex < routes.length - 1 ? (
              <button className="primary-action" onClick={() => { setRouteIndex(routeIndex + 1); sound.tone(146.83 + routeIndex * 9, 1, 0.05); }}>继续航行 <span>→</span></button>
            ) : (
              <button className="primary-action" onClick={() => go("beijing")}>进入北京 <span>→</span></button>
            )}
            <p className="perspective-note">这里呈现的是特奥多罗及十九世纪欧洲叙述中的“东方想象”，并非现实中国的复原。</p>
          </div>
        )}

        {stage === "beijing" && (
          <div className="scene-body dialogue-scene">
            <BilingualQuote pt="Sei duas palavras importantes, general: ‘mandarim’ e ‘chá’." zh="将军，我会两个重要的词：‘满大人’和‘茶’。" />
            <p>卡米洛夫的花园里，地图、茶具、档案、服饰与军刀把赎罪改写成外交程序。</p>
            <div className="hotspot-index">
              {(sceneHotspots.beijing ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length < 3 ? (
              <p className="discovery-count">已查看 {currentVisited.length} / 3</p>
            ) : !camilloff ? (
              <div className="choice-stack">
                <button className="choice-button" onClick={() => setCamilloff("treasury")}><span>把一半巨款交给国库</span><small>也许狄鑫福会因此平静</small></button>
                <button className="choice-button" onClick={() => setCamilloff("rice")}><span>私人向饥民分发大米</span><small>以慈善绕开国家</small></button>
                <button className="choice-button" onClick={() => setCamilloff("family")}><span>寻找狄鑫福的家族</span><small>把巨款直接还给后代</small></button>
              </div>
            ) : (
              <div className="dialogue-result">
                <div className="speaker">卡米洛夫</div>
                <BilingualQuote compact pt={camilloff === "treasury" ? "Erro, considerável erro, mancebo! Esses milhões nunca chegariam ao Tesouro imperial." : camilloff === "rice" ? "Funesta... A corte imperial veria aí imediatamente uma ambição política." : "Faça uma coisa. Procure a família de Ti Chin-Fu..."} zh={camilloff === "treasury" ? "错了，大错特错，年轻人！这些钱永远到不了帝国国库。" : camilloff === "rice" ? "这会招致灾祸……朝廷会立刻从中看出政治野心。" : "做一件事吧。去寻找狄鑫福的家人……"} />
                <p>{camilloff === "treasury" ? "他认为钱只会落进统治阶层‘深不可测的口袋’。" : camilloff === "rice" ? "他认为朝廷会把赈米视为收买民众、威胁王朝的政治野心。" : "这是唯一暂时不会让特奥多罗被斩首的方案。"} 最终，你必须乔装成富有文人，等待行政机器找出家族地址。</p>
                <button className="primary-action" onClick={() => go("tienho")}>随向导萨托出发 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "tienho" && (
          <div className="scene-body attack-scene">
            <BilingualQuote pt="era em roda da estalagem toda a populaça de Tien-Hó, rosnando sinistramente..." zh="天河村的全部民众围在客栈四周，发出阴森的低吼……" />
            <div className="hotspot-index">
              {(sceneHotspots.tienho ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length < 3 ? (
              <p className="discovery-count">已查看 {currentVisited.length} / 3</p>
            ) : !attackChoice ? (
              <>
                <div className="choice-stack horizontal">
                  <button className="choice-button dangerous" onClick={() => chooseAttack("coins")}><span>把银币撒向人群</span><small>用财富开路</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("bag")}><span>死守钱袋</span><small>保住补偿的资本</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("guide")}><span>跟紧萨托</span><small>相信唯一的向导</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{attackChoice === "coins" ? "萨托把铜钱像种子一样撒下；人群短暂满足，随后又齐声索要‘更多’。" : attackChoice === "bag" ? "你试图守住用于补偿的钱，却让自己和钱同时成为更清楚的目标。" : "你跟随唯一的向导，但骚乱迅速吞没了队伍。"}</p>
                <BilingualQuote compact pt="A turba rugia, insaciada... Não tenho mais, criatura! O resto está em Pequim!" zh="人群仍不满足，咆哮起来……我没有了，朋友！其余的都在北京！" />
                <p>原作没有给特奥多罗英雄式的胜利：他抓住马鬃逃跑，被砖块击中，最后倒在荒野。</p>
                <button className="primary-action" onClick={() => go("mission")}>醒来 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "mission" && (
          <div className="scene-body">
            <BilingualQuote pt="um sino tocava a matinas... rolaram-me das pálpebras duas lágrimas mudas." zh="晨祷的钟声响了起来……两滴无声的泪从我的眼睑滚落。" />
            <p>绷带、井、晨钟、《日课经》、来信与路边获救的孩子共同构成另一种“补偿”图景。</p>
            <div className="hotspot-index">
              {(sceneHotspots.mission ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 3 ? (
              <button className="primary-action" onClick={() => go("letter")}>拆开卡米洛夫的附言 <span>→</span></button>
            ) : (
              <p className="discovery-count">已查看 {currentVisited.length} / 3</p>
            )}
          </div>
        )}

        {stage === "letter" && (
          <div className="scene-body">
            <div className="letter-sheet">
              <span>附言 · 卡米洛夫将军</span>
              <p><span lang="pt">“Enquanto à viúva e família de Ti Chin-Fu, houve um engano...”</span><span>“关于狄鑫福的遗孀和家人，事情弄错了……”</span></p>
              <button className={letterClues.includes("cantao") ? "is-read" : ""} onClick={() => !letterClues.includes("cantao") && setLetterClues([...letterClues, "cantao"])}>
                <b>广东</b><em><span lang="pt">“É no Sul da China, na província de Cantão.”</span><span>“他们住在中国南方的广东省。”</span></em>
              </button>
              <button className={letterClues.includes("kaoli") ? "is-read" : ""} onClick={() => !letterClues.includes("kaoli") && setLetterClues([...letterClues, "kaoli"])}>
                <b>高丽</b><em><span lang="pt">“Mas também há uma família Ti Chin-Fu para além da Grande Muralha...”</span><span>“但长城之外也有一个狄鑫福家族……”</span></em>
              </button>
            </div>
            {letterClues.length < 2 ? (
              <p className="discovery-count">已展开 {letterClues.length} / 2</p>
            ) : !searchAgain ? (
              <>
                <p>同一封信给出两个狄鑫福家族、两个死去的家长、两处贫困。原作让“后代”从可补偿的对象重新变成无法验证的名字。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setSearchAgain(true)}><span>再寻找一次</span><small>去广东，或去高丽</small></button>
                  <button className="choice-button dangerous" onClick={() => go("return")}><span>返回欧洲</span><small>我已经尽力了</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <BilingualQuote compact pt="Ir de novo bater as estradas da China? Jamais!" zh="还要重新踏遍中国的道路？绝不！" />
                <p>选择“再寻找一次”并没有制造原作不存在的成功支线。特奥多罗只在脑中排演广东、高丽与再次受袭，随后仍以“已经做了合理、慷慨且合乎逻辑的事”为自己辩护。</p>
                <button className="primary-action" onClick={() => go("return")}>返回欧洲 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "return" && (
          <div className="scene-body ghost-scene">
            <BilingualQuote pt="Era ele, outra vez! E foi ele, perpetuamente!" zh="又是他！从此以后，永远都是他！" />
            <p>狄鑫福始终保持同一个死亡姿态，横卧在船舱、码头、沙地与城市拱门之前，不再受地理距离约束。</p>
            <div className="return-stamps" aria-label="返航地点">
              {["新加坡", "锡兰", "苏伊士", "马耳他", "直布罗陀", "里斯本"].map((place, index) => (
                <button key={place} className={returnStops.includes(place) ? "is-read" : ""} style={{ animationDelay: `${index * 0.16}s` }} onClick={() => {
                  if (!returnStops.includes(place)) setReturnStops([...returnStops, place]);
                  sound.tone(110 + index * 14, 0.7, 0.11, 0, "triangle");
                }}>{returnStops.includes(place) ? "狄鑫福 · " : ""}{place}</button>
              ))}
            </div>
            {returnStops.length >= 5 ? (
              <>
                <BilingualQuote compact pt="Quando desembarquei em Lisboa... a sua figura bojuda enchia todo o arco da Rua Augusta." zh="当我在里斯本下船时……他肥胖的身影塞满了奥古斯塔街的整座拱门。" />
                <button className="primary-action" onClick={() => go("renounce")}>在里斯本放弃财产 <span>→</span></button>
              </>
            ) : <p className="discovery-count">已经过 {returnStops.length} / 5</p>}
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <BilingualQuote pt="Abandonei o palacete ao Loreto, a existência de nababo." zh="我抛下洛雷托的宫殿，也抛下富豪般的生活。" />
            <p>你回到第一幕的同一间房，却已经不能恢复同一种贫穷。</p>
            <div className="hotspot-index">
              {(sceneHotspots.renounce ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <div className="ledger-animation" aria-hidden="true"><span>洛雷托宫殿</span><i>— 十万六千孔托</i><b>{currentVisited.length >= 3 ? "仍属于我" : "零？"}</b></div>
            {currentVisited.length >= 2 ? <button className="primary-action" onClick={() => go("humiliation")}>回到办公桌 <span>→</span></button> : <p className="discovery-count">已查看 {currentVisited.length} / 2</p>}
          </div>
        )}

        {stage === "humiliation" && (
          <div className="scene-body">
            <BilingualQuote pt="todos aqueles que a minha opulência humilhara cobriram-me de ofensas, como se alastra de lixo uma estátua derrubada de príncipe decaído." zh="所有曾受我财富羞辱的人都用侮辱覆盖我，如同人们把垃圾铺满一尊倒下的失势王子的雕像。" />
            <p>旧同事、报纸、贵族、教会、民众和马克斯太太依次“纠正”特奥多罗的贫穷，社会惩罚把他重新推向财富。</p>
            <div className="hotspot-index">
              {(sceneHotspots.humiliation ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 2 ? (
              <div className="consequence">
                <BilingualQuote compact pt="Então, indignado, um dia subitamente reentrei com estrondo no meu palacete e no meu luxo." zh="终于有一天，我愤怒地轰然闯回自己的宫殿和奢华生活。" />
                <p>“继续忍受”并不是原作提供的稳定出口：银行里的财富仍属于特奥多罗，狄鑫福也仍在身旁。叙述最终把他推回唯一真实发生的行动。</p>
                <button className="primary-action" onClick={() => go("prison")}>推开洛雷托宫殿的大门 <span>→</span></button>
              </div>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / 2</p>}
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body ending-body prison-body">
            <div className="ending-mark">II</div>
            <p className="ending-label">正篇结局 · 奢华的牢笼</p>
            <BilingualQuote pt="Desde então uma saciedade enervante mantém-me semanas inteiras num sofá, mudo e soturno, pensando na felicidade do não-ser..." zh="从那以后，一种令人虚弱的餍足让我一连数周躺在沙发上，沉默而阴郁，想着不存在的幸福……" />
            <p>吊灯重新点亮，里斯本再次匍匐。终局并不是“享受或悔恨”的二选一，而是享受与痛苦在同一座宫殿里持续。</p>
            <div className="hotspot-index final-index">
              {(sceneHotspots.prison ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 3 ? (
              <div className="final-testament">
                <BilingualQuote pt="Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!" zh="把我从财富中解救出来！让满大人复活！把贫穷的安宁还给我！" className="ending-quote" />
                <BilingualQuote compact pt="Não pode ser, meu prezado senhor, não pode ser..." zh="不行，我尊贵的先生，不行……" className="devil-final" />
                <BilingualQuote pt="Só sabe bem o pão que dia a dia ganham as nossas mãos: nunca mates o Mandarim!" zh="只有双手每日挣来的面包才真正甘美：永远不要杀死满大人！" className="last-words" />
                <p className="translation">狄鑫福横陈在镜中宴席之间；然而特奥多罗在最后一句又转向读者：如果同样轻易地杀人并继承财产，整个中国不会剩下一个满大人。告诫因此也沾染了自我开脱。</p>
                <button className="primary-action" onClick={reset}>从未响起的铃开始</button>
              </div>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / 3</p>}
          </div>
        )}
      </section>

      {ghostIntensity > 0 && (
        <TiChinFu
          intensity={ghostIntensity}
          revealed={ghostRevealed}
          onInspect={() => {
            setGhostRevealed(!ghostRevealed);
            sound.tone(98, 1.8, 0.12, 0, "sine");
          }}
        />
      )}

      {(stage === "bell" || stage === "prison") && <DevilFigure />}

      <footer className="game-footer">
        <span>{stage === "intro" ? "一八八〇 / 二〇二六" : info.subtitle ? `${info.act} · ${info.subtitle}` : info.act}</span>
        <span>{sound.enabled ? "声音开启" : "静音模式"}</span>
      </footer>

      {infoOpen && (
        <div className="modal-backdrop">
          <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
            <button className="modal-close" onClick={() => setInfoOpen(false)} aria-label="关闭">×</button>
            <div className="scene-kicker">版本说明</div>
            <h2 id="about-title">关于这个校订版</h2>
            <p>这是一个可完整通关的浏览器交互叙事，根据埃萨·德·凯罗斯一八八〇年的小说《满大人》改编。它保留“摇铃—暴富—亡者—远东之旅—返欧—奢华牢笼”的主线，并加入“三次拒绝”的特别结局。</p>
            <p>小说引文采用葡萄牙语与中文对照，不再显示书中位置；物件展开后只呈现与之有关的中文译文。</p>
            <p>狄鑫福以横卧尸身反复进入画面；魔鬼则依照原作成为一个黑衣、高礼帽、戴黑手套并把双手按在雨伞柄上的中产人物。两者都以透明背景角色素材融入场景。</p>
            <p>拒绝结局中的新增文字均明确标为本项目原创；视觉中的中国是对特奥多罗及十九世纪欧洲“东方想象”的批判性呈现，不作为历史中国的写实复原。</p>
            <p className="credits">文字与交互设计：本研究原型<br />插画与角色设定：人工智能辅助生成并完成透明背景处理</p>
            <div className="music-credits">
              <span>分幕配乐</span>
              <a href="https://pixabay.com/music/ambient-mystery-dark-375266/" target="_blank" rel="noreferrer">《Mystery Dark》· leberch · Pixabay Content License</a>
              <a href="https://opengameart.org/content/apparitions-ball" target="_blank" rel="noreferrer">《Apparitions Ball》· Bobjt · CC0</a>
              <a href="https://opengameart.org/content/i-swear-i-saw-it-background-track" target="_blank" rel="noreferrer">《I Swear I Saw It》· yd · CC0</a>
              <a href="https://opengameart.org/content/the-journey-begins" target="_blank" rel="noreferrer">《The Journey Begins》· Igor Gundarev · CC0</a>
              <a href="https://opengameart.org/content/pursuit" target="_blank" rel="noreferrer">《Pursuit》· Sudocolon · CC0</a>
              <a href="https://opengameart.org/content/contemplation-0" target="_blank" rel="noreferrer">《Contemplation》· Joth · CC0</a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
