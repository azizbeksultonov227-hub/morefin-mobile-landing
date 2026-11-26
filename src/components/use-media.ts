"use client";

import { useSyncExternalStore } from "react";

/** Whether a media query matches, kept current; false on the server and in the first paint. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (change) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", change);
      return () => mq.removeEventListener("change", change);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
