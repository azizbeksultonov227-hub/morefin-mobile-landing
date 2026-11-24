import { ScrollWords } from "@/components/scroll-words";
import type { Dict } from "@/i18n";

// the rest of the product in three lines, in the same ruled rows as the hero card
export function More({ t }: { t: Dict }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-10 md:py-32">
      <ScrollWords text={t.moreTitle} className="text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]" />
      <ul>
        {t.more.map((m) => (
          <li key={m.tag} className="grid gap-1.5 border-t border-line py-5 md:grid-cols-[8rem_1fr] md:gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary dark:text-accent">{m.tag}</span>
            <p className="text-base text-muted md:text-lg">{m.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
