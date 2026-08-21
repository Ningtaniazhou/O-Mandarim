"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from "react";

type ReturnPhase = "arrival" | "map" | "complete";

type MapRoute = {
  label: string;
  pt: string;
  zh: string;
  response: string;
  path: string;
  point: [number, number];
};

const mapRoutes: MapRoute[] = [
  {
    label: "尼古河",
    pt: "O meu hóspede sobe até Ni Ku-Hé, na margem do Pei-Hó...",
    zh: "我的客人先北上，抵达白河岸边的尼古河……",
    response: "尼古河。先沿白河北上。",
    path: "M142 506 C178 484 210 458 255 428",
    point: [255, 428],
  },
  {
    label: "密云",
    pt: "Daí, em barcos chatos, vai a My-Yun. Boa cidade, há lá um Buda vivo...",
    zh: "从那里乘平底船去密云。好城，那里还有一尊活佛……",
    response: "到密云，再离开水路。",
    path: "M255 428 C301 408 344 405 390 371",
    point: [390, 371],
  },
  {
    label: "切希亚堡",
    pt: "Daí, a cavalo, segue até à fortaleza de Ché-Hia.",
    zh: "从那里骑马前往切希亚堡。",
    response: "然后换马，继续向北。",
    path: "M390 371 C430 345 478 331 523 295",
    point: [523, 295],
  },
  {
    label: "长城",
    pt: "Passa a Grande Muralha, famoso espetáculo!...",
    zh: "越过长城——那可是有名的景观！……",
    response: "越过长城。",
    path: "M523 295 C567 270 606 248 651 231",
    point: [651, 231],
  },
  {
    label: "古北口",
    pt: "Descansa no forte de Ku Pi-Hó. Pode lá caçar a gazela. Soberbas gazelas...",
    zh: "在古北口堡歇息。你还可以在那里猎瞪羚。多好的瞪羚……",
    response: "在古北口歇脚。",
    path: "M651 231 C697 218 735 211 781 194",
    point: [781, 194],
  },
  {
    label: "天河",
    pt: "E com dois dias de caminhada está em Tien-Hó... Brilhante, hem?... Quando quer partir? Amanhã?...",
    zh: "再走两天就到天河了……很不错吧？……您想什么时候动身？明天？",
    response: "明天。",
    path: "M781 194 C823 173 858 145 895 116",
    point: [895, 116],
  },
];

// Each resting pose leaves the newly revealed place name above-left of the hand.
// Index 0 waits beside Beijing; indexes 1–6 dock beside the completed route point.
const handDockPositions = [
  [18, 66, -4],
  [30, 60, 2],
  [44, 52, -2],
  [56, 43, 3],
  [69, 34, -3],
  [82, 29, 2],
  [93, 18, -4],
] as const;

type MapStyle = CSSProperties & {
  "--hand-left": string;
  "--hand-top": string;
  "--hand-rotate": string;
};

