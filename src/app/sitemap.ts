import type { MetadataRoute } from "next";
import { LOCALES, pageUrl } from "@/i18n";

// a fixed file, so it is also written out as-is in the static GitHub Pages preview
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, pageUrl(l)]));
  return LOCALES.map((l) => ({ url: pageUrl(l), alternates: { languages } }));
}
