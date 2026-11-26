"use client";

import { useEffect, useId, useRef, useState } from "react";
import "./agents.css";

// Morefin's AI "employees", one per thing the product does for a business. Each is a small glossy character drawn
// here (no images): a body in its own colour, two eyes that blink now and then.
const AGENTS = [
  { shape: "calc", from: "#5B82FF", to: "#1F45D6" }, // net profit
  { shape: "receipt", from: "#FFC95C", to: "#EE8A00" }, // receipts into expenses
  { shape: "pie", from: "#A99CFF", to: "#6A5AD8" }, // partner's share
  { shape: "cup", from: "#4FD796", to: "#0F955C" }, // KPI bonuses
  { shape: "bell", from: "#FF9585", to: "#DE4A45" }, // debts falling due
  { shape: "target", from: "#7CC8FF", to: "#2A8BE6" }, // the monthly plan
  { shape: "chart", from: "#FF86C0", to: "#D33F86" }, // the monthly report
] as const;
type Shape = (typeof AGENTS)[number]["shape"];

// where each place in the row sits (x in em from the centre) and how big it is; the middle one is the one at work
const SLOTS: Record<number, { x: number; s: number }> = {
  [-3]: { x: -7.8, s: 0.2 }, [-2]: { x: -6.05, s: 0.4 }, [-1]: { x: -3.6, s: 0.58 }, 0: { x: 0, s: 1 },
  1: { x: 3.6, s: 0.58 }, 2: { x: 6.05, s: 0.4 }, 3: { x: 7.8, s: 0.2 },
};
// long enough for a slow reader to take in the line before the next one comes
const EVERY = 4500;

export function Agents({ items }: { items: { role: string; text: string }[] }) {
  const [active, setActive] = useState(0);
  // the row works only while it is on screen: scrolled away, the turns stop and the blinking holds
  const [shown, setShown] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const n = AGENTS.length;
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting));
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    // still for anyone who asked for less motion: the first employee stays
    if (!shown || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), EVERY);
    return () => clearInterval(id);
  }, [n, shown]);
  const now = items[active % items.length];

  return (
    <div ref={ref} className={`agents ${shown ? "" : "is-away"}`}>
      <div className="agents-row" aria-hidden>
        {AGENTS.map((agent, i) => {
          let d = (i - active + n) % n;
          if (d > n / 2) d -= n;
          const slot = SLOTS[d];
          return (
            <span key={agent.shape} className={`agents-char ${d === 0 ? "is-on" : ""}`} style={{ "--x": `${slot.x}em`, "--s": slot.s, opacity: Math.abs(d) <= 2 ? 1 : 0, "--blink": `${(i * 0.83) % 4}s` } as React.CSSProperties}>
              <Character shape={agent.shape} from={agent.from} to={agent.to} />
            </span>
          );
        })}
      </div>
      <p key={active} className="agents-line"><span><b>{now.role}</b> {now.text}</span></p>
    </div>
  );
}

function Character({ shape, from, to }: { shape: Shape; from: string; to: string }) {
  // a gradient id that is safe inside url(#...)
  const id = `ag${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fill = `url(#${id})`;
  return (
    <svg viewBox="0 0 64 64">
      <defs>
        <linearGradient id={id} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <Body shape={shape} fill={fill} />
      {/* a soft shine on the upper left, so the body reads as rounded */}
      <ellipse cx="24" cy="18" rx="9" ry="4.5" fill="#fff" opacity=".28" transform="rotate(-24 24 18)" />
      <g className="agents-eyes">
        <rect x={EYES[shape][0] - 5.5} y={EYES[shape][1]} width="4.4" height="8.5" rx="2.2" fill="#fff" />
        <rect x={EYES[shape][0] + 1.1} y={EYES[shape][1]} width="4.4" height="8.5" rx="2.2" fill="#fff" />
      </g>
    </svg>
  );
}

// where each character's eyes sit (centre x, top y)
const EYES: Record<Shape, [number, number]> = {
  calc: [32, 34], receipt: [32, 26], pie: [27, 37], cup: [32, 17], bell: [32, 27], target: [32, 28], chart: [32, 30],
};

function Body({ shape, fill }: { shape: Shape; fill: string }) {
  switch (shape) {
    case "calc":
      return (
        <>
          <rect x="11" y="7" width="42" height="50" rx="13" fill={fill} />
          <rect x="18" y="14" width="28" height="11" rx="4.5" fill="#fff" opacity=".32" />
        </>
      );
    case "receipt":
      return <path d="M17 7h30a5 5 0 0 1 5 5v45l-5.4-3.6-5.3 3.6-5.3-3.6L30.7 57l-5.3-3.6L20 57l-3-2V12a5 5 0 0 1 5-5Z" fill={fill} transform="translate(-2.5 0)" />;
    case "pie":
      return (
        <>
          <path d="M30 13a21 21 0 1 0 21 21H30Z" fill={fill} />
          <path d="M35 8a21 21 0 0 1 21 21H35Z" fill={fill} opacity=".75" />
        </>
      );
    case "cup":
      return (
        <>
          <path d="M14 8h36v14a18 18 0 0 1-36 0Z" fill={fill} />
          <rect x="28.5" y="38" width="7" height="9" fill={fill} />
          <rect x="18" y="46" width="28" height="10" rx="4" fill={fill} />
        </>
      );
    case "bell":
      return (
        <>
          <path d="M32 7c-11 0-18 8.5-18 19.5V37l-5.5 7.5h47L50 37V26.5C50 15.5 43 7 32 7Z" fill={fill} />
          <circle cx="32" cy="51.5" r="5.5" fill={fill} />
        </>
      );
    case "target":
      return (
        <>
          <circle cx="32" cy="32" r="25" fill={fill} />
          <circle cx="32" cy="32" r="16.5" fill="#fff" opacity=".18" />
        </>
      );
    case "chart":
      return (
        <>
          <rect x="8" y="32" width="14" height="25" rx="5" fill={fill} />
          <rect x="25" y="19" width="14" height="38" rx="5" fill={fill} />
          <rect x="42" y="8" width="14" height="49" rx="5" fill={fill} />
        </>
      );
  }
}
