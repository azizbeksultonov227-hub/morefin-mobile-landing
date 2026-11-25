"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { MorefinMark } from "@/components/mark";
import { SplitWords } from "@/components/split-words";
import { APP_URL, type Dict } from "@/i18n";
import { drawWire, ease, group, span, useStoryLoop, useWires, type Wire } from "./story";
import "./income-flow.css";
import "./ai-flow.css";

// How Morefin AI works, told like the blue income flow above it and built on the same board (its classes and
// layout come from income-flow.css; ai-flow.css gives it the page's light look and its own cards):
// 1, a receipt is photographed; 2, Morefin AI reads four things off it, each on its own card; 3, you confirm the
// proposed expense, and what it updates is ticked off. It plays by itself once the board is wholly on screen.

const FIELDS = [
  { key: "amount", color: "#2C98E6" },
  { key: "category", color: "#7A70D4" },
  { key: "account", color: "#12A5B8" },
  { key: "date", color: "#F59E0B" },
] as const;
type Field = (typeof FIELDS)[number]["key"];

// the same pace as the income flow: it plays, holds its result, then plays again
const PLAY = 7000;
const PAUSE = 2500;

// one connector from the photo to each field, and one from each field to the proposal
const WIRES: Wire[] = [
  ...FIELDS.map((field, index) => ({ role: "in" as const, index, from: ".ai-photo", to: `[data-field="${field.key}"]` })),
  ...FIELDS.map((field, index) => ({ role: "out" as const, index, from: `[data-field="${field.key}"]`, to: ".if-result" })),
];

function FieldIcon({ kind }: { kind: Field }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "amount" ? <><rect x="2.8" y="6" width="18.4" height="12" rx="2.4" /><circle cx="12" cy="12" r="2.6" /><path d="M6.2 9.4v.01M17.8 14.6v.01" /></>
        : kind === "category" ? <><path d="M3.5 12.2V4.8a1.3 1.3 0 0 1 1.3-1.3h7.4l8.3 8.3a1.3 1.3 0 0 1 0 1.8l-7.4 7.4a1.3 1.3 0 0 1-1.8 0Z" /><circle cx="8.2" cy="8.2" r="1.4" /></>
        : kind === "account" ? <><path d="M19 7.5V6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H19a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H5.5" /><path d="M16.5 13.8h.01" /></>
        : <><rect x="3.5" y="5" width="17" height="15.5" rx="2.6" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>}
    </svg>
  );
}

const Tick = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8" /></svg>;

