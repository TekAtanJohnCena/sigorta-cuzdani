import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { saveComparison, getPoliciesByIds } from "@/lib/firebase/firestore";
import { logger } from "@/lib/logger";

// Rate limiter (10 comparisons per minute per tenant)
const comparisonRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkComparisonRateLimit(tenantId: string): boolean {
  const now = Date.now();
  const record = comparisonRateLimit.get(tenantId) || { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  if (record.count >= 10) return false;

  record.count++;
  comparisonRateLimit.set(tenantId, record);
  return true;
}

export const POST = withAuth(async (req, { tenantId, uid }) => {
  try {
    if (!checkComparisonRateLimit(tenantId)) {
      return NextResponse.json(
        { success: false, error: "Çok fazla karşılaştırma talebi. 1 dakika bekleyin." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { policyIds, title, notes } = body;

    if (!Array.isArray(policyIds) || policyIds.length < 2 || policyIds.length > 4) {
      return NextResponse.json(
        { success: false, error: "2-4 arası poliçe seçilmelidir." },
        { status: 400 }
      );
    }

    const policies = await getPoliciesByIds(policyIds, tenantId);

    if (policies.length !== policyIds.length) {
      return NextResponse.json(
        { success: false, error: "Bazı poliçeler bulunamadı veya erişim yetkiniz yok." },
        { status: 403 }
      );
    }

    const comparisonId = await saveComparison(tenantId, policyIds, {
      createdBy: uid,
      title,
      notes,
    });

    logger.info("Comparison created", "api/comparisons", { tenantId, comparisonId, policyCount: policies.length });

    return NextResponse.json({
      success: true,
      data: {
        comparisonId,
        policies,
      },
    });
  } catch (error) {
    logger.error("Comparison creation failed", "api/comparisons", { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: "Karşılaştırma oluşturulamadı." },
      { status: 500 }
    );
  }
});
