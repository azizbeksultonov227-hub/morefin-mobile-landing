import type { NextConfig } from "next";

// a public page: framed by nobody else, no sniffing, HTTPS only
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
