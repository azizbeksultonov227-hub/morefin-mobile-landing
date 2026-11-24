import type { MetadataRoute } from "next";
import { LOCALES, pageUrl } from "@/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, pageUrl(l)]));
  return LOCALES.map((l) => ({ url: pageUrl(l), alternates: { languages } }));
}