export function AiFlow({ t, start }: { t: Dict; start: string }) {
  const a = t.ai;
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLElement>(null);
  // how far the story has played, 0 to 1 (driven by time once the board is fully on screen, not by scrolling)
  const progressRef = useRef(0);
  const total = a.items.reduce((sum, [, value]) => sum + value, 0);

  // Paint one frame of the story; it runs every animation frame, so it writes to the DOM directly.
  const paint = () => {
    const root = rootRef.current;
    if (!root) return;
    const progress = reduced ? 1 : progressRef.current;

    // 1. The photo: a scan line runs down the receipt inside the camera's frame, then the shot is taken.
    const scan = span(progress, 0.03, 0.17);
    const photo = root.querySelector<HTMLElement>(".ai-photo")!;
    photo.style.setProperty("--scan", String(scan));
    photo.classList.toggle("is-scanning", scan > 0 && scan < 1);
    photo.classList.toggle("is-on", scan >= 1);

    // 2. Morefin AI reads it: each field's line arrives, its card loads from left to right, then the value shows.
    FIELDS.forEach((field, index) => {
      const begin = 0.19 + index * 0.1;
      const load = span(progress, begin + 0.07, begin + 0.13);
      const node = root.querySelector<HTMLElement>(`[data-field="${field.key}"]`)!;
      node.classList.toggle("is-loading", load > 0 && load < 1);
      node.classList.toggle("is-on", load >= 1);
      node.style.setProperty("--load", String(load));
      if (field.key === "amount") node.querySelector<HTMLElement>(".if-rule-amount b")!.textContent = group(total * ease(span(progress, begin + 0.13, begin + 0.2)));
      drawWire(root, `in-${index}`, span(progress, begin, begin + 0.07));
      drawWire(root, `out-${index}`, span(progress, 0.69 + index * 0.025, 0.79 + index * 0.025));
    });
    // the receipt's total is where the amount is read from: it is marked as the amount card loads
    root.querySelector(".ai-paper-total")!.classList.toggle("is-read", progress >= 0.26);

    // 3. You confirm: the proposal arrives, its button is pressed, and what it updates is ticked off one by one.
    const ready = ease(span(progress, 0.8, 0.86));
    const result = root.querySelector<HTMLElement>(".if-result")!;
    result.classList.toggle("is-on", ready > 0);
    result.classList.toggle("is-pressed", progress >= 0.89);
    result.querySelector<HTMLElement>(".if-result-amount b")!.textContent = group(total * ready);
    result.querySelectorAll("li").forEach((item, index) => item.classList.toggle("is-on", progress >= 0.92 + index * 0.025));
  };
  // the story's loop and the wires' measuring always call the latest paint
  const paintRef = useRef(paint);
  useLayoutEffect(() => {
    paintRef.current = paint;
    paint();
  });

  const wires = useWires(rootRef, WIRES, FIELDS.length, paintRef);
  useStoryLoop(rootRef, progressRef, paintRef, reduced, PLAY, PAUSE);

  return (
    <section ref={rootRef} id="ai" className="income-flow ai-flow" data-reduced={reduced}>
      {/* the page's sticky start button steps aside while this section, which has its own button, is on screen */}
      <div className="if-track" data-no-sticky>
        <div className="if-stage">
          <header className="if-head">
            <h2 className="text-balance text-[clamp(2.1rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              <SplitWords text={a.title} />
            </h2>
          </header>

          <div className="if-body">
            <div className="if-board">
              <svg className="if-wires" aria-hidden="true">
                {wires.map((w) => <path key={`${w.role}-${w.index}`} data-wire={`${w.role}-${w.index}`} d={w.d} pathLength={1} style={{ "--tone": FIELDS[w.index].color } as CSSProperties} />)}
                {wires.map((w) => <circle key={`${w.role}-${w.index}`} data-pulse={`${w.role}-${w.index}`} r={5} style={{ "--tone": FIELDS[w.index].color } as CSSProperties} />)}
              </svg>

              <div className="if-column">
                <span className="if-step"><i>1</i>{a.steps[0]}</span>
                <div className="if-node ai-photo">
                  <span className="ai-photo-status"><i /><span className="ai-when-off">{a.scanning}</span><span className="ai-when-on">{a.scanned}</span></span>
                  <div className="ai-paper">
                    <p className="ai-paper-title">{a.receipt}</p>
                    <hr />
                    {a.items.map(([name, value]) => <p key={name}><span>{name}</span><span>{group(value)}</span></p>)}
                    <hr />
                    <p className="ai-paper-total"><span>{a.total}</span><span>{group(total)}</span></p>
                    <i className="ai-scan" aria-hidden="true" />
                    <span className="ai-frame" aria-hidden="true"><i /><i /><i /><i /></span>
                  </div>
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>2</i><MorefinMark className="ai-star" size={32} />{a.steps[1]}</span>
                <div className="if-rules">
                  {FIELDS.map((field) => (
                    <div className="if-node if-rule" data-field={field.key} key={field.key} style={{ "--tone": field.color } as CSSProperties}>
                      <span className="if-rule-icon"><FieldIcon kind={field.key} /></span>
                      <span className="if-rule-name"><b>{a.fields[field.key].name}</b><small>{a.fields[field.key].detail}</small></span>
                      <span className="if-rule-amount">
                        {field.key === "amount" ? <span><b>0</b> <small>{t.currency}</small></span> : <span><b>{a.values[field.key]}</b></span>}
                      </span>
                      <i className="if-rule-load" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="if-column">
                <span className="if-step"><i>3</i>{a.steps[2]}</span>
                <div className="if-node if-result">
                  <small>{a.proposal}</small>
                  <strong className="if-result-amount">−<b>0</b> <span>{t.currency}</span></strong>
                  <span className="ai-result-meta">{a.values.category} · {a.values.account}</span>
                  <span className="ai-confirm">
                    <span className="ai-confirm-off">{a.confirm}</span>
                    <span className="ai-confirm-on"><Tick />{a.confirmed}</span>
                    <i className="ai-tap" aria-hidden="true" />
                  </span>
                  <ul className="ai-updates">
                    {a.updates.map((line) => <li key={line}><Tick />{line}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="if-cta">
              <a data-cta data-lead="ai" href={APP_URL} className="if-button">
                {start} <ArrowRight aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
