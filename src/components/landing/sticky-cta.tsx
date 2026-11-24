"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_URL } from "@/i18n";

// on a phone the start button stays at hand once the hero's own button has scrolled away, until the closing one shows;
// it also steps aside over a [data-no-sticky] block (a full-screen pinned stage that has its own button)
export function StickyCta({ label }: { label: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const ctas = [...document.querySelectorAll("[data-cta]")];
    const covers = [...document.querySelectorAll("[data-no-sticky]")];
    const visible = new Set<Element>();
    let passedHero = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
        if (e.target === ctas[0]) passedHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      }
      setShown(passedHero && visible.size === 0);
    });
    [...ctas, ...covers].forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 transition duration-300 [background:linear-gradient(to_top,var(--bg)_55%,transparent)] md:hidden ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}>
      <a data-lead="sticky" href={APP_URL} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-white shadow-lg shadow-primary/30">
        {label} <ArrowRight className="size-4" />
      </a>
    </div>
  );
}
