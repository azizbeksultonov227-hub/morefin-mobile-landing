import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { Pixels } from "@/components/pixels";
import { SmoothScroll } from "@/components/smooth-scroll";
import { DICT, isLocale, LOCALES, pageUrl, SITE_URL } from "@/i18n";
import "../globals.css";
import "lenis/dist/lenis.css";

// Uzbek and English need only the latin set (their ‘ and ʻ are in it), Russian the cyrillic one; latin-ext is never
// needed, so it is not fetched up front (its rules stay declared, should a character ever ask for it)
const geist = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-geist" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const viewport: Viewport = {
  // light only, whatever the phone's own setting
  themeColor: "#f8fbfd",
  colorScheme: "light",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = DICT[locale].meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    alternates: {
      canonical: pageUrl(locale),
      languages: { uz: pageUrl("uz"), ru: pageUrl("ru"), en: pageUrl("en"), "x-default": pageUrl("uz") },
    },
    openGraph: { title: t.title, description: t.description, url: pageUrl(locale), siteName: "Morefin", locale: { uz: "uz_UZ", ru: "ru_RU", en: "en_US" }[locale], type: "website", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    // phone browsers add their own attributes to <html> before the page loads (Chrome on iOS adds a frame token),
    // which is not a mismatch of ours
    <html lang={locale} className={geist.variable} suppressHydrationWarning>
      <body>
        {children}
        <SmoothScroll />
        <Pixels />
      </body>
    </html>
  );
}
