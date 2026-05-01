"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDemo } from "@/lib/context/DemoContext";
import { useAuth } from "@/lib/firebase/AuthContext";
import { usePolicies } from "@/lib/hooks/usePolicies";
import { MOCK_POLICIES } from "@/lib/mockData";
import { calculatePortfolioScore } from "@/lib/engines/portfolioScoreEngine";
import { daysUntil, formatDateShort } from "@/lib/utils/date";
import { POLICY_TYPE_LABELS } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";

export default function RightPanel() {
  const { appUser } = useAuth();
  const { isDemoMode } = useDemo();
  const { policies: dbPolicies } = usePolicies(isDemoMode ? null : appUser?.tenantId);
  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;

  const { score, grade, label, expiringPolicies, upcomingPayments, totalPolicies } = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === "active");
    const portfolioScore = calculatePortfolioScore(policies);

    const expiringPolicies = activePolicies
      .filter((p) => {
        const days = daysUntil(p.endDate);
        return days >= 0 && days <= 90;
      })
      .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate))
      .slice(0, 3);

    const upcomingPayments: { id: string; amount: number; dueDate: string; policyName: string; company: string }[] = [];
    activePolicies.forEach((p) => {
      if (p.premium.paymentType === "installment" && p.premium.installments) {
        p.premium.installments.forEach((inst) => {
          if (inst.status === "pending") {
            upcomingPayments.push({
              id: inst.id || `${p.id}-inst`,
              amount: inst.amount,
              dueDate: inst.dueDate,
              policyName: p.policyType,
              company: p.insuranceCompany,
            });
          }
        });
      }
    });

    const sortedPayments = upcomingPayments
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    return {
      score: portfolioScore.overall,
      grade: portfolioScore.grade,
      label: portfolioScore.label,
      expiringPolicies,
      upcomingPayments: sortedPayments,
      totalPolicies: activePolicies.length,
    };
  }, [policies]);

  const scoreColor =
    score >= 75
      ? { ring: "#22C55E", bg: "rgba(34,197,94,0.08)", text: "#15803D" }
      : score >= 55
      ? { ring: "#F59E0B", bg: "rgba(245,158,11,0.08)", text: "#D97706" }
      : { ring: "#EF4444", bg: "rgba(239,68,68,0.08)", text: "#DC2626" };

  const circumference = 2 * Math.PI * 44; // radius=44
  const dashOffset = circumference - (score / 100) * circumference;

  if (totalPolicies === 0) return null;

  return (
    <aside className="right-panel">
      {/* Portföy Skoru */}
      <div className="rp-card">
        <div className="rp-card-label">Portföy Skoru</div>
        <div className="rp-score-ring-wrapper">
          <svg width="110" height="110" viewBox="0 0 110 110" className="rp-score-svg">
            <circle cx="55" cy="55" r="44" fill="none" stroke="var(--neutral-100)" strokeWidth="8" />
            <circle
              cx="55"
              cy="55"
              r="44"
              fill="none"
              stroke={scoreColor.ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="rp-score-center">
            <div className="rp-score-value">{score}</div>
            <div className="rp-score-max">/100</div>
          </div>
        </div>
        <div className="rp-score-grade" style={{ color: scoreColor.text, background: scoreColor.bg }}>
          {grade} Sınıfı · {label}
        </div>
        <Link href="/dashboard/ai-analysis" className="rp-link-btn">
          AI Analizi Görüntüle →
        </Link>
      </div>

      {/* Yaklaşan Vadeler */}
      {expiringPolicies.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-card-label">⏰ Yaklaşan Vadeler</div>
            <Link href="/dashboard/policies?status=expiring" className="rp-see-all">Tümü</Link>
          </div>
          <div className="rp-list">
            {expiringPolicies.map((p) => {
              const days = daysUntil(p.endDate);
              const urgency = days <= 14 ? "critical" : days <= 30 ? "warning" : "normal";
              return (
                <Link href={`/dashboard/policies`} key={p.id} className={`rp-list-item rp-urgency-${urgency}`}>
                  <div className="rp-list-item-left">
                    <div className="rp-list-item-title">
                      {POLICY_TYPE_LABELS[p.policyType as keyof typeof POLICY_TYPE_LABELS] || p.policyType}
                    </div>
                    <div className="rp-list-item-sub">{p.insuranceCompany}</div>
                  </div>
                  <div className="rp-list-item-right">
                    <div className={`rp-days-badge rp-days-${urgency}`}>{days}g</div>
                    <div className="rp-list-item-date">{formatDateShort(p.endDate)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Yaklaşan Ödemeler */}
      {upcomingPayments.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-card-label">💳 Yaklaşan Ödemeler</div>
            <Link href="/dashboard/calendar" className="rp-see-all">Takvim</Link>
          </div>
          <div className="rp-list">
            {upcomingPayments.map((pay, idx) => (
              <div key={idx} className="rp-list-item rp-payment-item">
                <div className="rp-list-item-left">
                  <div className="rp-list-item-title">
                    {POLICY_TYPE_LABELS[pay.policyName as keyof typeof POLICY_TYPE_LABELS] || pay.policyName}
                  </div>
                  <div className="rp-list-item-sub">{pay.company}</div>
                </div>
                <div className="rp-list-item-right">
                  <div className="rp-payment-amount">{formatCurrency(pay.amount)}</div>
                  <div className="rp-list-item-date">{formatDateShort(pay.dueDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı Eylemler */}
      <div className="rp-card rp-quick-actions">
        <div className="rp-card-label">Hızlı Eylemler</div>
        <div className="rp-actions-grid">
          <Link href="/dashboard/upload" className="rp-action-btn">
            <span className="rp-action-icon">📤</span>
            <span>PDF Yükle</span>
          </Link>
          <Link href="/dashboard/ai-analysis" className="rp-action-btn rp-action-ai">
            <span className="rp-action-icon">🤖</span>
            <span>AI Analiz</span>
          </Link>
          <Link href="/dashboard/renewals" className="rp-action-btn">
            <span className="rp-action-icon">🔄</span>
            <span>Yenileme</span>
          </Link>
          <Link href="/dashboard/risk-gaps" className="rp-action-btn">
            <span className="rp-action-icon">🎯</span>
            <span>Risk</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
