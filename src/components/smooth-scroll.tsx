"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";

// Lenis runs in Motion's setup step, so useScroll reads this frame's position; it turns itself off for reduced motion
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);
  useEffect(() => {
    const update = ({ timestamp }: { timestamp: number }) => ref.current?.lenis?.raf(timestamp);
    frame.setup(update, true);
    return () => cancelFrame(update);
  }, []);
  return (
    <ReactLenis root options={{ autoRaf: false }} ref={ref}>
      {children}
    </ReactLenis>
  );
}
