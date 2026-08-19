"use client";

import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

/* eslint-disable @next/next/no-img-element */

type Phase = "intro" | "coin" | "rice" | "lantern" | "bridge" | "reality" | "identity" | "escape" | "wall" | "wilderness" | "collapsed";
type Evidence = "letter" | "cross" | "gold" | "sato";

type Props = {
  soundEnabled: boolean;
  onMusic: (src: string, volume: number) => void;
  onSilence: (duration?: number) => void;
  onComplete: () => void;
};

const evidence = {
  letter: { label: "官员介绍信", icon: "文", hint: "葡萄牙文、官印与签名", intent: "我受官府委托而来", seen: "无人能读的外国字与红印", outcome: "伪造官文的异乡术士", quote: "纸张在人群中倒着传了一圈。有人指着印章说：‘这是召来灾祸的符牒。’", pressure: 84 },
  cross: { label: "十字架", icon: "†", hint: "随身携带的信仰凭证", intent: "我是受教会保护的旅人", seen: "陌生的金属法器", outcome: "携带异邦法器的陌生人", quote: "十字架在火把间闪了一下。人群退了半步，又把棍棒握得更紧。", pressure: 88 },
  gold: { label: "金币", icon: "●", hint: "最直观，也最危险", intent: "这些钱足以证明我的身份", seen: "传闻中的外国宝藏", outcome: "必须交出全部黄金的人", quote: "第一枚金币还没有落稳，后面的人已经喊道：‘箱子里还有更多！’", pressure: 100 },
  sato: { label: "让萨托翻译", icon: "译", hint: "把信任交给一句话", intent: "我们只是来帮助穷人", seen: "萨托说：他要把财物给全村", outcome: "必须在天亮前兑现的承诺", quote: "萨托：‘他……他来把财物分给全村！’话音未落，最后一辆行李车已经开始移动。", pressure: 96 },
} as const;

const wilderness = [
  ["向前走", "马匹已经跑远，空马镫在风里甩动。", "我的衣服冻在皮肤上。金币、身份和向导都留在了身后。"],
  ["站稳", "泥水没过靴底。我每走一步，都要把脚从地里拔出来。", "身后的喊声已经听不见了。荒野并没有因此变得安全。"],
  ["抬起脚", "左耳的血一直流到肩上，现在已经冷了。", "远处有一点白光。它没有靠近，也没有消失。"],
  ["呼吸", "寒气把呼吸留在眼前，路已经从脚下消失。", "我已经不再决定往哪里走，只求身体还能站着。"],
  ["保持清醒", "我只剩一件事还能做。", "保持清醒。每一次呼吸都比上一次更难。"],
] as const;

