import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { logger } from "@/lib/logger";
import packageJson from "@/../package.json";

// ============================================
// Health Check API — Public endpoint for monitoring
// No auth required — used by uptime monitors
// ============================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    let firebaseConnected = false;
    let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "unknown";

    try {
      const app = getAdminApp();
      firebaseConnected = !!app;
    } catch (firebaseError) {
      logger.warn("Firebase health check failed", "api/health", {
        error: (firebaseError as Error).message,
      });
    }

    const isHealthy = firebaseConnected;
    const status = isHealthy ? "healthy" : "unhealthy";
    const statusCode = isHealthy ? 200 : 503;

    const response = {
      success: isHealthy,
      data: {
        status,
        timestamp,
        version: packageJson.version,
        firebase: {
          connected: firebaseConnected,
          projectId,
        },
      },
    };

    if (isHealthy) {
      logger.debug("Health check passed", "api/health");
    } else {
      logger.warn("Health check failed", "api/health", {
        firebase: firebaseConnected,
      });
    }

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error("Health check error", "api/health", {
      error: (error as Error).message,
    });

    return NextResponse.json(
      {
        success: false,
        error: "System unavailable",
        timestamp,
      },
      { status: 503 }
    );
  }
}
