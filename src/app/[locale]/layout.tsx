import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { MotionProvider } from "@/components/motion-provider";
import { Pixels } from "@/components/pixels";
import { SmoothScroll } from "@/components/smooth-scroll";
import { DICT, isLocale, LOCALES, pageUrl, SITE_URL } from "@/i18n";
import "../globals.css";
import "lenis/dist/lenis.css";

const geist = Geist({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-geist-mono" });

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
    <html lang={locale} className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <MotionProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </MotionProvider>
        <Pixels />
      </body>
    </html>
  );
}
