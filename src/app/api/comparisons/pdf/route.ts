import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { getPoliciesByIds } from "@/lib/firebase/firestore";
import { generateComparisonPDF } from "@/lib/pdf/comparisonPDF";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (req, { tenantId }) => {
  try {
    const body = await req.json();
    const { policyIds } = body;

    if (!Array.isArray(policyIds) || policyIds.length < 2) {
      return NextResponse.json(
        { success: false, error: "En az 2 poliçe seçilmelidir." },
        { status: 400 }
      );
    }

    const policies = await getPoliciesByIds(policyIds, tenantId);

    if (policies.length !== policyIds.length) {
      return NextResponse.json(
        { success: false, error: "Poliçeler yüklenemedi." },
        { status: 403 }
      );
    }

    const pdfBytes = await generateComparisonPDF(policies);

    logger.info("PDF generated", "api/comparisons/pdf", { tenantId, policyCount: policies.length });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Police_Karsilastirma_${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    logger.error("PDF generation failed", "api/comparisons/pdf", { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: "PDF oluşturulamadı." },
      { status: 500 }
    );
  }
});
