import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { generateRiskReportPDF } from "@/lib/pdf/riskReportPDF";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (req, { tenantId }) => {
  try {
    const body = await req.json();
    const {
      sectorLabel,
      coverageScore,
      criticalCount,
      warningCount,
      gaps,
      totalPolicies,
      estimatedMissingCost,
    } = body;

    // Validation
    if (!sectorLabel || typeof coverageScore !== "number") {
      return NextResponse.json(
        { success: false, error: "Geçersiz veri." },
        { status: 400 }
      );
    }

    const pdfBytes = await generateRiskReportPDF({
      tenantId,
      sectorLabel,
      coverageScore,
      criticalCount: criticalCount || 0,
      warningCount: warningCount || 0,
      gaps: gaps || [],
      totalPolicies: totalPolicies || 0,
      estimatedMissingCost: estimatedMissingCost || 0,
    });

    logger.info("Risk PDF generated", "api/risk/pdf", {
      tenantId,
      coverageScore,
      gapCount: gaps?.length || 0,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Risk_Raporu_${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    logger.error("Risk PDF generation failed", "api/risk/pdf", {
      error: (error as Error).message,
    });
    return NextResponse.json(
      { success: false, error: "PDF oluşturulamadı." },
      { status: 500 }
    );
  }
});
