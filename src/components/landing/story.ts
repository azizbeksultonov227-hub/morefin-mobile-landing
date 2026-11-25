import { useEffect, useState, type RefObject } from "react";

// What the page's two animated stories share (the income flow and Morefin AI): number helpers, the connectors
// between their cards, and the loop that plays a story by itself once its board is wholly on screen.

export const group = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const span = (progress: number, from: number, to: number) => clamp((progress - from) / (to - from));
export const ease = (value: number) => 1 - Math.pow(1 - value, 3);

/** A connector from one card to one of several ("in"), or from one of several to one card ("out"). */
export type Wire = { role: "in" | "out"; index: number; from: string; to: string };

/** Draw the connector `name` up to `value` (0 to 1) and ride a pulse on its leading end. */
export function drawWire(root: HTMLElement, name: string, value: number) {
  const path = root.querySelector<SVGPathElement>(`[data-wire="${name}"]`);
  const pulse = root.querySelector<SVGCircleElement>(`[data-pulse="${name}"]`);
  if (!path || !pulse) return;
  path.style.setProperty("--p", String(value));
  path.classList.toggle("is-live", value >= 1);
  const moving = value > 0 && value < 1;
  pulse.classList.toggle("is-on", moving);
  if (!moving) return;
  const point = path.getPointAtLength(path.getTotalLength() * value);
  pulse.setAttribute("cx", String(point.x));
  pulse.setAttribute("cy", String(point.y));
}

/** The connectors' paths, measured from the cards themselves so they follow the board (.if-board) at any size.
 *  `count` is how many fan out; their ends are spread along the single card's edge, not drawn from one point. */
export function useWires(rootRef: RefObject<HTMLElement | null>, list: Wire[], count: number, paintRef: RefObject<() => void>) {
  const [wires, setWires] = useState<Array<Wire & { d: string }>>([]);
  useEffect(() => {
    const board = rootRef.current?.querySelector<HTMLElement>(".if-board");
    if (!board) return;
    const measure = () => {
      const frame = board.getBoundingClientRect();
      const box = (selector: string) => {
        const rect = board.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        return { left: rect.left - frame.left, right: rect.right - frame.left, top: rect.top - frame.top, bottom: rect.bottom - frame.top, cy: rect.top - frame.top + rect.height / 2 };
      };
      setWires(list.map((w) => {
        const a = box(w.from), b = box(w.to);
        const spread = (w.index - (count - 1) / 2) * Math.min(14, (w.role === "in" ? a.bottom - a.top : b.bottom - b.top) / 9);
        const ay = w.role === "in" ? a.cy + spread : a.cy;
        const by = w.role === "out" ? b.cy + spread : b.cy;
        const bend = (b.left - a.right) / 2;
        return { ...w, d: `M${a.right} ${ay} C${a.right + bend} ${ay} ${b.left - bend} ${by} ${b.left} ${by}` };
      }));
      paintRef.current();
    };
    // a ResizeObserver reports once right away, then on every size change
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [rootRef, list, count, paintRef]);
  return wires;
}

/** The story is not tied to scrolling. The heading's (.if-head) words rise in as the section comes into view; once
 *  the board (.if-board) is wholly on screen the story plays by itself over `play` ms, holds the result for `pause`
 *  ms, and starts again. Leaving the section stops it; coming back fully starts it from the beginning. */
export function useStoryLoop(rootRef: RefObject<HTMLElement | null>, progressRef: RefObject<number>, paintRef: RefObject<() => void>, reduced: boolean, play: number, pause: number) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const head = root.querySelector<HTMLElement>(".if-head")!;
    if (reduced) {
      head.classList.add("is-in");
      paintRef.current();
      return;
    }
    let raf = 0;
    let wait = 0;
    let begun = 0;
    let playing = false;
    const frame = (now: number) => {
      if (!begun) begun = now;
      progressRef.current = clamp((now - begun) / play);
      paintRef.current();
      if (progressRef.current < 1) raf = requestAnimationFrame(frame);
      else wait = window.setTimeout(() => { begun = 0; raf = requestAnimationFrame(frame); }, pause);
    };
    const start = () => {
      if (playing) return;
      playing = true;
      begun = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!playing) return;
      playing = false;
      cancelAnimationFrame(raf);
      clearTimeout(wait);
      progressRef.current = 0;
      paintRef.current();
    };
    // the section fills the screen, so "fully here" means its board (the cards and lines) is wholly on screen;
    // the heading rises in earlier, as the section comes into view, and the story stops once the section is mostly gone
    const board = root.querySelector<HTMLElement>(".if-board")!;
    const steps = { threshold: Array.from({ length: 41 }, (_, i) => i / 40) };
    const onSection = new IntersectionObserver(([entry]) => {
      const shown = entry.intersectionRect.height / Math.max(1, Math.min(entry.boundingClientRect.height, innerHeight));
      if (shown >= 0.3) head.classList.add("is-in");
      if (shown < 0.5) stop();
    }, steps);
    const onBoard = new IntersectionObserver(([entry]) => { if (entry.intersectionRatio >= 0.99) start(); }, steps);
    onSection.observe(root);
    onBoard.observe(board);
    return () => {
      onSection.disconnect();
      onBoard.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(wait);
    };
  }, [rootRef, progressRef, paintRef, reduced, play, pause]);
}
