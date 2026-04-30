import type { NextConfig } from "next";

const securityHeaders = [
  // Clickjacking koruması
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIME type sniffing koruması
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS koruması (modern tarayıcılarda CSP daha etkili)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Referrer bilgisi sızıntısını azalt
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HTTPS zorunlu (prod'da)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // İzin politikası — gereksiz API erişimlerini kısıtla
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
  // Security Headers — tüm route'lara uygulanır
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // API route'larına özel ek kısıtlamalar
  async rewrites() {
    return [];
  },

  // Log seviyesi (prod'da debug logları gizle)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
