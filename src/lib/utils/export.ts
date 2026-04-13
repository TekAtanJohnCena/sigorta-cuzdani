import { Policy, POLICY_TYPE_LABELS, POLICY_STATUS_LABELS } from "@/types/policy";
import { formatDateShort } from "./date";

/**
 * Escapes CSV special characters and encloses in quotes to handle commas/newlines
 */
function escapeCSV(text: string | null | undefined): string {
  if (!text) return '""';
  const str = String(text);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports a list of policies to a CSV file and triggers browser download
 */
export function exportPoliciesToCSV(policies: Policy[]) {
  // UTF-8 BOM helps Excel recognize the encoding correctly for Turkish chars
  const BOM = "\uFEFF";

  const headers = [
    "Durum",
    "Poliçe Türü",
    "Poliçe No",
    "Sigorta Şirketi",
    "Acente",
    "Başlangıç Tarihi",
    "Bitiş (Vade) Tarihi",
    "Toplam Prim",
    "Para Birimi",
    "Ödeme Şekli",
    "Taksit Sayısı",
    "AI Güven Skoru (%)"
  ];

  const rows = policies.map((p) => {
    return [
      POLICY_STATUS_LABELS[p.status],
      POLICY_TYPE_LABELS[p.policyType] || p.policyType,
      p.policyNumber,
      p.insuranceCompany,
      p.agencyName,
      p.startDate ? formatDateShort(p.startDate) : "",
      p.endDate ? formatDateShort(p.endDate) : "",
      p.premium.totalPremium.toString(),
      p.premium.currency,
      p.premium.paymentType === "installment" ? "Taksitli" : "Peşin",
      p.premium.paymentType === "installment" ? (p.premium.installmentCount?.toString() || "") : "1",
      p.aiExtraction.confidenceScore.toString()
    ].map(escapeCSV).join(",");
  });

  const csvContent = BOM + headers.map(escapeCSV).join(",") + "\n" + rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Sigorta_Portfoyu_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
