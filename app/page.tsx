"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BeijingCurtainScene from "./beijing-curtain-scene";
import SupplicationSequence from "./supplication-sequence";

type Stage =
  | "intro"
  | "office"
  | "market"
  | "room"
  | "book"
  | "bell"
  | "tiDeath"
  | "refusalEnding"
  | "inheritance"
  | "luxury"
  | "ghost"
  | "map"
  | "beijing"
  | "repose"
  | "camilloffSalon"
  | "camilloffMeeting"
  | "tienho"
  | "wilderness"
  | "mission"
  | "letter"
  | "return"
  | "reckoning"
  | "renounce"
  | "prison"
  | "devilReturn"
  | "devilDialogue"
  | "supplication"
  | "testament";

type HotspotItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  translation: string;
};

type BeijingDestination = "" | "tartar" | "chinese";

const beijingDestinations: Record<Exclude<BeijingDestination, "">, { title: string; original: string; summary: string }> = {
  tartar: { title: "紫禁城", original: "", summary: "宫墙、权贵与金色屋顶" },
  chinese: { title: "老百姓的街巷", original: "", summary: "泥泞、尘土与拥挤的人群" },
};

const beijingDestinationKeys = ["tartar", "chinese"] as const;

const routes = [
  ["里斯本", "我离开洛雷托豪宅，决意亲赴北京寻找狄鑫福的家族。"],
  ["马赛", "我包下整艘名为“锡兰号”的邮船，从马赛向东方启航。"],
  ["上海", "“锡兰号”平静而单调地航行到上海；我一路没有观光的兴致，只想着此行的目的。"],
  ["天津", "从上海沿河乘罗素公司的小轮船抵达天津。"],
  ["通州", "卡米洛夫派出的翻译萨托在此处迎接。"],
  ["北京", "在俄罗斯公使卡米洛夫的协助下，我开始寻找狄鑫福的后代。"],
];

const stageInfo: Record<Stage, { act: string; title: string; subtitle: string }> = {
  intro: { act: "", title: "未响的铃", subtitle: "一声轻响" },
  office: { act: "第一章 · 里斯本", title: "王国内政部", subtitle: "抄写员的白昼" },
  market: { act: "第一章 · 里斯本", title: "圣克拉拉旧货市场", subtitle: "Feira da Ladra" },
  room: { act: "第一章 · 里斯本", title: "特奥多罗的房间", subtitle: "一个贫穷的小职员" },
  book: { act: "第一章 · 旧书", title: "发亮的字句", subtitle: "" },
  bell: { act: "第一章 · 诱惑", title: "魔鬼的提议", subtitle: "桌上的铃" },
  tiDeath: { act: "第一章 · 远方", title: "狄鑫福之死", subtitle: "铃声抵达中国" },
  refusalEnding: { act: "特别结局", title: "合上的书页", subtitle: "拒绝诱惑" },
  inheritance: { act: "第二章 · 财富", title: "陌生人的遗产", subtitle: "" },
  luxury: { act: "第三章 · 黄金", title: "洛雷托的盛宴", subtitle: "百万富翁" },
  ghost: { act: "第三章 · 亡者", title: "宴席上的客人", subtitle: "狄鑫福" },
  map: { act: "第四章 · 远行", title: "向东方去", subtitle: "从里斯本到北京" },
  beijing: { act: "第五章 · 北京", title: "城门之前", subtitle: "东直门外的轿子" },
  repose: { act: "第五章 · 北京", title: "轿中北京", subtitle: "宫墙与老百姓的街巷" },
  camilloffSalon: { act: "第五章 · 北京", title: "将军夫人的客厅", subtitle: "月色花园与钢琴" },
  camilloffMeeting: { act: "第五章 · 北京", title: "卡米洛夫的建议", subtitle: "赎罪的三种办法" },
  tienho: { act: "第六章 · 远东", title: "天河村", subtitle: "客栈外的人群" },
  wilderness: { act: "第六章 · 远东", title: "荒野上的路", subtitle: "马匹消失之后" },
  mission: { act: "第七章 · 修道院", title: "修道院的清晨", subtitle: "获救，却未获宽恕" },
  letter: { act: "第七章 · 远东", title: "地址之谜", subtitle: "" },
  return: { act: "第七章 · 返航", title: "死者同行", subtitle: "从中国返回欧洲" },
  reckoning: { act: "第八章 · 里斯本", title: "洛雷托的一夜", subtitle: "无法平息的亡灵" },
  renounce: { act: "第八章 · 里斯本", title: "放弃一切", subtitle: "重返贫穷" },
  prison: { act: "第八章 · 里斯本", title: "里斯本俯首", subtitle: "回到洛雷托之后" },
  devilReturn: { act: "第八章 · 夜路", title: "荒街上的黑衣人", subtitle: "魔鬼再度出现" },
  devilDialogue: { act: "第八章 · 夜路", title: "无法撤销的交易", subtitle: "" },
  supplication: { act: "第八章 · 夜路", title: "空无一人", subtitle: "乞求之后" },
  testament: { act: "正篇结局", title: "留给世人的话", subtitle: "遗嘱与告诫" },
};

const corpsePresenceStages: Stage[] = ["ghost", "return", "reckoning", "renounce", "prison", "devilReturn", "devilDialogue", "supplication", "testament"];

const musicCues = {
  mystery: { src: "/audio/unsolved-investigation-v1.ogg", volume: 0.74 },
  ballroom: { src: "/audio/apparitions-ball.mp3", volume: 0.2 },
  haunting: { src: "/audio/i-swear-i-saw-it.ogg", volume: 0.23 },
  journey: { src: "/audio/the-journey-begins.ogg", volume: 0.22 },
  pursuit: { src: "/audio/pursuit.mp3", volume: 0.2 },
  contemplation: { src: "/audio/contemplation.mp3", volume: 0.25 },
  oriental: { src: "/audio/asianoriental1.ogg", volume: 0.3 },
} as const;

const stageMusic: Record<Stage, { src: string; volume: number }> = {
  intro: musicCues.mystery,
  office: musicCues.mystery,
  market: musicCues.mystery,
  room: musicCues.mystery,
  book: musicCues.mystery,
  bell: musicCues.mystery,
  tiDeath: musicCues.haunting,
  refusalEnding: musicCues.mystery,
  inheritance: musicCues.ballroom,
  luxury: musicCues.ballroom,
  ghost: musicCues.haunting,
  map: musicCues.journey,
  beijing: musicCues.journey,
  repose: musicCues.oriental,
  camilloffSalon: musicCues.oriental,
  camilloffMeeting: musicCues.oriental,
  tienho: musicCues.pursuit,
  wilderness: musicCues.pursuit,
  mission: musicCues.contemplation,
  letter: musicCues.contemplation,
  return: musicCues.haunting,
  reckoning: musicCues.haunting,
  renounce: musicCues.haunting,
  prison: musicCues.haunting,
  devilReturn: musicCues.haunting,
  devilDialogue: musicCues.haunting,
  supplication: musicCues.haunting,
  testament: musicCues.contemplation,
};

const refusalLines = [
  "你把良心称作原则，不过是因为今晚的价钱还没有说得足够具体。",
  "别急着自豪，我亲爱的先生。饥饿很会替哲学修改措辞。",
];

