"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { APP_URL, type Dict, type Locale } from "@/i18n";
import "./income-flow.css";

// The Morefin site's income workflow (src/sections/AppHero.tsx), with its scroll story, set in this page's own
// language: the hero card's ledger (hairline rules, mono tabular figures), one blue for the money that stays and
// greys for the money that leaves, and schematic wiring between the three steps. GSAP's ScrollTrigger is replaced by
// a plain scroll listener; phones keep the wide three-column board, shrunk to the screen's width.

// One income and four percentage rules. The percentages are exact on purpose:
// 5,87% is calculated as 5,87%, never rounded to 6.
const RULES = [
  { key: "share", percent: 5.87 },
  { key: "tax", percent: 4 },
  { key: "kpi", percent: 2 },
  // Running costs are the largest slice; what remains is a little over half.
  { key: "fee", percent: 30 },
] as const;
const REST = Number((100 - RULES.reduce((sum, rule) => sum + rule.percent, 0)).toFixed(2));
const INCOMES = [12_000_000, 5_000_000, 40_000_000];
// a heading's words light up one after another while the section scrolls in, like every heading on this page
const DIM = 0.18;

const group = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const percentText = (value: number, locale: string) => String(value).replace(".", locale === "en" ? "." : ",");
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const span = (progress: number, from: number, to: number) => clamp((progress - from) / (to - from));
const ease = (value: number) => 1 - Math.pow(1 - value, 3);

type Wire = { role: "in" | "out"; index: number; d: string };

// A schematic connector: out horizontally, one vertical run at the midpoint, in horizontally, with small rounded
// corners. Every income wire shares the same trunk, so the four read as one line that branches.
function elbow(x1: number, y1: number, x2: number, y2: number, corner: number) {
  if (Math.abs(y2 - y1) < 0.5) return `M${x1} ${y1} H${x2}`;
  const mid = (x1 + x2) / 2;
  const r = Math.min(corner, Math.abs(y2 - y1) / 2, (x2 - x1) / 4);
  const s = y2 > y1 ? 1 : -1;
  return `M${x1} ${y1} H${mid - r} Q${mid} ${y1} ${mid} ${y1 + s * r} V${y2 - s * r} Q${mid} ${y2} ${mid + r} ${y2} H${x2}`;
}

function Start({ label, lead }: { label: string; lead: string }) {
  return (
    <a data-cta data-lead={lead} href={APP_URL} className="if-button">
      {label} <ArrowRight aria-hidden />
    </a>
  );
}

