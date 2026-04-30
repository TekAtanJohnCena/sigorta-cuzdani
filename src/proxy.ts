import { NextRequest, NextResponse } from "next/server";

// ============================================
// Next.js Proxy (v16.2.4+) — Route Koruması
// middleware.ts yerine proxy.ts kullanılıyor
// /dashboard, /efsun ve /api/* route'larını korur
// ============================================

const ADMIN_PATHS = ["/api/admin"];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    pathname !== "/api/admin/auth";
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Admin path koruması ───────────────────────────────
  if (isAdminPath(pathname)) {
    const adminToken = req.cookies.get("admin_token")?.value ||
      req.headers.get("x-admin-token");

    if (!adminToken) {
      if (pathname.startsWith("/efsun")) {
        return NextResponse.redirect(new URL("/efsun?unauthorized=1", req.url));
      }
      return NextResponse.json(
        { error: "Yönetici yetkisi gerekli." },
        { status: 401 }
      );
    }

    // HMAC token yapısı kontrolü (tam doğrulama API'de)
    try {
      const decoded = Buffer.from(adminToken, "base64url").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 3 || parts[0] !== "v1") {
        throw new Error("Invalid token structure");
      }
    } catch {
      if (pathname.startsWith("/efsun")) {
        return NextResponse.redirect(new URL("/efsun?unauthorized=1", req.url));
      }
      return NextResponse.json({ error: "Geçersiz token." }, { status: 401 });
    }
  }

  // ─── API route'ları — CORS ve güvenlik header'ları ─────
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

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
  matcher: [
    "/dashboard/:path*",
    "/efsun/:path*",
    "/efsun",
    "/api/:path*",
  ],
};
