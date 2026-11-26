"use client";

import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { MorefinMark } from "@/components/mark";
import { SplitWords } from "@/components/split-words";
import { useMedia } from "@/components/use-media";
import { APP_URL, type Dict, type Locale } from "@/i18n";
import { createPainter, drawWire, ease, span, useStoryLoop, useWires, type Painter, type Wire } from "./story";
import "./income-flow.css";
import "./ai-flow.css";

// What Morefin AI does for a business, told like the blue income flow above it and built on the same board (its
// classes and layout come from income-flow.css; ai-flow.css gives it the page's light look and its own cards).
// The heading says it does a financier's whole job; 1, the business's money comes in; 2, Morefin AI does the four
// jobs, one card each (answers questions, prepares reports, reminds, manages payments); 3, the financier's job fills
// up to 100%. The pill under the board says it never sleeps, is never late and never tires.

const JOBS = [
  { key: "answer", color: "#2C98E6" },
  { key: "report", color: "#7A70D4" },
  { key: "remind", color: "#12A5B8" },
  { key: "pay", color: "#F59E0B" },
] as const;
type Job = (typeof JOBS)[number]["key"];

// the same pace as the income flow: it plays, holds its result, then plays again
const PLAY = 7000;
const PAUSE = 2500;

// one connector from the business to each job, and one from each job to the result
const WIRES: Wire[] = [
  ...JOBS.map((job, index) => ({ role: "in" as const, index, from: ".ai-feed", to: `[data-job="${job.key}"]` })),
  ...JOBS.map((job, index) => ({ role: "out" as const, index, from: `[data-job="${job.key}"]`, to: ".if-result" })),
];

/** 48 000 000 as "+48 mln", −5 600 000 as "−5,6 mln" (the unit and decimal mark follow the language). */
const millions = (value: number, unit: string, locale: Locale) =>
  `${value < 0 ? "−" : "+"}${String(Math.round(Math.abs(value) / 100_000) / 10).replace(".", locale === "en" ? "." : ",")}${unit}`;

function JobIcon({ kind }: { kind: Job }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "answer" ? <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.8V16A2.5 2.5 0 0 1 4 13.5Z" /><path d="M10.2 8.6a1.9 1.9 0 1 1 2.5 1.8c-.4.15-.7.5-.7.9v.3M12 13.2h.01" /></>
        : kind === "report" ? <><path d="M3.5 20.5h17" /><path d="M7 16.5v-5M12 16.5V6.5M17 16.5v-8" /></>
        : kind === "remind" ? <><path d="M18.5 16.5h-13l1.4-2V10a5.1 5.1 0 0 1 10.2 0v4.5Z" /><path d="M10 19.2a2.1 2.1 0 0 0 4 0" /></>
        : <><rect x="3.5" y="5" width="17" height="15.5" rx="2.6" /><path d="M3.5 10h17M8 3v4M16 3v4M9 15.2l2 2 4-4" /></>}
    </svg>
  );
}

const Tick = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8" /></svg>;

