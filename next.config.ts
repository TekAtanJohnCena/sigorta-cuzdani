import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  // Clickjacking korumasÄ±
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIME type sniffing korumasÄ±
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS korumasÄ± (modern tarayÄ±cÄ±larda CSP daha etkili)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Referrer bilgisi sÄ±zÄ±ntÄ±sÄ±nÄ± azalt
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HTTPS zorunlu (prod'da)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Ä°zin politikasÄ± â€” gereksiz API eriÅŸimlerini kÄ±sÄ±tla
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Firebase Auth
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseapp.com https://apis.google.com",
      // Firebase Storage, CDN
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://firebasestorage.googleapis.com",
      // Google Fonts, Firebase Auth popup
      "font-src 'self' https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Firebase Auth popup images
      "img-src 'self' data: blob: https://*.googleusercontent.com https://firebasestorage.googleapis.com",
      // Firebase Auth popup frame
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
// Security Headers â€” tÃ¼m route'lara uygulanÄ±r
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // API route'larÄ±na Ã¶zel ek kÄ±sÄ±tlamalar
  async rewrites() {
    return [];
  },

  // Log seviyesi (prod'da debug loglarÄ± gizle)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // B2B Performans OptimizasyonlarÄ± (G-18)
  compiler: {
    // Production'da console.log vs. kaldÄ±r (error ve warn hariÃ§)
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default bundleAnalyzer(nextConfig);

