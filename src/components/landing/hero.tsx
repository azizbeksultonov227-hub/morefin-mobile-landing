"use client";

import { ArrowRight, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { SplitWords } from "@/components/split-words";
import { Agents } from "./agents";
import { APP_URL, type Dict } from "@/i18n";

// the moving grid is a desktop treat: phones get a still one in CSS and never download it
const CursorGrid = dynamic(() => import("@/components/rb/cursor-grid"), { ssr: false });

// The first screen: Morefin's AI employees at work, one line saying what Morefin is, and the button to start.
export function Hero({ t }: { t: Dict }) {
  const fine = useMedia("(pointer: fine)");

  return (
    <section data-hero className="relative flex min-h-svh flex-col overflow-hidden">
      {fine ? (
        <CursorGrid className="!absolute inset-0" cellSize={46} color="#3b6cff" lightMode radius={140} holdTime={700} fadeDuration={2200} fillOpacity={0.1} gridOpacity={0.07} spotlight={0.5} />
      ) : (
        <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(90%_60%_at_50%_0%,black,transparent)]" />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] [background:radial-gradient(55%_60%_at_50%_0%,rgb(31_79_234/0.18),transparent)]" />

      {/* centred a little above the middle of the screen (more room below than above) */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-24">
        {/* what Morefin's AI employees are busy with, one at a time */}
        <div className="appear mb-7 md:mb-10">
          <Agents items={t.agents} />
        </div>
        <h1 className="max-w-5xl text-balance text-[clamp(2.4rem,7.6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <SplitWords text={t.h1a} />
          <br />
          <span className="text-muted/80"><SplitWords text={t.h1b} delay={300} /></span>
        </h1>
        {/* two ways on: start free (a dark button in a glowing brand ring), or first see how it works (a light one
            with a video mark, leading to the animated walk-through below) */}
        <div className="appear mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10" style={{ "--d": "900ms" } as React.CSSProperties}>
          <span className="pointer-events-auto rounded-full bg-[linear-gradient(120deg,#7cc8ff,#1f4fea_40%,#8b7cff_75%,#f0a8ff)] p-[3px] shadow-[0_0_24px_-4px_rgb(59_130_246/0.55)]">
            <a data-cta data-lead="hero" href={APP_URL} className="group flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(180deg,#2b3243,#0f172a)] px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] md:text-base">
              {t.start} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </a>
          </span>
          <a href="#how" className="group pointer-events-auto flex h-[58px] items-center gap-3 rounded-full bg-white/90 pl-4 pr-6 ring-1 ring-slate-900/[0.08] shadow-sm shadow-slate-900/5 backdrop-blur transition hover:bg-white hover:ring-slate-900/15">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Play className="size-4 translate-x-px fill-current" aria-hidden /></span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold text-fg">{t.learn.title}</span>
              <span className="text-[13px] text-muted">{t.learn.sub}</span>
            </span>
          </a>
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
