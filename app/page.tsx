"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "intro"
  | "room"
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

const roomObjects = [
  {
    id: "ledger",
    label: "账簿",
    glyph: "Ⅲ",
    text: "三十年抄写公文，薪水仍只够把饥饿推迟到下旬。",
  },
  {
    id: "lottery",
    label: "彩票",
    glyph: "№",
    text: "你把命运折成一小片纸；它每周准时宣布你没有命运。",
  },
  {
    id: "prayer",
    label: "祈祷卡",
    glyph: "✣",
    text: "圣徒沉默。窗外的里斯本也沉默，只有债主十分健谈。",
  },
  {
    id: "book",
    label: "旧书",
    glyph: "▤",
    text: "书页自行翻动。页脚写着：在遥远的中国，一个你永远不会认识的人正在饮茶。",
  },
];

const luxuries = [
  {
    id: "palace",
    label: "宫殿",
    pt: "O palácio",
    text: "洛雷托的石阶为你铺上红毯。昨天不肯回信的人，今天称你为‘亲爱的Teodoro’。",
  },
  {
    id: "banquet",
    label: "宴席",
    pt: "O banquete",
    text: "香槟、银器、异国鲜果。每一只空杯都把那声铃响得更清楚。",
  },
  {
    id: "desire",
    label: "欲望",
    pt: "O desejo",
    text: "欲望不再需要等待，但被满足之后，它只学会提出更昂贵的要求。",
  },
];

const routes = [
  ["Lisboa", "里斯本", "你离开宫殿；死者先一步登船。"],
  ["Suez", "苏伊士", "沙漠把欧洲的借口晒得透明。"],
  ["Ceilão", "锡兰", "热雨掠过甲板，黄色身影仍在船尾。"],
  ["Singapura", "新加坡", "财富可以换舱房，却不能买一场无梦的睡眠。"],
  ["Xangai", "上海", "海关、名片、译员：你的赎罪开始需要盖章。"],
  ["Tianjin", "天津", "河道转冷。欧洲的地图在此处开始犹豫。"],
  ["Pequim", "北京", "你抵达的不是答案，而是一整套礼节。"],
];

const stageInfo: Record<Stage, { act: string; title: string; pt: string }> = {
  intro: { act: "PROÊMIO", title: "那一声还未响起的铃", pt: "TI-LI-TIM" },
  room: { act: "I · LISBOA", title: "Teodoro的房间", pt: "Um amanuense pobre" },
  bell: { act: "II · A PROPOSTA", title: "魔鬼的提议", pt: "A campainha" },
  refusalEnding: { act: "FIM I", title: "合上的书页", pt: "A Página Fechada" },
  inheritance: { act: "III · O OURO", title: "陌生人的遗产", pt: "Um mandarim morreu" },
  luxury: { act: "III · O OURO", title: "洛雷托的盛宴", pt: "O milionário" },
  ghost: { act: "IV · A SOMBRA", title: "宴席上的客人", pt: "Ti Chin-Fu" },
  map: { act: "V · O ORIENTE", title: "向东方去", pt: "De Lisboa a Pequim" },
  beijing: { act: "V · O ORIENTE", title: "Camilloff的办法", pt: "A burocracia da expiação" },
  tienho: { act: "V · O ORIENTE", title: "天和村", pt: "Tien-Hó" },
  mission: { act: "V · O ORIENTE", title: "修道院的清晨", pt: "Salvo, não absolvido" },
  letter: { act: "V · O ORIENTE", title: "地址不存在", pt: "A família ausente" },
  return: { act: "VI · REGRESSO", title: "返航", pt: "O morto viaja contigo" },
  renounce: { act: "VI · REGRESSO", title: "放弃一切", pt: "A tentativa de pobreza" },
  humiliation: { act: "VI · REGRESSO", title: "贫穷的社交代价", pt: "A sociedade corrige-te" },
  prison: { act: "FIM II", title: "奢华的牢笼", pt: "O Palácio-Prisão" },
};

