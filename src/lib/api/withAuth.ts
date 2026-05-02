// ============================================
// API Auth Middleware Helper
// API route'larında kullanım: withAuth(handler)
// Firebase ID token'ını Authorization header'dan doğrular
// tenantId'yi Firestore users koleksiyonundan çeker
// Global rate limiting ile brute-force koruması
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { logger } from "@/lib/logger";

// ============================================
// Global Rate Limiter — 100 req/min per IP
// Production'da Redis önerilir, burada basit in-memory Map
// ============================================
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip) || { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  if (record.count >= 100) {
    logger.warn("Rate limit exceeded", "withAuth", { ip, count: record.count });
    return false; // Block
  }

  record.count++;
  rateLimiter.set(ip, record);
  return true;
}

export interface AuthContext {
  tenantId: string;
  uid: string;
  email: string;
  role: string;
}

type ApiHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Wraps an API route with Firebase ID token verification.
 * Extracts tenantId from Firestore users collection — client cannot spoof it.
 *
 * Usage:
 *   export const POST = withAuth(async (req, { tenantId, uid }) => { ... });
 */
export function withAuth(handler: ApiHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Rate limiting check
      const ip = getClientIp(req);
      if (!checkRateLimit(ip)) {
        return NextResponse.json(
          {
            success: false,
            error: "Çok fazla istek. Lütfen 1 dakika bekleyin.",
            timestamp: new Date().toISOString()
          },
          { status: 429 }
        );
      }

      const authHeader = req.headers.get("authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        logger.warn("Missing auth token", "withAuth", { path: req.nextUrl.pathname, ip });
        return NextResponse.json(
          {
            success: false,
            error: "Kimlik doğrulaması gerekli.",
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }

      const idToken = authHeader.slice(7);

      let decodedToken;
      try {
        const adminApp = getAdminApp();
        const adminAuth = getAuth(adminApp);
        decodedToken = await adminAuth.verifyIdToken(idToken);
      } catch (verifyErr) {
        logger.warn("Invalid Firebase token", "withAuth", {
          error: (verifyErr as Error).message,
          path: req.nextUrl.pathname,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Geçersiz veya süresi dolmuş oturum.",
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      const uid = decodedToken.uid;
      const email = decodedToken.email || "";

      // tenantId'yi Firestore users koleksiyonundan oku
      // Aynı tenant altında birden fazla kullanıcı olabilir
      let tenantId = uid; // fallback
      let role = "admin";

      try {
        const adminApp = getAdminApp();
        const adminDb = getFirestore(adminApp);
        const userDoc = await adminDb.collection("users").doc(uid).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          tenantId = userData?.tenantId || uid;
          role = userData?.role || "admin";
        }
      } catch (dbErr) {
        // Firestore okunamazsa UID'yi tenantId olarak kullan (güvenli fallback)
        logger.warn("Failed to read user doc, using UID as tenantId", "withAuth", {
          uid,
          error: (dbErr as Error).message,
        });
      }

      logger.debug("Auth OK", "withAuth", { uid, tenantId, path: req.nextUrl.pathname });

      return handler(req, { tenantId, uid, email, role });
    } catch (err) {
      logger.error("withAuth unexpected error", "withAuth", {
        error: (err as Error).message,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Sunucu hatası.",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

