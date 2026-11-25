"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SplitWords } from "@/components/split-words";
import { APP_URL, money, RULES, type Dict } from "@/i18n";
import { incomeAt, press, usePresses } from "./presses";

// the moving grid is a desktop treat: phones get a still one in CSS and never download it
const CursorGrid = dynamic(() => import("@/components/rb/cursor-grid"), { ssr: false });

export function Hero({ t }: { t: Dict }) {
  const [ready, setReady] = useState(false);
  const fine = useMedia("(pointer: fine)");
  const { count } = usePresses();
  const { amount, method } = incomeAt(count);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 700);
    // a click, not pointerdown: a swipe to scroll on a phone is not a press; links lead away, so they don't count
    const down = (e: MouseEvent) => { if (!(e.target as Element).closest("a")) press(); };
    addEventListener("click", down);
    return () => { clearTimeout(id); removeEventListener("click", down); };
  }, []);

  const rows: [string, number, string?][] = [
    [`${t.rows.income} · ${t.methods[method]}`, amount, "+"],
    [`${t.rows.partner} ${RULES.partner * 100}%`, amount * RULES.partner, "−"],
    [`${t.rows.kpi} ${RULES.kpi * 100}%`, amount * RULES.kpi, "−"],
    [`${t.rows.tax} ${RULES.tax * 100}%`, amount * RULES.tax, "−"],
  ];
  const net = amount * (1 - RULES.partner - RULES.kpi - RULES.tax);

  return (
    <section data-hero className="relative flex min-h-svh flex-col overflow-hidden">
      {fine ? (
        <CursorGrid className="!absolute inset-0" cellSize={46} color="#3b6cff" lightMode radius={140} holdTime={700} fadeDuration={2200} fillOpacity={0.1} gridOpacity={0.07} spotlight={0.5} />
      ) : (
        <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(90%_60%_at_50%_0%,black,transparent)]" />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] [background:radial-gradient(55%_60%_at_50%_0%,rgb(31_79_234/0.18),transparent)]" />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-12 pt-24 md:px-10 md:pb-14 md:pt-28">
        <h1 className="max-w-5xl text-balance text-[clamp(2.4rem,7.6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <SplitWords text={t.h1a} />
          <br />
          <span className="text-muted/80"><SplitWords text={t.h1b} delay={300} /></span>
        </h1>

        {/* phones keep the desktop pairing: the card on the left, shrunk like a picture (400px wide = 25 of its "16px"),
            the words and the button on the right at their normal reading size */}
        <div className="mt-8 grid grid-cols-[1.08fr_1fr] items-end gap-4 md:mt-10 md:grid-cols-[minmax(0,400px)_1fr] md:gap-8">
          <div className="picture appear rounded-2xl border border-line bg-card/90 p-5 font-mono text-sm shadow-xl shadow-blue-950/5" style={{ "--d": "700ms", "--pf": "calc((100vw - 56px) * 0.519 / 25)" } as React.CSSProperties}>
            <p className="mb-2.5 text-xs text-muted">{t.card}</p>
            {rows.map(([k, v, sign], i) => (
              <div key={i} className="flex h-9 items-center justify-between gap-3 border-t border-line">
                <span className="truncate text-muted">{k}</span>
                <Value show={ready} id={count} delay={i * 0.12} className={i === 0 ? "text-success" : undefined}>
                  {sign}{money(v)}
                </Value>
              </div>
            ))}
            <div className="flex h-10 items-center justify-between gap-3 border-t border-line font-semibold">
              <span>{t.rows.net}</span>
              <Value show={ready} id={count} delay={0.5} className="text-primary dark:text-accent">
                {money(net)} {t.currency}
              </Value>
            </div>
            <p className="mt-1.5 text-xs text-muted">{t.tryIt}</p>
          </div>

          <div className="appear md:justify-self-end md:text-right" style={{ "--d": "950ms" } as React.CSSProperties}>
            <p className="max-w-sm text-sm text-muted md:ml-auto md:text-lg">{t.lead}</p>
            <a data-cta data-lead="hero" href={APP_URL} className="group pointer-events-auto mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-fg px-3 py-3 text-center text-[13px] font-medium leading-tight text-bg transition hover:bg-primary hover:text-white md:mt-5 md:inline-flex md:w-auto md:px-6 md:text-base">
              {t.start} <ArrowRight className="hidden size-4 shrink-0 transition group-hover:translate-x-0.5 min-[400px]:block" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Whether a media query matches; false on the server and in the first paint. */
function useMedia(query: string) {
  return useSyncExternalStore(
    (f) => { const mq = matchMedia(query); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); },
    () => matchMedia(query).matches,
    () => false,
  );
}

/** A figure that rolls in from below whenever a new income arrives. */
function Value({ show, id, delay, className = "", children }: { show: boolean; id: number; delay: number; className?: string; children: React.ReactNode }) {
  return (
    <span className={`relative inline-flex h-5 shrink-0 overflow-hidden tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {show && (
          <m.span key={id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ delay, type: "spring", stiffness: 420, damping: 32 }}>
            {children}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
