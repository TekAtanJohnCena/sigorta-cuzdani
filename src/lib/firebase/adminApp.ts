// ============================================
// Firebase Admin App Singleton
// Server-side only — never import in client components
// ============================================

import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { logger } from "@/lib/logger";

let adminApp: App | null = null;

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey || !projectId) {
    // Admin SDK credentials yoksa dev mode — bazı işlevler çalışmaz
    logger.warn(
      "Firebase Admin SDK credentials missing. Server-side auth disabled.",
      "adminApp"
    );
    // Credentials olmadan initialize et (bazı işlevler kısıtlı olur)
    adminApp = initializeApp({ projectId });
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  logger.info("Firebase Admin SDK initialized", "adminApp");
  return adminApp;
}
