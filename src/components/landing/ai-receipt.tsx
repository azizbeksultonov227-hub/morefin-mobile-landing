"use client";

import { AnimatePresence, useInView } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { MorefinMark } from "@/components/mark";
import { ScrollWords } from "@/components/scroll-words";
import { money, type Dict } from "@/i18n";

const SPRING = { type: "spring", stiffness: 320, damping: 28 } as const;
const IN = { initial: { opacity: 0, y: 16, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: SPRING };

// a receipt photo goes in, Morefin AI reads it, you confirm, the expense is saved
export function AiReceipt({ t }: { t: Dict }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-20%" });
  const [step, setStep] = useState(0);
  const total = t.receiptItems.reduce((s, [, v]) => s + v, 0);

  useEffect(() => {
    if (!seen) return;
    const ids = [400, 1300, 2600, 3900, 4500, 5500].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => ids.forEach(clearTimeout);
  }, [seen]);

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10 md:py-32">
      <div ref={ref} className="order-2 mx-auto w-full max-w-md rounded-[2rem] border border-line bg-card p-4 shadow-2xl shadow-blue-950/10 md:order-1">
        <div className="flex items-center gap-3 border-b border-line px-1 pb-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10"><MorefinMark className="size-6" /></span>
          <span className="text-sm font-semibold">Morefin AI</span>
        </div>
        <div className="flex h-[27rem] flex-col justify-end gap-3 overflow-hidden pt-4 text-sm">
          <AnimatePresence>
            {step >= 1 && (
              <m.div key="photo" layout {...IN} className="ml-auto w-44 -rotate-2 rounded-xl border border-line bg-white p-3 font-mono text-[11px] text-zinc-800 shadow-md">
                <p className="text-center font-semibold tracking-wider">{t.receipt}</p>
                <div className="my-2 border-t border-dashed border-zinc-300" />
                {t.receiptItems.map(([name, v]) => (
                  <p key={name} className="flex justify-between"><span>{name}</span><span>{money(v)}</span></p>
                ))}
                <div className="my-2 border-t border-dashed border-zinc-300" />
                <p className="flex justify-between font-semibold"><span>{t.total}</span><span>{money(total)}</span></p>
              </m.div>
            )}
            {step >= 3 && (
              <m.div key="read" layout {...IN} className="max-w-[85%]">
                <div className="rounded-2xl rounded-bl-md bg-fg/[0.06] px-3.5 py-2.5 leading-snug">
                  <p className="font-semibold">🧾 {t.aiRead}</p>
                  <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                    <dt className="text-muted">{t.aiFields.amount}</dt><dd className="tabular-nums">{money(total)} {t.currency}</dd>
                    <dt className="text-muted">{t.aiFields.category}</dt><dd>{t.aiCategory}</dd>
                    <dt className="text-muted">{t.aiFields.account}</dt><dd>{t.aiAccount}</dd>
                  </dl>
                  <p className="mt-1 text-right text-[11px] text-muted">{t.now}</p>
                </div>
                <div className={`mt-1 rounded-xl py-2 text-center text-xs font-medium transition-colors duration-300 ${step >= 4 ? "bg-primary text-white" : "bg-fg/[0.06] text-primary dark:text-accent"}`}>{t.confirm}</div>
              </m.div>
            )}
            {step >= 6 && (
              <m.div key="saved" layout {...IN} className="max-w-[85%] rounded-2xl rounded-bl-md bg-fg/[0.06] px-3.5 py-2.5 leading-snug">
                <p>✅ {t.aiSaved}</p>
                <p className="mt-1 text-right text-[11px] text-muted">{t.now}</p>
              </m.div>
            )}
            {(step === 2 || step === 5) && (
              <m.div key="typing" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-fg/[0.06] px-3.5 py-3">
                {[0, 1, 2].map((d) => (
                  <m.span key={d} className="size-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <m.div className="order-1 md:order-2" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <ScrollWords text={t.aiTitle} className="text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]" />
        <p className="mt-5 max-w-md text-base text-muted md:text-lg">{t.aiText}</p>
      </m.div>
    </section>
  );
}
