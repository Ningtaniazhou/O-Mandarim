/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Phase = "idle" | "running" | "kneeling" | "vanishing" | "falling" | "aftermath";

const phaseCopy: Record<Phase, string> = {
  idle: "魔鬼已经回答。特奥多罗只剩最后一次卑微的请求。",
  running: "特奥多罗冲向那个黑衣人。",
  kneeling: "他跪倒在湿冷的石路上，双手伸向魔鬼的小腿。",
  vanishing: "手指几乎触到衣料时，黑衣人的轮廓开始消散。",
  falling: "支撑骤然落空；特奥多罗向前扑倒。",
  aftermath: "煤气灯暗下去。垃圾堆旁，只剩一条瘦狗。",
};

function playImpact(context: AudioContext, frequency: number, volume: number, duration: number) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(38, frequency * 0.48), now + duration);
  filter.type = "lowpass";
  filter.frequency.value = 520;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(filter).connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.04);
}

export default function SupplicationPrototypePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [soundOn, setSoundOn] = useState(true);
  const timersRef = useRef<number[]>([]);
  const contextRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(true);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const clearSequence = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearSequence();
      void contextRef.current?.close();
    };
  }, [clearSequence]);

  const ensureAudio = useCallback(async () => {
    if (!soundOnRef.current || typeof window === "undefined") return null;
    if (!contextRef.current) contextRef.current = new window.AudioContext();
    if (contextRef.current.state === "suspended") await contextRef.current.resume();
    return contextRef.current;
  }, []);

  const queue = useCallback((callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  }, []);

  const beginSupplication = useCallback(async () => {
    clearSequence();
    setPhase("running");
    const context = await ensureAudio();

    if (context && soundOnRef.current) {
      [0, 280, 560, 820].forEach((delay, index) => {
        queue(() => playImpact(context, 112 - index * 7, 0.045, 0.12), delay);
      });
    }

    queue(() => {
      setPhase("kneeling");
      if (context && soundOnRef.current) playImpact(context, 82, 0.085, 0.2);
    }, 1120);

    queue(() => setPhase("vanishing"), 1740);

    queue(() => {
      setPhase("falling");
      if (context && soundOnRef.current) playImpact(context, 58, 0.16, 0.45);
    }, 3180);

    queue(() => setPhase("aftermath"), 4000);
  }, [clearSequence, ensureAudio, queue]);

  const busy = phase !== "idle" && phase !== "aftermath";
  const visibleTeodoro = phase === "idle" ? "running" : phase;

  return (
    <main className={styles.page}>
      <section className={`${styles.stage} ${styles[phase]}`} aria-label="特奥多罗乞求魔鬼的独立动画样片">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.street} src="/supplication-street-v1.png" alt="煤气灯照亮的湿石路，远处垃圾堆旁有一条瘦狗" />
        <div className={styles.streetShade} aria-hidden="true" />
        <div className={styles.gasGlow} aria-hidden="true" />
        <div className={styles.dogReveal} aria-hidden="true" />
        <div className={styles.dogMask} aria-hidden="true" />

        <header className={styles.header}>
          <a className={styles.backLink} href="/">← 返回《满大人》</a>
          <div className={styles.headerActions}>
            <button className={styles.soundButton} type="button" onClick={() => setSoundOn((current) => !current)}>
              声音：{soundOn ? "开" : "关"}
            </button>
            <span>独立动画样片</span>
          </div>
        </header>

        <aside className={styles.storyPanel}>
          <p className={styles.eyebrow}>第八章 · 夜路</p>
          <h1>乞求</h1>
          <blockquote>
            <span lang="pt">“Eu atirei-me aos seus pés numa suplicação abjecta...”</span>
            <span>“我扑向他的脚下，卑微地哀求……”</span>
          </blockquote>
          <p className={styles.status} aria-live="polite">{phaseCopy[phase]}</p>
          <button className={styles.begButton} type="button" onClick={beginSupplication} disabled={busy}>
            {phase === "aftermath" ? "重演" : busy ? "……" : "乞求"}
            {!busy && <span>→</span>}
          </button>
          <div className={styles.timeline} aria-hidden="true">
            {["running", "kneeling", "vanishing", "falling", "aftermath"].map((item) => (
              <i key={item} className={phase === item || (phase === "aftermath" && item !== "idle") ? styles.activeMark : ""} />
            ))}
          </div>
        </aside>

        <figure className={styles.devil} aria-label="魔鬼站在煤气灯下">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/devil-standing-v1.png" alt="身穿黑衣、戴高礼帽并夹着雨伞的魔鬼" />
        </figure>

        <figure className={`${styles.teodoro} ${styles[`teodoro${visibleTeodoro[0].toUpperCase()}${visibleTeodoro.slice(1)}`]}`} aria-live="off">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visibleTeodoro === "running" ? "/teodoro-run-v1.png" : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? "/teodoro-kneel-v1.png" : "/teodoro-fallen-v1.png"}
            alt={visibleTeodoro === "running" ? "特奥多罗冲向魔鬼" : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? "特奥多罗跪地伸手试图抱住魔鬼的小腿" : "特奥多罗失去支撑后扑倒在湿石路上"}
          />
        </figure>

        <p className={styles.endLine}>“Não pode ser, meu prezado senhor, não pode ser...”</p>
      </section>
    </main>
  );
}