export function IncomeFlow({ t, locale, start }: { t: Dict; locale: Locale; start: string }) {
  const f = t.flow;
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLElement>(null);
  // lead: the section scrolling into view (the heading lights up, the board rises); progress: the pinned track, 0 to 1
  const leadRef = useRef(0);
  const progressRef = useRef(0);
  const incomeRef = useRef(INCOMES[0]);
  const [income, setIncome] = useState(0);
  const [wires, setWires] = useState<Wire[]>([]);

  // Paint one frame of the story. Runs on every scroll tick and every income
  // change, so it writes to the DOM directly instead of re-rendering React.
  const paint = () => {
    const root = rootRef.current;
    if (!root) return;
    const lead = reduced ? 1 : leadRef.current;
    const progress = reduced ? 1 : progressRef.current;
    // Act one, while the section scrolls in: the heading's words light up and the board rises into place under it.
    const dock = reduced ? 1 : ease(span(lead, 0.35, 0.95));
    const stage = root.querySelector<HTMLElement>(".if-stage")!;
    const body = root.querySelector<HTMLElement>(".if-body")!;
    const words = root.querySelectorAll<HTMLElement>(".if-word");
    const lit = span(lead, 0.2, 0.75);
    words.forEach((word, index) => { word.style.opacity = String(DIM + (1 - DIM) * span(lit, index / words.length, (index + 1) / words.length)); });
    body.style.transform = dock < 1 ? `translate3d(0, ${stage.clientHeight * 0.4 * (1 - dock)}px, 0)` : "";
    body.style.opacity = String(dock);

    // Act two, pinned: the workflow itself plays over the whole track.
    const amount = incomeRef.current;
    // Draw a connector up to `value` and ride a small dot on its leading end.
    const wire = (name: string, value: number) => {
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
    };
    // The income lands first: the figure counts up from zero. Only then is it distributed.
    const arrived = span(progress, 0.02, 0.14);
    root.querySelector<HTMLElement>(".if-income-node")!.classList.toggle("is-on", arrived >= 1);
    root.querySelectorAll<HTMLElement>(".if-income strong b").forEach((node, index) => { node.textContent = group(INCOMES[index] * arrived); });

    const settle = ease(span(progress, 0.8, 0.9));
    let deducted = 0;
    RULES.forEach((rule, index) => {
      const begin = 0.18 + index * 0.1;
      const line = span(progress, begin, begin + 0.07);
      // The connector arrives, the row's rule fills from left to right, and only
      // then does its amount appear and count up.
      const load = span(progress, begin + 0.07, begin + 0.13);
      const count = ease(span(progress, begin + 0.13, begin + 0.2));
      const full = (amount * rule.percent) / 100;
      const node = root.querySelector<HTMLElement>(`[data-rule="${rule.key}"]`)!;
      node.classList.toggle("is-loading", load > 0 && load < 1);
      node.classList.toggle("is-on", load >= 1);
      node.style.setProperty("--load", String(load));
      node.querySelector<HTMLElement>(".if-rule-amount b")!.textContent = group(full * count);
      wire(`in-${index}`, line);
      wire(`out-${index}`, span(progress, 0.69 + index * 0.025, 0.79 + index * 0.025));
      root.style.setProperty(`--slice-${index}`, String(rule.percent * settle));
      deducted += full;
    });
    const result = root.querySelector<HTMLElement>(".if-result")!;
    result.classList.toggle("is-on", settle > 0);
    result.classList.toggle("is-done", settle >= 1);
    result.querySelector<HTMLElement>(".if-result-amount b")!.textContent = settle > 0 ? group(amount - deducted * settle) : "0";
    const meter = ease(span(progress, 0.9, 1));
    root.style.setProperty("--meter", String(meter));
    root.querySelector<HTMLElement>(".if-stat")!.classList.toggle("is-on", meter > 0);
    root.querySelector<HTMLElement>(".if-stat-value")!.textContent = `${Math.round(95 * meter)}%`;
  };
  // the scroll listener and the resize observer always call the latest paint
  const paintRef = useRef(paint);
  useLayoutEffect(() => {
    paintRef.current = paint;
    paint();
  });

  // The connectors are measured from the cards themselves, so they follow the board at any size.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const board = root.querySelector<HTMLElement>(".if-board")!;
    const measure = () => {
      const frame = board.getBoundingClientRect();
      const box = (el: Element) => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left - frame.left, right: rect.right - frame.left, cy: rect.top - frame.top + rect.height / 2 };
      };
      const corner = parseFloat(getComputedStyle(board).fontSize) * 0.6;
      const a = box(board.querySelector(".if-income-node")!);
      const b = box(board.querySelector(".if-result")!);
      const rows = [...board.querySelectorAll("[data-rule]")].map(box);
      setWires([
        ...rows.map((row, index) => ({ role: "in" as const, index, d: elbow(a.right, a.cy, row.left, row.cy, corner) })),
        ...rows.map((row, index) => ({ role: "out" as const, index, d: elbow(row.right, row.cy, b.left, b.cy, corner) })),
      ]);
      paintRef.current();
    };
    // a ResizeObserver reports once right away, then on every size change
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  // Where ScrollTrigger used to sit: how far the pinned track has been scrolled, painted once per frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const track = root.querySelector<HTMLElement>(".if-track")!;
    const stage = root.querySelector<HTMLElement>(".if-stage")!;
    let raf = 0;
    let stageTop = "";
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const vh = innerHeight;
      // phones: where the shorter stage pins, so it sits mid-screen and clear of the header (CSS uses it below 1024px)
      const top = `${Math.round(Math.max(72, (vh - stage.offsetHeight) / 2))}px`;
      if (top !== stageTop) root.style.setProperty("--stage-top", (stageTop = top));
      if (rect.top > vh * 1.5 || rect.bottom < -vh * 0.5) return; // far off screen: nothing to draw
      leadRef.current = clamp((vh - rect.top) / vh);
      progressRef.current = clamp(-rect.top / Math.max(1, rect.height - vh));
      paintRef.current();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const choose = (index: number) => {
    incomeRef.current = INCOMES[index];
    setIncome(index);
    const strip = rootRef.current?.querySelector<HTMLElement>(".if-incomes");
    strip?.scrollTo({ left: strip.clientWidth * index, behavior: reduced ? "auto" : "smooth" });
  };
  // A swipe moves the strip; the figure it settles on becomes the income.
  const onSwipe = (event: React.UIEvent<HTMLDivElement>) => {
    const strip = event.currentTarget;
    const index = Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
    if (index === income || !INCOMES[index]) return;
    incomeRef.current = INCOMES[index];
    setIncome(index);
  };

  return (
    <section ref={rootRef} className="income-flow" data-reduced={reduced}>
      {/* the page's sticky start button steps aside while this pinned stage fills the screen */}
      <div className="if-track" data-no-sticky>
        <div className="if-stage">
          <header className="if-head">
            <h2 className="text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
              <span className="sr-only">{f.title}</span>
              <span aria-hidden>{f.title.split(" ").map((word, index) => <span key={index} className="if-word">{word} </span>)}</span>
            </h2>
            <p className="text-base md:text-lg">{f.subtitle}</p>
          </header>

          <div className="if-body">
            <div className="if-board">
              <svg className="if-wires" aria-hidden="true">
                {wires.map((w) => <path key={`${w.role}-${w.index}`} data-wire={`${w.role}-${w.index}`} d={w.d} pathLength={1} />)}
                {wires.map((w) => <circle key={`${w.role}-${w.index}`} data-pulse={`${w.role}-${w.index}`} r={3} />)}
              </svg>

              <div className="if-column">
                <span className="if-step"><i>01</i>{f.steps[0]}</span>
                <div className="if-node if-income-node">
                  <div className="if-income-top">
                    <span className="if-income-status"><i /><span className="if-when-off">{f.waiting}</span><span className="if-when-on">{f.incoming}</span></span>
                    <small>{f.when}</small>
                  </div>
                  <div className="if-incomes" onScroll={onSwipe} tabIndex={0} aria-label={f.swipe}>
                    {INCOMES.map((amount, index) => (
                      <div className="if-income" key={amount} aria-hidden={index !== income}>
                        <strong><sup>+</sup><b>0</b><span>{t.currency}</span></strong>
                        <small>{f.sale} · {f.methods[index]}</small>
                      </div>
                    ))}
                  </div>
                  {/* the three ways money comes in, each with its own example income */}
                  <div className="if-tabs" role="group" aria-label={f.swipe}>
                    {INCOMES.map((amount, index) => (
                      <button key={amount} type="button" aria-pressed={index === income} onClick={() => choose(index)}>{f.methods[index]}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>02</i>{f.steps[1]}</span>
                <div className="if-node if-rules">
                  <div className="if-rules-head" aria-hidden="true"><span /><span /><span>%</span><span>{t.currency}</span></div>
                  {RULES.map((rule, index) => (
                    <div className="if-rule" data-rule={rule.key} key={rule.key}>
                      <span className="if-rule-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="if-rule-name"><b>{f.rules[rule.key].name}</b><small>{f.rules[rule.key].detail}</small></span>
                      <em className="if-rule-percent">{percentText(rule.percent, locale)}</em>
                      <span className="if-rule-amount">−<b>0</b></span>
                      <i className="if-rule-load" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>03</i>{f.steps[2]}</span>
                <div className="if-node if-result">
                  <small>{f.net}</small>
                  <strong className="if-result-amount"><b>0</b><span>{t.currency}</span></strong>
                  <span className="if-split-label">{f.split}</span>
                  {/* what stays leads, in blue; what left follows in greys */}
                  <div className="if-split" aria-hidden="true">
                    <i className="if-split-rest" style={{ flexGrow: REST }} />
                    {RULES.map((rule, index) => <i key={rule.key} data-shade={index} style={{ flexGrow: `var(--slice-${index}, 0)` } as unknown as React.CSSProperties} />)}
                  </div>
                  <ul className="if-legend">
                    <li><i className="if-split-rest" />{f.net}<em>{percentText(REST, locale)}%</em></li>
                    {RULES.map((rule, index) => <li key={rule.key}><i data-shade={index} />{f.rules[rule.key].name}<em>{percentText(rule.percent, locale)}%</em></li>)}
                  </ul>
                  <span className="if-done"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8" /></svg>{f.done}</span>
                </div>
              </div>
            </div>

            <div className="if-foot">
              <div className="if-stat">
                <strong className="if-stat-value">0%</strong>
                <span className="if-stat-text">{f.statCaption}</span>
                <span className="if-stat-bar" aria-hidden="true"><i /></span>
                <span className="if-stat-rest">5% {f.manual}</span>
              </div>
              <div className="if-cta"><Start label={start} lead="flow" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
