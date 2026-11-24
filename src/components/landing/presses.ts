"use client";

import { useSyncExternalStore } from "react";

// every tap on the page is a new income; the hero card and the split section both show the latest one
const AMOUNTS = [12_000_000, 4_500_000, 27_800_000, 8_200_000, 15_600_000, 6_300_000];

type State = { count: number };
let state: State = { count: 0 };
const subs = new Set<() => void>();

export function press() {
  state = { count: state.count + 1 };
  subs.forEach((f) => f());
}

const EMPTY: State = { count: 0 };
export const usePresses = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
    () => EMPTY,
  );

/** The income the page shows after `count` taps, and which of the payment methods it came by. */
export const incomeAt = (count: number) => ({ amount: AMOUNTS[count % AMOUNTS.length], method: count % 4 });
