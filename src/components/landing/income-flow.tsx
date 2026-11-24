"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { APP_URL, type Dict, type Locale } from "@/i18n";
import "./income-flow.css";

// A port of the Morefin site's income workflow (src/sections/AppHero.tsx + income-flow.css), same look and same
// scroll story. Two changes: GSAP's ScrollTrigger is replaced by a plain scroll listener (no new library), and phones
// keep the wide three-column board, shrunk to the screen's width, instead of the site's one-panel-at-a-time strip.

// One income and four percentage rules. The percentages are exact on purpose:
// 5,87% is calculated as 5,87%, never rounded to 6. Each rule has its own
// colour, shared by its card, its connectors and its slice of the result;
// they are this page's colours: primary, slate, accent and amber.
const RULES = [
  { key: "share", percent: 5.87, color: "#1F4FEA" },
  { key: "tax", percent: 4, color: "#64748B" },
  { key: "kpi", percent: 2, color: "#3B9DFB" },
  // Running costs are the largest slice; what remains is a little over half.
  { key: "fee", percent: 30, color: "#F59E0B" },
] as const;
// a heading's words light up one after another while the section scrolls in, like every heading on this page
const DIM = 0.18;
const REST = 100 - RULES.reduce((sum, rule) => sum + rule.percent, 0);
const COINS = 7;
const INCOMES = [12_000_000, 5_000_000, 40_000_000];

const group = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const percentText = (value: number, locale: string) => String(value).replace(".", locale === "en" ? "." : ",");
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const span = (progress: number, from: number, to: number) => clamp((progress - from) / (to - from));
const ease = (value: number) => 1 - Math.pow(1 - value, 3);

type Wire = { role: "in" | "out"; index: number; from: string; to: string };

