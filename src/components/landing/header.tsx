"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/mark";
import { APP_URL, DICT, LOCALES, path, type Locale } from "@/i18n";

// remember the visitor's own pick so "/" stops following their country
export const pick = (l: Locale) => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; };

// A quiet bar: the logo, then on the right a small language menu and a light "log in" button, so nothing in it
// outweighs the hero's own start button
export function Header({ locale, signIn }: { locale: Locale; signIn: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 min-[360px]:px-5 md:px-10">
        <a href={path(locale)} className="shrink-0"><Wordmark priority height={36} className="h-7 min-[360px]:h-8 md:h-9" /></a>
        <nav className="flex items-center gap-1 min-[360px]:gap-2">
          <LangMenu locale={locale} />
          <a href={APP_URL} className="flex h-9 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-fg shadow-sm shadow-slate-900/5 transition hover:border-fg/20 hover:shadow-md">{signIn}</a>
        </nav>
      </div>
    </header>
  );
}

// the current language as a small globe button; the three languages open under it, each under its own name
function LangMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("pointerdown", away);
    addEventListener("keydown", esc);
    return () => { removeEventListener("pointerdown", away); removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-label={DICT[locale].name} onClick={() => setOpen((o) => !o)} className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-fg/80 outline-none transition hover:bg-fg/5 hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/40">
        <Globe className="size-4" aria-hidden />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-line bg-card p-1 shadow-lg shadow-slate-900/10">
          {LOCALES.map((l) => (
            <a key={l} href={path(l)} hrefLang={l} lang={l} onClick={() => pick(l)} aria-current={l === locale ? "page" : undefined} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-fg/5 ${l === locale ? "font-semibold text-fg" : "text-fg/80"}`}>
              {DICT[l].name}
              {l === locale ? <Check className="size-4 text-primary" aria-hidden /> : <span className="text-xs uppercase text-muted">{l}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// one segmented pill: a quiet track, the current language on a raised white thumb
export function Langs({ locale }: { locale: Locale }) {
  return (
    <span className="flex h-9 items-center rounded-full bg-fg/[0.06] p-1 backdrop-blur dark:bg-white/[0.07]">
      {LOCALES.map((l) => (
        <a key={l} href={path(l)} hrefLang={l} lang={l} aria-label={DICT[l].name} onClick={() => pick(l)} aria-current={l === locale ? "page" : undefined} className={`flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold uppercase tracking-wide transition ${l === locale ? "bg-card text-fg shadow-sm shadow-slate-900/10 dark:bg-white/15" : "text-muted hover:text-fg"}`}>
          {l}
        </a>
      ))}
    </span>
  );
}
