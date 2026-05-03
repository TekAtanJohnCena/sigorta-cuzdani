import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/firebase/withAuth";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { riskMiningEngine } from "@/lib/ai/engines/riskMiningEngine";
import type { Policy } from "@/types/policy";
import type { RiskAlert } from "@/lib/ai/types";

/**
 * GET /api/ai/critical-alerts
 * Returns count of CRITICAL severity alerts across all tenant policies
 * Used for global AI notification badge
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const policies = await getPoliciesByTenant(user.tenantId);

    if (!policies || policies.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
          total: 0,
        },
      });
    }

    let criticalCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    // Analyze each policy for critical risks
    for (const policy of policies) {
      const p = policy as unknown as Policy;

      // Construct policy text from available data
      const policyText = [
        `Poliçe Tipi: ${p.policyType}`,
        `Sigorta Şirketi: ${p.insuranceCompany}`,
        `Poliçe No: ${p.policyNumber}`,
        p.notes ? `Özel Şartlar: ${p.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      // Analyze with risk mining engine
      const result = await riskMiningEngine.analyzePolicy(
        p.id,
        p.policyType,
        policyText,
        p.coverages?.map((c) => ({
          name: c.name,
          amount: c.amount,
          deductible: c.deductible,
        })) || []
      );

      // Count by severity
      result.alerts.forEach((alert: RiskAlert) => {
        if (alert.severity === "CRITICAL") criticalCount++;
        else if (alert.severity === "WARNING") warningCount++;
        else if (alert.severity === "INFO") infoCount++;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        criticalCount,
        warningCount,
        infoCount,
        total: criticalCount + warningCount + infoCount,
      },
    });
  } catch (error) {
    console.error("[API] /api/ai/critical-alerts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kritik uyarılar yüklenirken hata oluştu",
      },
      { status: 500 }
    );
  }
});
