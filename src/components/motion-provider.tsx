"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// the animation engine arrives after first paint; until then the page is plain, finished HTML
const features = () => import("./features").then((r) => r.default);

/** Every motion animation honours the OS "reduce motion" setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
