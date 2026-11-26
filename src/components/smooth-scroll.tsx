"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

// Smooth wheel scrolling, for a mouse or a trackpad only. A phone keeps its own scrolling (Lenis would not smooth a
// finger anyway) and so never runs Lenis's every-frame loop; neither does anyone who asked for less motion. It sits
// beside the page rather than around it, so switching it on after the first paint does not rebuild the page.
const QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
const subscribe = (change: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", change);
  return () => mq.removeEventListener("change", change);
};

export function SmoothScroll() {
  const smooth = useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
  return smooth ? <ReactLenis root options={{ anchors: true }} /> : null;
}
