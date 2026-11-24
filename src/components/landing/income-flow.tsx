"use client";

import { ArrowRight } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { APP_URL, money, type Dict, type Locale } from "@/i18n";
import "./income-flow.css";

// Ported from the Morefin site (AppHero + income-flow.css). There the scroll drives it over a 460vh pinned track;
// here each part plays once it is on screen, so a phone just scrolls past three short stages.
// One income and four percentage rules. The percentages are exact on purpose: 5,87% is calculated as 5,87%.
const RULES = [
  { key: "share", percent: 5.87, color: "#2C98E6" },
  { key: "tax", percent: 4, color: "#7A70D4" },
  { key: "kpi", percent: 2, color: "#12A5B8" },
  // running costs are the largest slice; what remains is a little over half
  { key: "fee", percent: 30, color: "#F59E0B" },
] as const;
const REST = 100 - RULES.reduce((sum, rule) => sum + rule.percent, 0);
const INCOMES = [12_000_000, 5_000_000, 40_000_000];
const COINS = 7;

// the story, one stage at a time: 1 coins fall, 2 the income lands, 3-6 rule i loads (and is done from 4+i),
// 8 the result settles, 9 everything is counted. DELAYS[s] is how long stage s lasts.
const RULE0 = 3;
const RESULT = 8;
const DONE = 9;
const DELAYS = [300, 750, 900, 750, 750, 750, 750, 500, 1000];

type Paths = { ins: string[]; outs: string[] };

const percentText = (value: number, locale: Locale) => String(value).replace(".", locale === "en" ? "." : ",");

