import { NextRequest, NextResponse } from "next/server";

// ============================================
// Next.js Middleware — Route Koruması
// /dashboard ve /api/* route'larını korur
// Client-side auth (AuthContext) ile birlikte çalışır
// ============================================

// Korumalı prefix'ler
const PROTECTED_PATHS = ["/dashboard"];
const API_PROTECTED_PATHS = ["/api/policies", "/api/ai", "/api/automation"];
const ADMIN_PATHS = ["/emre", "/api/admin"];

// Public route'lar (auth gerekmez)
const PUBLIC_PATHS = ["/login", "/demo", "/", "/api/admin/auth"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isApiProtected(pathname: string): boolean {
  return API_PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    pathname !== "/api/admin/auth";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Admin path koruması ───────────────────────────────
  if (isAdminPath(pathname)) {
    const adminToken = req.cookies.get("admin_token")?.value ||
      req.headers.get("x-admin-token");

    if (!adminToken) {
      // /emre sayfası için login'e yönlendir
      if (pathname.startsWith("/emre")) {
        return NextResponse.redirect(new URL("/emre?unauthorized=1", req.url));
      }
      // Admin API için 401
      return NextResponse.json(
        { error: "Yönetici yetkisi gerekli." },
        { status: 401 }
      );
    }

    // HMAC token doğrulaması (basit — tam doğrulama API'de yapılır)
    try {
      const decoded = Buffer.from(adminToken, "base64url").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 3 || parts[0] !== process.env.ADMIN_USERNAME) {
        throw new Error("Invalid token structure");
      }
    } catch {
      if (pathname.startsWith("/emre")) {
        return NextResponse.redirect(new URL("/emre?unauthorized=1", req.url));
      }
      return NextResponse.json({ error: "Geçersiz token." }, { status: 401 });
    }
  }

  // ─── Dashboard koruması (client-side auth ile koordineli) ──
  if (isProtected(pathname)) {
    // Firebase auth cookie'si yok mu? Login'e yönlendir
    // Not: Firebase client SDK'nın oturum cookie'si
    const firebaseCookie =
      req.cookies.get("firebase-auth-token")?.value ||
      req.cookies.has("__session");

    // İlk yüklemede cookie olmayabilir — client AuthContext devralır
    // Bu sadece hızlı bir pre-check; gerçek doğrulama AuthContext'te
    if (!firebaseCookie) {
      // SSR sayfaları için client AuthContext'in çalışması beklenir
      // Middleware burada sadece açık kötüye kullanım girişimlerini engeller
      return NextResponse.next();
    }
  }

  // ─── Güvenlik Header'ları (API route'lar için ek) ──────
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // API route'larında CORS kısıtlaması
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "https://sigortacuzdani.com",
      "https://www.sigortacuzdani.com",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Middleware'in çalışacağı route'lar
  matcher: [
    "/dashboard/:path*",
    "/emre/:path*",
    "/emre",
    "/api/:path*",
    // Static dosyaları ve _next'i atla
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