export default function TienhoSequence({ soundEnabled, onMusic, onSilence, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [rumor, setRumor] = useState("一位远道而来的陌生人");
  const [crowd, setCrowd] = useState(3);
  const [lanterns, setLanterns] = useState<number[]>([]);
  const [choice, setChoice] = useState<Evidence | "">("");
  const [grip, setGrip] = useState(0);
  const [escape, setEscape] = useState({ distance: 0, gold: 100, crowd: 46 });
  const [escapeHeld, setEscapeHeld] = useState(false);
  const [coinBurst, setCoinBurst] = useState(0);
  const [wildStep, setWildStep] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [wakeRound, setWakeRound] = useState(0);
  const [wakeHold, setWakeHold] = useState(0);
  const [wakeVisible, setWakeVisible] = useState(false);
  const timers = useRef<number[]>([]);
  const gripFrame = useRef(0);
  const gripStart = useRef(0);
  const escapeHeldRef = useRef(false);
  const escapeRunningRef = useRef(false);
  const escapeRef = useRef(escape);
  const escapeFrame = useRef(0);
  const escapeLast = useRef(0);
  const lastCoin = useRef(0);
  const wakeFrame = useRef(0);
  const wakeStart = useRef(0);
  const wakeHolding = useRef(false);
  const wakeRoundRef = useRef(0);
  const audioContext = useRef<AudioContext | null>(null);

  const later = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
    return id;
  };

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
    cancelAnimationFrame(gripFrame.current);
    cancelAnimationFrame(escapeFrame.current);
    cancelAnimationFrame(wakeFrame.current);
    audioContext.current?.close().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (["intro", "coin", "rice", "lantern"].includes(phase)) onMusic("/audio/apparitions-ball.mp3", 0.18);
    if (["bridge", "reality", "identity", "escape", "wall"].includes(phase)) onMusic("/audio/pursuit.mp3", 0.2);
    if (phase === "wilderness") onMusic("/audio/i-swear-i-saw-it.ogg", 0.17);
    if (phase === "collapsed") onSilence(1800);
  }, [phase, onMusic, onSilence]);

  const getAudio = () => {
    if (!soundEnabled) return null;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext.current ??= new AudioCtor();
    void audioContext.current.resume();
    return audioContext.current;
  };

  const tap = (frequency = 420, duration = 0.14, volume = 0.04, delay = 0) => {
    const ctx = getAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  };

  const noise = (duration = 0.16, frequency = 900, volume = 0.035) => {
    const ctx = getAudio();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < data.length; index += 1) {
      // Audio noise is intentionally non-deterministic and is generated only inside a user interaction.
      // eslint-disable-next-line react-hooks/purity
      last = last * 0.35 + (Math.random() * 2 - 1) * 0.65;
      data[index] = last;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  };

  const physicalSound = (kind: "coin" | "wood" | "paper" | "drum" | "mud" | "breath" | "snap") => {
    if (kind === "coin") { tap(1760, 0.16, 0.022); tap(2470, 0.11, 0.012, 0.01); }
    if (kind === "wood") { tap(210, 0.09, 0.045); noise(0.06, 760, 0.038); }
    if (kind === "paper") noise(0.28, 1650, 0.035);
    if (kind === "drum") { tap(78, 0.38, 0.09); noise(0.09, 520, 0.048); }
    if (kind === "mud") { tap(92, 0.16, 0.026); noise(0.2, 240, 0.052); }
    if (kind === "breath") noise(0.52, 760, 0.026);
    if (kind === "snap") { noise(0.12, 1350, 0.08); tap(210, 0.08, 0.05, 0.02); }
  };

  const beginDream = () => {
    getAudio();
    setPhase("coin");
    setRumor("一位远道而来的陌生人");
  };

  const giveCoin = () => {
    if (phase !== "coin") return;
    physicalSound("coin");
    setRumor("慷慨的陌生人");
    setCrowd(7);
    setPhase("rice");
  };

  const giveRice = () => {
    if (phase !== "rice") return;
    noise(0.48, 2850, 0.05);
    setRumor("富有的陌生人");
    setCrowd(12);
    setPhase("lantern");
  };

  const lightLantern = (index: number) => {
    if (phase !== "lantern" || lanterns.includes(index)) return;
    physicalSound("paper");
    const next = [...lanterns, index];
    setLanterns(next);
    setCrowd((value) => value + 2);
    if (next.length === 3) {
      setRumor("带着无数黄金的陌生人");
      later(() => {
        setPhase("bridge");
        [0, 560, 1080, 1540, 1940, 2290].forEach((delay) => later(() => physicalSound("drum"), delay));
        later(() => setPhase("reality"), 2920);
      }, 850);
    }
  };

  const startGrip = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== "reality") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    physicalSound("paper");
    gripStart.current = event.timeStamp;
    const tick = (now: number) => {
      const progress = Math.min(100, ((now - gripStart.current) / 1250) * 100);
      setGrip(progress);
      if (progress >= 100) {
        physicalSound("drum");
        setPhase("identity");
      } else gripFrame.current = requestAnimationFrame(tick);
    };
    gripFrame.current = requestAnimationFrame(tick);
  };

  const cancelGrip = () => {
    if (phase !== "reality") return;
    cancelAnimationFrame(gripFrame.current);
    setGrip(0);
  };

  const chooseEvidence = (value: Evidence) => {
    if (choice) return;
    setChoice(value);
    physicalSound(value === "letter" ? "paper" : value === "gold" ? "coin" : "wood");
    later(() => physicalSound("drum"), 150);
  };

  const beginEscape = () => {
    if (!choice) return;
    const initial = { distance: 0, gold: 100, crowd: evidence[choice].pressure * 0.46 };
    escapeRef.current = initial;
    setEscape(initial);
    setPhase("escape");
  };

  const setHeld = (held: boolean) => {
    if (phase !== "escape") return;
    escapeHeldRef.current = held;
    setEscapeHeld(held);
    if (held) physicalSound("paper");
    if (!escapeRunningRef.current) {
      escapeRunningRef.current = true;
      escapeLast.current = 0;
      const run = (now: number) => {
        if (!escapeLast.current) escapeLast.current = now;
        const delta = Math.min(0.05, (now - escapeLast.current) / 1000);
        escapeLast.current = now;
        const current = escapeRef.current;
        const next = escapeHeldRef.current
          ? { distance: current.distance + 4.8 * delta, gold: current.gold, crowd: current.crowd + 6.5 * delta }
          : { distance: current.distance + 13.5 * delta, gold: current.gold - 17 * delta, crowd: current.crowd - 10.5 * delta };
        next.gold = Math.max(0, next.gold);
        next.crowd = Math.max(8, Math.min(98, next.crowd));
        escapeRef.current = next;
        setEscape(next);
        if (!escapeHeldRef.current && now - lastCoin.current > 190) {
          setCoinBurst((value) => value + 1);
          lastCoin.current = now;
        }
        if (next.distance >= 72) {
          escapeRunningRef.current = false;
          setEscapeHeld(false);
          setPhase("wall");
          physicalSound("wood");
          return;
        }
        escapeFrame.current = requestAnimationFrame(run);
      };
      escapeFrame.current = requestAnimationFrame(run);
    }
  };

  const cutBag = () => {
    physicalSound("snap");
    setEscape((value) => ({ ...value, gold: 0 }));
    later(() => setPhase("wilderness"), 750);
  };

  const blink = (update?: () => void) => {
    setBlinking(false);
    requestAnimationFrame(() => setBlinking(true));
    if (update) later(update, 390);
    later(() => setBlinking(false), 900);
  };

  const advanceWild = () => {
    if (phase !== "wilderness" || wildStep >= 4 || blinking) return;
    physicalSound("mud");
    blink(() => setWildStep((step) => step + 1));
  };

  const startWakeHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== "wilderness" || wildStep !== 4 || wakeHolding.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    wakeHolding.current = true;
    wakeStart.current = event.timeStamp;
    const round = wakeRoundRef.current;
    const target = [1050, 1450, 2050][round];
    const tick = (now: number) => {
      if (!wakeHolding.current) return;
      const elapsed = now - wakeStart.current;
      if (round === 2 && elapsed >= target * 0.9) {
        setWakeHold(82);
        wakeHolding.current = false;
        setPhase("collapsed");
        physicalSound("mud");
        later(() => setWakeVisible(true), 2450);
        return;
      }
      const progress = Math.min(100, (elapsed / target) * 100);
      setWakeHold(progress);
      if (progress >= 100) {
        wakeHolding.current = false;
        const nextRound = round + 1;
        wakeRoundRef.current = nextRound;
        setWakeRound(nextRound);
        setWakeHold(0);
        physicalSound("drum");
        blink();
        return;
      }
      wakeFrame.current = requestAnimationFrame(tick);
    };
    wakeFrame.current = requestAnimationFrame(tick);
  };

  const cancelWakeHold = () => {
    if (!wakeHolding.current) return;
    wakeHolding.current = false;
    cancelAnimationFrame(wakeFrame.current);
    setWakeHold(0);
    physicalSound("breath");
  };

  const dreamPhase = ["intro", "coin", "rice", "lantern", "bridge"].includes(phase);
  const realPhase = ["reality", "identity"].includes(phase);
  const escapePhase = ["escape", "wall"].includes(phase);
  const result = choice ? evidence[choice] : null;
  const wildMoment = wilderness[wildStep];
  const wildAction = wildStep < 4 ? wildMoment[0] : wakeRound === 0 ? "保持清醒" : wakeRound === 1 ? "呼吸" : "不要睡去";
  const wakeStyle = { "--wake-hold": wakeHold } as CSSProperties;

  return (
    <section className={`th-sequence th-${phase} ${blinking ? "is-blinking" : ""}`} aria-label="天河村章节">
      {(dreamPhase || realPhase) && (
        <>
          <img className="th-bg th-dream-bg" src="/tienho-dream-v1.png" alt="天河村客栈前的米粮与灯笼庆典" />
          <img className="th-bg th-real-bg" src="/tienho-reality-v1.png" alt="月夜中包围客栈的人群与行李车" />
          <div className="th-vignette" />
          <div className="th-crowd" aria-hidden="true">{Array.from({ length: crowd }, (_, index) => <i key={index} style={{ left: `${index * 16}px` }} />)}</div>
          <div className="th-petals" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ left: `${28 + (index * 17) % 68}%`, animationDelay: `${-(index % 8)}s` }} />)}</div>
          <aside className="th-rumor"><span>人群低语</span><strong>{rumor}</strong><b><i /></b></aside>
          <div className="th-chant">再给一些！</div>
        </>
      )}

      {phase === "intro" && <div className="th-story"><p className="th-kicker">尘世安慰客栈 · 入夜</p><h2>茶气尚温。萨托仍在说着明日的计划。</h2><p>找到遗孀，分发米粮，让整个村庄亮起灯火。疲倦正把屋梁下的纸龙慢慢融进暮色。</p><button onClick={beginDream}>饮尽茶，合上眼睛 <span>→</span></button></div>}
      {phase === "coin" && <div className="th-story"><p className="th-kicker">第二日 · 仿佛已经到来</p><h2>狄鑫福的遗孀站在晨光里。</h2><p>她没有开口，只把一只空碗捧向我。</p><button className="th-coin" onClick={giveCoin}>金币</button><button className="th-bowl" onClick={giveCoin}>把金币放进碗里</button></div>}
      {phase === "rice" && <div className="th-story"><p className="th-kicker">村口 · 米粮车</p><h2>她的笑容像一道许可。</h2><p>人群为我让出通往粮车的路。</p><button className="th-object-action" onClick={giveRice}>分发米粮</button></div>}
      {phase === "lantern" && <div className="th-story"><p className="th-kicker">黄昏 · 庆典</p><h2>每一盏灯，都召来更多面孔。</h2><p>点亮三盏灯笼。</p><div className="th-lanterns">{[0, 1, 2].map((index) => <button key={index} className={lanterns.includes(index) ? "is-lit" : ""} onClick={() => lightLantern(index)} aria-label={`点亮第 ${index + 1} 盏灯笼`}>灯</button>)}</div></div>}
      {phase === "bridge" && <div className="th-story is-quiet"><p className="th-kicker">庆典 · 最热闹的时候</p><h2>最后一盏灯亮了。</h2><p>鼓点从人群深处传来。</p></div>}
      {phase === "reality" && <><div className="th-story"><p className="th-kicker">午夜 · 尘世安慰客栈</p><h2>鼓声没有停。它只是变成了撞门声。</h2><p>窗外那句欢呼仍在重复，而一只手已经伸向钱袋。</p></div><button className="th-grip" style={{ "--grip": grip } as CSSProperties} onPointerDown={startGrip} onPointerUp={cancelGrip} onPointerCancel={cancelGrip}><i />按住钱袋</button></>}

      {phase === "identity" && <div className="th-identity"><p className="th-kicker">第三阶段 · 身份盘问</p><h2>从行李中举出一件能够证明身份的东西。</h2><p>我拥有许多证明地位的物件，却没有一种能在这里建立信任。</p><div className="th-evidence">{(Object.keys(evidence) as Evidence[]).map((key) => <button key={key} disabled={Boolean(choice)} className={choice === key ? "is-chosen" : ""} onClick={() => chooseEvidence(key)}><i>{evidence[key].icon}</i><strong>{evidence[key].label}</strong><small>{evidence[key].hint}</small></button>)}</div>{result && <><div className="th-causal"><div><span>我的本意</span><strong>{result.intent}</strong></div><b>→</b><div><span>他们看见</span><strong>{result.seen}</strong></div><b>→</b><div className="is-danger"><span>新的传闻</span><strong>{result.outcome}</strong></div></div><blockquote>{result.quote}</blockquote><button className="th-primary" onClick={beginEscape}>路障塌了——从后窗逃走 <span>→</span></button></>}</div>}

      {escapePhase && <div className="th-escape"><div className="th-escape-vignette" /><img src="/teodoro-run-v1.png" alt="特奥多罗抱着沉重的钱袋奔逃" /><div className="th-escape-copy"><p className="th-kicker">第四阶段 · 金币负重逃亡</p><h2>{phase === "wall" ? "钱袋的皮绳挂在了窗栅上。" : "钱袋越完整，我就跑得越慢。"}</h2><p>{phase === "wall" ? "出口近在眼前。带着它，我翻不过去。" : "按住钱袋保住金币；松手时金币会洒落，人群也会转身争抢。"}</p></div><div className="th-escape-hud"><label>出口距离 <b><i style={{ width: `${Math.min(100, escape.distance)}%` }} /></b><strong>{Math.round(Math.min(100, escape.distance))}%</strong></label><label>剩余金币 <b><i style={{ width: `${escape.gold}%` }} /></b><strong>{Math.round(escape.gold)}%</strong></label><label>身后人群 <b><i style={{ width: `${escape.crowd}%` }} /></b><strong>{Math.round(escape.crowd)}%</strong></label></div>{phase === "escape" && <button className={`th-escape-bag ${escapeHeld ? "is-held" : ""}`} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setHeld(true); }} onPointerUp={() => setHeld(false)} onPointerCancel={() => setHeld(false)}><i>✦</i><span>按住：保住金币 / 松开：跑得更快</span></button>}{phase === "wall" && <button className="th-cut" onClick={cutBag}>割断钱袋</button>}<div className="th-coins" key={coinBurst} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--coin-x": `${-60 - index * 18}px`, "--coin-y": `${-25 + (index % 3) * 24}px` } as CSSProperties} />)}</div></div>}

      {(phase === "wilderness" || phase === "collapsed") && <div className="th-wilderness"><img src="/wilderness-teodoro-v2.png" alt="月夜荒野中，浑身湿透的特奥多罗独自走过泥地" /><div className="th-wild-cold" /><div className="th-wild-copy"><p className="th-kicker">天河村外 · 荒野</p><h2>{wildMoment[1]}</h2><p>{wildMoment[2]}</p></div><div className="th-body-signals" aria-hidden="true"><span className={wildStep > 0 ? "is-visible" : ""}>衣服 · 湿透</span><span className={wildStep > 1 ? "is-visible" : ""}>左耳 · 温热</span><span className={wildStep > 2 ? "is-visible" : ""}>双脚 · 失去知觉</span><span className={wildStep > 3 ? "is-visible" : ""}>呼吸 · 结霜</span></div>{phase === "wilderness" && <button className="th-wild-action" style={wakeStyle} onClick={advanceWild} onPointerDown={wildStep === 4 ? startWakeHold : undefined} onPointerUp={wildStep === 4 ? cancelWakeHold : undefined} onPointerCancel={wildStep === 4 ? cancelWakeHold : undefined}><i /><strong>{wildAction}</strong></button>}</div>}

      <div className="th-blackout" aria-hidden={phase !== "collapsed"}>{phase === "collapsed" && wakeVisible && <button onClick={onComplete}>醒来</button>}</div>
    </section>
  );
}
