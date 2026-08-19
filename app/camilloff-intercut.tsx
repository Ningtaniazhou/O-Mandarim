"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type Place = "mansion" | "yamen";

type SceneCopy = {
  image: string;
  place: string;
  speaker: string;
  pt: string;
  zh: string;
  line: string;
};

type IntercutDay = {
  theme: string;
  mansion: SceneCopy;
  yamen: SceneCopy;
};

const intercutDays: IntercutDay[] = [
  {
    theme: "等待、礼节与第一次试探",
    mansion: {
      image: "/camilloff-day1-mansion.png",
      place: "府邸 · 茶室",
      speaker: "将军夫人",
      pt: "O sonho de Vladimira era habitar Paris; e fazendo ferver delicadamente as folhas de chá, pedia-me histórias ladinas de cocottes...",
      zh: "弗拉基米拉梦想住在巴黎；她轻轻煮沸茶叶，请我讲那些风流女子的狡黠故事……",
      line: "茶杯落到托碟上。她没有移开目光，只问巴黎是否真像我说的那样懂得爱情。",
    },
    yamen: {
      image: "/camilloff-day1-yamen.png",
      place: "衙门 · 第一重手续",
      speaker: "书吏",
      pt: "Teve de provar primeiro que o desejo de conhecer a morada de um velho mandarim não encobria uma conspiração contra a segurança do Império...",
      zh: "他首先必须证明，查问一位老满大人的住处，并不掩藏着危害帝国安全的阴谋……",
      line: "印章落下。书吏收走第一份陈情，却说还需另一份文书证明这番查问无意冒犯礼制。",
    },
  },
  {
    theme: "展开、遮掩与关系靠近",
    mansion: {
      image: "/camilloff-day2-mansion.png",
      place: "府邸 · 离扇面更近",
      speaker: "特奥多罗",
      pt: "Ao lado um arroio fresco ia cantando docemente... e junto à janela rendilhada... pousava aberto ao alto um leque...",
      zh: "一旁清凉的溪流低声歌唱……雕花窗边，一柄扇子高高展开，微风使它发出温柔而忧郁的颤音……",
      line: "她展开扇子，像是遮住笑意。我越过扇沿继续讲巴黎，声音也随之低了下来。",
    },
    yamen: {
      image: "/camilloff-day2-yamen.png",
      place: "衙门 · 名册与旧档",
      speaker: "卡米洛夫",
      pt: "Centenares de escribas empalideceram noite e dia, de pincel na mão, desenhando relatórios sobre papel de arroz...",
      zh: "数百名书吏日夜面色苍白，手执毛笔，在宣纸上写下一份又一份报告……",
      line: "卡米洛夫展开刚送来的名单。从天文台到档案院，每个名字都把他推向下一间衙署。",
    },
  },
  {
    theme: "进入的许可",
    mansion: {
      image: "/camilloff-day3-mansion.png",
      place: "府邸 · 静憩亭门前",
      speaker: "将军夫人",
      pt: "Eu... ia entreabrir a porta do Repouso Discreto: — Mimi? E a voz da generala respondia, suave como um beijo: — All right...",
      zh: "我轻轻推开静憩亭的门：‘咪咪？’将军夫人的声音像吻一样柔和：‘进来吧……’",
      line: "门从里面打开。她伸出戴着手套的手，把我引进比客厅更私密的静憩亭。",
    },
    yamen: {
      image: "/camilloff-day3-yamen.png",
      place: "衙门 · 门槛之外",
      speaker: "门吏",
      pt: "Quando Camilloff perguntava pelo resultado, vinha-lhe a resposta satisfatória que se estavam consultando os Livros Santos de Lao-Tsé...",
      zh: "卡米洛夫询问结果时，得到的圆满答复总是：他们正在查阅老子的圣书……",
      line: "门吏的双手自然垂在身侧，语气恭敬而坚定：里面仍在查阅古籍，将军今天不能进去。",
    },
  },
  {
    theme: "两条时间线重新靠拢",
    mansion: {
      image: "/camilloff-day4-mansion.png",
      place: "府邸 · 被留下的手套",
      speaker: "特奥多罗",
      pt: "Eu arregaçava-lhe a larga manga... e ia fazendo viajar os meus lábios devotos pela pele fresca dos seus belos braços...",
      zh: "我卷起她宽大的衣袖，让虔诚的吻沿着她美丽手臂上清凉的肌肤缓缓游移……",
      line: "她离开后，一只浅色手套仍搭在我座椅旁。我的手在它上方停了一瞬，没有把它送回去。",
    },
    yamen: {
      image: "/camilloff-day4-yamen.png",
      place: "衙门 · 封缄的消息",
      speaker: "书吏",
      pt: "Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!",
      zh: "终于查明，一位名叫狄鑫福的富有满大人，过去住在蒙古边境的天河！",
      line: "封缄的回报终于递到卡米洛夫手中。漫长的手续被压缩成一个地名：天河。",
    },
  },
];

