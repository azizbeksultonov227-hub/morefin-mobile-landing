"use client";

import { ArrowRight, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { SplitWords } from "@/components/split-words";
import { useMedia } from "@/components/use-media";
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

      {/* centred a little above the middle of the screen (more room below than above); on phones and tablets also
          centred across, like the page's other screens, so the AI employee at work stands in the middle. It is a page
          of its own, on a phone too: it fills the whole first screen and nothing of the blue story shows until the
          visitor scrolls. On a phone the content sits in the middle of the screen below the bar, a touch above centre,
          and the space between its three parts grows with a taller screen instead of leaving an empty band at its foot */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-12 pt-20 max-md:items-center max-md:text-center md:px-10 md:pb-32 md:pt-24">
        {/* what Morefin's AI employees are busy with, one at a time */}
        <div className="appear mb-[clamp(1.75rem,5svh,3.5rem)] md:mb-10">
          <Agents items={t.agents} />
        </div>
        <h1 className="max-w-5xl text-balance text-[clamp(2.4rem,7.6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <SplitWords text={t.h1a} />
          <br />
          <span className="text-muted/80"><SplitWords text={t.h1b} delay={300} /></span>
        </h1>
        {/* two ways on, always side by side: start free (the brand-blue button), or first see how it works (a light one
            with a video mark, leading to the animated walk-through below). On a phone both are compact and share the
            width, each never narrower than its label (a long one, like Russian's, takes more of the row instead of
            spilling out); the light one's second line and the arrow come in once there is room. */}
        <div className="appear mt-[clamp(2rem,6svh,4rem)] flex items-center gap-2 max-md:w-full max-md:justify-center sm:gap-3 md:mt-10" style={{ "--d": "900ms" } as React.CSSProperties}>
          <a data-lead="hero" href={APP_URL} className="group pointer-events-auto flex h-[54px] min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#3d6bff,#1f4fea)] px-3 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_10px_24px_-8px_rgb(31_79_234/0.55)] transition hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_14px_30px_-8px_rgb(31_79_234/0.7)] min-[380px]:text-sm sm:h-[58px] sm:flex-none sm:gap-2.5 sm:px-8 sm:text-[15px] md:text-base">
            {t.start} <ArrowRight className="hidden size-4 shrink-0 transition group-hover:translate-x-0.5 min-[420px]:block" />
          </a>
          <a href="#how" className="group pointer-events-auto flex h-[54px] min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-3 ring-1 ring-slate-900/[0.08] shadow-sm shadow-slate-900/5 transition hover:bg-white hover:ring-slate-900/15 sm:h-[58px] sm:flex-none sm:justify-start sm:gap-3 sm:pl-4 sm:pr-6">
            <span className="hidden size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary min-[360px]:grid sm:size-9"><Play className="size-3.5 translate-x-px fill-current sm:size-4" aria-hidden /></span>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-fg min-[380px]:text-sm sm:text-[15px]">{t.learn.title}</span>
              <span className="hidden text-[13px] text-muted sm:block">{t.learn.sub}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
