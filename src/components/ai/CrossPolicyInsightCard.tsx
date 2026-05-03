"use client";

import React from "react";
import type { CrossPolicyInsight, InsightType, InsightPriority } from "@/lib/ai/types";

interface CrossPolicyInsightCardProps {
  insight: CrossPolicyInsight;
  onAction?: (actionType: string) => void;
}

const TYPE_CONFIG = {
  overlap: {
    icon: "🔄",
    label: "Çakışan Teminat",
    typeClass: "type-overlap",
  },
  gap: {
    icon: "⚠️",
    label: "Koruma Boşluğu",
    typeClass: "type-gap",
  },
  inefficiency: {
    icon: "💸",
    label: "Maliyet Verimsizliği",
    typeClass: "type-inefficiency",
  },
  concentration_risk: {
    icon: "🎯",
    label: "Konsantrasyon Riski",
    typeClass: "type-concentration_risk",
  },
} as const;

const PRIORITY_CONFIG = {
  high: {
    badgeClass: "badge-red",
    label: "YÜKSEK ÖNCELİK",
  },
  medium: {
    badgeClass: "badge-amber",
    label: "ORTA ÖNCELİK",
  },
  low: {
    badgeClass: "badge-blue",
    label: "DÜŞÜK ÖNCELİK",
  },
} as const;

export function CrossPolicyInsightCard({ insight, onAction }: CrossPolicyInsightCardProps) {
  const typeConfig = TYPE_CONFIG[insight.type];
  const priorityConfig = PRIORITY_CONFIG[insight.priority];

  return (
    <div className={`ai-insight-card ${typeConfig.typeClass}`}>
      {/* Header */}
      <div className="ai-insight-header">
        <span className="ai-insight-icon" role="img" aria-label={typeConfig.label}>
          {typeConfig.icon}
        </span>
        <div className="ai-insight-content">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span className={`badge ${priorityConfig.badgeClass}`} style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
              {priorityConfig.label}
            </span>
            <span className="badge badge-type" style={{ fontSize: "0.7rem" }}>
              {typeConfig.label}
            </span>
          </div>
          <h3 className="ai-insight-title">
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="ai-insight-description">
        {insight.description}
      </p>

      {/* Affected Policies */}
      {insight.affectedPolicies && insight.affectedPolicies.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>
            Etkilenen Poliçeler:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {insight.affectedPolicies.map((policyId, idx) => (
              <span
                key={idx}
                style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-primary)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-light)", fontFamily: "monospace", color: "var(--text-secondary)" }}
              >
                {policyId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Financial Impact */}
      <div className="ai-grid-2" style={{ marginBottom: "16px" }}>
        {insight.potentialSavings !== undefined && insight.potentialSavings > 0 && (
          <div className="ai-value-card" style={{ backgroundColor: "var(--success-50)", borderColor: "var(--success-200)" }}>
            <span className="ai-value-label" style={{ color: "var(--success-700)" }}>
              💰 Potansiyel Tasarruf
            </span>
            <p className="ai-value-amount" style={{ color: "var(--success-800)" }}>
              {insight.potentialSavings.toLocaleString("tr-TR")} TL
            </p>
          </div>
        )}
        {insight.riskExposure !== undefined && insight.riskExposure > 0 && (
          <div className="ai-value-card" style={{ backgroundColor: "var(--danger-50)", borderColor: "var(--danger-200)" }}>
            <span className="ai-value-label" style={{ color: "var(--danger-700)" }}>
              ⚠️ Risk Tutarı
            </span>
            <p className="ai-value-amount" style={{ color: "var(--danger-800)" }}>
              {insight.riskExposure.toLocaleString("tr-TR")} TL
            </p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>💡 Uzman Önerisi:</span>
        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", margin: 0 }}>{insight.recommendation}</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
        {insight.type === "overlap" && (
          <button
            onClick={() => onAction?.("optimize_coverage")}
            className="btn btn-primary btn-sm"
          >
            ✂️ Teminatı Optimize Et
          </button>
        )}
        {insight.type === "gap" && (
          <button
            onClick={() => onAction?.("close_gap")}
            className="btn btn-primary btn-sm"
          >
            🛡️ Boşluğu Kapat
          </button>
        )}
        {insight.type === "concentration_risk" && (
          <button
            onClick={() => onAction?.("diversify")}
            className="btn btn-primary btn-sm"
          >
            🔀 Dağıtımı İyileştir
          </button>
        )}
      </div>
    </div>
  );
}
