// ============================================
// API Auth Middleware Helper
// API route'larında kullanım: withAuth(handler)
// Firebase ID token'ını Authorization header'dan doğrular
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { logger } from "@/lib/logger";

export interface AuthenticatedRequest extends NextRequest {
  tenantId: string;
  uid: string;
  email: string;
}

type ApiHandler = (
  req: NextRequest,
  context: { tenantId: string; uid: string; email: string }
) => Promise<NextResponse>;

/**
 * Wraps an API route with Firebase ID token verification.
 * Extracts tenantId from the verified token — client cannot spoof it.
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
      // tenantId = uid (her tenant kendi Firebase UID'si ile ayrışır)
      const tenantId = uid;

      logger.debug("Auth OK", "withAuth", { uid, path: req.nextUrl.pathname });

      return handler(req, { tenantId, uid, email });
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
