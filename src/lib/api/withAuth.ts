// ============================================
// API Auth Middleware Helper
// API route'larında kullanım: withAuth(handler)
// Firebase ID token'ını Authorization header'dan doğrular
// tenantId'yi Firestore users koleksiyonundan çeker
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { logger } from "@/lib/logger";

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
      const authHeader = req.headers.get("authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        logger.warn("Missing auth token", "withAuth", { path: req.nextUrl.pathname });
        return NextResponse.json(
          { error: "Kimlik doğrulaması gerekli." },
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
          { error: "Geçersiz veya süresi dolmuş oturum." },
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
        { error: "Sunucu hatası." },
        { status: 500 }
      );
    }
  };
}

