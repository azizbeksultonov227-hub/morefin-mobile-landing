"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { APP_URL, type Locale } from "@/i18n";
import { Langs } from "./header";

// the pixel wordmark is only fetched once the footer comes near
const ParticleText = dynamic(() => import("@/components/rb/particle-text"), { ssr: false });

// the wordmark is made of pixels: the pointer scatters them, a click bursts them, they always come back
export function Footer({ locale, signIn }: { locale: Locale; signIn: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px" });
  // bigger pixels on a wide screen, so they still read as pixels; only read once in view, never on the server
  const wide = near && matchMedia("(min-width: 768px)").matches;
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pt-8 text-sm text-muted md:px-10">
        <Langs locale={locale} />
        <a href={APP_URL} className="transition hover:text-fg">{signIn}</a>
        <span>© 2026 Morefin</span>
      </div>
      <div ref={ref} className="h-[clamp(150px,27vw,420px)] text-fg">
        {near && (
          <ParticleText
            text="Morefin"
            shape="square"
            particleSize={wide ? 5 : 3}
            density={wide ? 7 : 4}
            color="currentColor"
            highlightColor="#3b9dfb"
            intro="rain"
            gatherDuration={1400}
            pointerRepel={70}
            repelRadius={110}
            idleDrift={0.4}
            fontSize="clamp(5rem, 24vw, 22rem)"
            fontWeight={700}
            glow={false}
            className="!min-h-0"
          />
        )}
      </div>
    </footer>
  );
}
