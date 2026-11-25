"use client";

import { ArrowRight } from "lucide-react";
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

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-12 pt-24 md:px-10 md:pb-14 md:pt-28">
        {/* what Morefin's AI employees are busy with, one at a time */}
        <div className="appear mb-7 md:mb-10">
          <Agents items={t.agents} />
        </div>
        <h1 className="max-w-5xl text-balance text-[clamp(2.4rem,7.6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <SplitWords text={t.h1a} />
          <br />
          <span className="text-muted/80"><SplitWords text={t.h1b} delay={300} /></span>
        </h1>
        {/* a compact start button: the label, and the arrow in its own small circle that nudges forward on hover */}
        <div className="appear mt-8 md:mt-10" style={{ "--d": "900ms" } as React.CSSProperties}>
          <a data-cta data-lead="hero" href={APP_URL} className="group pointer-events-auto inline-flex h-12 items-center gap-3 rounded-full bg-primary pl-6 pr-1.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-xl hover:shadow-primary/40 md:h-14 md:pl-7 md:pr-2 md:text-base">
            {t.start}
            <span className="grid size-9 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5 md:size-10">
              <ArrowRight className="size-4" />
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
