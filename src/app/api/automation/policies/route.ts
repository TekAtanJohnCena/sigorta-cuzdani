import { NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "@/lib/logger";

// Retry mekanizması için yardımcı fonksiyon
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.warn("Retry attempt failed", "automation/policies", {
        attempt,
        maxRetries,
        error: lastError.message,
      });

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

export async function GET(request: Request) {
  const startTime = Date.now();

  // 1. Authorization Kontrolü
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Unauthorized automation attempt", "automation/policies");
    return NextResponse.json(
      { success: false, error: "Unauthorized", timestamp: new Date().toISOString() },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || token !== cronSecret) {
    logger.error("Invalid CRON secret", "automation/policies");
    return NextResponse.json(
      { success: false, error: "Unauthorized", timestamp: new Date().toISOString() },
      { status: 401 }
    );
  }

  try {
    logger.info("Policy expiration automation started", "automation/policies");

    // Retry mekanizması ile batch güncelleme
    const result = await retryOperation(async () => {
      const adminApp = getAdminApp();
      const db = getFirestore(adminApp);

      // 2. İş Mantığı: Bitiş tarihi geçmiş ve aktif olan poliçeleri bul
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // Firestore sorgusu
      const policiesRef = db.collection("policies");
      const snapshot = await policiesRef
        .where("status", "==", "active")
        .where("endDate", "<", todayStr)
        .get();

      if (snapshot.empty) {
        logger.info("No expired policies found", "automation/policies");
        return 0;
      }

      // 3. Performans: Toplu güncelleme (Batch write)
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "expired",
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();

      logger.info("Policy status updated successfully", "automation/policies", {
        updated: snapshot.size,
        executionTime: Date.now() - startTime,
      });

      return snapshot.size;
    });

    return NextResponse.json({
      success: true,
      data: { updatedCount: result },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Policy automation failed after retries", "automation/policies", {
      error: (error as Error).message,
      executionTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Poliçe güncelleme işlemi başarısız oldu.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