export function AiFlow({ t, locale, start }: { t: Dict; locale: Locale; start: string }) {
  const a = t.ai;
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const rootRef = useRef<HTMLElement>(null);
  // how far the story has played, 0 to 1 (driven by time once the board is fully on screen, not by scrolling)
  const progressRef = useRef(0);
  const painterRef = useRef<Painter | null>(null);

  // Paint one frame of the story; it runs every animation frame, so it writes to the page directly (and only what
  // changed, through the painter).
  const paint = () => {
    const root = rootRef.current;
    if (!root) return;
    const p = (painterRef.current ??= createPainter(root));
    const wire = (name: string) => wires.find((w) => w.name === name);
    const progress = reduced ? 1 : progressRef.current;

    // 1. The business's money comes in, one line after another.
    p.all(".ai-feed li").forEach((row, index) => p.toggle(row, "is-in", progress >= 0.03 + index * 0.035));

    // 2. Morefin AI does each job: its line arrives, the card loads from left to right, then it is ticked.
    JOBS.forEach((job, index) => {
      const begin = 0.19 + index * 0.1;
      const load = span(progress, begin + 0.07, begin + 0.13);
      const node = p.one(`[data-job="${job.key}"]`);
      p.toggle(node, "is-loading", load > 0 && load < 1);
      p.toggle(node, "is-on", load >= 1);
      p.style(node, "--load", String(load));
      drawWire(p, wire(`in-${index}`), span(progress, begin, begin + 0.07));
      drawWire(p, wire(`out-${index}`), span(progress, 0.69 + index * 0.025, 0.79 + index * 0.025));
    });

    // 3. The financier's job fills up: a quarter for each job, counted up to 100%. The bar's four parts grow by
    //    fractions of its free space (together at most 1), so the empty part is simply the bar showing through.
    const settle = ease(span(progress, 0.8, 0.9));
    p.all(".if-split i").forEach((slice) => p.style(slice, "flex-grow", String(0.25 * settle)));
    const result = p.one(".if-result");
    p.toggle(result, "is-on", settle > 0);
    p.toggle(result, "is-done", settle >= 1);
    p.text(p.one(".if-result-amount b"), String(Math.round(100 * settle)));

    // And it never stops: the pill comes in and its three words are ticked one by one.
    p.toggle(p.one(".ai-always"), "is-on", progress >= 0.86);
    p.all(".ai-always li").forEach((item, index) => p.toggle(item, "is-on", progress >= 0.9 + index * 0.04));
  };
  // the story's loop and the wires' measuring always call the latest paint
  const paintRef = useRef(paint);
  useLayoutEffect(() => {
    paintRef.current = paint;
    paint();
  });

  const wires = useWires(rootRef, WIRES, JOBS.length, paintRef);
  useStoryLoop(rootRef, progressRef, paintRef, reduced, PLAY, PAUSE);

  return (
    <section ref={rootRef} id="ai" className="income-flow ai-flow">
      <div className="if-track">
        <div className="if-stage">
          <header className="if-head">
            <h2 className="text-balance text-[clamp(2.1rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              <SplitWords text={a.title} />
            </h2>
          </header>

          <div className="if-body">
            <div className="if-board">
              <svg className="if-wires" aria-hidden="true">
                {wires.map((w) => <path key={w.name} data-wire={w.name} d={w.d} pathLength={1} style={{ "--tone": JOBS[w.index].color } as CSSProperties} />)}
                {wires.map((w) => <circle key={w.name} data-pulse={w.name} r={5} style={{ "--tone": JOBS[w.index].color } as CSSProperties} />)}
              </svg>

              <div className="if-column">
                <span className="if-step"><i>1</i>{a.steps[0]}</span>
                <div className="if-node ai-feed">
                  <div className="ai-feed-top">
                    <span className="ai-live"><i />{a.live}</span>
                    <small>{a.month}</small>
                  </div>
                  <ul>
                    {a.feed.map(([name, value]) => (
                      <li key={name} data-out={value < 0}><i aria-hidden="true" /><span>{name}</span><b>{millions(value, a.million, locale)}</b></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>2</i><MorefinMark className="ai-star" size={32} />{a.steps[1]}</span>
                <div className="if-rules">
                  {JOBS.map((job) => (
                    <div className="if-node if-rule" data-job={job.key} key={job.key} style={{ "--tone": job.color } as CSSProperties}>
                      <span className="if-rule-icon"><JobIcon kind={job.key} /></span>
                      <span className="if-rule-name"><b>{a.jobs[job.key].name}</b><small>{a.jobs[job.key].detail}</small></span>
                      <span className="ai-job-tick"><Tick /></span>
                      <i className="if-rule-load" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>3</i>{a.steps[2]}</span>
                <div className="if-node if-result">
                  <small>{a.work}</small>
                  <strong className="if-result-amount"><b>0</b>%</strong>
                  <span className="if-split-label">{a.split}</span>
                  <div className="if-split" aria-hidden="true">
                    {JOBS.map((job) => <i key={job.key} style={{ background: job.color }} />)}
                  </div>
                  <ul className="if-legend">
                    {JOBS.map((job) => <li key={job.key}><i style={{ background: job.color }} />{a.jobs[job.key].short}</li>)}
                  </ul>
                  <span className="if-done"><Tick />{a.done}</span>
                </div>
              </div>
            </div>

            {/* it never stops: a clock that keeps turning, round the clock, and the three words */}
            <div className="ai-always">
              <span className="ai-clock" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 12V8.2" /><path className="ai-clock-hand" d="M12 12h4.2" /></svg>
              </span>
              <strong>24/7</strong>
              <ul>
                {a.always.map((word) => <li key={word}><Tick />{word}</li>)}
              </ul>
            </div>

            <div className="if-cta">
              <a data-lead="ai" href={APP_URL} className="if-button">
                {start} <ArrowRight aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