const sceneHotspots: Partial<Record<Stage, HotspotItem[]>> = {
  market: [
    { id: "telescope", label: "旧望远镜", x: 13, y: 64, translation: "黄铜镜筒上积着海盐般的白斑；摊主说，它曾看见远洋船只驶入特茹河。" },
    { id: "porcelain", label: "瓷制圣母像", x: 21, y: 70, translation: "一尊指尖大小的瓷制圣母像，蓝釉已经从衣褶上剥落。" },
    { id: "reliquary", label: "鎏金圣物匣", x: 54, y: 64, translation: "鎏金匣门只剩一扇，里面没有圣骨，只有潮湿天鹅绒留下的暗印。" },
    { id: "watch", label: "停摆的怀表", x: 49, y: 82, translation: "怀表的指针停在四点十七分；谁也说不清那一刻曾经发生过什么。" },
    { id: "old-volume", label: "虫蛀的旧书", x: 35, y: 78, translation: "古老庄严的字体、虫蛀的黄纸、修道院式的厚重装帧，还有夹在书中的绿色丝带——都令我着迷。" },
  ],
  room: [
    { id: "lamp", label: "绿色灯罩", x: 7, y: 41, translation: "绿色灯罩在蜡烛周围投下一片半明半暗。" },
    { id: "folio", label: "旧书", x: 21, y: 73, translation: "古老庄严的字体、被虫蛀的黄纸、修道院式的厚重装帧，还有夹在那一页的绿色丝带——都令我着迷！" },
    { id: "bell", label: "铃与法语词典", x: 34, y: 53, translation: "铃安安静静地放在我面前的一本法语词典上。" },
    { id: "lottery", label: "彩票", x: 43, y: 68, translation: "我每晚向悲苦圣母祈求这一切，还购买彩票。" },
    { id: "madonna", label: "圣母像", x: 42, y: 45, translation: "床头挂着一幅悲苦圣母石版画，那是母亲留下的。" },
  ],
  luxury: [
    { id: "gold-bed", label: "金床", x: 63, y: 67, translation: "我的床以铺满錾花金片的床沿闻名欧洲，趣味夸张而野蛮。" },
    { id: "decanter", label: "酒与水晶", x: 78, y: 59, translation: "世上有勃艮第葡萄酒，例如一八五八年的罗曼尼·康帝和一八六一年的香贝丹。" },
    { id: "coins", label: "金币", x: 86, y: 72, translation: "我感到整个世界都在脚下——像一头餍足的狮子般打了个哈欠。" },
  ],
  beijing: [
    { id: "litter", label: "红绸轿子", x: 84, y: 69, translation: "一乘华贵的轿子正在东直门外等我，猩红丝帘上满是金线刺绣。" },
  ],
  tienho: [
    { id: "arrow", label: "箭与破洞", x: 84, y: 25, translation: "一块石头从我身旁飞来，击穿了窗格上的油纸；随后一支箭呼啸而过。" },
    { id: "money-case", label: "钱袋", x: 71, y: 82, translation: "可是，大人，至少保住您宝贵的性命！" },
    { id: "carts", label: "行李车", x: 61, y: 51, translation: "人群仍不满足，咆哮起来。" },
    { id: "pony", label: "马匹", x: 90, y: 53, translation: "我扑向那匹马，一把抓住它的鬃毛。" },
  ],
  mission: [
    { id: "bandage", label: "绷带", x: 46, y: 64, translation: "两位遣使会神父正慢慢清洗我的耳朵。" },
    { id: "well", label: "井与滑轮", x: 66, y: 49, translation: "井上的滑轮缓慢作响；晨祷的钟声响了起来。" },
    { id: "breviary", label: "《日课经》", x: 60, y: 82, translation: "我把一卷英格兰银行钞票放在他的《日课经》上，那书正翻到《贫穷福音》的一页。" },
    { id: "letter", label: "卡米洛夫的信", x: 72, y: 82, translation: "关于狄鑫福的遗孀和家人，事情弄错了。" },
    { id: "found-child", label: "神父捡到的弃婴", x: 91, y: 82, translation: "洛里奥神父在路旁发现这个赤裸、濒死的孩子，立刻为她施洗，并抱回修道院喂养。" },
  ],
  renounce: [
    { id: "window", label: "雨中的窗口", x: 86, y: 27, translation: "里斯本仍在窗外；我却再也回不到从前那种安静的贫穷。" },
    { id: "newspaper", label: "报纸", x: 82, y: 77, translation: "报纸把我的穷困当作一场应得的笑话。" },
    { id: "bell-remains", label: "仍在桌上的铃", x: 61, y: 68, translation: "这柄摇铃没有消失；它像一笔无法注销的旧账，仍留在桌上。" },
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

  const fade = (incoming: HTMLAudioElement, outgoing: HTMLAudioElement | null, target: number, duration = 900) => {
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

  const handbell = () => {
    const ctx = ensure();
    if (!ctx || !master.current || !enabledRef.current) return;

    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const convolver = ctx.createConvolver();
    dry.gain.value = 0.74;
    wet.gain.setValueAtTime(0.64, ctx.currentTime);
    wet.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.15);
    dry.connect(master.current);
    convolver.connect(wet);
    wet.connect(master.current);

    const impulseLength = Math.floor(ctx.sampleRate * 4.2);
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i += 1) {
        const decay = Math.pow(1 - i / impulseLength, 2.2);
        data[i] = (Math.random() * 2 - 1) * decay * 0.48;
      }
    }
    convolver.buffer = impulse;

    const partials: Array<[number, number, OscillatorType]> = [
      [642, 0.3, "triangle"],
      [913, 0.2, "sine"],
      [1387, 0.14, "sine"],
      [1928, 0.09, "triangle"],
      [2671, 0.055, "sine"],
      [3548, 0.035, "sine"],
    ];
    partials.forEach(([frequency, volume, type], index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.detune.setValueAtTime(index % 2 === 0 ? -3 : 4, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.008 + index * 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.55);
      oscillator.connect(gain);
      gain.connect(dry);
      gain.connect(convolver);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 3.7);
    });

    const strikeLength = Math.floor(ctx.sampleRate * 0.055);
    const strikeBuffer = ctx.createBuffer(1, strikeLength, ctx.sampleRate);
    const strikeData = strikeBuffer.getChannelData(0);
    for (let i = 0; i < strikeLength; i += 1) {
      strikeData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / strikeLength, 4);
    }
    const strike = ctx.createBufferSource();
    const highPass = ctx.createBiquadFilter();
    const strikeGain = ctx.createGain();
    strike.buffer = strikeBuffer;
    highPass.type = "highpass";
    highPass.frequency.value = 1500;
    strikeGain.gain.value = 0.16;
    strike.connect(highPass);
    highPass.connect(strikeGain);
    strikeGain.connect(dry);
    strikeGain.connect(convolver);
    strike.start();
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
      void active.play().then(() => fade(active, null, currentVolume.current, 240)).catch(() => undefined);
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

  return { enabled, enable, playTrack, tone, handbell, thud, toggle };
}