// counts from wherever it was to `value`; renders on its own so the rest of the section stays still
function Count({ value, ms = 700 }: { value: number; ms?: number }) {
  const [shown, setShown] = useState(0);
  const at = useRef(0);
  useEffect(() => {
    const from = at.current;
    if (from === value) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // a frame's timestamp can be a touch earlier than `start`; below 0 the easing would dip under `from`
      const p = ms > 0 ? Math.min(1, Math.max(0, (now - start) / ms)) : 1;
      at.current = from + (value - from) * (1 - (1 - p) ** 3);
      setShown(at.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <>{money(shown)}</>;
}

function RuleIcon({ kind }: { kind: (typeof RULES)[number]["key"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {kind === "share" ? <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.6c1.6.6 2.6 2 3 4.4" /></>
        : kind === "tax" ? <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="m9.5 13.5 5-5M9.6 9h.01M14.4 13.4h.01" /></>
        : kind === "kpi" ? <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.2" /><path d="M12 12l6.5-6.5" /></>
        : <><rect x="3" y="6" width="18" height="12.5" rx="2.6" /><path d="M3 10.5h18M7 15h3.5" /></>}
    </svg>
  );
}

const Chevron = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>;

export function IncomeFlow({ t, locale, start }: { t: Dict; locale: Locale; start: string }) {
  const f = t.flow;
  const reduced = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const incomeRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  // on a phone the three stages sit one under another, so each waits until it is actually on screen
  const seenIncome = useInView(incomeRef, { once: true, margin: "-15%" });
  const seenRules = useInView(rulesRef, { once: true, margin: "-20%" });
  const seenResult = useInView(resultRef, { once: true, margin: "-15%" });
  const [stage, setStage] = useState(0);
  const [pick, setPick] = useState(0);
  const [paths, setPaths] = useState<Paths>({ ins: [], outs: [] });
  const amount = INCOMES[pick];

  useEffect(() => {
    if (stage >= DONE) return;
    const ready = stage === 0 ? seenIncome : stage === 2 ? seenRules : stage === RESULT - 1 ? seenResult : true;
    if (!ready) return;
    const id = setTimeout(() => setStage((s) => s + 1), reduced ? 0 : DELAYS[stage]);
    return () => clearTimeout(id);
  }, [stage, seenIncome, seenRules, seenResult, reduced]);

  // wide screens: connectors from the income to every rule and from every rule to the result, measured off the cards
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measure = () => {
      const income = incomeRef.current, rules = rulesRef.current, result = resultRef.current;
      if (innerWidth < 1024 || !income || !rules || !result) return setPaths({ ins: [], outs: [] });
      const frame = board.getBoundingClientRect();
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { left: r.left - frame.left, right: r.right - frame.left, height: r.height, cy: r.top - frame.top + r.height / 2 };
      };
      const a = box(income), b = box(result);
      const cards = [...rules.querySelectorAll("[data-rule]")].map(box);
      // lines leave and arrive spread along the card's edge, not from one point
      const spread = (i: number, h: number) => (i - (RULES.length - 1) / 2) * Math.min(14, h / 9);
      const curve = (x1: number, y1: number, x2: number, y2: number) => {
        const bend = (x2 - x1) / 2;
        return `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
      };
      setPaths({
        ins: cards.map((c, i) => curve(a.right, a.cy + spread(i, a.height), c.left, c.cy)),
        outs: cards.map((c, i) => curve(c.right, c.cy, b.left, b.cy + spread(i, b.height))),
      });
    };
    // a ResizeObserver reports once on its own right away, and again whenever the board changes size
    const ro = new ResizeObserver(measure);
    ro.observe(board);
    return () => ro.disconnect();
  }, []);

  const choose = (next: number) => {
    const index = (next + INCOMES.length) % INCOMES.length;
    setPick(index);
    const strip = stripRef.current;
    strip?.scrollTo({ left: strip.clientWidth * index, behavior: reduced ? "auto" : "smooth" });
  };
  // a swipe moves the strip; the card it settles on becomes the income
  const onSwipe = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const index = Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
    if (index !== pick && INCOMES[index]) setPick(index);
  };

  const landed = stage >= 2;
  const settled = stage >= RESULT;
  const done = stage >= DONE;

  return (
    <section className="income-flow">
      <div className="if-inner">
        <m.header className="if-head" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          {/* phones get a shorter line so it can be large */}
          <h2><span className="if-title-full">{f.title}</span><span className="if-title-short">{f.titleShort}</span></h2>
          <p>{f.subtitle}</p>
        </m.header>

        <div ref={boardRef} className="if-board">
          <svg className="if-wires" aria-hidden>
            {paths.ins.map((d, i) => (
              <path key={`in-${i}`} d={d} pathLength={1} style={{ "--tone": RULES[i].color, strokeDashoffset: stage >= RULE0 + i ? 0 : 1 } as CSSProperties} />
            ))}
            {paths.outs.map((d, i) => (
              <path key={`out-${i}`} d={d} pathLength={1} style={{ "--tone": RULES[i].color, strokeDashoffset: settled ? 0 : 1, transitionDelay: `${i * 90}ms` } as CSSProperties} />
            ))}
          </svg>

          <div className="if-column">
            <span className="if-step"><i>1</i>{f.steps[0]}</span>
            <div className={`if-coins ${stage === 1 ? "is-falling" : ""}`} aria-hidden>
              {Array.from({ length: COINS }, (_, i) => (
                <i key={i} style={{ "--x": `${12 + ((i * 37) % 76)}%`, "--spin": `${(i % 2 ? -1 : 1) * (30 + i * 12)}deg`, "--d": `${i * 70}ms` } as CSSProperties} />
              ))}
            </div>
            <div ref={incomeRef} className={`if-node if-income-node ${landed ? "is-on" : ""}`}>
              <div className="if-income-top">
                <span className="if-income-status"><i />{landed ? f.incoming : f.waiting}</span>
                <small>{f.when}</small>
              </div>
              <div ref={stripRef} className="if-incomes" onScroll={onSwipe} tabIndex={0} aria-label={f.swipe}>
                {INCOMES.map((value, i) => (
                  <div className="if-income" key={value} aria-hidden={i !== pick}>
                    <strong><sup>+</sup><b><Count value={landed ? value : 0} /></b><span>{t.currency}</span></strong>
                    <small>{f.sale} · {f.methods[i]}</small>
                  </div>
                ))}
              </div>
              <div className="if-swipe" title={f.swipe}>
                <button type="button" onClick={() => choose(pick - 1)} aria-label={f.previous}><Chevron d="m14.5 6-6 6 6 6" /></button>
                <span className="if-dots" aria-hidden>{INCOMES.map((value, i) => <i key={value} data-on={i === pick} />)}</span>
                <button type="button" onClick={() => choose(pick + 1)} aria-label={f.next}><Chevron d="m9.5 6 6 6-6 6" /></button>
              </div>
            </div>
          </div>

          <div className="if-column">
            <span className="if-step"><i>2</i>{f.steps[1]}</span>
            <p className="if-panel-note"><b><Count value={landed ? amount : 0} /></b> {t.currency} {f.splitting}</p>
            <div ref={rulesRef} className="if-rules">
              {RULES.map((rule, i) => {
                const on = stage > RULE0 + i;
                return (
                  <div key={rule.key} data-rule={rule.key} className={`if-node if-rule ${stage === RULE0 + i ? "is-loading" : ""} ${on ? "is-on" : ""}`} style={{ "--tone": rule.color } as CSSProperties}>
                    <span className="if-rule-icon"><RuleIcon kind={rule.key} /></span>
                    <span className="if-rule-name"><b>{f.rules[rule.key].name}</b><small>{f.rules[rule.key].detail}</small></span>
                    <span className="if-rule-amount">
                      <span><b><Count value={on ? (amount * rule.percent) / 100 : 0} ms={500} /></b> <small>{t.currency}</small></span>
                      <em>{percentText(rule.percent, locale)}%</em>
                    </span>
                    <i className="if-rule-load" aria-hidden />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="if-column">
            <span className="if-step"><i>3</i>{f.steps[2]}</span>
            <div ref={resultRef} className={`if-node if-result ${settled ? "is-on" : ""} ${done ? "is-done" : ""}`}>
              <small>{f.net}</small>
              <strong className="if-result-amount"><b><Count value={settled ? (amount * REST) / 100 : 0} ms={900} /></b> <span>{t.currency}</span></strong>
              <span className="if-split-label">{f.split}</span>
              <div className="if-split" aria-hidden>
                {RULES.map((rule) => <i key={rule.key} style={{ background: rule.color, flexGrow: settled ? rule.percent : 0 }} />)}
                <i className="if-split-rest" style={{ flexGrow: REST }} />
              </div>
              <ul className="if-legend">
                {RULES.map((rule) => <li key={rule.key}><i style={{ background: rule.color }} />{f.rules[rule.key].name}</li>)}
              </ul>
              <span className="if-done"><Chevron d="m6 12 4 4 8-8" />{f.done}</span>
            </div>
          </div>
        </div>

        <div className={`if-stat ${done ? "is-on" : ""}`}>
          <strong className="if-stat-value"><Count value={done ? 95 : 0} ms={1000} />%</strong>
          <span className="if-stat-text">{f.statCaption}</span>
          <span className="if-stat-bar" aria-hidden><i style={{ width: done ? "95%" : "0%" }} /></span>
          <span className="if-stat-rest">5% {f.manual}</span>
        </div>

        <a data-cta data-lead="flow" href={APP_URL} className="if-cta group">
          {start} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
