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

type HotspotItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  page: number;
  quote: string;
  note: string;
};

const routes = [
  ["Lisboa", "里斯本", "你离开宫殿；死者先一步登船。"],
  ["Marselha", "马赛", "Teodoro包下整艘名为‘Ceilão’的邮船，从马赛向东方启航。"],
  ["Xangai", "上海", "‘Ceilão’的航行平静而单调；小说直到上海才重新标出地点。"],
  ["Tien-Tsin", "天津", "从上海沿河乘Russel公司的小轮船抵达Tien-Tsin。"],
  ["Tung-Chou", "通州", "Camilloff派出的哥萨克与译员Sá-Tó在此迎接。"],
  ["Pequim", "北京", "城门在最后一道夕阳离开天坛塔楼时关闭。"],
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

const sceneHotspots: Partial<Record<Stage, HotspotItem[]>> = {
  room: [
    { id: "lamp", label: "绿色灯罩", x: 5, y: 48, page: 10, quote: "O abat-jour verde da vela punha uma penumbra em redor.", note: "绿色灯罩在桌边投下一圈半明半暗的光，诱惑以极其日常的方式进入房间。" },
    { id: "folio", label: "旧书", x: 24, y: 65, page: 8, quote: "O tipo venerando, o papel amarelado com picadas de traça, a grave encadernação freirática, a fitinha verde marcando a página — encantavam-me!", note: "Teodoro在Feira da Ladra购买残缺旧书；书的物质感本身就是诱惑的入口。" },
    { id: "bell", label: "铃与法语词典", x: 42, y: 59, page: 10, quote: "a campainha, pousada pacatamente diante de mim sobre um dicionário francês", note: "原作明确写铃安静地放在一本法语词典上。点击它以前，它只是房间里最普通的物件。" },
    { id: "lottery", label: "彩票", x: 55, y: 71, page: 8, quote: "pedia-as todas as noites a Nossa Senhora das Dores, e comprava décimos da lotaria.", note: "祷告与彩票是Teodoro催促幸福到来的两种同构手段。" },
    { id: "madonna", label: "圣母像", x: 65, y: 60, page: 6, quote: "ter à cabeceira da cama uma litografia de Nossa Senhora das Dores que pertencera à mamã", note: "这张属于母亲的Nossa Senhora das Dores石版画，后来也随行至远东。" },
  ],
  luxury: [
    { id: "gold-bed", label: "金床", x: 63, y: 67, page: 29, quote: "Tornou-se famoso na Europa o meu leito, de um gosto exuberante e bárbaro, com a barra recoberta de lâminas de ouro lavrado", note: "床成为被欧洲观看和报道的奢华标本。" },
    { id: "decanter", label: "酒与水晶", x: 78, y: 59, page: 13, quote: "há vinhos de Borgonha, como por exemplo o Romanée-Conti de 58 e o Chambertin, de 61", note: "魔鬼最先用可以被消费的具体事物，而不是抽象权力，引诱Teodoro。" },
    { id: "coins", label: "金币", x: 86, y: 72, page: 23, quote: "sentindo o mundo aos meus pés — bocejei como um leão farto.", note: "财富立即带来的不是满足，而是饱食后的无聊。" },
    { id: "door-ghost", label: "横陈的黄袍尸身", x: 48, y: 42, page: 34, quote: "ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços", note: "Ti Chin-Fu不是站立的幽灵：尸身横陈在门槛或金床上，始终保持死亡时的同一姿态。" },
  ],
  beijing: [
    { id: "robe", label: "文人服饰", x: 25, y: 81, page: 52, quote: "eu devia desde já vestir-me como um chinês opulento, da classe letrada", note: "外交建议首先把赎罪转化为服装、礼仪与扮演。" },
    { id: "map", label: "天和路线图", x: 53, y: 71, page: 69, quote: "já o zeloso Camilloff, de lápis na mão, ia marcando no mapa o meu itinerário para Tien-Hó!", note: "Camilloff在地图上把一个不确定的家族变成了确定的路线。" },
    { id: "tea", label: "茶具", x: 70, y: 62, page: 49, quote: "Para tudo isto dispõe da palavra ‘chá’. É pouco.", note: "Teodoro声称只会mandarim与chá；Camilloff指出其中只有一个词能被理解。" },
    { id: "dossiers", label: "档案", x: 78, y: 82, page: 65, quote: "centenares de escribas empalideceram noite e dia, de pincel na mão, desenhando relatórios sobre papel de arroz", note: "查找一个地址扩张成整个帝国行政机器的滑稽表演。" },
    { id: "sabre", label: "Camilloff的军刀", x: 86, y: 63, page: 51, quote: "Faça uma coisa. Procure a família de Ti Chin-Fu...", note: "将军给出的实用方案推动Teodoro继续向天和村。" },
  ],
  tienho: [
    { id: "arrow", label: "箭与破洞", x: 15, y: 28, page: 76, quote: "uma pedra veio ao meu lado furar o papel encerado da gelosia; depois uma flecha silvou", note: "第一块石头和第一支箭把赎罪之旅变成逃生。" },
    { id: "money-case", label: "钱袋", x: 25, y: 78, page: 77, quote: "Mas com a rica vida, Vossa Honra!", note: "Sá-Tó劝他舍弃财物，至少保住‘宝贵的生命’。" },
    { id: "carts", label: "行李车", x: 61, y: 58, page: 78, quote: "A turba rugia, insaciada.", note: "铜钱短暂制造沉默，却不能终止欲望。" },
    { id: "pony", label: "马匹", x: 65, y: 78, page: 79, quote: "arremessei-me sobre ele, empolguei-lhe as crinas", note: "最后的可行选择不是补偿，而是抓住马鬃逃走。" },
  ],
  mission: [
    { id: "bandage", label: "绷带", x: 22, y: 80, page: 81, quote: "Dois padres lazaristas lavavam-me devagar a orelha.", note: "修士处理耳伤；Teodoro把这片寂静误认成道德上的避难所。" },
    { id: "well", label: "井与滑轮", x: 42, y: 45, page: 81, quote: "a roldana de um poço rangia lentamente; um sino tocava a matinas", note: "井的吱呀声与晨祷钟声构成远东篇最安静的声景。" },
    { id: "breviary", label: "《日课经》", x: 66, y: 75, page: 93, quote: "sobre o seu Breviário, aberto numa página do Evangelho de Pobreza, um rolo de notas do Banco de Inglaterra", note: "Teodoro把英国银行钞票放在‘贫穷福音’打开的页面上。" },
    { id: "letter", label: "Camilloff的信", x: 83, y: 83, page: 90, quote: "Enquanto à viúva e família de Ti Chin-Fu, houve um engano", note: "决定整趟旅程意义的事实，被Camilloff轻描淡写地放在附言里。" },
    { id: "found-child", label: "Bem-Achado", x: 89, y: 56, page: 86, quote: "tinha-a encontrado abandonada, nuazinha, morrendo à beira de um caminho", note: "真正需要立即救助的孩子，被传教士从路边抱回；它与Teodoro抽象寻找‘后代’形成对照。" },
  ],
  renounce: [
    { id: "old-coat", label: "旧外套", x: 68, y: 55, page: 97, quote: "Fui, com uma quinzena coçada, realugar o meu quarto na casa da Madame Marques", note: "Teodoro试图穿回原来的贫穷，却无法让社会忘记他的财富。" },
    { id: "copy-paper", label: "抄写纸", x: 34, y: 78, page: 97, quote: "voltei à repartição, de espinhaço curvo, a implorar os meus vinte mil réis mensais", note: "身体重新弯曲，旧职业却不能恢复旧身份。" },
    { id: "bank-ledger", label: "银行账簿", x: 51, y: 69, page: 98, quote: "os seus milhões, que jaziam agora estéreis e intactos nos bancos, ainda de facto eram meus!", note: "不消费财产不等于不拥有财产；幽灵因此不会消失。" },
  ],
  humiliation: [
    { id: "newspaper", label: "报纸", x: 55, y: 72, page: 97, quote: "Os jornais, num triunfo de ironia, achincalharam a minha miséria.", note: "同一批报纸曾把他的每次身体反应都报道给全世界。" },
    { id: "window", label: "里斯本的窗口", x: 12, y: 30, page: 98, quote: "Logo, Lisboa, sem hesitar, se rojou aos meus pés.", note: "他一回到宫殿，城市便立即恢复崇拜。" },
    { id: "bell-again", label: "仍在桌上的铃", x: 43, y: 59, page: 99, quote: "Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!", note: "Teodoro最终想要的不是更多财富，而是能够重新贫穷。" },
  ],
  prison: [
    { id: "mirror", label: "镜中宴会", x: 80, y: 28, page: 98, quote: "A Aristocracia beijou-me os dedos como a um tirano: e o Clero incensou-me como a um ídolo.", note: "社会再次承认他，因为财富从未真正离开。" },
    { id: "devil", label: "魔鬼的回答", x: 17, y: 47, page: 99, quote: "Não pode ser, meu prezado senhor, não pode ser...", note: "魔鬼不再辩论。他只说明交易不可逆。" },
    { id: "testament", label: "遗嘱", x: 67, y: 76, page: 99, quote: "Nele lego os meus milhões ao Demónio; pertencem-lhe", note: "遗嘱承认财富从一开始就更接近魔鬼的财产。" },
    { id: "last-page", label: "最后一页", x: 47, y: 77, page: 100, quote: "nunca mates o Mandarim!", note: "紧接着，叙述者又怀疑任何读者在同样条件下都会按铃。" },
  ],
};

function useSound() {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

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
      setReady(true);
    }
    void context.current.resume();
    return context.current;
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
    enabledRef.current = next;
    setEnabled(next);
    if (master.current && ctx) {
      master.current.gain.cancelScheduledValues(ctx.currentTime);
      master.current.gain.setTargetAtTime(next ? 0.72 : 0, ctx.currentTime, 0.04);
    }
    if (next) {
      window.setTimeout(() => {
        tone(220, 1.25, 0.11, 0, "triangle");
        tone(329.63, 1.5, 0.07, 0.08, "sine");
      }, 80);
    }
  };

  const toggle = () => setAudio(!enabledRef.current);
  const enable = () => setAudio(true);

  return { enabled, ready, ensure, enable, tone, bell, thud, toggle };
}

