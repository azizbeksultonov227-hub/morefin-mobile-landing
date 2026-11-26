"use client";

import { useEffect } from "react";
import { useMedia } from "./use-media";

// Smooth wheel scrolling, for a mouse or a trackpad only. A phone keeps its own scrolling (Lenis would not smooth a
// finger anyway), so it never downloads Lenis or runs its every-frame loop; neither does anyone who asked for less
// motion. Lenis is fetched only once a fine pointer is found, and stops again if that changes.
export function SmoothScroll() {
  const smooth = useMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  useEffect(() => {
    if (!smooth) return;
    let lenis: { destroy(): void } | undefined;
    let gone = false;
    import("lenis").then(({ default: Lenis }) => {
      if (!gone) lenis = new Lenis({ autoRaf: true, anchors: true });
    });
    return () => {
      gone = true;
      lenis?.destroy();
    };
  }, [smooth]);
  return null;
}
