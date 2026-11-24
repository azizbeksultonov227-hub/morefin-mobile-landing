import { NextResponse, type NextRequest } from "next/server";
import { countryLocale, isLocale } from "./i18n";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse/i;

// Uzbek has no prefix: "/" is served from /uz. The first visit to "/" follows the visitor's country, unless they picked a language.
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) return NextResponse.redirect(`https://${host.slice(4)}${pathname}${search}`, 308);
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];

  // one page per language: any other address goes to its language's page
  if (parts.length > 1 || (first && !isLocale(first))) return NextResponse.redirect(new URL(isLocale(first) ? `/${first}` : "/", req.url), 307);
  // /uz stays reachable: the proxy also sees our own rewrite to it, and its canonical points at "/" anyway
  if (isLocale(first)) return NextResponse.next();

  if (pathname === "/") {
    const picked = req.cookies.get("lang")?.value;
    const want = isLocale(picked) ? picked : BOT.test(req.headers.get("user-agent") ?? "") ? "uz" : countryLocale(req.headers.get("cf-ipcountry"));
    // https by hand: behind the reverse proxy the request itself looks like plain http
    if (want !== "uz") return NextResponse.redirect(`https://${host}/${want}${search}`, { status: 307, headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.rewrite(new URL(pathname === "/" ? "/uz" : `/uz${pathname}`, req.url));
}

export const config = {
  // pages only: no static files, no metadata files
  matcher: ["/((?!_next|favicon.ico|icon.png|og.png|robots.txt|sitemap.xml|.*\\.).*)"],
};
