"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { APP_URL, type Dict, type Locale } from "@/i18n";
import "./income-flow.css";

// The Morefin site's income workflow (src/sections/AppHero.tsx) with its scroll story, drawn minimally: one idea
// carried by one colour. Blue is your money: the whole income lands as a full blue bar, the rules take their parts
// (grey, as amounts), and the net profit card's bar shrinks to the share that stays. GSAP's ScrollTrigger is
// replaced by a plain scroll listener; phones keep the same three-column board, shrunk to the screen's width.

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

type Wire = { role: "in" | "out"; index: number; from: string; to: string; d: string };

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
  const [before, after] = f.keeps.split("{p}");

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
      const moving = value > 0 && value < 1;
      pulse.classList.toggle("is-on", moving);
      if (!moving) return;
      const point = path.getPointAtLength(path.getTotalLength() * value);
      pulse.setAttribute("cx", String(point.x));
      pulse.setAttribute("cy", String(point.y));
    };
    // The income lands first: its figure counts up and its blue bar fills. Only then is it distributed.
    const arrived = ease(span(progress, 0.02, 0.14));
    root.style.setProperty("--arrive", String(arrived));
    root.querySelector<HTMLElement>(".if-income-node")!.classList.toggle("is-on", arrived >= 1);
    root.querySelectorAll<HTMLElement>(".if-income b").forEach((node, index) => { node.textContent = group(INCOMES[index] * arrived); });

    const settle = ease(span(progress, 0.8, 0.9));
    let deducted = 0;
    RULES.forEach((rule, index) => {
      const begin = 0.18 + index * 0.1;
      // The connector arrives, a thin line runs under the row while the rule works, then its amount counts up.
      const line = span(progress, begin, begin + 0.07);
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
      deducted += full;
    });
    // The result: the whole income less what the rules took; its bar shrinks from the full income to the share that stays.
    const result = root.querySelector<HTMLElement>(".if-result")!;
    result.classList.toggle("is-on", settle > 0);
    result.classList.toggle("is-done", settle >= 1);
    root.style.setProperty("--keep", String(1 - (1 - REST / 100) * settle));
    result.querySelector<HTMLElement>(".if-result-amount b")!.textContent = settle > 0 ? group(amount - deducted * settle) : "0";
    const meter = ease(span(progress, 0.9, 1));
    root.querySelector<HTMLElement>(".if-stat")!.classList.toggle("is-on", meter > 0);
    root.querySelector<HTMLElement>(".if-stat b")!.textContent = `${Math.round(95 * meter)}%`;
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
      const box = (selector: string) => {
        const rect = board.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        return { left: rect.left - frame.left, right: rect.right - frame.left, top: rect.top - frame.top, bottom: rect.bottom - frame.top, cy: rect.top - frame.top + rect.height / 2 };
      };
      const list = [
        ...RULES.map((rule, index) => ({ role: "in" as const, index, from: ".if-income-node", to: `[data-rule="${rule.key}"]` })),
        ...RULES.map((rule, index) => ({ role: "out" as const, index, from: `[data-rule="${rule.key}"]`, to: ".if-result" })),
      ];
      setWires(list.map((w) => {
        const a = box(w.from), b = box(w.to);
        // lines leave and arrive spread a little along the card's edge, not from one point
        const spread = (w.index - (RULES.length - 1) / 2) * Math.min(10, (w.role === "in" ? a.bottom - a.top : b.bottom - b.top) / 12);
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
            <h2 className="text-[clamp(1.75rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              <span className="sr-only">{f.title}</span>
              <span aria-hidden>{f.title.split(" ").map((word, index) => <span key={index} className="if-word">{word} </span>)}</span>
            </h2>
            <p className="text-base md:text-lg">{f.subtitle}</p>
          </header>

          <div className="if-body">
            <div className="if-board">
              <svg className="if-wires" aria-hidden="true">
                {wires.map((w) => <path key={`${w.role}-${w.index}`} data-wire={`${w.role}-${w.index}`} d={w.d} pathLength={1} />)}
                {wires.map((w) => <circle key={`${w.role}-${w.index}`} data-pulse={`${w.role}-${w.index}`} r={3.5} />)}
              </svg>

              <div className="if-column">
                <span className="if-step"><i>1</i>{f.steps[0]}</span>
                <div className="if-node if-income-node">
                  <span className="if-income-status"><span className="if-when-off">{f.waiting}</span><span className="if-when-on">{f.incoming}</span></span>
                  <div className="if-incomes" onScroll={onSwipe} tabIndex={0} aria-label={f.swipe}>
                    {INCOMES.map((amount, index) => (
                      <div className="if-income" key={amount} aria-hidden={index !== income}><b>0</b><span>{t.currency}</span></div>
                    ))}
                  </div>
                  <i className="if-bar" aria-hidden="true"><i /></i>
                  {/* the three ways money comes in, each with its own example income */}
                  <div className="if-tabs" role="group" aria-label={f.swipe}>
                    {INCOMES.map((amount, index) => (
                      <button key={amount} type="button" aria-pressed={index === income} onClick={() => choose(index)}>{f.methods[index]}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>2</i>{f.steps[1]}</span>
                <div className="if-node if-rules">
                  {RULES.map((rule) => (
                    <div className="if-rule" data-rule={rule.key} key={rule.key}>
                      <span className="if-rule-name"><b>{f.rules[rule.key].name}</b><small>{f.rules[rule.key].detail}</small></span>
                      <span className="if-rule-percent">{percentText(rule.percent, locale)}%</span>
                      <span className="if-rule-amount">−<b>0</b></span>
                      <i className="if-rule-load" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>3</i>{f.steps[2]}</span>
                <div className="if-node if-result">
                  <small>{f.net}</small>
                  <strong className="if-result-amount"><b>0</b><span>{t.currency}</span></strong>
                  <i className="if-bar" aria-hidden="true"><i /></i>
                  <p className="if-keep">{before}<b>{percentText(REST, locale)}%</b>{after}</p>
                </div>
              </div>
            </div>

            <p className="if-stat"><b>0%</b> {f.statCaption}</p>
            <div className="if-cta"><Start label={start} lead="flow" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
