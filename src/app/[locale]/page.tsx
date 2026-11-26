import { AiFlow } from "@/components/landing/ai-flow";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { IncomeFlow } from "@/components/landing/income-flow";
import { DICT, type Locale } from "@/i18n";

// Three screens, each with its own start button: what Morefin is (hero), how a payment becomes net profit by itself
// (the blue story), and what Morefin AI does (the AI story, which closes the page).
export default async function Page({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = DICT[locale];
  return (
    <>
      <Header locale={locale} signIn={t.signIn} />
      <main>
        <Hero t={t} />
        <IncomeFlow t={t} locale={locale} start={t.start} />
        <AiFlow t={t} locale={locale} start={t.start} />
      </main>
      <Footer locale={locale} signIn={t.signIn} />
    </>
  );
}
