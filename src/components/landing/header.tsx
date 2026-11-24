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
        <a href={path(locale)} aria-label="Morefin"><Wordmark /></a>
        <nav className="flex items-center gap-1 text-sm">
          <Langs locale={locale} />
          <a href={APP_URL} className="ml-2 rounded-full border border-line bg-card/50 px-4 py-1.5 backdrop-blur transition hover:bg-fg hover:text-bg">{signIn}</a>
        </nav>
      </div>
    </header>
  );
}

export function Langs({ locale }: { locale: Locale }) {
  return (
    <span className="flex items-center">
      {LOCALES.map((l) => (
        <a key={l} href={path(l)} hrefLang={l} lang={l} aria-label={DICT[l].name} onClick={() => pick(l)} aria-current={l === locale ? "page" : undefined} className={`rounded-full px-2 py-1 font-mono text-xs uppercase transition ${l === locale ? "text-fg" : "text-muted hover:text-fg"}`}>
          {l}
        </a>
      ))}
    </span>
  );
}