const refusalLines = [
  "你把良心称作原则，不过是因为今晚的价钱还没有说得足够具体。",
  "别急着自豪，我亲爱的先生。饥饿很会替哲学修改措辞。",
];

function useSound() {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!context.current) {
      const AudioCtx = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      context.current = new AudioCtx();
      master.current = context.current.createGain();
      master.current.gain.value = enabled ? 0.2 : 0;
      master.current.connect(context.current.destination);
      setReady(true);
    }
    void context.current.resume();
    return context.current;
  };

  const tone = (frequency: number, duration = 0.8, volume = 0.08, delay = 0) => {
    const ctx = ensure();
    if (!ctx || !master.current || !enabled) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
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
      tone(frequency, 2.8 - i * 0.35, 0.16 / (i + 1), i * 0.025),
    );
  };

  const thud = () => {
    tone(88, 0.32, 0.22);
    tone(55, 0.52, 0.16, 0.08);
  };

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (master.current && context.current) {
      master.current.gain.setTargetAtTime(next ? 0.2 : 0, context.current.currentTime, 0.03);
    }
    if (next) ensure();
  };

  return { enabled, ready, ensure, tone, bell, thud, toggle };
}

function Specter({ intensity = 1 }: { intensity?: number }) {
  return (
    <div
      className="specter"
      style={{ "--specter-opacity": String(Math.min(0.2 + intensity * 0.18, 0.85)) } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="specter-hat" />
      <span className="specter-head" />
      <span className="specter-robe" />
      <span className="specter-kite">◇</span>
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
  const [infoOpen, setInfoOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const sound = useSound();

  const info = stageInfo[stage];
  const isEast = ["map", "beijing", "tienho", "mission", "letter"].includes(stage);
  const isPalace = ["luxury", "ghost", "return", "renounce", "humiliation", "prison"].includes(stage);
  const background = isEast ? "/east-journey.png" : isPalace ? "/palace-ghost.png" : "/lisbon-room.png";
  const ghostIntensity = stage === "luxury" ? chosenLuxuries.length : ["ghost", "return", "renounce", "humiliation", "prison"].includes(stage) ? 3 : 0;

  const go = (next: Stage) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setStage(next);
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
  };

  const progress = useMemo(() => {
    const order: Stage[] = ["intro", "room", "bell", "inheritance", "luxury", "ghost", "map", "beijing", "tienho", "mission", "letter", "return", "renounce", "humiliation", "prison"];
    const value = order.indexOf(stage);
    return Math.max(2, ((value < 0 ? 2 : value + 1) / order.length) * 100);
  }, [stage]);

  useEffect(() => {
    if (!sound.enabled || !sound.ready) return;
    const dark = ["ghost", "return", "renounce", "humiliation", "prison"].includes(stage);
    const east = ["map", "beijing", "tienho", "mission", "letter"].includes(stage);
    const notes = dark ? [73.42, 110, 146.83] : east ? [98, 146.83, 220] : [87.31, 130.81, 174.61];
    sound.tone(notes[0], 3.6, 0.035);
    const interval = window.setInterval(() => {
      const note = notes[Math.floor(Math.random() * notes.length)];
      sound.tone(note, 3.2, 0.025);
    }, 4300);
    return () => window.clearInterval(interval);
    // Sound callbacks are intentionally excluded: the ambient pulse only follows scene changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sound.enabled, sound.ready]);

  const findObject = (id: string) => {
    if (!roomFinds.includes(id)) {
      setRoomFinds([...roomFinds, id]);
      sound.tone(220 + roomFinds.length * 55, 0.45, 0.06);
    }
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

  const chooseLuxury = (id: string) => {
    if (chosenLuxuries.includes(id)) return;
    setChosenLuxuries([...chosenLuxuries, id]);
    sound.tone(261.63 + chosenLuxuries.length * 65, 1.2, 0.08);
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
        <button className="wordmark" onClick={reset} aria-label="回到游戏封面">
          O MANDARIM <span>· 交互叙事</span>
        </button>
        <div className="top-actions">
          <button className="icon-button" onClick={sound.toggle} aria-label={sound.enabled ? "关闭声音" : "打开声音"} title={sound.enabled ? "关闭声音" : "打开声音"}>
            <span aria-hidden="true">{sound.enabled ? "◖))" : "◖×"}</span>
          </button>
          <button className="icon-button" onClick={() => setInfoOpen(true)} aria-label="作品说明" title="作品说明">i</button>
        </div>
      </header>

      {stage !== "intro" && (
        <div className="progress-track" aria-label={`故事进度 ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      <section className={`scene-card ${isEast ? "scene-card-east" : ""}`} aria-live="polite">
        <div className="scene-kicker">{info.act}</div>
        <h1>{stage === "intro" ? "O MANDARIM" : info.title}</h1>
        <div className="scene-pt">{info.pt}</div>

        {stage === "intro" && (
          <div className="intro-content">
            <p className="lede">一只铃，一条从里斯本通往北京的航线，<br />以及一笔永远无法花清的债。</p>
            <button className="primary-action bell-action" onClick={() => { sound.ensure(); sound.tone(174.61, 1.4, 0.06); go("room"); }}>
              <span>翻开书页</span><small>建议开启声音</small>
            </button>
            <p className="edition-note">根据 Eça de Queirós 的小说改编 · 简体中文首版</p>
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body">
            <p>你是Teodoro，里斯本一名薪水微薄的公务员。夜里，饥饿、彩票与神学轮流向你许诺明天。</p>
            <p className="instruction">检查房间里的物件。至少触碰三件，才能读懂今晚出现的那一页。</p>
            <div className="object-grid">
              {roomObjects.map((object) => {
                const found = roomFinds.includes(object.id);
                return (
                  <button key={object.id} className={`object-button ${found ? "is-found" : ""}`} onClick={() => findObject(object.id)}>
                    <span className="object-glyph" aria-hidden="true">{object.glyph}</span>
                    <strong>{object.label}</strong>
                    <span>{found ? object.text : "触碰查看"}</span>
                  </button>
                );
              })}
            </div>
            {roomFinds.length >= 3 && (
              <button className="primary-action" onClick={() => go("bell")}>读出书页上的提议 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <p>魔鬼不要求你的灵魂。他只请你触碰铃柄：在遥远的中国，一位富有的官员将死去；无人会知道是你，而他的财富将归你。</p>
            <blockquote>“你甚至不必相信我。距离会替你完成其余的工作。”</blockquote>
            {refusals > 0 && refusals < 3 && (
              <div className="devil-reply">
                <span>魔鬼 · 第 {refusals + 1} 次</span>
                <p>“{refusalLines[refusals - 1]}”</p>
              </div>
            )}
            <div className="bell-choice">
              <button className="bell-object" onClick={ringBell} aria-label="按铃">
                <span className="bell-handle" /><span className="bell-dome" /><span className="bell-base" />
                <small>TOCAR</small>
              </button>
              <div className="choice-stack">
                <button className="choice-button dangerous" onClick={ringBell}><span>按下铃</span><small>一个动作；一笔巨款</small></button>
                <button className="choice-button" onClick={refuse}><span>拒绝{refusals > 0 ? ` · 第${refusals + 1}次` : ""}</span><small>把书合上一寸</small></button>
              </div>
            </div>
          </div>
        )}

        {stage === "refusalEnding" && (
          <div className="scene-body ending-body refusal-body">
            <div className="ending-mark">I</div>
            <p className="ending-label">特别结局 · A Página Fechada</p>
            <blockquote className="ending-quote" lang="pt">“Bravo, meu caro. Não tocaste a campainha. Conservaste a consciência — e também a miséria. Fecha o livro; amanhã voltaremos a discutir o preço de ambas.”</blockquote>
            <p className="translation">“好极了，我亲爱的朋友。你没有按铃。你保住了良心——也保住了贫困。合上书吧；明天我们再谈谈它们各自的价钱。”</p>
            <p className="original-note">魔鬼退回页缝。你赢得了今晚；他拥有所有明天。<br />以上为游戏原创台词，并非艾萨原文。</p>
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
                <p>几周后，伦敦的银行家通知你：一位名叫Ti Chin-Fu的陌生人留下难以计数的遗产。电报没有提到铃，也没有提到死亡。</p>
                <div className="money-number">106,000,000 <small>francos</small></div>
                <p>金钱如此庞大，因果关系看上去反而像一种迷信。</p>
                <button className="primary-action" onClick={() => go("luxury")}>入住洛雷托的宫殿 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <p>点击三种享受。每一次选择都会装饰宫殿，也会邀请另一位客人入席。</p>
            <div className="luxury-grid">
              {luxuries.map((item, index) => {
                const chosen = chosenLuxuries.includes(item.id);
                return (
                  <button key={item.id} className={`luxury-card ${chosen ? "is-chosen" : ""}`} onClick={() => chooseLuxury(item.id)}>
                    <span className="roman">0{index + 1}</span>
                    <strong>{item.label}</strong><em>{item.pt}</em>
                    <p>{chosen ? item.text : "享用"}</p>
                  </button>
                );
              })}
            </div>
            {chosenLuxuries.length >= 3 && (
              <button className="primary-action" onClick={() => { sound.tone(110, 2.4, 0.08); go("ghost"); }}>看向镜子里的第四个人 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "ghost" && (
          <div className="scene-body ghost-scene">
            <p>Ti Chin-Fu站在宴席尽头，黄袍寂静，手里牵着一只纸鸢。你闭眼，他便出现在眼睑内侧。</p>
            {!avoidance ? (
              <>
                <p className="instruction">你先尝试哪一种欧洲式的补救？</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setAvoidance("pleasure")}><span>加倍享乐</span><small>让音乐盖过铃声</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("church")}><span>求助教会</span><small>为死者购买弥撒</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("charity")}><span>慷慨捐赠</span><small>把利息叫作慈善</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "乐队演奏得更响。Ti Chin-Fu不需要耳朵。" : avoidance === "church" ? "神父答应祈祷，却不能替你解释财富的来源。" : "你的名字刻上医院的石墙；死者的名字仍无人念出。"}</p>
                <p>所有办法都在里斯本打转。于是，你第一次承认：补偿必须向东方移动。</p>
                <button className="primary-action" onClick={() => { setRouteIndex(0); go("map"); }}>登上去往中国的轮船 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <p>航线穿过纸页上的世界。每到一站，你带去更多财富，也带去一个越来越难以翻译的罪名。</p>
            <div className="route" role="img" aria-label={`航线进度：${routes[routeIndex][1]}`}>
              <div className="route-line"><span style={{ width: `${(routeIndex / (routes.length - 1)) * 100}%` }} /></div>
              {routes.map((stop, index) => (
                <button key={stop[0]} className={`route-stop ${index <= routeIndex ? "is-reached" : ""} ${index === routeIndex ? "is-current" : ""}`} style={{ left: `${(index / (routes.length - 1)) * 100}%` }} onClick={() => index <= routeIndex && setRouteIndex(index)} aria-label={stop[1]}>
                  <i /><span>{stop[0]}</span>
                </button>
              ))}
              <div className="route-ship" style={{ left: `${(routeIndex / (routes.length - 1)) * 100}%` }} aria-hidden="true">▰</div>
            </div>
            <div className="travel-caption"><strong>{routes[routeIndex][1]}</strong><span>{routes[routeIndex][2]}</span></div>
            {routeIndex < routes.length - 1 ? (
              <button className="primary-action" onClick={() => { setRouteIndex(routeIndex + 1); sound.tone(146.83 + routeIndex * 9, 1, 0.05); }}>继续航行 <span>→</span></button>
            ) : (
              <button className="primary-action" onClick={() => go("beijing")}>进入北京 <span>→</span></button>
            )}
            <p className="perspective-note">视觉提示：这里呈现的是Teodoro及十九世纪欧洲叙述中的“东方想象”，并非现实中国的复原。</p>
          </div>
        )}

        {stage === "beijing" && (
          <div className="scene-body dialogue-scene">
            <p>俄国使馆官员Camilloff愿意帮忙，却先解释帝国的三种解决方式。请选择Teodoro最先提出的补偿方案。</p>
            {!camilloff ? (
              <div className="choice-stack">
                <button className="choice-button" onClick={() => setCamilloff("treasury")}><span>把钱交给国库</span><small>让国家替我清白</small></button>
                <button className="choice-button" onClick={() => setCamilloff("rank")}><span>为家属购买官位</span><small>让等级替我补偿</small></button>
                <button className="choice-button" onClick={() => setCamilloff("widow")}><span>找到遗孀并与她结婚</span><small>让婚姻替我结束故事</small></button>
              </div>
            ) : (
              <div className="dialogue-result">
                <div className="speaker">CAMILLOFF</div>
                <blockquote>“{camilloff === "treasury" ? "国库会收下钱，但不会开具良心收据。" : camilloff === "rank" ? "官位可以买到，亲属却必须先被找到。" : "这是最浪漫的方案，因此也最不适合行政办理。"}”</blockquote>
                <p>最终，他让你乔装出城：有消息称Ti Chin-Fu的家人流落在天和村。</p>
                <button className="primary-action" onClick={() => go("tienho")}>随向导Sá-Tó出发 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "tienho" && (
          <div className="scene-body attack-scene">
            {!attackChoice ? (
              <>
                <p>村口的人群认出外国人的钱袋。石块落下，马受惊，Sá-Tó喊你立刻行动。</p>
                <p className="instruction">你只有一次反应的时间。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button dangerous" onClick={() => chooseAttack("coins")}><span>把银币撒向人群</span><small>用财富开路</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("bag")}><span>死守钱袋</span><small>保住补偿的资本</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("guide")}><span>跟紧Sá-Tó</span><small>相信唯一的向导</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{attackChoice === "coins" ? "银币让人群弯腰，也让你第一次看见金钱怎样同时制造道路与暴力。" : attackChoice === "bag" ? "钱袋保住了；你的身体没有。石块击中额角，世界从地图上消失。" : "向导冲进小巷，你紧随其后，却仍在混乱中被击倒。"}</p>
                <p>醒来时，你躺在传教士的修道院。所谓家属，一个也没有出现。</p>
                <button className="primary-action" onClick={() => go("mission")}>醒来 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "mission" && (
          <div className="scene-body">
            <p>修道院救了你的命。伤口合拢后，Camilloff的来信抵达：天和村的线索是错的，Ti Chin-Fu的家人也许在广东，也许已经去了高丽。</p>
            <blockquote>你跨越了半个世界，抵达的却是一封措辞礼貌的“不确定”。</blockquote>
            <button className="primary-action" onClick={() => go("letter")}>决定是否继续寻找 <span>→</span></button>
          </div>
        )}

        {stage === "letter" && (
          <div className="scene-body">
            {!searchAgain ? (
              <>
                <p>地图在你面前分成两条没有尽头的虚线。你可以继续追逐每一个传闻，也可以承认这场补偿从一开始就把死者当成了地址。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setSearchAgain(true)}><span>再寻找一次</span><small>去广东，或去高丽</small></button>
                  <button className="choice-button dangerous" onClick={() => go("return")}><span>返回欧洲</span><small>我已经尽力了</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>第二封信否定第一封，第三张地图否定第二张。每一条新线索都把Ti Chin-Fu变得更抽象，把你自己变得更具体。</p>
                <p>你终于不再寻找后代，而开始寻找一个可以被称作“已经尽力”的时刻。</p>
                <button className="primary-action" onClick={() => go("return")}>返回欧洲 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "return" && (
          <div className="scene-body ghost-scene">
            <p>新加坡、锡兰、苏伊士、马耳他、直布罗陀。每个港口都在身后缩小，Ti Chin-Fu却与日俱近。</p>
            <div className="return-stamps" aria-label="返航地点">
              {["新加坡", "锡兰", "苏伊士", "马耳他", "直布罗陀", "里斯本"].map((place, index) => <span key={place} style={{ animationDelay: `${index * 0.22}s` }}>{place}</span>)}
            </div>
            <p>他不再只是死者。他成为财富本身的影子，与你同舱，不需护照。</p>
            <button className="primary-action" onClick={() => go("renounce")}>在里斯本放弃财产 <span>→</span></button>
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <p>你搬出宫殿，把财物交给慈善，重新穿上旧外套，回到从前的机关。你以为贫穷可以倒着走，像一条回家的街。</p>
            <div className="ledger-animation" aria-hidden="true"><span>PALÁCIO</span><i>— 106.000.000</i><b>0?</b></div>
            <p>但法律上的财富仍属于你；而社会已经记住你曾经富有。Ti Chin-Fu照常在黄昏出现。</p>
            <button className="primary-action" onClick={() => go("humiliation")}>回到办公桌 <span>→</span></button>
          </div>
        )}

        {stage === "humiliation" && (
          <div className="scene-body">
            <p>旧同事不欢迎你，只研究你的失败。昨天的宾客在街上避开你；报纸把你的退隐称为怪癖，把你的痛苦称为表演。</p>
            <blockquote>没有人允许一个百万富翁只是贫穷。你的身份已经成为一种不可撤销的财产。</blockquote>
            <div className="choice-stack horizontal">
              <button className="choice-button" onClick={() => go("prison")}><span>忍受贫穷</span><small>宫殿仍登记在你名下</small></button>
              <button className="choice-button dangerous" onClick={() => go("prison")}><span>回到宫殿</span><small>至少让痛苦坐得舒服</small></button>
            </div>
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body ending-body prison-body">
            <div className="ending-mark">II</div>
            <p className="ending-label">正篇结局 · O Palácio-Prisão</p>
            <p>吊灯重新点亮。旧友重新认得你。宴席、丝绸与马车再次围拢过来，像一座装修精美的监狱。</p>
            <blockquote className="ending-quote">“魔鬼，我愿把这一切退还。让那个人重新活过来。”</blockquote>
            <p className="devil-final">书页没有回答。只有那只铃，在玻璃柜中轻轻晃动了一下。</p>
            <p className="translation">你可以退出宫殿，却无法退出那笔使你成为“你”的财富。Ti Chin-Fu站在镜子里，而所有宾客都只看见你。</p>
            <button className="primary-action" onClick={reset}>从未响起的铃开始</button>
          </div>
        )}
      </section>

      {ghostIntensity > 0 && <Specter intensity={ghostIntensity} />}

      <footer className="game-footer">
        <span>{stage === "intro" ? "1880 / 2026" : `${info.act} · ${info.pt}`}</span>
        <span>{sound.enabled ? "声音开启" : "静音模式"}</span>
      </footer>

      {infoOpen && (
        <div className="modal-backdrop">
          <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
            <button className="modal-close" onClick={() => setInfoOpen(false)} aria-label="关闭">×</button>
            <div className="scene-kicker">SOBRE ESTA EDIÇÃO</div>
            <h2 id="about-title">关于这个首版</h2>
            <p>这是一个简洁、可完整通关的浏览器交互叙事，根据Eça de Queirós的《O Mandarim》(1880)改编。它保留“按铃—暴富—幽灵—远东之旅—返欧—奢华牢笼”的主线，并加入“三次拒绝”的特别结局。</p>
            <p>玩法只使用四种核心动作：探索物件、对话选择、旅行地图，以及Ti Chin-Fu反复侵入画面与声音。选择改变局部叙述，但不会把小说主干拆成复杂的数值系统。</p>
            <p>葡文原作进入公版。游戏新增台词均为本项目原创；视觉中的中国是对Teodoro及十九世纪欧洲“东方想象”的批判性呈现，不作为历史中国的写实复原。</p>
            <p className="credits">文字与交互设计：为本研究原型制作<br />插画：AI辅助生成后用于本项目<br />音乐与音效：浏览器实时合成，不使用外部录音</p>
          </section>
        </div>
      )}
    </main>
  );
}