function TiChinFu({ intensity = 1, revealed, onInspect }: { intensity?: number; revealed: boolean; onInspect: () => void }) {
  return (
    <button
      className={`ti-figure ${revealed ? "is-revealed" : "is-silhouette"}`}
      style={{ "--ti-opacity": String(Math.min(0.28 + intensity * 0.2, 0.94)) } as React.CSSProperties}
      onClick={onInspect}
      aria-label="查看横卧的Ti Chin-Fu尸身"
    >
      {/* A raw img keeps the transparent corpse cutout portable in the edge build. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ti-chin-fu-corpse-v3.png" alt="Ti Chin-Fu身穿黄绸、仰卧而死，冷臂抱着纸鸢" />
      <span>{revealed ? "TI CHIN-FU · 点击退回尸影" : "触碰横陈的死者"}</span>
    </button>
  );
}

function SourceSlip({ item }: { item: HotspotItem }) {
  return (
    <aside className="source-slip" aria-live="polite">
      <div><span>原作 · CAPÍTULO</span><b>PDF p. {item.page}</b></div>
      <blockquote lang="pt">“{item.quote}”</blockquote>
      <p>{item.note}</p>
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
  const sound = useSound();

  const info = stageInfo[stage];
  const isEast = ["map", "beijing", "tienho", "mission", "letter"].includes(stage);
  const backgrounds: Record<Stage, string> = {
    intro: "/lisbon-room-v2.png",
    room: "/lisbon-room-v2.png",
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
    window.setTimeout(() => {
      setStage(next);
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
    const tense = stage === "tienho";
    const notes = tense
      ? [73.42, 77.78, 110, 116.54]
      : dark
        ? [73.42, 110, 130.81, 146.83]
        : east
          ? [98, 123.47, 146.83, 196]
          : [87.31, 110, 130.81, 174.61];
    let beat = 0;
    const playMeasure = () => {
      const root = notes[beat % notes.length];
      sound.tone(root, 2.6, tense ? 0.12 : 0.075, 0, "sine");
      sound.tone(root * 2, 0.72, tense ? 0.1 : 0.075, 0.12, "triangle");
      if (beat % 2 === 0) sound.tone(notes[(beat + 2) % notes.length] * 2, 1.15, 0.055, 0.42, "sine");
      beat += 1;
    };
    playMeasure();
    const interval = window.setInterval(() => {
      playMeasure();
    }, tense ? 980 : 1450);
    return () => window.clearInterval(interval);
    // The procedural score is rebuilt only when the scene or audio state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sound.enabled, sound.ready]);

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
        <button className="wordmark" onClick={reset} aria-label="回到游戏封面">
          O MANDARIM <span>· 交互叙事</span>
        </button>
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
        <h1>{stage === "intro" ? "O MANDARIM" : info.title}</h1>
        <div className="scene-pt">{info.pt}</div>
        {selectedHotspot && <SourceSlip item={selectedHotspot} />}

        {stage === "intro" && (
          <div className="intro-content">
            <p className="lede">一只铃，一条从里斯本通往北京的航线，<br />以及一笔永远无法花清的债。</p>
            <button className="primary-action bell-action" onClick={() => { sound.enable(); go("room"); }}>
              <span>开启声音并翻开书页</span><small>原创程序化配乐将在手势后播放</small>
            </button>
            <p className="edition-note">根据 Eça de Queirós 的小说改编 · 简体中文首版</p>
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body">
            <blockquote className="source-inline" lang="pt">“Eu chamo-me Teodoro — e fui amanuense do Ministério do Reino.” <cite>CAP. I · PDF p. 5</cite></blockquote>
            <p>每周，Teodoro弯着背替国家誊写恭敬的公文；每月二万réis。夜晚，他回到Travessa da Conceição nº 106，让祷告、彩票和旧书替自己想象幸福。</p>
            <p className="instruction">不要从文字菜单认识房间。请直接点击画面中的灯、旧书、铃、彩票与圣母像；检查任意三件物品。</p>
            <div className="hotspot-index">
              {(sceneHotspots.room ?? []).map((item) => (
                <button key={item.id} className={roomFinds.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{roomFinds.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {roomFinds.length >= 3 && (
              <button className="primary-action" onClick={() => go("bell")}>翻到黄色高亮的书页 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <div className="book-leaf">
              <span>BRECHA DAS ALMAS · 您在PDF中标出的原文</span>
              <blockquote lang="pt">“No fundo da China existe um mandarim mais rico que todos os reis de que a fábula ou a história contam. Dele nada conheces, nem o nome, nem o semblante, nem a seda de que se veste. Para que tu herdes os seus cabedais infindáveis, basta que toques essa campainha, posta a teu lado, sobre um livro. Ele soltará apenas um suspiro, nesses confins da Mongólia. Será então um cadáver: e tu verás a teus pés mais ouro do que pode sonhar a ambição de um avaro. Tu, que me lês e és um homem mortal, tocarás tu a campainha?”</blockquote>
              <small>EÇA · CAPÍTULO I · PDF p. 9</small>
            </div>
            <blockquote className="devil-original" lang="pt">“Vamos, Teodoro, meu amigo, estenda a mão, toque a campainha, seja um forte!” <cite>PDF p. 10</cite></blockquote>
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
                <blockquote className="source-inline" lang="pt">“Pobre Ti Chin-Fu!... Estava no seu jardim, sossegado, armando, para o lançar ao ar, um papagaio de papel...” <cite>CAP. I · PDF p. 17</cite></blockquote>
                <p>铃声之后，魔鬼第一次说出死者的名字。Ti Chin-Fu身穿黄绸，倒在溪边的草地上，怀中仍抱着尚未放飞的纸鸢。</p>
                <div className="money-number">106.000 <small>contos de réis</small></div>
                <blockquote className="source-inline compact" lang="pt">“São cento e seis mil contos, senhor!... da herança depositada do mandarim Ti Chin-Fu!” <cite>CAP. II · PDF p. 21</cite></blockquote>
                <button className="primary-action" onClick={() => go("luxury")}>入住洛雷托的宫殿 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <blockquote className="source-inline" lang="pt">“Então começou a minha vida de milionário.” <cite>CAP. III · PDF p. 29</cite></blockquote>
            <p>洛雷托宫殿的每件物品都把巨款变成可触摸的快感。请直接检查画面中的金床、酒器、金币与门后的黄袍。</p>
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
            <blockquote className="source-inline" lang="pt">“ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços... Era o mandarim Ti Chin-Fu!” <cite>CAP. III · PDF p. 34</cite></blockquote>
            <p>这一次，Ti Chin-Fu不再是站立的抽象光影。他是一具横陈的尸身：肥胖的老文人，白色长髭遮住嘴唇，黑辫拖在身后，黄绸包裹着朝上的肚腹，冰冷的双臂仍抱着纸鸢。</p>
            {!ghostRevealed ? (
              <p className="instruction">先触碰门槛或金床上横卧的Ti Chin-Fu。只有看清死者，补偿问题才会出现。</p>
            ) : !avoidance ? (
              <>
                <blockquote className="source-inline compact" lang="pt">“Tinha eliminado a criatura, de longe, com uma campainha... eu assassinara um velho!” <cite>PDF p. 35</cite></blockquote>
                <p className="instruction">面对一个具体的人以后，你先尝试哪一种欧洲式的补救？</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setAvoidance("pleasure")}><span>加倍享乐</span><small>让音乐盖过铃声</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("church")}><span>求助教会</span><small>为死者购买弥撒</small></button>
                  <button className="choice-button" onClick={() => setAvoidance("charity")}><span>慷慨捐赠</span><small>把利息叫作慈善</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "乐队演奏得更响。Ti Chin-Fu不需要耳朵。" : avoidance === "church" ? "神父答应祈祷，却不能替你解释财富的来源。" : "你的名字刻上医院的石墙；死者的名字仍无人念出。"}</p>
                <blockquote className="source-inline compact" lang="pt">“Partiria para Pequim; descobriria a família de Ti Chin-Fu...” <cite>CAP. III · PDF p. 43</cite></blockquote>
                <button className="primary-action" onClick={() => { setRouteIndex(0); go("map"); }}>登上去往中国的轮船 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <blockquote className="source-inline" lang="pt">“Anelei, suspirei por pisar a terra da China!... pus a proa ao Oriente.” <cite>CAP. III · PDF p. 43</cite></blockquote>
            <p>按原作实际写出的节点推进航线。邮船名为“Ceilão”，并不是一次锡兰停靠；从上海以后，旅程转入河流、驳船、陆路和外交接待。</p>
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
            <blockquote className="source-inline" lang="pt">“Sei duas palavras importantes, general: ‘mandarim’ e ‘chá’.” <cite>CAP. IV · PDF p. 48</cite></blockquote>
            <p>Camilloff的花园里，地图、茶具、档案、服饰与军刀把赎罪改写成外交程序。先从画面中检查至少三件物品。</p>
            <div className="hotspot-index">
              {(sceneHotspots.beijing ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length < 3 ? (
              <p className="instruction">还需检查 {3 - currentVisited.length} 件物品，Camilloff才会开始讨论补偿方案。</p>
            ) : !camilloff ? (
              <div className="choice-stack">
                <button className="choice-button" onClick={() => setCamilloff("treasury")}><span>把一半巨款交给国库</span><small>“Talvez Ti Chin-Fu se calmasse...”</small></button>
                <button className="choice-button" onClick={() => setCamilloff("rice")}><span>私人向饥民分发大米</span><small>以慈善绕开国家</small></button>
                <button className="choice-button" onClick={() => setCamilloff("family")}><span>寻找Ti Chin-Fu的家族</span><small>把巨款直接还给后代</small></button>
              </div>
            ) : (
              <div className="dialogue-result">
                <div className="speaker">CAMILLOFF</div>
                <blockquote lang="pt">“{camilloff === "treasury" ? "Erro, considerável erro, mancebo! Esses milhões nunca chegariam ao Tesouro imperial." : camilloff === "rice" ? "Funesta... A corte imperial veria aí imediatamente uma ambição política." : "Faça uma coisa. Procure a família de Ti Chin-Fu..."}”</blockquote>
                <p>{camilloff === "treasury" ? "他认为钱只会落进统治阶层‘深不可测的口袋’。" : camilloff === "rice" ? "他认为朝廷会把赈米视为收买民众、威胁王朝的政治野心。" : "这是唯一暂时不会让Teodoro被斩首的方案。"} 最终，你必须乔装成富有文人，等待行政机器找出家族地址。</p>
                <button className="primary-action" onClick={() => go("tienho")}>随向导Sá-Tó出发 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "tienho" && (
          <div className="scene-body attack-scene">
            <blockquote className="source-inline" lang="pt">“era em roda da estalagem toda a populaça de Tien-Hó, rosnando sinistramente...” <cite>CAP. VI · PDF p. 75</cite></blockquote>
            <p>在选择行动以前，先检查画面中的破窗、钱袋、路障和马匹。这些不是装饰，而是原作接下来每一步行动的条件。</p>
            <div className="hotspot-index">
              {(sceneHotspots.tienho ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length < 3 ? (
              <p className="instruction">还需检查 {3 - currentVisited.length} 个危险信号。</p>
            ) : !attackChoice ? (
              <>
                <p className="instruction">你只有一次反应的时间。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button dangerous" onClick={() => chooseAttack("coins")}><span>把银币撒向人群</span><small>用财富开路</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("bag")}><span>死守钱袋</span><small>保住补偿的资本</small></button>
                  <button className="choice-button" onClick={() => chooseAttack("guide")}><span>跟紧Sá-Tó</span><small>相信唯一的向导</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <p>{attackChoice === "coins" ? "Sá-Tó把铜钱像种子一样撒下；人群短暂满足，随后又齐声索要‘更多’。" : attackChoice === "bag" ? "你试图守住用于补偿的钱，却让自己和钱同时成为更清楚的目标。" : "你跟随唯一的向导，但骚乱迅速吞没了队伍。"}</p>
                <blockquote className="source-inline compact" lang="pt">“A turba rugia, insaciada... Não tenho mais, criatura! O resto está em Pequim!” <cite>PDF p. 78</cite></blockquote>
                <p>原作没有给Teodoro英雄式的胜利：他抓住马鬃逃跑，被砖块击中，最后倒在荒野。</p>
                <button className="primary-action" onClick={() => go("mission")}>醒来 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "mission" && (
          <div className="scene-body">
            <blockquote className="source-inline" lang="pt">“um sino tocava a matinas... rolaram-me das pálpebras duas lágrimas mudas.” <cite>CAP. VI · PDF p. 81</cite></blockquote>
            <p>修道院不是过场字幕。绷带、井、晨钟、《日课经》、来信与路边获救的孩子共同构成另一种“补偿”图景。请至少检查三件。</p>
            <div className="hotspot-index">
              {(sceneHotspots.mission ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 3 ? (
              <button className="primary-action" onClick={() => go("letter")}>拆开Camilloff的附言 <span>→</span></button>
            ) : (
              <p className="instruction">还需检查 {3 - currentVisited.length} 件修道院中的物品。</p>
            )}
          </div>
        )}

        {stage === "letter" && (
          <div className="scene-body">
            <div className="letter-sheet">
              <span>P. S. · GENERAL CAMILLOFF</span>
              <p lang="pt">“Enquanto à viúva e família de Ti Chin-Fu, houve um engano...”</p>
              <button className={letterClues.includes("cantao") ? "is-read" : ""} onClick={() => !letterClues.includes("cantao") && setLetterClues([...letterClues, "cantao"])}>
                <b>CANTÃO</b><em>“É no Sul da China, na província de Cantão.”</em>
              </button>
              <button className={letterClues.includes("kaoli") ? "is-read" : ""} onClick={() => !letterClues.includes("kaoli") && setLetterClues([...letterClues, "kaoli"])}>
                <b>KAO-LI</b><em>“Mas também há uma família Ti Chin-Fu para além da Grande Muralha...”</em>
              </button>
              <small>EÇA · CAPÍTULO VII · PDF pp. 89-90</small>
            </div>
            {letterClues.length < 2 ? (
              <p className="instruction">逐条点击附言中的两个地点。它们同时否定了天和村的确定性。</p>
            ) : !searchAgain ? (
              <>
                <p>同一封信给出两个Ti Chin-Fu家族、两个死去的家长、两处贫困。原作让“后代”从可补偿的对象重新变成无法验证的名字。</p>
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => setSearchAgain(true)}><span>再寻找一次</span><small>去广东，或去高丽</small></button>
                  <button className="choice-button dangerous" onClick={() => go("return")}><span>返回欧洲</span><small>我已经尽力了</small></button>
                </div>
              </>
            ) : (
              <div className="consequence">
                <blockquote className="source-inline compact" lang="pt">“Ir de novo bater as estradas da China? Jamais!” <cite>PDF p. 90</cite></blockquote>
                <p>选择“再寻找一次”并没有制造原作不存在的成功支线。Teodoro只在脑中排演广东、高丽与再次受袭，随后仍以“已经做了合理、慷慨且合乎逻辑的事”为自己辩护。</p>
                <button className="primary-action" onClick={() => go("return")}>返回欧洲 <span>→</span></button>
              </div>
            )}
          </div>
        )}

        {stage === "return" && (
          <div className="scene-body ghost-scene">
            <blockquote className="source-inline" lang="pt">“Era ele, outra vez! E foi ele, perpetuamente!” <cite>CAP. VII · PDF p. 95</cite></blockquote>
            <p>点击每一个返航地点。Ti Chin-Fu始终保持同一个死亡姿态：横卧在船舱、码头、沙地与城市拱门之前，不再受地理距离约束。</p>
            <div className="return-stamps" aria-label="返航地点">
              {["新加坡", "锡兰", "苏伊士", "马耳他", "直布罗陀", "里斯本"].map((place, index) => (
                <button key={place} className={returnStops.includes(place) ? "is-read" : ""} style={{ animationDelay: `${index * 0.16}s` }} onClick={() => {
                  if (!returnStops.includes(place)) setReturnStops([...returnStops, place]);
                  sound.tone(110 + index * 14, 0.7, 0.11, 0, "triangle");
                }}>{returnStops.includes(place) ? "Ti Chin-Fu · " : ""}{place}</button>
              ))}
            </div>
            {returnStops.length >= 5 ? (
              <>
                <blockquote className="source-inline compact" lang="pt">“Quando desembarquei em Lisboa... a sua figura bojuda enchia todo o arco da Rua Augusta.” <cite>PDF p. 96</cite></blockquote>
                <button className="primary-action" onClick={() => go("renounce")}>在里斯本放弃财产 <span>→</span></button>
              </>
            ) : <p className="instruction">还需经过 {5 - returnStops.length} 个返航节点。</p>}
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <blockquote className="source-inline" lang="pt">“Abandonei o palacete ao Loreto, a existência de nababo.” <cite>CAP. VIII · PDF p. 97</cite></blockquote>
            <p>你回到第一幕的同一间房，却已经不能恢复同一种贫穷。请检查旧外套、抄写纸和银行账簿。</p>
            <div className="hotspot-index">
              {(sceneHotspots.renounce ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <div className="ledger-animation" aria-hidden="true"><span>PALÁCIO</span><i>— 106.000 CONTOS</i><b>{currentVisited.length >= 3 ? "AINDA MEUS" : "0?"}</b></div>
            {currentVisited.length >= 2 ? <button className="primary-action" onClick={() => go("humiliation")}>回到办公桌 <span>→</span></button> : <p className="instruction">至少检查两件旧生活中的物品。</p>}
          </div>
        )}

        {stage === "humiliation" && (
          <div className="scene-body">
            <blockquote className="source-inline" lang="pt">“todos aqueles que a minha opulência humilhara cobriram-me de ofensas, como se alastra de lixo uma estátua derrubada de príncipe decaído.” <cite>CAP. VIII · PDF p. 97</cite></blockquote>
            <p>旧同事、报纸、贵族、教会、民众和Madame Marques依次“纠正”Teodoro的贫穷。检查画面里的报纸、窗口和仍在桌上的铃，看这场社会惩罚如何把他推回财富。</p>
            <div className="hotspot-index">
              {(sceneHotspots.humiliation ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 2 ? (
              <div className="consequence">
                <blockquote className="source-inline compact" lang="pt">“Então, indignado, um dia subitamente reentrei com estrondo no meu palacete e no meu luxo.” <cite>PDF p. 98</cite></blockquote>
                <p>“继续忍受”并不是原作提供的稳定出口：银行里的财富仍属于Teodoro，Ti Chin-Fu也仍在身旁。叙述最终把他推回唯一真实发生的行动。</p>
                <button className="primary-action" onClick={() => go("prison")}>推开洛雷托宫殿的大门 <span>→</span></button>
              </div>
            ) : <p className="instruction">至少检查两件物品，才能看清贫穷为何没有成为出口。</p>}
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body ending-body prison-body">
            <div className="ending-mark">II</div>
            <p className="ending-label">正篇结局 · O Palácio-Prisão</p>
            <blockquote className="source-inline" lang="pt">“Desde então uma saciedade enervante mantém-me semanas inteiras num sofá, mudo e soturno, pensando na felicidade do não-ser...” <cite>CAP. VIII · PDF p. 98</cite></blockquote>
            <p>吊灯重新点亮，里斯本再次匍匐。请检查镜中宴会、魔鬼、遗嘱和最后一页；终局并不是“享受或悔恨”的二选一，而是享受与痛苦在同一座宫殿里持续。</p>
            <div className="hotspot-index final-index">
              {(sceneHotspots.prison ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {currentVisited.length >= 3 ? (
              <div className="final-testament">
                <blockquote className="ending-quote" lang="pt">“Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!”</blockquote>
                <p className="devil-final" lang="pt">“Não pode ser, meu prezado senhor, não pode ser...” <span>— PDF p. 99</span></p>
                <blockquote className="last-words" lang="pt">“Só sabe bem o pão que dia a dia ganham as nossas mãos: nunca mates o Mandarim!” <cite>PDF p. 100</cite></blockquote>
                <p className="translation">Ti Chin-Fu横陈在镜中宴席之间；然而Teodoro在最后一句又转向读者：如果同样轻易地杀人并继承财产，整个中国不会剩下一个mandarim。告诫因此也沾染了自我开脱。</p>
                <button className="primary-action" onClick={reset}>从未响起的铃开始</button>
              </div>
            ) : <p className="instruction">还需检查 {3 - currentVisited.length} 件终局物品。</p>}
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

      <footer className="game-footer">
        <span>{stage === "intro" ? "1880 / 2026" : `${info.act} · ${info.pt}`}</span>
        <span>{sound.enabled ? "声音开启" : "静音模式"}</span>
      </footer>

      {infoOpen && (
        <div className="modal-backdrop">
          <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
            <button className="modal-close" onClick={() => setInfoOpen(false)} aria-label="关闭">×</button>
            <div className="scene-kicker">SOBRE ESTA EDIÇÃO</div>
            <h2 id="about-title">关于这个校订版</h2>
            <p>这是一个可完整通关的浏览器交互叙事，根据Eça de Queirós的《O Mandarim》(1880)改编。它保留“按铃—暴富—幽灵—远东之旅—返欧—奢华牢笼”的主线，并加入“三次拒绝”的特别结局。</p>
            <p>校订版把葡文原句与所用PDF页码直接放进场景：第一幕的房间物件、您标出的两段诱惑文字，以及北京、天和村、修道院、返航和终局都可以通过图像热点逐项阅读。</p>
            <p>Ti Chin-Fu使用同一个有透明背景的横卧尸身反复进入画面：肥胖的老文人、遮唇白髭、黑辫、黄绸、朝上的肚腹与冷臂间的纸鸢。无论出现在门槛、金床、船舱或返欧途中，他都不再站立；点击尸影可以显出原貌。</p>
            <p>葡文原作进入公版。拒绝结局中的魔鬼台词等新增文字均明确标为本项目原创；视觉中的中国是对Teodoro及十九世纪欧洲“东方想象”的批判性呈现，不作为历史中国的写实复原。</p>
            <p className="credits">文字与交互设计：为本研究原型制作<br />插画与角色设定：AI辅助生成、透明背景处理后用于本项目<br />音乐与音效：浏览器实时合成，不使用外部录音</p>
          </section>
        </div>
      )}
    </main>
  );
}
