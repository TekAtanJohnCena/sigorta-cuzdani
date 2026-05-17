import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency } from "@/lib/utils/currency";

interface RiskGap {
  label: string;
  severity: "critical" | "warning" | "info";
  detail: string;
  estimatedAnnualCost: { min: number; max: number };
  adoptionRate: number;
}

interface RiskReportData {
  tenantId: string;
  sectorLabel: string;
  coverageScore: number;
  criticalCount: number;
  warningCount: number;
  gaps: RiskGap[];
  totalPolicies: number;
  estimatedMissingCost: number;
}

export async function generateRiskReportPDF(data: RiskReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const { height, width } = page.getSize();
  let yPosition = height - 60;

  // Header
  page.drawText("Sigorta Portfolyo Risk Raporu", {
    x: 50,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0, 0.2, 0.5),
  });

  yPosition -= 20;
  page.drawText(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  yPosition -= 40;

  // Portfolio Score Section
  page.drawText("PORTFOLYO SKORU", {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  yPosition -= 25;

  const scoreColor = data.coverageScore >= 80
    ? rgb(0.13, 0.59, 0.13) // green
    : data.coverageScore >= 50
    ? rgb(0.85, 0.55, 0) // amber
    : rgb(0.8, 0, 0); // red

  const grade = data.coverageScore >= 90 ? "A"
    : data.coverageScore >= 80 ? "B"
    : data.coverageScore >= 70 ? "C"
    : data.coverageScore >= 60 ? "D"
    : "F";

  page.drawText(`Kapsam Orani: ${data.coverageScore}% (Derece: ${grade})`, {
    x: 70,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: scoreColor,
  });

  yPosition -= 20;
  page.drawText(`Sektor: ${data.sectorLabel}`, {
    x: 70,
    y: yPosition,
    size: 10,
    font,
  });

  yPosition -= 18;
  page.drawText(`Aktif Police Adedi: ${data.totalPolicies}`, {
    x: 70,
    y: yPosition,
    size: 10,
    font,
  });

  yPosition -= 18;
  page.drawText(`Kritik Risk Acigi: ${data.criticalCount}`, {
    x: 70,
    y: yPosition,
    size: 10,
    font,
    color: data.criticalCount > 0 ? rgb(0.8, 0, 0) : rgb(0.2, 0.2, 0.2),
  });

  yPosition -= 18;
  page.drawText(`Uyari Seviyesinde Risk: ${data.warningCount}`, {
    x: 70,
    y: yPosition,
    size: 10,
    font,
    color: data.warningCount > 0 ? rgb(0.85, 0.55, 0) : rgb(0.2, 0.2, 0.2),
  });

  yPosition -= 18;
  page.drawText(`Tahmini Eksik Teminat Maliyeti: ${formatCurrency(data.estimatedMissingCost)}/yil`, {
    x: 70,
    y: yPosition,
    size: 10,
    font,
  });

  yPosition -= 40;

  // Risk Gaps Section
  if (data.gaps.length > 0) {
    page.drawText("TESPIT EDILEN RISK ACIKLARI", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPosition -= 25;

    let currentPage = page;

    for (const gap of data.gaps) {
      // Check if we need a new page
      if (yPosition < 100) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = height - 60;
      }

      const severityLabel = gap.severity === "critical"
        ? "KRITIK"
        : gap.severity === "warning"
        ? "ONERILEN"
        : "BILGI";

      const severityColor = gap.severity === "critical"
        ? rgb(0.8, 0, 0)
        : gap.severity === "warning"
        ? rgb(0.85, 0.55, 0)
        : rgb(0, 0.4, 0.8);

      // Gap title
      currentPage.drawText(`${severityLabel}: ${gap.label}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: severityColor,
      });

      yPosition -= 18;

      // Gap detail - wrap text if too long
      const detailText = gap.detail.length > 75 ? gap.detail.substring(0, 72) + "..." : gap.detail;
      currentPage.drawText(detailText, {
        x: 70,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: width - 140,
      });

      yPosition -= 16;

      // Cost estimate
      const costText = `Tahmini Prim: ${formatCurrency(gap.estimatedAnnualCost.min)} - ${formatCurrency(gap.estimatedAnnualCost.max)}`;
      currentPage.drawText(costText, {
        x: 70,
        y: yPosition,
        size: 9,
        font,
      });

      yPosition -= 14;

      // Adoption rate
      currentPage.drawText(`Sektorde benimseme orani: %${gap.adoptionRate}`, {
        x: 70,
        y: yPosition,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      yPosition -= 25;
    }
  } else {
    page.drawText("TEBRIKLER!", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.13, 0.59, 0.13),
    });

    yPosition -= 25;

    page.drawText("Portfolyunuz sektorel standartlara tam uyumlu.", {
      x: 70,
      y: yPosition,
      size: 10,
      font,
    });
  }

  // Footer
  page.drawText("Bu rapor otomatik olusturulmustur.", {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText("Sigorta Cuzdani - Risk Analizi Modulu", {
    x: 50,
    y: 28,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