type WatchStyle = CSSProperties & { "--watch-progress": string; "--watch-day": string };

export default function CamilloffIntercut({ onComplete, onTone }: { onComplete: () => void; onTone: (frequency: number, duration: number, volume: number) => void }) {
  const [day, setDay] = useState(0);
  const [place, setPlace] = useState<Place>("mansion");
  const [seen, setSeen] = useState<string[]>(["0-mansion"]);
  const [watchProgress, setWatchProgress] = useState(0);
  const globeStart = useRef<number | null>(null);
  const globeDragged = useRef(false);
  const watchLastAngle = useRef<number | null>(null);
  const watchDegrees = useRef(0);
  const watchAdvanced = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const current = intercutDays[day];
  const copy = current[place];
  const seenBoth = seen.includes(`${day}-mansion`) && seen.includes(`${day}-yamen`);

  const showPlace = (next: Place) => {
    if (next === place) return;
    setPlace(next);
    setSeen((items) => items.includes(`${day}-${next}`) ? items : [...items, `${day}-${next}`]);
    onTone(next === "yamen" ? 174.61 : 220, 0.42, 0.055);
  };

  const flipSpace = () => showPlace(place === "mansion" ? "yamen" : "mansion");

  const advanceDay = () => {
    if (!seenBoth) return;
    onTone(day === intercutDays.length - 1 ? 261.63 : 207.65, 0.72, 0.065);
    if (day === intercutDays.length - 1) {
      timers.current.push(window.setTimeout(onComplete, 260));
      return;
    }
    const nextDay = day + 1;
    setDay(nextDay);
    setPlace("mansion");
    setSeen((items) => items.includes(`${nextDay}-mansion`) ? items : [...items, `${nextDay}-mansion`]);
    setWatchProgress(0);
    watchDegrees.current = 0;
    watchAdvanced.current = false;
  };

  const pointerAngle = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  };

  const handleWatchDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!seenBoth) return;
    watchLastAngle.current = pointerAngle(event);
    watchDegrees.current = 0;
    watchAdvanced.current = false;
    setWatchProgress(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleWatchMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (watchLastAngle.current === null || watchAdvanced.current || !seenBoth) return;
    const angle = pointerAngle(event);
    let delta = angle - watchLastAngle.current;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    watchLastAngle.current = angle;
    watchDegrees.current = Math.max(0, watchDegrees.current + delta);
    const progress = Math.min(1, watchDegrees.current / 320);
    setWatchProgress(progress);
    if (progress >= 1) {
      watchAdvanced.current = true;
      watchLastAngle.current = null;
      advanceDay();
    }
  };

  const handleWatchUp = (event: PointerEvent<HTMLButtonElement>) => {
    watchLastAngle.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!watchAdvanced.current) {
      watchDegrees.current = 0;
      setWatchProgress(0);
    }
  };

  const watchStyle: WatchStyle = {
    "--watch-progress": `${watchProgress * 360}deg`,
    "--watch-day": `${day * 82 + watchProgress * 360}deg`,
  };

  const nextDay = intercutDays[day + 1];

  return (
    <section className="intercut-stage" aria-label="宅邸内外四日双线">
      <div className={`intercut-card ${place === "yamen" ? "is-yamen" : "is-mansion"}`}>
        <div className="intercut-face mansion-face" style={{ backgroundImage: `url(${current.mansion.image})` }} aria-hidden="true" />
        <div className="intercut-face yamen-face" style={{ backgroundImage: `url(${current.yamen.image})` }} aria-hidden="true" />
      </div>
      <div className={`intercut-vignette ${place}`} aria-hidden="true" />

      <header className="intercut-heading">
        <span>第五章 · 北京</span>
        <h2>府邸内外</h2>
        <p>{current.theme}</p>
      </header>

      <article className="intercut-copy" key={`${day}-${place}`}>
        <div className="speaker">{copy.place}</div>
        <blockquote className="source-inline bilingual-quote compact">
          <span lang="pt">“{copy.pt}”</span>
          <span className="quote-translation">“{copy.zh}”</span>
        </blockquote>
        <p><strong>{copy.speaker}</strong>{copy.line}</p>
      </article>

      <div className="intercut-day-track" aria-label={`当前为第 ${day + 1} 日，共四日`}>
        {intercutDays.map((_, index) => <i key={index} className={index <= day ? "is-past" : ""} />)}
      </div>

      <div className="intercut-controls">
        <button
          className="space-globe"
          type="button"
          onPointerDown={(event) => {
            globeStart.current = event.clientX;
            globeDragged.current = false;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (globeStart.current === null || globeDragged.current) return;
            if (Math.abs(event.clientX - globeStart.current) >= 24) {
              globeDragged.current = true;
              flipSpace();
            }
          }}
          onPointerUp={(event) => {
            globeStart.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            timers.current.push(window.setTimeout(() => { globeDragged.current = false; }, 0));
          }}
          onClick={() => { if (!globeDragged.current) flipSpace(); }}
          aria-label={place === "mansion" ? "转动地球仪，切换到衙门" : "转动地球仪，切换到府邸"}
        >
          <span className="globe-sphere" aria-hidden="true"><i /><b>‹</b><b>›</b></span>
        </button>

        <button
          className={`time-watch ${seenBoth ? "is-ready" : "is-waiting"}`}
          type="button"
          style={watchStyle}
          onPointerDown={handleWatchDown}
          onPointerMove={handleWatchMove}
          onPointerUp={handleWatchUp}
          onPointerCancel={handleWatchUp}
          onKeyDown={(event) => {
            if (seenBoth && (event.key === "Enter" || event.key === " " || event.key === "ArrowRight")) {
              event.preventDefault();
              advanceDay();
            }
          }}
          aria-label={seenBoth ? (day === intercutDays.length - 1 ? "顺时针转动怀表，等待卡米洛夫归来" : "顺时针转动怀表，推进到下一日") : "先用地球仪查看同一天的另一处"}
          aria-disabled={!seenBoth}
        >
          <span className="watch-crown" aria-hidden="true" />
          <span className="watch-face" aria-hidden="true"><i /></span>
        </button>
      </div>

      <p className="sr-only" aria-live="polite">{seenBoth ? "这一天的宅邸与衙门都已查看，可以转动怀表。" : "转动地球仪，查看同一天的另一处。"}</p>
      {nextDay && <div className="intercut-preload" aria-hidden="true"><span style={{ backgroundImage: `url(${nextDay.mansion.image})` }} /><span style={{ backgroundImage: `url(${nextDay.yamen.image})` }} /></div>}
    </section>
  );
}