function RuleIcon({ kind }: { kind: (typeof RULES)[number]["key"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "share" ? <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.6c1.6.6 2.6 2 3 4.4" /></>
        : kind === "tax" ? <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="m9.5 13.5 5-5M9.6 9h.01M14.4 13.4h.01" /></>
        : kind === "kpi" ? <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.2" /><path d="M12 12l6.5-6.5" /></>
        : <><rect x="3" y="6" width="18" height="12.5" rx="2.6" /><path d="M3 10.5h18M7 15h3.5" /></>}
    </svg>
  );
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
  // lead: the section scrolling into view (the heading fades in); progress: the pinned track, 0 to 1
  const leadRef = useRef(0);
  const progressRef = useRef(0);
  const incomeRef = useRef(INCOMES[0]);
  const [income, setIncome] = useState(0);
  const [wires, setWires] = useState<Array<Wire & { d: string }>>([]);

  // Paint one frame of the story. Runs on every scroll tick and every income
  // change, so it writes to the DOM directly instead of re-rendering React.
  const paint = () => {
    const root = rootRef.current;
    if (!root) return;
    const lead = reduced ? 1 : leadRef.current;
    const scroll = reduced ? 1 : progressRef.current;
    // Act one, while the section scrolls in: the heading's words light up and the
    // workflow rises from below into place under it. (On the site the heading first
    // waits alone mid-screen; here that half screen of empty page is left out.)
    const dock = reduced ? 1 : ease(span(lead, 0.35, 0.95));
    const stage = root.querySelector<HTMLElement>(".if-stage")!;
    const head = root.querySelector<HTMLElement>(".if-head")!;
    const body = root.querySelector<HTMLElement>(".if-body")!;
    const lit = span(lead, 0.2, 0.75);
    const words = head.querySelectorAll<HTMLElement>(".if-word");
    words.forEach((word, index) => { word.style.opacity = String(DIM + (1 - DIM) * span(lit, index / words.length, (index + 1) / words.length)); });
    body.style.transform = dock < 1 ? `translate3d(0, ${stage.clientHeight * 0.4 * (1 - dock)}px, 0)` : "";
    body.style.opacity = String(dock);
    // Act two, pinned: the workflow itself plays over the whole track.
    const progress = scroll;
    const amount = incomeRef.current;
    // Draw a connector up to `value` and ride a pulse on its leading end.
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
    // Act three opens with the income itself: coins fall into the card and the
    // figure counts up from zero. Only then is it distributed.
    const arrived = span(progress, 0.035, 0.158);
    const incomeNode = root.querySelector<HTMLElement>(".if-income-node")!;
    incomeNode.classList.toggle("is-on", arrived >= 1);
    root.querySelectorAll<HTMLElement>(".if-income strong b").forEach((node, index) => { node.textContent = group(INCOMES[index] * arrived); });
    root.querySelectorAll<HTMLElement>(".if-coins i").forEach((coin, index) => {
      const fall = span(progress, 0.008 + index * 0.014, 0.072 + index * 0.014);
      coin.style.setProperty("--fall", String(fall));
      coin.style.opacity = fall <= 0 || fall >= 1 ? "0" : "1";
    });

    const settle = ease(span(progress, 0.8, 0.9));
    let deducted = 0;
    RULES.forEach((rule, index) => {
      const begin = 0.18 + index * 0.1;
      const line = span(progress, begin, begin + 0.07);
      // The connector arrives, the card loads from left to right, and only
      // then does its information appear and the amount count up.
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
      const box = (selector: string) => {
        const rect = board.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        return { left: rect.left - frame.left, right: rect.right - frame.left, top: rect.top - frame.top, bottom: rect.bottom - frame.top, cy: rect.top - frame.top + rect.height / 2 };
      };
      const list: Wire[] = [
        ...RULES.map((rule, index) => ({ role: "in" as const, index, from: ".if-income-node", to: `[data-rule="${rule.key}"]` })),
        ...RULES.map((rule, index) => ({ role: "out" as const, index, from: `[data-rule="${rule.key}"]`, to: ".if-result" })),
      ];
      setWires(list.map((w) => {
        const a = box(w.from), b = box(w.to);
        // Fan lines leave and arrive spread along the card's edge, not from one point.
        const spread = (w.index - (RULES.length - 1) / 2) * Math.min(14, (w.role === "in" ? a.bottom - a.top : b.bottom - b.top) / 9);
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

  const choose = (next: number) => {
    const index = (next + INCOMES.length) % INCOMES.length;
    incomeRef.current = INCOMES[index];
    setIncome(index);
    const strip = rootRef.current?.querySelector<HTMLElement>(".if-incomes");
    strip?.scrollTo({ left: strip.clientWidth * index, behavior: reduced ? "auto" : "smooth" });
  };
  // A swipe moves the strip; the card it settles on becomes the income.
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
                {wires.map((w) => <path key={`${w.role}-${w.index}`} data-wire={`${w.role}-${w.index}`} d={w.d} pathLength={1} style={{ "--tone": RULES[w.index].color } as CSSProperties} />)}
                {wires.map((w) => <circle key={`${w.role}-${w.index}`} data-pulse={`${w.role}-${w.index}`} r={5} />)}
              </svg>

              <div className="if-column">
                <span className="if-step"><i>1</i>{f.steps[0]}</span>
                <div className="if-coins" aria-hidden="true">
                  {Array.from({ length: COINS }, (_, index) => <i key={index} style={{ "--x": `${12 + ((index * 37) % 76)}%`, "--spin": `${(index % 2 ? -1 : 1) * (30 + index * 12)}deg` } as CSSProperties} />)}
                </div>
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
                  <div className="if-swipe" title={f.swipe}>
                    <button type="button" onClick={() => choose(income - 1)} aria-label={f.previous}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg></button>
                    <span className="if-dots" aria-hidden="true">{INCOMES.map((amount, index) => <i key={amount} data-on={index === income} />)}</span>
                    <button type="button" onClick={() => choose(income + 1)} aria-label={f.next}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6" /></svg></button>
                  </div>
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>2</i>{f.steps[1]}</span>
                <div className="if-rules">
                  {RULES.map((rule) => (
                    <div className="if-node if-rule" data-rule={rule.key} key={rule.key} style={{ "--tone": rule.color } as CSSProperties}>
                      <span className="if-rule-icon"><RuleIcon kind={rule.key} /></span>
                      <span className="if-rule-name"><b>{f.rules[rule.key].name}</b><small>{f.rules[rule.key].detail}</small></span>
                      <span className="if-rule-amount"><span><b>0</b> <small>{t.currency}</small></span><em>{percentText(rule.percent, locale)}%</em></span>
                      <i className="if-rule-load" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>3</i>{f.steps[2]}</span>
                <div className="if-node if-result">
                  <small>{f.net}</small>
                  <strong className="if-result-amount"><b>{group(INCOMES[0])}</b> <span>{t.currency}</span></strong>
                  {/* the breakdown sits on its own white panel, so every colour (the blue "Ulush" too) reads on it */}
                  <div className="if-breakdown">
                    <span className="if-split-label">{f.split}</span>
                    <div className="if-split" aria-hidden="true">
                      {RULES.map((rule, index) => <i key={rule.key} style={{ background: rule.color, flexGrow: `var(--slice-${index}, 0)` } as unknown as CSSProperties} />)}
                      <i className="if-split-rest" style={{ flexGrow: REST }} />
                    </div>
                    <ul className="if-legend">
                      {RULES.map((rule) => <li key={rule.key}><i style={{ background: rule.color }} />{f.rules[rule.key].name}<em>{percentText(rule.percent, locale)}%</em></li>)}
                      <li><i className="if-split-rest" />{f.net}<em>{percentText(Number(REST.toFixed(2)), locale)}%</em></li>
                    </ul>
                  </div>
                  <span className="if-done"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8" /></svg>{f.done}</span>
                </div>
              </div>
            </div>

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
    </section>
  );
}
