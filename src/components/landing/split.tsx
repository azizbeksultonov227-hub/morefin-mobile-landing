"use client";

import { AnimatePresence, useInView } from "motion/react";
import * as m from "motion/react-m";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollWords } from "@/components/scroll-words";
import { money, RULES, type Dict } from "@/i18n";
import { incomeAt, usePresses } from "./presses";

const PARTS = [
  { k: "partner", share: RULES.partner, color: "bg-primary" },
  { k: "kpi", share: RULES.kpi, color: "bg-warning" },
  { k: "tax", share: RULES.tax, color: "bg-muted" },
  { k: "stays", share: 1 - RULES.partner - RULES.kpi - RULES.tax, color: "bg-success" },
] as const;

// one income, and each recipient gets its part one after another; a tap anywhere sends the next income
export function Split({ t }: { t: Dict }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-20%" });
  const { count } = usePresses();
  const { amount, method } = incomeAt(count);
  // how far the split of this income has got; a new income starts again from nothing
  const [run, setRun] = useState({ count: 0, step: 0 });
  const step = run.count === count ? run.step : 0;

  useEffect(() => {
    if (!seen) return;
    const ids = PARTS.map((_, i) => setTimeout(() => setRun({ count, step: i + 1 }), 600 + i * 450));
    return () => ids.forEach(clearTimeout);
  }, [seen, count]);

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-10 md:py-32">
      <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <ScrollWords text={t.splitTitle} className="text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]" />
        <p className="mt-5 max-w-md text-base text-muted md:text-lg">{t.splitText}</p>
      </m.div>

      <m.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-md rounded-[1.75rem] border border-line bg-card p-5 shadow-2xl shadow-blue-950/10"
      >
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{t.incoming} · {t.methods[method]}</span>
          <span>{t.today}, 14:32</span>
        </div>
        <p className="mt-1.5 text-[1.75rem] font-semibold tabular-nums tracking-tight">
          +{money(amount)} <span className="text-base font-medium text-muted">{t.currency}</span>
        </p>

        <div className="mt-4 flex h-2.5 gap-1 overflow-hidden rounded-full">
          {PARTS.map((p, i) => (
            <m.span
              key={p.k}
              className={`h-full rounded-full ${p.color}`}
              style={{ flexBasis: `${p.share * 100}%`, transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step > i ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>

        <ul className="mt-4">
          {PARTS.map((p, i) => {
            const r = t.recipients[p.k];
            const done = step > i;
            return (
              <li key={p.k} className="flex items-center gap-3 border-t border-line py-2.5 text-sm">
                <span className={`size-2.5 shrink-0 rounded-full ${p.color}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="relative block h-4 text-xs text-muted">
                    <AnimatePresence>
                      {done && (
                        <m.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 inline-flex items-center gap-1">
                          <Check className="size-3 text-success" /> {r.done}
                        </m.span>
                      )}
                    </AnimatePresence>
                  </span>
                </span>
                <span className={`tabular-nums transition-opacity duration-300 ${done ? "opacity-100" : "opacity-30"} ${p.k === "stays" ? "font-semibold text-success" : ""}`}>
                  {money(amount * p.share)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
          <span>{t.wait}</span>
          <span className="font-mono text-fg">{t.waitValue}</span>
        </div>
      </m.div>
    </section>
  );
}
