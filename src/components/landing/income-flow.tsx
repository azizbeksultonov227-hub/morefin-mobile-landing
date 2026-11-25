"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { SplitWords } from "@/components/split-words";
import { APP_URL, type Dict, type Locale } from "@/i18n";
import "./income-flow.css";

// A port of the Morefin site's income workflow (src/sections/AppHero.tsx + income-flow.css), with the site's look:
// blue section, white cards, a colour per rule. Changes: GSAP's ScrollTrigger is replaced by a plain scroll listener
// (no new library); the heading is set like this page's others and the board rises in with it, without the site's
// half screen of empty page; phones keep the wide three-column board, shrunk to the screen's width.

// One income and four percentage rules. The percentages are exact on purpose:
// 5,87% is calculated as 5,87%, never rounded to 6. Each rule has its own
// colour, shared by its card, its connectors and its slice of the result.
const RULES = [
  { key: "share", percent: 5.87, color: "#2C98E6" },
  { key: "tax", percent: 4, color: "#7A70D4" },
  { key: "kpi", percent: 2, color: "#12A5B8" },
  // Running costs are the largest slice; what remains is a little over half.
  { key: "fee", percent: 30, color: "#F59E0B" },
] as const;
const REST = 100 - RULES.reduce((sum, rule) => sum + rule.percent, 0);
const COINS = 7;
// the story plays slowly, holds its result, then plays again
const PLAY = 7000;
const PAUSE = 2500;
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
  // how far the story has played, 0 to 1 (driven by time once the section is fully on screen, not by scrolling)
  const progressRef = useRef(0);
  const incomeRef = useRef(INCOMES[0]);
  const [income, setIncome] = useState(0);
  const [wires, setWires] = useState<Array<Wire & { d: string }>>([]);

  // Paint one frame of the story. Runs on every scroll tick and every income
  // change, so it writes to the DOM directly instead of re-rendering React.
  const paint = () => {
    const root = rootRef.current;
    if (!root) return;
    const progress = reduced ? 1 : progressRef.current;
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

  // The story is not tied to scrolling. The heading's words rise in as the section comes into view; once the board
  // is wholly on screen the workflow plays by itself, slowly (PLAY), holds the result for PAUSE, and starts again.
  // Leaving the section stops it; coming back fully starts it from the beginning.
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
      progressRef.current = clamp((now - begun) / PLAY);
      paintRef.current();
      if (progressRef.current < 1) raf = requestAnimationFrame(frame);
      else wait = window.setTimeout(() => { begun = 0; raf = requestAnimationFrame(frame); }, PAUSE);
    };
    const play = () => {
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
    const onBoard = new IntersectionObserver(([entry]) => { if (entry.intersectionRatio >= 0.99) play(); }, steps);
    onSection.observe(root);
    onBoard.observe(board);
    return () => {
      onSection.disconnect();
      onBoard.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(wait);
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
    <section ref={rootRef} id="how" className="income-flow" data-reduced={reduced}>
      {/* the page's sticky start button steps aside while this section, which has its own button, is on screen */}
      <div className="if-track" data-no-sticky>
        <div className="if-stage">
          <header className="if-head">
            {/* set like the hero's heading, words rising in one by one */}
            <h2 className="text-balance text-[clamp(2.1rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              <SplitWords text={f.title} />
            </h2>
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
                  <span className="if-split-label">{f.split}</span>
                  <div className="if-split" aria-hidden="true">
                    {RULES.map((rule, index) => <i key={rule.key} style={{ background: rule.color, flexGrow: `var(--slice-${index}, 0)` } as unknown as CSSProperties} />)}
                    <i className="if-split-rest" style={{ flexGrow: REST }} />
                  </div>
                  <ul className="if-legend">
                    {RULES.map((rule) => <li key={rule.key}><i style={{ background: rule.color }} />{f.rules[rule.key].name}</li>)}
                  </ul>
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