function RouteMap({ step, compact = false }: { step: number; compact?: boolean }) {
  return (
    <svg className={`route-map-svg ${compact ? "compact" : ""}`} viewBox="0 0 1000 620" role="img" aria-label={`北京到天河的路线，已绘制 ${step} 段`}>
      <g className="map-terrain" aria-hidden="true">
        <path d="M86 532 C195 470 174 389 283 360 C384 333 435 248 538 232 C672 210 715 126 925 82" />
        <path d="M155 558 C246 495 351 485 437 411 C536 326 651 354 742 276 C812 218 864 174 944 142" />
        <path d="M206 142 C297 112 365 157 446 127 C532 96 598 122 676 86" />
        <path className="river" d="M116 522 C211 470 173 398 267 350 C353 307 328 239 425 198" />
        <path className="wall" d="M584 264 L615 248 L642 260 L669 235 L695 247 L723 221" />
      </g>
      <g className="map-route-lines">
        {mapRoutes.map((route, index) => (
          <path key={route.label} className={index < step ? "is-drawn" : ""} d={route.path} pathLength="1" />
        ))}
      </g>
      <g className="map-place-labels">
        <circle cx="142" cy="506" r="7" />
        <text x="112" y="544">北京</text>
        {mapRoutes.map((route, index) => (
          <g key={route.label} className={index < step ? "is-visible" : ""}>
            <circle cx={route.point[0]} cy={route.point[1]} r="7" />
            <text x={route.point[0] + 12} y={route.point[1] - 12}>{route.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function ReturnQuote({ pt, zh }: { pt: string; zh: string }) {
  return (
    <blockquote className="source-inline bilingual-quote compact">
      <span lang="pt">“{pt}”</span>
      <span className="quote-translation">“{zh}”</span>
    </blockquote>
  );
}

export default function CamilloffReturnMap({ onContinue, onTone }: { onContinue: () => void; onTone: (frequency: number, duration: number, volume: number) => void }) {
  const [phase, setPhase] = useState<ReturnPhase>("arrival");
  const [gloveInspected, setGloveInspected] = useState(false);
  const [gloveFocus, setGloveFocus] = useState(false);
  const [mapStep, setMapStep] = useState(0);
  const [mapAnimating, setMapAnimating] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const inspectGlove = () => {
    setGloveInspected(true);
    setGloveFocus(true);
    onTone(196, 0.7, 0.05);
    timers.current.push(window.setTimeout(() => setGloveFocus(false), 2400));
  };

  const advanceMap = () => {
    if (phase !== "map" || mapAnimating || mapStep >= mapRoutes.length) return;
    setMapAnimating(true);
    setMapStep((step) => step + 1);
    onTone(246.94 + mapStep * 18, 0.46, 0.055);
    timers.current.push(window.setTimeout(() => setMapAnimating(false), 720));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const distance = Math.hypot(event.clientX - dragStart.current.x, event.clientY - dragStart.current.y);
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (distance >= 18) advanceMap();
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 10) return;
    event.preventDefault();
    advanceMap();
  };

  const currentRoute = mapStep > 0 ? mapRoutes[mapStep - 1] : null;
  const handPosition = handDockPositions[mapStep];
  const mapStyle: MapStyle = {
    "--hand-left": `${handPosition[0]}%`,
    "--hand-top": `${handPosition[1]}%`,
    "--hand-rotate": `${handPosition[2]}deg`,
  };

  return (
    <>
      {phase !== "map" && (
        <button className={`return-glove-hotspot ${gloveInspected ? "is-seen" : ""}`} type="button" onClick={inspectGlove} aria-label="看向桌角的女士手套">
          <span aria-hidden="true" />
        </button>
      )}

      {gloveFocus && (
        <aside className="glove-memory" aria-live="polite">
          <div aria-hidden="true" />
          <p>我的视线停了一瞬。手刚伸过去，又收了回来。</p>
        </aside>
      )}

      {phase === "arrival" && (
        <div className="scene-body camilloff-return-arrival">
          <ReturnQuote pt="Uma manhã, Camilloff, entrando na Chancelaria, onde eu fumava o cachimbo da amizade de companhia com Meriskoff, atirou o seu enorme sabre para um canapé, e contou-nos radiante as notícias que lhe dera o penetrante príncipe Tong." zh="一天早晨，卡米洛夫走进秘书处；当时我正和梅里斯科夫抽着友谊烟斗作伴。他把硕大的军刀扔到长榻上，兴高采烈地告诉我们佟亲王带来的消息。" />
          <p>自从来到北京，我再没有看见狄鑫福与纸鸢。门外的车轮声刚刚停住，卡米洛夫便带回成捆的公文、名单和封缄；夫人已经离开，桌角却还留着一件不属于这场会谈的东西。</p>
          <div className="dialogue-result">
            <div className="speaker">卡米洛夫</div>
            <ReturnQuote pt="Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!" zh="终于查明，一位名叫狄鑫福的富有满大人，过去住在蒙古边境的天河！" />
          </div>
          <p>线索指向北京以北、越过长城后的天河村。</p>
          <p>他没有看向那里，只把地图推到灯下，削尖了铅笔。</p>
          <button className="primary-action" type="button" onClick={() => setPhase("map")}>看他把消息画成道路 <span>→</span></button>
        </div>
      )}

      {phase === "map" && (
        <section className="map-workbench" aria-label="卡米洛夫绘制北京到天河的路线">
          <header className="map-workbench-heading">
            <span>寻访路线</span>
            <h2 className="section-title">纸上的道路</h2>
            <p>{mapStep < mapRoutes.length ? "推动铅笔、轻拖纸张，或滚动一次。" : "六段道路已经连在一起。"}</p>
          </header>
          <div
            className={`map-paper ${mapAnimating ? "is-jumping" : ""} shift-${mapStep % 3}`}
          >
            <RouteMap step={mapStep} />
            <button
              className="map-paper-drag-surface"
              type="button"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
                  event.preventDefault();
                  advanceMap();
                }
              }}
              aria-label="地图纸张：拖动、滚动或按回车绘制下一段路线"
            />
            <button className={`map-hand-control pose-${mapStep % 3} ${mapAnimating ? "is-moving" : ""}`} type="button" style={mapStyle} onClick={advanceMap} aria-label="推动卡米洛夫的铅笔，绘制下一段路线" disabled={mapStep >= mapRoutes.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/camilloff-map-hand-v1.png" alt="卡米洛夫握着铅笔的手" draggable={false} />
            </button>
          </div>
          <aside className="map-conversation" aria-live="polite">
            {currentRoute ? (
              <>
                <div className="speaker">卡米洛夫 · {String(mapStep).padStart(2, "0")} / 06</div>
                <ReturnQuote pt={currentRoute.pt} zh={currentRoute.zh} />
                <p><strong>特奥多罗</strong>{currentRoute.response}</p>
              </>
            ) : (
              <p className="map-waiting-copy">铅笔悬在北京上方。第一段路还没有出现。</p>
            )}
            {mapStep >= mapRoutes.length && <button className="primary-action" type="button" onClick={() => setPhase("complete")}>从地图上抬起视线 <span>→</span></button>}
          </aside>
        </section>
      )}

      {phase === "complete" && (
        <div className="scene-body camilloff-return-complete">
          <div className="completed-route-overlay" aria-hidden="true"><RouteMap step={mapRoutes.length} compact /></div>
          <ReturnQuote pt="Mas já o zeloso Camilloff, de lápis na mão, ia marcando no mapa o meu itinerário para Tien-Hó!" zh="然而，热心的卡米洛夫已经拿起铅笔，在地图上标出我前往天河的路线！" />
          <p>道路已经完整地铺在桌面中央。卡米洛夫风尘未洗，仍俯身替我核对每一处转折；那只浅色手套则安静地留在画面边缘。</p>
          <div className="dialogue-result">
            <div className="speaker">卡米洛夫</div>
            <p>“什么时候动身？明天？”</p>
            <div className="speaker teodoro">特奥多罗</div>
            <p>“明天。”我闷闷地回答。</p>
          </div>
          <button className="primary-action" type="button" onClick={onContinue}>告别卡米洛夫，前往天河村 <span>→</span></button>
        </div>
      )}
    </>
  );
}
