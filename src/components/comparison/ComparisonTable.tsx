"use client";

import { Policy, POLICY_TYPE_LABELS } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";

interface ComparisonTableProps {
  policies: Policy[];
}

export function ComparisonTable({ policies }: ComparisonTableProps) {
  const rows = [
    { label: "Poliçe Tipi", getValue: (p: Policy) => POLICY_TYPE_LABELS[p.policyType] },
    { label: "Poliçe No", getValue: (p: Policy) => p.policyNumber },
    { label: "Sigorta Şirketi", getValue: (p: Policy) => p.insuranceCompany },
    { label: "Acente", getValue: (p: Policy) => p.agencyName },
    { label: "Başlangıç", getValue: (p: Policy) => formatDateShort(p.startDate) },
    { label: "Bitiş", getValue: (p: Policy) => formatDateShort(p.endDate) },
    { label: "Net Prim", getValue: (p: Policy) => formatCurrency(p.premium.netPremium), highlight: true },
    { label: "Vergiler", getValue: (p: Policy) => formatCurrency((p.premium.bsmv || 0) + (p.premium.thgf || 0)) },
    { label: "Toplam Prim", getValue: (p: Policy) => formatCurrency(p.premium.totalPremium), highlight: true },
    { label: "Ödeme Tipi", getValue: (p: Policy) => p.premium.paymentType === "installment" ? "Taksitli" : "Peşin" },
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th style={{ position: "sticky", left: 0, background: "var(--bg-primary)", zIndex: 10 }}>Özellik</th>
            {policies.map((policy, idx) => (
              <th key={policy.id}>Poliçe {idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const values = policies.map((p) => row.getValue(p));
            const allSame = values.every((v) => v === values[0]);

            return (
              <tr key={row.label}>
                <td style={{ position: "sticky", left: 0, background: "var(--bg-primary)", fontWeight: 600 }}>
                  {row.label}
                </td>
                {policies.map((policy, idx) => (
                  <td
                    key={policy.id}
                    style={{
                      background: row.highlight && !allSame ? "var(--warning-50)" : undefined,
                      fontWeight: row.highlight ? 700 : undefined,
                    }}
                  >
                    {values[idx]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
