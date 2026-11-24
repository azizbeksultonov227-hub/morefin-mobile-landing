"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/mark";
import { APP_URL, DICT, LOCALES, path, type Locale } from "@/i18n";

// remember the visitor's own pick so "/" stops following their country
export const pick = (l: Locale) => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; };

export function Header({ locale, signIn }: { locale: Locale; signIn: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
        <a href={path(locale)} className="shrink-0"><Wordmark priority height={36} className="h-8 md:h-9" /></a>
        <nav className="flex items-center gap-2">
          <Langs locale={locale} />
          <a href={APP_URL} className="flex h-9 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:opacity-85">{signIn}</a>
        </nav>
      </div>
    </header>
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
