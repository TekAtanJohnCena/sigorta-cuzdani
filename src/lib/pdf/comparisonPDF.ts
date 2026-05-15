import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";

export async function generateComparisonPDF(policies: Record<string, unknown>[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let yPosition = height - 50;

  page.drawText("Police Karsilastirma Raporu", {
    x: 50,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0.2, 0.5),
  });

  yPosition -= 30;

  const colWidth = 180;
  const startX = 50;

  page.drawText("Ozellik", { x: startX, y: yPosition, size: 10, font: boldFont });

  policies.forEach((policy, idx) => {
    page.drawText(`Police ${idx + 1}`, {
      x: startX + (idx + 1) * colWidth,
      y: yPosition,
      size: 10,
      font: boldFont,
    });
  });

  yPosition -= 25;

  const rows = [
    { label: "Police No", getValue: (p: Record<string, unknown>) => String(p.policyNumber || "-") },
    { label: "Sirket", getValue: (p: Record<string, unknown>) => String(p.insuranceCompany || "-") },
    { label: "Toplam Prim", getValue: (p: Record<string, unknown>) => formatCurrency((p.premium as { totalPremium?: number })?.totalPremium || 0) },
    { label: "Baslangic", getValue: (p: Record<string, unknown>) => formatDateShort(p.startDate as string) },
    { label: "Bitis", getValue: (p: Record<string, unknown>) => formatDateShort(p.endDate as string) },
  ];

  rows.forEach((row) => {
    page.drawText(row.label, { x: startX, y: yPosition, size: 9, font });

    policies.forEach((policy, idx) => {
      page.drawText(row.getValue(policy), {
        x: startX + (idx + 1) * colWidth,
        y: yPosition,
        size: 9,
        font,
      });
    });

    yPosition -= 20;
  });

  page.drawText(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
