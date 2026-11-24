"use client";

import Script from "next/script";
import { useEffect } from "react";
import { APP_URL } from "@/i18n";

// Meta (Facebook/Instagram) Pixel ID from Events Manager. Not a secret: it is public in every page that carries it.
// Set it here, or pass NEXT_PUBLIC_META_PIXEL_ID at build time; empty means no pixel is loaded at all.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

// Meta's own base code, unchanged: a tiny queue now, fbevents.js loads async and never blocks the page
const META_BASE = (id: string) => `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');
fbq('track','PageView');`;

const APP_ORIGIN = new URL(APP_URL).origin;

/**
 * Ad tracking for the landing: a PageView on arrival, a Lead when someone presses a start button.
 * Every link to the app also carries the ad's utm_* / fbclid on, so the app can see where the visitor came from.
 */
export function Pixels() {
  useEffect(() => {
    // capture: runs before the browser follows the link, so the href change still counts
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || new URL(a.href).origin !== APP_ORIGIN) return;
      const url = new URL(a.href);
      new URLSearchParams(location.search).forEach((v, k) => { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
      a.href = url.toString();
      // only the "try it free" buttons are leads; "log in" is someone who already has an account
      if (a.dataset.lead) window.fbq?.("track", "Lead", { content_name: a.dataset.lead });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!/^\d+$/.test(META_PIXEL_ID)) return null;
  return <Script id="meta-pixel" strategy="afterInteractive">{META_BASE(META_PIXEL_ID)}</Script>;
}