function TiChinFu({ intensity = 1, revealed, onInspect }: { intensity?: number; revealed: boolean; onInspect: () => void }) {
  return (
    <>
      <button
        className={`ti-figure ${revealed ? "is-revealed" : "is-silhouette"}`}
        style={{ "--ti-opacity": String(Math.min(0.28 + intensity * 0.2, 0.94)) } as React.CSSProperties}
        onClick={onInspect}
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* A raw img keeps the transparent corpse cutout portable in the edge build. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ti-chin-fu-corpse-v3.png" alt="狄鑫福身穿黄绸、仰卧而死，冷臂抱着纸鸢" />
      </button>
      <button
        className={`corpse-toggle ${revealed ? "is-dismiss" : "is-question"}`}
        onClick={onInspect}
        aria-label={revealed ? "还是不看为好" : "显出狄鑫福的尸体"}
        aria-pressed={revealed}
      >
        <span aria-hidden="true">{revealed ? "还是不看为好" : "?"}</span>
      </button>
    </>
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
  const [officeDocumentOpen, setOfficeDocumentOpen] = useState(false);
  const [officeDocumentSeen, setOfficeDocumentSeen] = useState(false);
  const [officeDozing, setOfficeDozing] = useState(false);
  const [officeDozed, setOfficeDozed] = useState(false);
  const [refusals, setRefusals] = useState(0);
  const [bellRung, setBellRung] = useState(false);
  const [bellSequence, setBellSequence] = useState<"" | "ringing" | "black">("");
  const [deathAnimationDone, setDeathAnimationDone] = useState(false);
  const [deathAnimationRun, setDeathAnimationRun] = useState(0);
  const [inheritanceOpened, setInheritanceOpened] = useState(false);
  const [chosenLuxuries, setChosenLuxuries] = useState<string[]>([]);
  const [avoidance, setAvoidance] = useState("");
  const [routeIndex, setRouteIndex] = useState(0);
  const [camilloff, setCamilloff] = useState("");
  const [beijingDestination, setBeijingDestination] = useState<BeijingDestination>("");
  const [beijingVisited, setBeijingVisited] = useState<Exclude<BeijingDestination, "">[]>([]);
  const [generalaTopics, setGeneralaTopics] = useState<string[]>([]);
  const [camilloffNews, setCamilloffNews] = useState(false);
  const [attackChoice, setAttackChoice] = useState("");
  const [collapsePhase, setCollapsePhase] = useState<"" | "falling" | "dark" | "waking">("");
  const [collapseSeen, setCollapseSeen] = useState(false);
  const [letterDecision, setLetterDecision] = useState<"" | "search" | "return">("");
  const [letterClues, setLetterClues] = useState<string[]>([]);
  const [returnStops, setReturnStops] = useState<string[]>([]);
  const [supplicated, setSupplicated] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [visualFinds, setVisualFinds] = useState<Partial<Record<Stage, string[]>>>({});
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [ghostRevealed, setGhostRevealed] = useState(false);
  const [ghostChoiceSeen, setGhostChoiceSeen] = useState(false);
  const [testamentOpen, setTestamentOpen] = useState(false);
  const [finalBookPhase, setFinalBookPhase] = useState<0 | 1 | 2>(0);
  const [finalArtifactsSeen, setFinalArtifactsSeen] = useState<string[]>([]);
  const [stageHistory, setStageHistory] = useState<Stage[]>([]);
  const sound = useSound();
  const ringing = bellSequence === "ringing";

  const info = stageInfo[stage];
  const isEast = ["map", "beijing", "repose", "camilloffSalon", "camilloffMeeting", "tienho", "wilderness", "mission", "letter"].includes(stage);
  const backgrounds: Record<Stage, string> = {
    intro: "/intro-cover-v1.png",
    office: "/ministry-office-awake-v1.png",
    market: "/feira-da-ladra-v1.png",
    room: "/lisbon-room-v3.png",
    book: "/lisbon-room-v3.png",
    bell: "/lisbon-room-v3.png",
    tiDeath: "/ti-chin-fu-death-garden-v1.png",
    refusalEnding: "/lisbon-room-v3.png",
    inheritance: "/inheritance-messenger-v1.png",
    luxury: "/palace-ghost.png",
    ghost: "/palace-ghost.png",
    map: "/east-journey.png",
    beijing: "/pequim-arrival-v1.png",
    repose: "/pequim-litter-interior-v1.png",
    camilloffSalon: "/pequim-repose-v1.png",
    camilloffMeeting: "/camilloff-meeting-v1.png",
    tienho: "/tienho-inn-v3.png",
    wilderness: "/wilderness-v1.png",
    mission: "/mission-cloister-v5.png",
    letter: "/mission-cloister-v5.png",
    return: "/lisbon-room-v3.png",
    reckoning: "/palace-ghost.png",
    renounce: "/renounce-room-v1.png",
    prison: "/loreto-restored-v1.png",
    devilReturn: "/devil-street-v1.png",
    devilDialogue: "/devil-street-v1.png",
    supplication: "/devil-vanished-v1.png",
    testament: "/testament-study-v2.png",
  };
  const beijingStreetBackgrounds: Record<Exclude<BeijingDestination, "">, string> = {
    tartar: "/pequim-tartar-city-v1.png",
    chinese: "/pequim-chinese-quarter-v1.png",
  };
  const background = backgrounds[stage];
  const ghostIntensity = stage === "luxury" ? chosenLuxuries.length : corpsePresenceStages.includes(stage) ? 3 : 0;
  const currentHotspots = sceneHotspots[stage] ?? [];
  const currentVisited = visualFinds[stage] ?? [];
  const hasInspectedAll = currentHotspots.length > 0 && currentVisited.length >= currentHotspots.length;
  const allBeijingStopsVisited = beijingDestinationKeys.every((place) => beijingVisited.includes(place));
  const showBeijingCurtain = stage === "repose" && Boolean(beijingDestination);

  const resetRevisitableStage = (next: Stage) => {
    if (next === "office") {
      setOfficeDocumentOpen(false);
      setOfficeDocumentSeen(false);
      setOfficeDozing(false);
      setOfficeDozed(false);
    }
    if (next === "market") {
      setVisualFinds((finds) => ({ ...finds, market: [] }));
    }
    if (next === "bell" && !bellRung) setRefusals(0);
    if (next === "ghost") setAvoidance("");
    if (next === "beijing") {
      setCamilloff("");
      setBeijingDestination("");
      setBeijingVisited([]);
      setGeneralaTopics([]);
      setCamilloffNews(false);
      setVisualFinds((finds) => ({ ...finds, beijing: [] }));
    }
    if (next === "repose") {
      setCamilloff("");
      setBeijingDestination("");
      setBeijingVisited([]);
      setGeneralaTopics([]);
      setCamilloffNews(false);
    }
    if (next === "camilloffSalon") setGeneralaTopics([]);
    if (next === "camilloffMeeting") {
      setCamilloff("");
      setCamilloffNews(false);
    }
    if (next === "tienho") setAttackChoice("");
    if (next === "wilderness") {
      setCollapseSeen(false);
      setCollapsePhase("");
    }
    if (next === "letter") setLetterDecision("");
    if (next === "testament") {
      setTestamentOpen(false);
      setFinalBookPhase(0);
      setFinalArtifactsSeen([]);
    }
  };

  const go = (next: Stage) => {
    resetRevisitableStage(next);
    setTransitioning(true);
    setStageHistory((history) => [...history, stage]);
    window.setTimeout(() => {
      setStage(next);
      setSelectedHotspot(null);
      setGhostRevealed(next === "ghost" && ghostChoiceSeen);
      setTransitioning(false);
    }, 280);
  };

  const goBack = () => {
    const previous = stageHistory.at(-1);
    if (!previous) return;
    resetRevisitableStage(previous);
    setTransitioning(true);
    setStageHistory((history) => history.slice(0, -1));
    window.setTimeout(() => {
      setStage(previous);
      setSelectedHotspot(null);
      setGhostRevealed(previous === "ghost" && ghostChoiceSeen);
      setTransitioning(false);
    }, 280);
  };

  const reset = () => {
    setStage("intro");
    setTransitioning(false);
    setRoomFinds([]);
    setOfficeDocumentOpen(false);
    setOfficeDocumentSeen(false);
    setOfficeDozing(false);
    setOfficeDozed(false);
    setRefusals(0);
    setBellRung(false);
    setBellSequence("");
    setDeathAnimationDone(false);
    setDeathAnimationRun(0);
    setInheritanceOpened(false);
    setChosenLuxuries([]);
    setAvoidance("");
    setRouteIndex(0);
    setCamilloff("");
    setBeijingDestination("");
    setBeijingVisited([]);
    setGeneralaTopics([]);
    setCamilloffNews(false);
    setAttackChoice("");
    setCollapsePhase("");
    setCollapseSeen(false);
    setLetterDecision("");
    setLetterClues([]);
    setReturnStops([]);
    setSupplicated(false);
    setInfoOpen(false);
    setShake(false);
    setVisualFinds({});
    setSelectedHotspot(null);
    setGhostRevealed(false);
    setGhostChoiceSeen(false);
    setTestamentOpen(false);
    setFinalBookPhase(0);
    setFinalArtifactsSeen([]);
    setStageHistory([]);
  };

  const progress = useMemo(() => {
    const order: Stage[] = ["intro", "office", "market", "room", "book", "bell", "tiDeath", "inheritance", "luxury", "ghost", "map", "beijing", "repose", "camilloffSalon", "camilloffMeeting", "tienho", "wilderness", "mission", "letter", "return", "reckoning", "renounce", "prison", "devilReturn", "devilDialogue", "supplication", "testament"];
    const value = order.indexOf(stage);
    return Math.max(2, ((value < 0 ? 2 : value + 1) / order.length) * 100);
  }, [stage]);

  useEffect(() => {
    const cue = stageMusic[stage];
    sound.playTrack(cue.src, cue.volume);
    // Track transitions follow narrative stages; the sound controller persists between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== "tiDeath") return;
    // Reset the one-shot animation whenever this scene is entered or replayed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeathAnimationDone(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeathAnimationDone(true);
      return;
    }
    const startled = window.setTimeout(() => sound.tone(92.5, 1.35, 0.1, 0, "sine"), 1350);
    const impact = window.setTimeout(() => sound.tone(55, 1.8, 0.12, 0, "triangle"), 4350);
    const finished = window.setTimeout(() => setDeathAnimationDone(true), 9000);
    return () => {
      window.clearTimeout(startled);
      window.clearTimeout(impact);
      window.clearTimeout(finished);
    };
    // The sound controller intentionally persists between narrative stages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, deathAnimationRun]);

  const inspectHotspot = (item: HotspotItem) => {
    const existing = visualFinds[stage] ?? [];
    if (!existing.includes(item.id)) {
      setVisualFinds((finds) => {
        const stageFinds = finds[stage] ?? [];
        return stageFinds.includes(item.id) ? finds : { ...finds, [stage]: [...stageFinds, item.id] };
      });
      if (stage === "room") setRoomFinds((finds) => finds.includes(item.id) ? finds : [...finds, item.id]);
      if (stage === "luxury") setChosenLuxuries((finds) => finds.includes(item.id) ? finds : [...finds, item.id]);
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
    if (bellSequence || bellRung) return;
    setBellRung(true);
    setBellSequence("ringing");
    sound.handbell();
    window.setTimeout(() => {
      setBellSequence("black");
    }, 4300);
    window.setTimeout(() => {
      setBellSequence("");
      go("tiDeath");
    }, 5300);
  };

  const replayTiDeath = () => {
    setDeathAnimationDone(false);
    setDeathAnimationRun((run) => run + 1);
  };

  const chooseAvoidance = (choice: string) => {
    setGhostChoiceSeen(true);
    setAvoidance(choice);
  };

  const chooseCamilloff = (choice: string) => {
    setCamilloff(choice);
  };

  const chooseBeijingDestination = (destination: Exclude<BeijingDestination, "">) => {
    setBeijingDestination(destination);
    setBeijingVisited((visited) => visited.includes(destination) ? visited : [...visited, destination]);
    setSelectedHotspot(null);
    sound.tone(174.61, 0.75, 0.06, 0, "triangle");
  };

  const returnToLitter = () => {
    setBeijingDestination("");
    setSelectedHotspot(null);
  };

  const inspectGeneralaTopic = (topic: string) => {
    setGeneralaTopics((topics) => topics.includes(topic) ? topics : [...topics, topic]);
    sound.tone(topic === "europe" ? 261.63 : 329.63, 0.7, 0.06, 0, "triangle");
  };

  const beginCamilloffMeeting = () => {
    go("camilloffSalon");
  };

  const toggleOfficeDocument = () => {
    setOfficeDocumentSeen(true);
    setOfficeDocumentOpen((open) => !open);
    sound.tone(220, 0.55, 0.05, 0, "triangle");
  };

  const toggleOfficeDoze = () => {
    setOfficeDozed(true);
    setOfficeDozing((dozing) => !dozing);
    sound.tone(123.47, 0.9, 0.045, 0, "sine");
  };

  const chooseAttack = () => {
    if (attackChoice) return;
    setAttackChoice("escape");
    setShake(true);
    sound.thud();
    window.setTimeout(() => setShake(false), 620);
  };

  const collapseInWilderness = () => {
    if (collapseSeen || collapsePhase) return;
    setCollapsePhase("falling");
    sound.thud();
    window.setTimeout(() => setCollapsePhase("dark"), 2020);
  };

  const chooseLetterDecision = (choice: "search" | "return") => {
    setLetterDecision(choice);
  };

  const wakeAtMission = () => {
    setCollapseSeen(true);
    setCollapsePhase("waking");
    go("mission");
    window.setTimeout(() => setCollapsePhase(""), 460);
  };

  const begTheDevil = () => {
    if (!supplicated) {
      setSupplicated(true);
      sound.tone(92, 1.7, 0.11, 0, "sine");
    }
    go("supplication");
  };

  const openFinalTestament = () => {
    setFinalBookPhase(0);
    setTestamentOpen(true);
    setFinalArtifactsSeen((seen) => seen.includes("testament") ? seen : [...seen, "testament"]);
    sound.tone(164.81, 0.85, 0.06, 0, "triangle");
  };

  const openFinalBook = () => {
    setTestamentOpen(false);
    setFinalBookPhase(1);
    sound.tone(196, 0.75, 0.055, 0, "triangle");
  };

  const turnFinalBookCover = () => {
    setFinalBookPhase(2);
    setFinalArtifactsSeen((seen) => seen.includes("book") ? seen : [...seen, "book"]);
    sound.tone(246.94, 0.9, 0.06, 0, "triangle");
  };

  const closeFinalBook = () => {
    setFinalBookPhase(0);
    sound.tone(196, 0.65, 0.045, 0, "triangle");
  };

  const finalArtifactsRead = finalArtifactsSeen.includes("testament") && finalArtifactsSeen.includes("book");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "ti-death") {
      // The preview route intentionally selects its isolated demonstration scene on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("tiDeath");
      setStageHistory([]);
    }
  }, []);

  return (
    <main className={`game-shell stage-${stage} ${currentHotspots.length > 0 ? "has-hotspots" : ""} ${showBeijingCurtain ? "has-beijing-curtain" : ""} ${transitioning ? "is-transitioning" : ""} ${shake ? "is-shaking" : ""} ${ringing ? "is-ringing-bell" : ""}`}>
      <div className="scene-image" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      {stage === "office" && <div className={`office-doze-image ${officeDozing ? "is-visible" : ""}`} aria-hidden="true" />}
      <div className="scene-vignette" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />

      <header className="topbar">
        <div className="navigation-actions">
          <button className="wordmark" onClick={reset} aria-label="回到游戏封面">《满大人》<span>· 交互叙事</span></button>
          {stageHistory.length > 0 && stage !== "supplication" && !ringing && !collapsePhase && <button className="back-button" onClick={goBack}>← 返回上一页</button>}
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

      {showBeijingCurtain && beijingDestination && (
        <BeijingCurtainScene
          key={beijingDestination}
          title={beijingDestinations[beijingDestination].title}
          exterior={beijingStreetBackgrounds[beijingDestination]}
          soundEnabled={sound.enabled}
          onDepart={returnToLitter}
        >
          {beijingDestination === "tartar" ? (
            <>
              <BilingualQuote pt="A habitação de Camilloff ficava na Cidade Tártara, nos bairros militares e nobres. Há aqui uma tranquilidade austera." zh="卡米洛夫的住所位于紫禁城的军人和贵族街区。这里笼罩着一种严肃的宁静。" />
              <p>金钉高轮马车和官轿从宽阔街道上掠过；富丽店铺陈列明代瓷器、青铜、珐琅、象牙、丝绸与镶嵌武器。禁城高墙后，帝宫明黄屋顶在树海间发亮；贵族弓手、孔雀翎官员和飘在高空的巨大纸鸢共同维护着一个不可接近的世界。</p>
              <BilingualQuote compact pt="Aqui está o vasto palácio imperial, entre arvoredos misteriosos, com os seus telhados de um amarelo de oiro vivo!" zh="那就是辽阔的帝宫，藏在神秘的树木之间，屋顶闪着鲜明的金黄色！" />
            </>
          ) : beijingDestination === "chinese" ? (
            <>
              <BilingualQuote pt="E lá fomos penetrando na Cidade Chinesa, pela porta monstruosa de Tchin-Men. Aqui habita a burguesia, o mercador, a populaça." zh="我们从巨大的前门进入老百姓的街巷。商人、市民和普通百姓都住在这里。" />
              <p>世代污物压成的泥泞覆盖路面，只剩几块粉红色明代石板。饥饿的狗在空地哀叫，黑色污水散发刺鼻气味；尘土把人群罩成昏黄一片，骆驼商队缓慢挤过穷铺、棚屋、苦役和成群乞丐。越靠近天坛，贫困越像一堵没有尽头的墙。</p>
              <BilingualQuote compact pt="Uma multidão rumorosa e espessa... a poeira envolve tudo de uma névoa amarelada; um fedor acre exala-se dos enxurros negros." zh="喧闹而稠密的人群川流不息……尘土给一切罩上黄雾，黑色污水沟散出刺鼻恶臭。" />
            </>
          ) : null}
        </BeijingCurtainScene>
      )}

      {stage === "supplication" && (
        <SupplicationSequence soundEnabled={sound.enabled} onContinue={() => go("testament")}>
          <TiChinFu
            intensity={ghostIntensity}
            revealed={ghostRevealed}
            onInspect={() => {
              setGhostRevealed(!ghostRevealed);
              sound.tone(98, 1.8, 0.12, 0, "sine");
            }}
          />
        </SupplicationSequence>
      )}

      <section className={`scene-card ${isEast ? "scene-card-east" : ""}`} aria-live="polite" aria-hidden={showBeijingCurtain || undefined}>
        {info.act && <div className="scene-kicker">{info.act}</div>}
        <h1>{stage === "intro" ? "《满大人》" : info.title}</h1>
        {info.subtitle && <div className="scene-pt">{info.subtitle}</div>}
        {selectedHotspot && <SourceSlip item={selectedHotspot} />}

        {stage === "intro" && (
          <div className="intro-content">
            <p className="lede">一柄摇铃，一条从里斯本通往北京的航线，<br />以及一笔永远无法还清的债。</p>
            <button className="primary-action bell-action" onClick={() => { sound.enable(); go("office"); }}>
              <span>进入故事世界</span>
            </button>
            <p className="edition-note">根据埃萨·德·凯罗斯的小说改编</p>
          </div>
        )}

        {stage === "office" && (
          <div className="scene-body office-scene">
            <BilingualQuote pt="A minha existência era bem equilibrada e suave. Toda a semana, de mangas de lustrina à carteira da minha repartição, ia lançando, numa formosa letra cursiva, sobre o papel ‘Tojal’ do Estado, estas frases fáceis..." zh="我的生活平稳而安宁。每周，我戴着黑亮的护袖，伏在部门的书桌前，以优美的草体誊写国家公文。" />
            <p>墨水、火漆与称谓把一周分成整齐的格子。我只须让每一道笔画保持恭敬，便可以安稳地领到每月二万雷斯。</p>
            <div className="office-actions">
              <button className={`object-action ${officeDocumentSeen ? "is-read" : ""}`} onClick={toggleOfficeDocument}><span>{officeDocumentOpen ? "收起桌上的公文" : "展开桌上的公文"}</span><small>国家“托雅尔”公文纸</small></button>
              <button className={`object-action ${officeDozed ? "is-read" : ""}`} onClick={toggleOfficeDoze}><span>{officeDozing ? "从梦里醒来" : "打瞌睡"}</span><small>让笔尖暂时停下</small></button>
            </div>
            {officeDocumentOpen && (
              <article className="official-paper">
                <span>王国内政部 · 往来公文</span>
                <p lang="pt">Exmo. Sr. — Tenho a honra de comunicar a V. Exa... Tenho a honra de passar às mãos de V. Exa., Ilmo. e Exmo. Sr...</p>
                <p>尊敬的阁下：本人谨荣幸地向阁下禀告……本人谨荣幸地将此件呈交尊贵而卓越的阁下钧鉴……</p>
              </article>
            )}
            {officeDozing && (
              <div className="dream-bubbles" aria-label="特奥多罗的白日梦">
                <p>“在中央饭店开一瓶香槟，让侍者记住我的名字……”</p>
                <p>“让一双温柔的手向我伸来，在维纳斯清凉的怀中忘掉这张书桌……”</p>
              </div>
            )}
            {officeDocumentSeen && officeDozed ? (
              <button className="primary-action" onClick={() => go("market")}>下班 <span>→</span></button>
            ) : <p className="discovery-count">桌上的公文与短暂的白日梦，都在等待我。</p>}
          </div>
        )}

        {stage === "market" && (
          <div className="scene-body market-scene">
            <BilingualQuote pt="Tinha tomado o hábito discreto de comprar na Feira da Ladra antigos volumes desirmanados, e à noite, no meu quarto, repastava-me dessas leituras curiosas." zh="我养成了一个不动声色的习惯：到旧货市场买些零散残旧的古书，晚上带回房间，在这些古怪的读物里消磨时间。" />
            <p>圣克拉拉的摊位沿着斜坡铺开。旧望远镜、失去圣骨的匣子、剥釉的圣像与停摆的怀表挤在一起；书摊上那些庄严而荒诞的题名，总比一顿晚餐更容易落入我的预算。</p>
            <div className="hotspot-index">
              {(sceneHotspots.market ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <>
                <BilingualQuote compact pt="O tipo venerando, o papel amarelado com picadas de traça, a grave encadernação freirática, a fitinha verde marcando a página — encantavam-me!" zh="古老庄严的字体、虫蛀的黄纸、修道院式的厚重装帧，还有夹在书中的绿色丝带——都令我着迷！" />
                <p>我把那本旧书夹在腋下，数出几个铜币。它将和我一起回到孔塞桑巷一百零六号。</p>
                <button className="primary-action" onClick={() => go("room")}>回家 <span>→</span></button>
              </>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body">
            <BilingualQuote pt="Eu chamo-me Teodoro — e fui amanuense do Ministério do Reino." zh="我叫特奥多罗——曾是王国内政部的一名抄写员。" />
            <p>每周，我弯着背替国家誊写恭敬的公文；每月二万雷斯。夜晚，我回到孔塞桑巷一百零六号，让祷告、彩票和旧书替自己想象幸福。</p>
            <div className="hotspot-index">
              {(sceneHotspots.room ?? []).map((item) => (
                <button key={item.id} className={roomFinds.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{roomFinds.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => go("book")}>仔细翻阅旧书 <span>→</span></button>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "book" && (
          <div className="scene-body book-scene">
            <article className="book-leaf featured-book-page">
              <span>《灵魂的裂缝》</span>
              <blockquote lang="pt">«No fundo da China existe um mandarim mais rico que todos os reis de que a fábula ou a história contam. Dele nada conheces, nem o nome, nem o semblante, nem a seda de que se veste. Para que tu herdes os seus cabedais infindáveis, basta que toques essa campainha, posta a teu lado, sobre um livro. Ele soltará apenas um suspiro, nesses confins da Mongólia. Será então um cadáver: e tu verás a teus pés mais ouro do que pode sonhar a ambição de um avaro. Tu, que me lês e és um homem mortal, tocarás tu a campainha?»</blockquote>
              <p>“中国深处有一个满大人，比传说或历史中的所有国王都更富有。你对他一无所知：不知道他的名字、容貌，也不知道他身穿怎样的绸缎。要继承他无穷无尽的财产，只须摇响放在你身旁一本书上的这只铃。他只会在遥远的蒙古边地发出一声叹息。随后他便成为一具尸体，而你脚下的黄金将多得超出守财奴的野心所能梦想。正在读我的你，也是一个凡人——你会摇响铃吗？”</p>
            </article>
            <button className="primary-action" onClick={() => { sound.tone(164.81, 0.8, 0.08, 0, "triangle"); go("bell"); }}>桌旁传来人声 <span>→</span></button>
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <div className="devil-dialogue-card">
              <span>魔鬼</span>
              <p className="devil-final-line">“来吧，特奥多罗，我的朋友，伸出手来，摇响铃，做个强者！”</p>
            </div>
            {refusals > 0 && refusals < 3 && !bellRung && (
              <div className="devil-reply">
                <span>魔鬼</span>
                <p>“{refusalLines[refusals - 1]}”</p>
              </div>
            )}
            {bellRung && !ringing ? (
              <div className="consequence locked-choice">
                <p>摇铃的动作已经完成。金属余音散入房间，远方那一声叹息也无法撤回。</p>
                <button className="primary-action" onClick={() => go("tiDeath")}>看见铃声抵达远方 <span>→</span></button>
              </div>
            ) : refusals >= 3 ? (
              <div className="consequence locked-choice">
                <p>我已经三次拒绝。魔鬼退入纸页，今晚不会再给出第四次提议。</p>
                <button className="primary-action" onClick={() => go("refusalEnding")}>回到合上的书页 <span>→</span></button>
              </div>
            ) : (
              <div className="bell-choice">
                <button className={`bell-object ${ringing ? "is-ringing" : ""}`} onClick={ringBell} disabled={ringing} aria-label="摇铃">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/bell-v1.png" alt="一柄精致的十九世纪欧洲黄铜手摇铃" />
                </button>
                <div className="choice-stack">
                  <button className="choice-button dangerous" onClick={ringBell} disabled={ringing}><span>摇铃</span></button>
                  <button className="choice-button" onClick={refuse} disabled={ringing}><span>拒绝</span></button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === "tiDeath" && (
          <div className="ti-death-scene" key={deathAnimationRun}>
            <div className="death-mist death-mist-back" aria-hidden="true" />
            <div className="death-character-stage" aria-label="狄鑫福在花园溪流旁的草岸上听见铃声后倒地身亡的剪纸动画">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-alive-cutout" src="/ti-chin-fu-alive-v3.png" alt="肥胖、白胡子的狄鑫福身穿黄绸，怀抱纸鸢，站在溪流旁的草岸上" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-corpse-cutout" src="/ti-chin-fu-corpse-v3.png" alt="狄鑫福仰面倒在溪边草地上，冰冷的双臂仍抱着纸鸢" />
              <div className="death-ground-shadow" aria-hidden="true" />
            </div>
            <div className="death-mist death-mist-front" aria-hidden="true" />
            <aside className={`death-caption ${deathAnimationDone ? "is-visible" : ""}`}>
              <blockquote lang="pt">“Agora jaz à beira de um arroio cantante, todo vestido de seda amarela, morto, de pança ao ar, sobre a relva verde; e nos braços frios tem o seu papagaio de papel, que parece tão morto como ele.”</blockquote>
              <p>“如今他躺在潺潺溪水旁，身穿黄绸，仰面死在绿草上；冰冷的双臂仍抱着纸鸢，那纸鸢看起来也和他一样死寂。”</p>
              <div className="death-actions">
                <button onClick={replayTiDeath}>再看一次</button>
                <button className="primary-action" onClick={() => go("inheritance")}>一个月以后 <span>→</span></button>
              </div>
            </aside>
          </div>
        )}

        {stage === "refusalEnding" && (
          <div className="scene-body ending-body refusal-body">
            <div className="ending-mark">I</div>
            <p className="ending-label">特别结局 · 合上的书页</p>
            <blockquote className="ending-quote">“好极了，我亲爱的朋友。你没有摇铃。你保住了良心——也保住了贫困。合上书吧；明天我们再谈谈它们各自的价钱。”</blockquote>
            <p className="original-note">魔鬼退回页缝。你赢得了今晚；他拥有所有明天。<br />（以上为游戏原创台词，并非艾萨原文。）</p>
            <button className="primary-action" onClick={reset}>返回故事世界</button>
          </div>
        )}

        {stage === "inheritance" && (
          <div className="scene-body inheritance-scene">
            {!inheritanceOpened ? (
              <>
                <BilingualQuote compact pt="Decorreu um mês." zh="一个月过去了。" />
                <p>八月的一个星期日早晨，我穿着衬衫躺在床上打盹，熄灭的香烟还粘在唇边。门轻轻作响；我半睁开困倦的眼睛，看见一个秃顶的老头在我的床前俯下身。</p>
                <div className="messenger-dialogue">
                  <span>西尔维斯特</span>
                  <BilingualQuote compact pt="O Sr. Teodoro?... O Sr. Teodoro do Ministério do Reino?" zh="您是特奥多罗先生？……王国内政部的特奥多罗先生？" />
                  <p>他矮小而肥胖，白色络腮胡擦着黑色呢外套的翻领，金丝眼镜在圆脸上微微发颤；双手捧着一只鼓胀的信封，黑蜡封印沉沉压在纸上。</p>
                </div>
                <div className="sealed-letter">
                  <button onClick={() => { setInheritanceOpened(true); sound.tone(329.63, 0.9, 0.08); }}>
                    <span className="wax-seal">S</span>
                    <strong>黑蜡封缄的信</strong>
                    <small>拆开</small>
                  </button>
                </div>
              </>
            ) : (
              <>
                <BilingualQuote pt="São cento e seis mil contos, senhor!... da herança depositada do mandarim Ti Chin-Fu!" zh="是十万六千孔托，先生！……那是满大人狄鑫福存下的遗产！" />
                <p>西尔维斯特说，这封信由他在澳门、香港与南安普敦的事务所辗转送达。一个月前还是穷抄写员的我，如今成了陌生死者的唯一继承人。</p>
                <div className="money-number">106,000 <small>孔托雷斯</small></div>
                <BilingualQuote compact pt="Pobre Ti Chin-Fu!... Estava no seu jardim, sossegado, armando, para o lançar ao ar, um papagaio de papel..." zh="可怜的狄鑫福！……他本来安静地待在花园里，正扎着一只准备放飞的纸鸢……" />
                <p>直到这时，铃声与遗产终于有了名字。狄鑫福身穿黄绸，倒在溪边的草地上，怀中仍抱着尚未放飞的纸鸢。</p>
                <button className="primary-action" onClick={() => go("luxury")}>搬入洛雷托豪宅 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <BilingualQuote pt="Então começou a minha vida de milionário." zh="于是，我的百万富翁生活开始了。" />
            <p>洛雷托豪宅的金床、酒器和金币把巨款变成我触手可及的快感；横陈在地的尸体却让享乐渐渐失去滋味。</p>
            <div className="hotspot-index">
              {(sceneHotspots.luxury ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => { sound.tone(110, 2.4, 0.08); go("ghost"); }}>我无法忽视…… <span>→</span></button>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "ghost" && (
          <div className="scene-body ghost-scene">
            <BilingualQuote pt="ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços... Era o mandarim Ti Chin-Fu!" zh="他不是横卧在门槛上，就是横陈在金床上——那肥胖的身躯拖着黑辫，穿着黄袍，怀中抱着纸鸢……正是满大人狄鑫福！" />
            <p>他就横陈在那里：肥胖的老文人，白色长髭遮住嘴唇，黑辫拖在身后，黄绸包裹着朝上的肚腹，冰冷的双臂仍抱着纸鸢。</p>
            {avoidance ? (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "音乐、酒宴和彻夜狂欢只能暂时淹没罪疚；宾客散去后，狄鑫福仍横陈在门槛。留在欧洲，我永远无法摆脱他。" : avoidance === "church" ? "弥撒可以为亡魂祈祷，却不能把财产归还给被夺走一切的家族。若要真正补偿死者，我必须亲自找到狄鑫福的后代。" : "捐款救济了许多陌生人，却始终没有抵达狄鑫福的家族。我终于决定追查他们的下落，把这笔财富交还给真正的继承人。"}</p>
                <BilingualQuote compact pt="Partiria para Pequim; descobriria a família de Ti Chin-Fu..." zh="我要去北京；找到狄鑫福的家人……" />
                <button className="primary-action" onClick={() => go("map")}>登上去往中国的轮船 <span>→</span></button>
              </div>
            ) : !ghostRevealed ? (
              <p className="discovery-count">尸影尚未显出原貌。</p>
            ) : (
              <>
                <BilingualQuote compact pt="Tinha eliminado a criatura, de longe, com uma campainha... eu assassinara um velho!" zh="我从远方摇响一柄摇铃除掉了这个人……我杀死了一个老人！" />
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => chooseAvoidance("pleasure")}><span>加倍享乐</span><small>让音乐盖过铃声</small></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("church")}><span>求助教会</span><small>为死者购买弥撒</small></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("charity")}><span>慷慨捐赠</span><small>把利息叫作慈善</small></button>
                </div>
              </>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <BilingualQuote pt="Anelei, suspirei por pisar a terra da China!... pus a proa ao Oriente." zh="我渴望着、叹息着，想要踏上中国的土地！……于是船头转向东方。" />
            <p>为了查明狄鑫福后代的下落，我用成把的金币匆忙办妥准备，从里斯本赶到马赛，包下整艘名为“锡兰号”的邮船。第二天清晨，我迎着海鸥与初升的阳光驶离马赛，船头转向东方。</p>
            <div className="route" role="img" aria-label={`航线进度：${routes[routeIndex][0]}`}>
              <div className="route-line"><span style={{ width: `${(routeIndex / (routes.length - 1)) * 100}%` }} /></div>
              {routes.map((stop, index) => (
                <button key={stop[0]} className={`route-stop ${index <= routeIndex ? "is-reached" : ""} ${index === routeIndex ? "is-current" : ""}`} style={{ left: `${(index / (routes.length - 1)) * 100}%` }} disabled aria-label={stop[0]}>
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
          </div>
        )}

        {stage === "beijing" && (
          <div className="scene-body beijing-arrival-scene">
            <BilingualQuote pt="Pequim está diante de mim! E uma vasta muralha, monumental e bárbara, de um negro baço..." zh="北京就在我眼前！一道广阔、雄伟而粗犷的城墙呈暗黑色，向视线尽头延伸……" />
            <p>城门层叠的飞檐衬在血色紫红的落日上；北面，蒙古群山像悬在淡紫烟霭中。黑墙脚下挤着一片异国集市，摇曳的灯笼把暮色割成血红斑块，白色棚布像停在墙边的一群蝴蝶。</p>
            <div className="hotspot-index">
              {(sceneHotspots.beijing ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {!hasInspectedAll ? (
              <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
            ) : (
              <>
                <BilingualQuote compact pt="Uma rica liteira esperava-me à Porta de Tung Tsen-Men, para eu atravessar Pequim até à residência militar de Camilloff." zh="一乘华贵的轿子正在东直门外等我，要载我穿过北京，前往卡米洛夫的军邸。" />
                <button className="primary-action" onClick={() => go("repose")}>坐进轿子，穿过东直门 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "repose" && (
          <div className="scene-body beijing-tour-scene">
            {!beijingDestination && (
              <>
                <BilingualQuote pt="Senti-me triste; subi à liteira, cerrei as cortinas de seda escarlate todas bordadas a ouro; e cercado dos cossacos, eis-me entrando a velha Pequim..." zh="我感到一阵悲凉；坐进轿子，合上绣满金线的猩红丝帘，在哥萨克骑兵护送下进入古老的北京……" />
                <p>车轮、轿杠、马蹄和骆驼的步伐从帘外交错而过。每到一处，我都可以命轿夫停下，掀开帘子，看看这座城把奢华与苦难安置在多么接近的地方。</p>
                <div className="beijing-destination-grid">
                  {beijingDestinationKeys.map((key) => {
                    const destination = beijingDestinations[key];
                    return (
                    <button key={key} className={beijingVisited.includes(key) ? "is-visited" : ""} onClick={() => chooseBeijingDestination(key)}>
                      <span>{beijingVisited.includes(key) ? "再去" : "前往"}</span>
                      <strong>{destination.title}</strong>
                      {destination.original && <em>{destination.original}</em>}
                      <small>{destination.summary}</small>
                    </button>
                    );
                  })}
                </div>
                {allBeijingStopsVisited && <button className="primary-action" onClick={beginCamilloffMeeting}>前往卡米洛夫府邸 <span>→</span></button>}
              </>
            )}
          </div>
        )}

        {stage === "camilloffSalon" && (
          <div className="scene-body generala-visit">
            <BilingualQuote pt="Era alta e loira; tinha os olhos verdes das sereias de Homero... e nos dedos, que lhe beijei, errava um aroma fino de sândalo e de chá." zh="她身材高挑，一头金发，绿色眼睛像荷马笔下的海妖……我吻过的手指间，浮动着檀香与茶的细微香气。" />
            <p>轿子停在卡米洛夫府邸。月光洒满花园，流水在黑暗中低语；将军夫人穿白色丝裙，胸前别着一朵猩红玫瑰。在她身边，欧洲的谈话与钢琴声几乎把我从赎罪之旅里带走。</p>
            <div className="generala-topics">
              <button className={generalaTopics.includes("europe") ? "is-read" : ""} onClick={() => inspectGeneralaTopic("europe")}><span>和她聊天</span><small>虚无主义、左拉与里奥十三世</small></button>
              <button className={generalaTopics.includes("piano") ? "is-read" : ""} onClick={() => inspectGeneralaTopic("piano")}><span>请她弹琴</span><small>女低音划破紫禁城的寂静</small></button>
            </div>
            {generalaTopics.includes("europe") && <BilingualQuote compact pt="Conversámos muito da Europa, do niilismo, de Zola, de Leão XIII, e da magreza de Sarah Bernhardt..." zh="我们谈了许多欧洲的事：虚无主义、左拉、里奥十三世，还有莎拉·伯恩哈特的消瘦……" />}
            {generalaTopics.includes("piano") && <BilingualQuote compact pt="Depois ela sentou-se ao piano — e a sua voz de contralto quebrou até tarde os silêncios melancólicos da Cidade Tártara..." zh="后来她坐到钢琴前——她的女低音一直到深夜还在划破紫禁城忧郁的寂静……" />}
            {generalaTopics.length >= 2 ? <button className="primary-action" onClick={() => go("camilloffMeeting")}>第二天去见卡米洛夫将军 <span>→</span></button> : <p className="discovery-count">与她交谈，再听一段琴声。</p>}
          </div>
        )}

        {stage === "camilloffMeeting" && (
          <div className="scene-body camilloff-meeting">
            {camilloffNews ? (
              <div className="dialogue-result repose-news">
                <div className="speaker">卡米洛夫</div>
                <BilingualQuote compact pt="Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó! Tinha morrido subitamente: e a sua larga descendência residia lá, em miséria, num casebre vil..." zh="终于查明，一位名叫狄鑫福的富有满大人曾住在蒙古边境的天河村。他猝然去世；众多后代仍住在那里，穷困地挤在一间破屋里……" />
                <BilingualQuote compact pt="Depois desde que chegara a Pequim, eu não tornara a avistar a forma odiosa de Ti Chin-Fu e do seu papagaio. A Consciência era dentro em mim como uma pomba adormecida." zh="自从来到北京，我再没有看见狄鑫福与纸鸢那可憎的形影。良心在我心里，仿佛一只睡着的鸽子。" />
                <p>我几乎想把这份寂静误认作宽恕。卡米洛夫却已经用铅笔标出路线：线索指向北京以北、越过长城后的天河村；先沿白河北上，再换船、骑马穿过长城，最后还要步行两天。</p>
                <button className="primary-action" onClick={() => go("tienho")}>告别卡米洛夫，前往天河村 <span>→</span></button>
              </div>
            ) : (
              <>
                <BilingualQuote pt="Sei duas palavras importantes, general: ‘mandarim’ e ‘chá’." zh="将军，我会两个重要的词：‘满大人’和‘茶’。" />
                <p>第二天一早，我把那柄摇铃、狄鑫福的死与此行的目的全都告诉卡米洛夫。我们隔桌而坐；老将军捋着浓密的白胡子，逐一驳回我那些过于简单的补偿办法。</p>
                {!camilloff ? (
                  <div className="choice-stack">
                    <button className="choice-button" onClick={() => chooseCamilloff("treasury")}><span>把一半巨款交给国库</span><small>也许狄鑫福会因此平静</small></button>
                    <button className="choice-button" onClick={() => chooseCamilloff("rice")}><span>私人向饥民分发大米</span><small>以慈善绕开国家</small></button>
                    <button className="choice-button" onClick={() => chooseCamilloff("family")}><span>寻找狄鑫福的家族</span><small>把巨款直接还给后代</small></button>
                  </div>
                ) : (
                  <div className="dialogue-result">
                    <div className="speaker">卡米洛夫</div>
                    <BilingualQuote compact pt={camilloff === "treasury" ? "Erro, considerável erro, mancebo! Esses milhões nunca chegariam ao Tesouro imperial." : camilloff === "rice" ? "Funesta... A corte imperial veria aí imediatamente uma ambição política." : "Faça uma coisa. Procure a família de Ti Chin-Fu..."} zh={camilloff === "treasury" ? "错了，大错特错，年轻人！这些钱永远到不了帝国国库。" : camilloff === "rice" ? "这会招致灾祸……朝廷会立刻从中看出政治野心。" : "做一件事吧。去寻找狄鑫福的家人……"} />
                    <p>{camilloff === "treasury" ? "钱只会留在统治阶层‘深不可测的口袋’里，不能让一个饥民吃饱。" : camilloff === "rice" ? "朝廷会把赈米视为收买民众、威胁王朝的政治野心。" : "只有找到死者的家人，补偿才可能真正抵达被夺去财富的人。"} 卡米洛夫答应向佟亲王查问狄鑫福后代的住处。</p>
                    <button className="primary-action" onClick={() => setCamilloffNews(true)}>等待佟亲王的回信 <span>→</span></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {stage === "tienho" && (
          <div className="scene-body attack-scene">
            <BilingualQuote pt="Já a tarde declinava, e o Sol descia vermelho como um escudo de metal candente, quando chegámos a Tien-Hó." zh="我们抵达天河村时，午后已经衰退，太阳像一面烧红的金属盾牌缓缓下沉。" />
            <p>黑色村墙倚着咆哮的溪流；东面的荒原一直伸向天主教修道院，北方仍是悬在空中的蒙古紫山。我住进气味污浊的“尘世安慰客栈”，屋梁下吊满纸龙。短暂走进街巷后，我因泥泞、污水、饥饿的狗和围观人群而匆匆返回。</p>
            <p>我和萨托原计划第二天找到狄鑫福的遗孀，把存放在北京的巨款交给她，再经地方官同意向全村分米。可是入夜以后，消息先一步传遍街巷：一个“外国魔鬼”带着装满财宝的行李车来到村里。白天那些惊异的目光开始在客栈周围徘徊，萨托只得把行李车推到门前作成路障。</p>
            <BilingualQuote compact pt="Desde as autoridades até aos mendigos, a fama da minha riqueza, a legenda das carretas carregadas de ouro inflamara todos os apetites!..." zh="从官府到乞丐，我富有的传闻、那些装满黄金的车辆传说，已经点燃了所有人的欲望！……" />
            <p>午夜时，低沉的声浪包围客栈。萨托怀疑连地方官也在暗中主持这场抢掠：在财富传言面前，原本等待救济的人群、旅店主人和官府忽然有了同一个目的——在天亮前夺走我带来的全部财物。</p>
            <BilingualQuote pt="era em roda da estalagem toda a populaça de Tien-Hó, rosnando sinistramente..." zh="天河村的全部民众围在客栈四周，发出阴森的低吼……" />
            <div className="hotspot-index">
              {(sceneHotspots.tienho ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {!hasInspectedAll ? (
              <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
            ) : !attackChoice ? (
              <button className="primary-action" onClick={chooseAttack}>把钱币撒向人群 <span>→</span></button>
            ) : (
              <div className="consequence">
                <p>萨托把成串的铜钱一把把撒下；人群短暂满足，随后又齐声索要“更多”。钱袋很快见底，行李车和木箱也被冲破，全部财物在乱刀与无数双手之间散尽。</p>
                <BilingualQuote compact pt="A turba rugia, insaciada... Não tenho mais, criatura! O resto está em Pequim!" zh="人群仍不满足，咆哮起来……我没有了，朋友！其余的都在北京！" />
                <p>人群闯进客栈搜寻更大的财宝。我拆开后院竹栅，扑向拴在横梁上的马，死死抓住鬃毛；箭与砖块从身旁飞过，我沿黑暗的街巷冲向城墙的缺口。</p>
                <button className="primary-action" onClick={() => go("wilderness")}>策马冲出天河村 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "wilderness" && (
          <div className="scene-body wilderness-scene">
            <BilingualQuote pt="De repente o pónei, eu, rolámos com um baque surdo. Era uma lagoa... vi o pónei, correndo, muito longe, como uma sombra, com os estribos ao vento..." zh="突然，我和马匹砰然滚倒——那是一片水塘……等我重新站稳，只见马匹已经跑得很远，像一道黑影，空马镫在风中甩动……" />
            <p>我浑身湿透，耳边的血一路滴到肩上。马匹消失以后，只剩我独自穿过泥地与荆棘；寒气把衣服冻结在皮肤上，黑暗里仿佛有野兽的眼睛闪动。</p>
            <BilingualQuote compact pt="Então comecei a caminhar por aquela solidão, enterrando-me nas terras lodosas, cortando através do mato espinhoso." zh="于是，我开始穿过那片荒凉之地，陷进泥泞的土地，劈开带刺的灌木前行。" />
            {collapseSeen ? (
              <div className="consequence locked-choice">
                <p>我已经倒在废弃棺木旁的荒野里；两位前往天河村的遣使会神父把我抬回了修道院。</p>
                <button className="primary-action" onClick={() => go("mission")}>回到修道院的清晨 <span>→</span></button>
              </div>
            ) : (
              <button className="primary-action" onClick={collapseInWilderness}>支撑着继续走 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "mission" && (
          <div className="scene-body">
            <BilingualQuote pt="um sino tocava a matinas... rolaram-me das pálpebras duas lágrimas mudas." zh="晨祷的钟声响了起来……两滴无声的泪从我的眼睑滚落。" />
            <p>两位遣使会神父清晨在路上发现了昏迷的我，把我用担架抬回修道院。朱利奥神父身穿紫袍，留着长辫和庄严的胡须，手中缓缓摇着一柄巨大的折扇；在回廊里，他看上去几乎像一位沉思经书的老满大人。</p>
            <BilingualQuote compact pt="O superior lazarista era o excelente padre Giulio... com a sua túnica roxa, o rabicho longo, a barba venerável, agitando devagar um enorme leque..." zh="遣使会的院长是善良的朱利奥神父……他穿着紫袍，留着长辫和庄严的胡须，缓缓摇动一柄巨大的折扇……" />
            <div className="hotspot-index">
              {(sceneHotspots.mission ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => go("letter")}>拆开卡米洛夫的信 <span>→</span></button>
            ) : (
              <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
            )}
          </div>
        )}

        {stage === "letter" && (
          <div className="scene-body">
            <div className="letter-sheet">
              <span>附言 · 卡米洛夫将军</span>
              <p><span lang="pt">“Enquanto à viúva e família de Ti Chin-Fu, houve um engano...”</span><span>“关于狄鑫福的遗孀和家人，事情弄错了……”</span></p>
              <button className={letterClues.includes("cantao") ? "is-read" : ""} onClick={() => setLetterClues((clues) => clues.includes("cantao") ? clues : [...clues, "cantao"])}>
                <b>广东</b><em><span lang="pt">“É no Sul da China, na província de Cantão.”</span><span>“他们住在中国南方的广东省。”</span></em>
              </button>
              <button className={letterClues.includes("kaoli") ? "is-read" : ""} onClick={() => setLetterClues((clues) => clues.includes("kaoli") ? clues : [...clues, "kaoli"])}>
                <b>高丽</b><em><span lang="pt">“Mas também há uma família Ti Chin-Fu para além da Grande Muralha...”</span><span>“但长城之外也有一个狄鑫福家族……”</span></em>
              </button>
            </div>
            {letterClues.length < 2 ? (
              <p className="discovery-count">已展开 {letterClues.length} / 2</p>
            ) : !letterDecision ? (
              <>
                <p>这封信里居然涉及两个死去的狄鑫福，两个在贫困中挣扎的家庭。我要把财富还给谁？那个原本确切的名字，在眼前重新变得无法辨认。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => chooseLetterDecision("search")}><span>再寻找一次</span><small>去广东，或去高丽</small></button>
                  <button className="choice-button dangerous" onClick={() => chooseLetterDecision("return")}><span>返回欧洲</span><small>我已经尽力了</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <BilingualQuote compact pt="Além disso, Ti Chin-Fu e o seu papagaio continuavam invisíveis... e já o aplacamento do remorso visível diminuíra em mim singularmente o desejo da expiação..." zh="此外，狄鑫福和他的纸鸢始终没有再出现……随着那可见的悔恨平息，我赎罪的愿望也显著减弱了……" />
                <p>自从踏入中国，我一次也没有再看见狄鑫福的尸身。我把这段沉默解释成死者已经看见我的奔波，也已经平息了怨怼。</p>
                {letterDecision === "search" ? (
                  <>
                    <BilingualQuote compact pt="Ir de novo bater as estradas da China? Jamais!" zh="还要重新踏遍中国的道路？绝不！" />
                    <p>广东、高丽、又一次漫长旅途与袭击的阴影在我眼前交替出现。我把两条路线默念了一遍，却再也无法让受伤的身体迈向其中任何一条；最终，我把信折起，决定返回欧洲。</p>
                  </>
                ) : (
                  <p>我没有再去追逐信上互相冲突的地址。受伤的身体、天河村的砖石和那两个同名家族在眼前纠缠；回廊却寂静无声，我终于说服自己：已经做过合理、慷慨而合乎逻辑的事。</p>
                )}
                <BilingualQuote compact pt="Bem, Ti Chin-Fu está contente." zh="好吧，狄鑫福已经满意了。" />
                <button className="primary-action" onClick={() => go("return")}>返回欧洲 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "return" && (
          <div className="scene-body ghost-scene">
            <p>“爪哇号”载着我离开香港，向欧洲返航。直到那天夜里，我都以为狄鑫福已经平息了怨怼；十一点，我走进熄灯后的船舱，月光正穿过舷窗。</p>
            <BilingualQuote
              pt="Eram onze horas quando desci ao meu beliche. As luzes já estavam apagadas: mas a Lua que se erguia ao nível da água, redonda e branca, batia o vidro da cabina com um raio de claridade: e então, a essa meia-tinta pálida, lá vi, estirada sobre a maca, a figura pançuda, vestida de seda amarela, com o seu papagaio nos braços!"
              zh="十一点钟，我回到自己的卧舱。灯已经熄灭；圆而苍白的月亮从水面升起，一道清光照在舷窗上。就在那片惨淡的半明半暗中，我看见吊床上横陈着那肥胖的身躯：身穿黄绸，怀里抱着纸鸢！"
            />
            <BilingualQuote compact pt="Era ele, outra vez! E foi ele, perpetuamente!" zh="又是他！阴魂不散！" />
            <p>狄鑫福是在返程的船上突然重新出现的。从此，无论船停靠哪里，他都保持着同一个死亡姿态，仿佛距离再也不能把我们分开。</p>
            <div className="return-stamps" aria-label="返航地点">
              {["新加坡", "锡兰", "苏伊士", "马耳他", "直布罗陀", "里斯本"].map((place, index) => (
                <button key={place} className={returnStops.includes(place) ? "is-read" : ""} style={{ animationDelay: `${index * 0.16}s` }} onClick={() => {
                  setReturnStops((stops) => stops.includes(place) ? stops : [...stops, place]);
                  sound.tone(110 + index * 14, 0.7, 0.11, 0, "triangle");
                }}>{place}</button>
              ))}
            </div>
            {returnStops.length >= 6 ? (
              <>
                <BilingualQuote compact pt="Quando desembarquei em Lisboa... a sua figura bojuda enchia todo o arco da Rua Augusta." zh="当我在里斯本下船时……他肥胖的身影塞满了奥古斯塔街的整座拱门。" />
                <button className="primary-action" onClick={() => go("reckoning")}>回到洛雷托 <span>→</span></button>
              </>
            ) : <p className="discovery-count">已经过 {returnStops.length} / 6</p>}
          </div>
        )}

        {stage === "reckoning" && (
          <div className="scene-body ghost-scene reckoning-scene">
            <BilingualQuote
              pt="Então, certo que não poderia jamais aplacar Ti Chin-Fu, toda essa noite no meu quarto ao Loreto, onde como outrora as velas inumeráveis das serpentinas davam aos damascos tons de sangue fresco, meditei sacudir de mim, como um adorno de pecado, esses milhões sobrenaturais."
              zh="于是，我确信自己再也无法平息狄鑫福。那一整夜，我待在洛雷托的房间里；枝形烛台上无数蜡烛一如往昔，把锦缎映成鲜血般的颜色。我反复思量，要把这笔超自然的巨款像罪恶的饰物一样从身上甩掉。"
            />
            <p>彻夜不灭的烛火把每一面锦缎都染成血色。狄鑫福仍横陈在宴席与金床之间；我已经走过半个世界，却没有让他的目光离开我。若财富是这具尸体通向我的道路，我只能把它截断。</p>
            <BilingualQuote compact pt="E assim me libertaria talvez daquela pança e daquele papagaio abominável!" zh="也许这样，我才能摆脱那肥胖的尸身和那只可憎的纸鸢！" />
            <button className="primary-action" onClick={() => go("renounce")}>抛下这笔财产 <span>→</span></button>
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <BilingualQuote pt="Abandonei o palacete ao Loreto, a existência de nababo." zh="我抛下洛雷托的宫殿，也抛下富豪般的生活。" />
            <p>我重新租下马克斯太太家的旧房间，却再也回不到从前那种安静的贫穷。</p>
            <div className="hotspot-index">
              {(sceneHotspots.renounce ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <div className="ledger-animation" aria-hidden="true"><span>洛雷托宫殿</span><i>— 十万六千孔托</i><b>{currentVisited.length >= 3 ? "仍属于我" : "零？"}</b></div>
            <div className="consequence">
              <BilingualQuote pt="todos aqueles que a minha opulência humilhara cobriram-me de ofensas, como se alastra de lixo uma estátua derrubada de príncipe decaído." zh="所有曾受我财富羞辱的人都用侮辱覆盖我，如同人们把垃圾铺满一尊倒下的失势王子的雕像。" />
              <p>旧同事、报纸、贵族、教会、街上的人群，甚至马克斯太太，都在惩罚我的贫穷。每一次羞辱，都把我重新推向那座豪宅。</p>
              <BilingualQuote compact pt="Então, indignado, um dia subitamente reentrei com estrondo no meu palacete e no meu luxo." zh="终于有一天，我愤怒地轰然闯回自己的宫殿和奢华生活。" />
              <p>我试着继续忍受，可银行里的财富仍在等我，狄鑫福也没有离开。旧同事、报纸和街上的石块把我逼到尽头；我终于转身，重新走向洛雷托。</p>
              {hasInspectedAll ? (
                <button className="primary-action" onClick={() => go("prison")}>推开洛雷托豪宅的大门 <span>→</span></button>
              ) : (
                <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
              )}
            </div>
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body loreto-restored-body">
            <BilingualQuote
              pt="Logo, Lisboa, sem hesitar, se rojou aos meus pés. A Madame Marques chamou-me, chorando, «filho do seu coração». Os jornais deram-me os qualificativos que, de antiga tradição, pertencem à Divindade: fui o Omnipotente, fui o Omnisciente! A Aristocracia beijou-me os dedos como a um tirano: e o Clero incensou-me como a um ídolo."
              zh="里斯本立即毫不迟疑地匍匐在我脚下。马克斯太太哭着称我为‘她心爱的儿子’。报纸把按古老传统属于神明的称号送给我：我是全能者，我是全知者！贵族像面对暴君般亲吻我的手指；教士像供奉偶像般向我献香。"
            />
            <p>长窗重新放出灯火，身穿黑绸制服的仆人又在洛雷托豪宅中穿行。我重新拥有了整个里斯本，却只在它的敬畏里感到厌倦。</p>
            <BilingualQuote compact pt="Desde então uma saciedade enervante mantém-me semanas inteiras num sofá, mudo e soturno, pensando na felicidade do não-ser..." zh="从那以后，一种令人虚弱的餍足让我一连数周躺在沙发上，沉默而阴郁，想着不存在的幸福……" />
            <button className="primary-action" onClick={() => go("devilReturn")}>独自走入夜色 <span>→</span></button>
          </div>
        )}

        {stage === "devilReturn" && (
          <div className="scene-body devil-street-body">
            <BilingualQuote
              pt="Uma noite, recolhendo só por uma rua deserta, vi diante de mim o Personagem vestido de preto com o guarda-chuva debaixo do braço, o mesmo que no meu quarto feliz da Travessa da Conceição me fizera, a um ti-li-tim de campainha, herdar tantos milhões detestáveis."
              zh="一天夜里，我独自走在一条荒无人烟的街上，忽然看见前方那个一身黑衣、腋下夹着雨伞的人——正是他，曾在孔塞桑巷那间幸福的小屋里，让我随着铃的一声轻响继承了那些可憎的千万财富。"
            />
            <p>煤气灯的微光落在他的礼帽和黑色外套上。他仍然像第一次出现时那样庄重、平静，仿佛我们之间从未横过一具尸体与半个世界。</p>
            <button className="primary-action dangerous-action" onClick={() => go("devilDialogue")}>追上他 <span>→</span></button>
          </div>
        )}

        {stage === "devilDialogue" && (
          <div className="scene-body devil-dialogue-body">
            <p>我向他冲去，死死抓住他那件市民式长外套的衣襟，喊道：</p>
            <BilingualQuote pt="Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!" zh="把我从财富中解救出来！让满大人复活！把贫穷的安宁还给我！" className="ending-quote" />
            <p>他庄重地把雨伞移到另一只胳膊下，和善地回答：</p>
            <BilingualQuote pt="Não pode ser, meu prezado senhor, não pode ser..." zh="不行，我尊贵的先生，不行……" className="ending-quote devil-final" />
            <button className="primary-action supplication-action" onClick={begTheDevil}>{supplicated ? "回到魔鬼消失的一刻" : "乞求"} <span>→</span></button>
          </div>
        )}

        {stage === "supplication" && (
          <div className="scene-body supplication-body">
            <BilingualQuote
              pt="Eu atirei-me aos seus pés numa suplicação abjecta: mas só vi diante de mim, sob uma luz mortiça de gás, a forma magra de um cão farejando o lixo."
              zh="我扑倒在他脚下，卑微地哀求；可当我抬起头，在煤气灯将熄的微光里，面前只剩一条瘦狗，正在垃圾堆中嗅闻。"
            />
            <p>我跪在湿冷的石路上，伸出的双手抓不住任何衣角。魔鬼消失了；他的回答却留了下来。</p>
            <BilingualQuote compact pt="Nunca mais encontrei este indivíduo." zh="我再也没有遇见过这个人。" />
            <button className="primary-action" onClick={() => go("testament")}>回到洛雷托 <span>→</span></button>
          </div>
        )}

        {stage === "testament" && (
          <>
            <div className="scene-body testament-body">
              <p className="ending-label">正篇结局</p>
              <p>我回到洛雷托豪宅，痛苦地坐在办公桌前。魔鬼不肯撤销交易，狄鑫福的尸影也没有离去；财富仍在身边，我却再也无法把它当作幸福。</p>
              <p>桌上放着一份已经写好的遗嘱，以及一本记录这一切的书。</p>
              <div className="final-artifact-progress" aria-live="polite">
                <span className={finalArtifactsSeen.includes("testament") ? "is-read" : ""}>遗嘱</span>
                <span className={finalArtifactsSeen.includes("book") ? "is-read" : ""}>《满大人》</span>
              </div>
              {finalArtifactsRead && <button className="primary-action" onClick={reset}>返回故事世界的起点 <span>→</span></button>}
            </div>

            <div className="ending-object-hotspots" aria-label="桌上的物件">
              <button className={finalArtifactsSeen.includes("testament") ? "is-read testament-hotspot" : "testament-hotspot"} onClick={openFinalTestament} aria-label="展开遗嘱">
                <i>01</i><span>遗嘱</span>
              </button>
              <button className={finalArtifactsSeen.includes("book") ? "is-read final-book-hotspot" : "final-book-hotspot"} onClick={openFinalBook} aria-label="查看《满大人》">
                <i>02</i><span>《满大人》</span>
              </button>
            </div>

            {testamentOpen && (
              <div className="artifact-overlay" role="dialog" aria-modal="true" aria-label="特奥多罗的遗嘱">
                <article className="will-sheet">
                  <button className="artifact-close" onClick={() => setTestamentOpen(false)}>收起</button>
                  <p className="will-kicker">遗嘱</p>
                  <h2>特奥多罗最后的意愿</h2>
                  <p><strong>立遗嘱人：</strong>特奥多罗</p>
                  <ol>
                    <li>鉴于本人自知将死，现将名下由狄鑫福之死而来的全部财产、现金、宅邸及其收益，悉数遗赠予魔鬼。</li>
                    <li>这些财富本就属于他；由他亲自认领，并依其意志处置与分配。</li>
                  </ol>
                  <p>本遗嘱为本人最后且不可撤回的意愿。</p>
                  <p className="will-signature">Teodoro</p>
                </article>
              </div>
            )}

            {finalBookPhase > 0 && (
              <div className="artifact-overlay final-book-overlay" role="dialog" aria-modal="true" aria-label="《满大人》">
                <div className="final-book-dialog">
                  {finalBookPhase === 1 ? (
                    <>
                      <div className="final-book-cover" aria-label="《满大人》封面">
                        <small>特奥多罗著</small>
                        <span>《满大人》</span>
                      </div>
                      <button className="final-book-action" onClick={turnFinalBookCover}>翻开</button>
                    </>
                  ) : (
                    <>
                      <article className="final-book-page" aria-label="翻开的《满大人》">
                        <section className="final-book-leaf">
                          <p lang="pt"><em>Só sabe bem o pão que dia a dia ganham as nossas mãos: nunca mates o Mandarim!</em></p>
                        </section>
                        <section className="final-book-leaf">
                          <p>只有双手每日挣来的面包才真正甘美：千万别杀害满大人！</p>
                        </section>
                      </article>
                      <button className="final-book-action" onClick={closeFinalBook}>合上</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {bellSequence && (
        <div className={`bell-cinematic is-${bellSequence}`} aria-hidden="true">
          {ringing && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bell-v1.png" alt="" />
            </>
          )}
        </div>
      )}

      {ghostIntensity > 0 && stage !== "supplication" && (
        <TiChinFu
          key={stage}
          intensity={ghostIntensity}
          revealed={ghostRevealed}
          onInspect={() => {
            setGhostRevealed(!ghostRevealed);
            sound.tone(98, 1.8, 0.12, 0, "sine");
          }}
        />
      )}

      {stage === "bell" && <DevilFigure />}

      {collapsePhase && (
        <div className={`faint-overlay is-${collapsePhase}`} role={collapsePhase === "dark" ? "dialog" : undefined} aria-live="assertive">
          <div className="falling-horizon" aria-hidden="true" />
          {collapsePhase === "dark" && <button className="wake-button" onClick={wakeAtMission}>醒来</button>}
        </div>
      )}

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
            <p>本交互叙事游戏根据埃萨·德·凯罗斯一八八〇年的小说《满大人》改编。它保留埃萨原作的故事主线，在此基础上，如果三次拒绝魔鬼的摇铃提议则触发特别结局，特别结局为原创内容，与原作无关。本作中涉及的中国是特奥多罗及十九世纪欧洲对于东方的想象，并非历史中国的现实复原。</p>
            <p className="credits">制作者：周宁&emsp;&emsp;使用模型：chatgpt sol 5.6</p>
            <div className="music-credits">
              <span>分幕配乐</span>
              <a href="https://opengameart.org/content/unsolved-investigation" target="_blank" rel="noreferrer">《Unsolved Investigation》· isaiah658 · CC0</a>
              <a href="https://opengameart.org/content/apparitions-ball" target="_blank" rel="noreferrer">《Apparitions Ball》· Bobjt · CC0</a>
              <a href="https://opengameart.org/content/i-swear-i-saw-it-background-track" target="_blank" rel="noreferrer">《I Swear I Saw It》· yd · CC0</a>
              <a href="https://opengameart.org/content/the-journey-begins" target="_blank" rel="noreferrer">《The Journey Begins》· Igor Gundarev · CC0</a>
              <a href="https://opengameart.org/content/pursuit" target="_blank" rel="noreferrer">《Pursuit》· Sudocolon · CC0</a>
              <a href="https://opengameart.org/content/contemplation-0" target="_blank" rel="noreferrer">《Contemplation》· Joth · CC0</a>
              <a href="https://opengameart.org/content/asianoriental1" target="_blank" rel="noreferrer">《Asianoriental1》· Tozan · CC0</a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
