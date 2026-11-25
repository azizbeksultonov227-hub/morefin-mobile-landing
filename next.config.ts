import type { NextConfig } from "next";

// a public page: framed by nobody else, no sniffing, HTTPS only
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

// GITHUB_PAGES=true builds the phone preview for GitHub Pages (see .github/workflows/pages.yml): plain static files
// under /<repo>, so no server features (no image optimiser, no response headers); the real site stays a standalone server
const PAGES = process.env.GITHUB_PAGES === "true";
const BASE = PAGES ? "/morefin-mobile-landing" : "";

const nextConfig: NextConfig = {
  ...(PAGES
    ? { output: "export", basePath: BASE, trailingSlash: true, images: { unoptimized: true } }
    : {
        output: "standalone",
        async headers() {
          return [{ source: "/:path*", headers: SECURITY_HEADERS }];
        },
      }),
  env: { NEXT_PUBLIC_BASE_PATH: BASE },
  poweredByHeader: false,
  devIndicators: false,
  // dev only: lets a phone on the same Wi-Fi/hotspot open http://<mac-ip>:3500 with scripts working
  allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*", "*.local"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
