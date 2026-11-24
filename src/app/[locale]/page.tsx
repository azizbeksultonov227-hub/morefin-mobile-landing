import { ArrowRight } from "lucide-react";
import { AiReceipt } from "@/components/landing/ai-receipt";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { More } from "@/components/landing/more";
import { Split } from "@/components/landing/split";
import { StickyCta } from "@/components/landing/sticky-cta";
import { ScrollWords } from "@/components/scroll-words";
import { APP_URL, DICT, type Locale } from "@/i18n";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = DICT[locale];
  return (
    <>
      <Header locale={locale} signIn={t.signIn} />
      <main>
        <Hero t={t} />
        <Split t={t} />
        <AiReceipt t={t} />
        <More t={t} />
        <section className="relative px-5 py-24 text-center [background:radial-gradient(60%_70%_at_50%_100%,rgb(31_79_234/0.16),transparent)] md:py-36">
          <ScrollWords text={t.ctaTitle} className="relative mx-auto max-w-4xl text-balance text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]" />
          <p className="relative mx-auto mt-5 max-w-md text-base text-muted md:text-lg">{t.ctaText}</p>
          <a data-cta data-lead="final" href={APP_URL} className="group relative mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50 sm:w-auto">
            {t.start} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </a>
        </section>
      </main>
      <Footer locale={locale} signIn={t.signIn} />
      <StickyCta label={t.start} />
    </>
  );
}
