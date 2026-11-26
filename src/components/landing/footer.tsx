"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LOGO } from "@/components/mark";

// the pixel wordmark is only fetched once the footer comes near
const ParticleText = dynamic(() => import("@/components/rb/particle-text"), { ssr: false });

// The page ends on the logo alone (language and "log in" live in the top bar). It is made of pixels (like its own
// pixel "fin"): the pointer scatters them, a click bursts them, they always come back; on a phone they rest once
// gathered (a drift of half a pixel nobody sees there would keep the canvas redrawing every frame)
export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNear(true);
      io.disconnect();
    }, { rootMargin: "200px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  // bigger pixels on a wide screen, so they still read as pixels; only read once in view, never on the server
  const wide = near && matchMedia("(min-width: 768px)").matches;
  return (
    <footer className="overflow-hidden border-t border-line">
      <div ref={ref} className="h-[clamp(150px,27vw,420px)] text-primary">
        {near && (
          <ParticleText
            text="Morefin"
            image={LOGO.src}
            shape="square"
            particleSize={wide ? 5 : 3}
            density={wide ? 7 : 4}
            color="currentColor"
            highlightColor="#3b9dfb"
            intro="rain"
            gatherDuration={1400}
            pointerRepel={70}
            repelRadius={110}
            idleDrift={wide ? 0.4 : 0}
            glow={false}
            className="!min-h-0"
          />
        )}
      </div>
    </footer>
  );
}
