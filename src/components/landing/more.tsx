import { ScrollWords } from "@/components/scroll-words";
import type { Dict } from "@/i18n";

// the rest of the product in three lines, in the same ruled rows as the hero card;
// phones keep the two columns too (title left, rows right), with the tag over its text where 8rem would not fit
export function More({ t }: { t: Dict }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-[1fr_1.15fr] gap-5 px-5 py-20 md:gap-12 md:px-10 md:py-32">
      <ScrollWords text={t.moreTitle} className="text-[clamp(1.4rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]" />
      <ul>
        {t.more.map((m) => (
          <li key={m.tag} className="grid gap-1 border-t border-line py-4 md:grid-cols-[8rem_1fr] md:gap-6 md:py-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary md:text-xs dark:text-accent">{m.tag}</span>
            <p className="text-sm text-muted md:text-lg">{m.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
