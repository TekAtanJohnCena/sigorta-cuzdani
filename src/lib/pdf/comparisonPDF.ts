import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Policy } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";

export async function generateComparisonPDF(policies: Policy[]): Promise<Uint8Array> {
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
    { label: "Police No", getValue: (p: Policy) => p.policyNumber },
    { label: "Sirket", getValue: (p: Policy) => p.insuranceCompany },
    { label: "Toplam Prim", getValue: (p: Policy) => formatCurrency(p.premium.totalPremium) },
    { label: "Baslangic", getValue: (p: Policy) => formatDateShort(p.startDate) },
    { label: "Bitis", getValue: (p: Policy) => formatDateShort(p.endDate) },
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
