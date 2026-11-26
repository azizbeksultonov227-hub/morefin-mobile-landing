import { useEffect, useState, type RefObject } from "react";

// What the page's two animated stories share (the income flow and Morefin AI): number helpers, a painter that touches
// the page only where something changed, the connectors between their cards, and the loop that plays a story by
// itself once its board is wholly on screen.

export const group = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const span = (progress: number, from: number, to: number) => clamp((progress - from) / (to - from));
export const ease = (value: number) => 1 - Math.pow(1 - value, 3);

/** A story paints every frame. The painter finds each node once and writes only what changed since the last frame
 *  (any write, even of the same value, makes the browser restyle), so a frame where little moves costs little. */
export type Painter = ReturnType<typeof createPainter>;
export function createPainter(root: HTMLElement) {
  const found = new Map<string, Element>();
  const lists = new Map<string, Element[]>();
  const last = new WeakMap<Element, Map<string, string | boolean>>();
  const changed = (el: Element, key: string, value: string | boolean) => {
    let seen = last.get(el);
    if (!seen) last.set(el, (seen = new Map()));
    if (seen.get(key) === value) return false;
    seen.set(key, value);
    return true;
  };
  return {
    one<T extends Element = HTMLElement>(selector: string) {
      let el = found.get(selector);
      if (!el?.isConnected) {
        el = root.querySelector(selector) ?? undefined;
        if (el) found.set(selector, el);
      }
      return el as T | undefined;
    },
    all<T extends Element = HTMLElement>(selector: string) {
      let list = lists.get(selector);
      if (!list?.length || !list.every((el) => el.isConnected)) lists.set(selector, (list = [...root.querySelectorAll(selector)]));
      return list as T[];
    },
    toggle(el: Element | undefined, name: string, on: boolean) {
      if (el && changed(el, `.${name}`, on)) el.classList.toggle(name, on);
    },
    style(el: HTMLElement | SVGElement | undefined, property: string, value: string) {
      if (el && changed(el, property, value)) el.style.setProperty(property, value);
    },
    text(el: Element | undefined, value: string) {
      if (el && changed(el, "#text", value)) el.textContent = value;
    },
    attr(el: Element | undefined, name: string, value: string) {
      if (el && changed(el, `@${name}`, value)) el.setAttribute(name, value);
    },
  };
}

/** A connector from one card to one of several ("in"), or from one of several to one card ("out"). */
export type Wire = { role: "in" | "out"; index: number; from: string; to: string };
/** A measured connector: its path, and points along it with the distance to each, for placing its pulse. */
export type Curve = Wire & { name: string; d: string; points: number[]; lengths: number[] };

const SAMPLES = 32;
// points along a cubic curve and how far along it each one is; enough of them that a pulse moves smoothly between
function measureCurve(ax: number, ay: number, c1x: number, c1y: number, c2x: number, c2y: number, bx: number, by: number) {
  const points: number[] = [];
  const lengths: number[] = [];
  let total = 0;
  let px = ax;
  let py = ay;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const u = 1 - t;
    const x = u * u * u * ax + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * bx;
    const y = u * u * u * ay + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * by;
    total += Math.hypot(x - px, y - py);
    points.push(x, y);
    lengths.push(total);
    px = x;
    py = y;
  }
  return { points, lengths };
}

/** Draw a connector up to `value` (0 to 1) and ride a pulse on its leading end. The pulse's place comes from the
 *  curve's own points, not from asking the page (which would make the browser lay out in the middle of a frame). */
export function drawWire(p: Painter, wire: Curve | undefined, value: number) {
  if (!wire) return;
  const path = p.one<SVGPathElement>(`[data-wire="${wire.name}"]`);
  const pulse = p.one<SVGCircleElement>(`[data-pulse="${wire.name}"]`);
  p.style(path, "--p", String(value));
  p.toggle(path, "is-live", value >= 1);
  const moving = value > 0 && value < 1;
  p.toggle(pulse, "is-on", moving);
  if (!moving) return;
  const { points, lengths } = wire;
  const goal = lengths[lengths.length - 1] * value;
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < goal) i++;
  const f = (goal - lengths[i - 1]) / Math.max(1e-6, lengths[i] - lengths[i - 1]);
  p.attr(pulse, "cx", (points[2 * i - 2] + (points[2 * i] - points[2 * i - 2]) * f).toFixed(1));
  p.attr(pulse, "cy", (points[2 * i - 1] + (points[2 * i + 1] - points[2 * i - 1]) * f).toFixed(1));
}

/** The connectors' paths, measured from the cards themselves so they follow the board (.if-board) at any size.
 *  `count` is how many fan out; their ends are spread along the single card's edge, not drawn from one point. */
export function useWires(rootRef: RefObject<HTMLElement | null>, list: Wire[], count: number, paintRef: RefObject<() => void>) {
  const [wires, setWires] = useState<Curve[]>([]);
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
        const c1x = a.right + bend, c2x = b.left - bend;
        return {
          ...w,
          name: `${w.role}-${w.index}`,
          d: `M${a.right} ${ay} C${c1x} ${ay} ${c2x} ${by} ${b.left} ${by}`,
          ...measureCurve(a.right, ay, c1x, ay, c2x, by, b.left, by),
        };
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
    let painted = 0;
    let playing = false;
    const frame = (now: number) => {
      if (!begun) begun = now;
      progressRef.current = clamp((now - begun) / play);
      // at most about 60 paints a second: a 120 Hz phone would otherwise do the work twice for no visible gain
      if (now - painted >= 15 || progressRef.current >= 1) {
        painted = now;
        paintRef.current();
      }
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
