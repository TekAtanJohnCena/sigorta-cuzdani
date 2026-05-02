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
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  gap: {
    icon: "⚠️",
    label: "Koruma Boşluğu",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  inefficiency: {
    icon: "💸",
    label: "Maliyet Verimsizliği",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  concentration_risk: {
    icon: "🎯",
    label: "Konsantrasyon Riski",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
} as const;

const PRIORITY_CONFIG = {
  high: {
    badge: "bg-red-600 text-white",
    label: "YÜKSEK",
  },
  medium: {
    badge: "bg-yellow-600 text-white",
    label: "ORTA",
  },
  low: {
    badge: "bg-blue-600 text-white",
    label: "DÜŞÜK",
  },
} as const;

export function CrossPolicyInsightCard({ insight, onAction }: CrossPolicyInsightCardProps) {
  const typeConfig = TYPE_CONFIG[insight.type];
  const priorityConfig = PRIORITY_CONFIG[insight.priority];

  return (
    <div
      className={`${typeConfig.bgColor} ${typeConfig.borderColor} border-l-4 rounded-lg p-4 md:p-6 mb-4 transition-all hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl" role="img" aria-label={typeConfig.label}>
            {typeConfig.icon}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`${priorityConfig.badge} text-xs font-bold px-2 py-1 rounded uppercase`}>
                {priorityConfig.label}
              </span>
              <span
                className={`${typeConfig.color} bg-white bg-opacity-60 text-xs font-semibold px-2 py-1 rounded border ${typeConfig.borderColor}`}
              >
                {typeConfig.label}
              </span>
            </div>
            <h3 className={`text-base md:text-lg font-bold ${typeConfig.color}`}>
              {insight.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm md:text-base text-gray-800 leading-relaxed mb-4">
        {insight.description}
      </p>

      {/* Affected Policies */}
      {insight.affectedPolicies && insight.affectedPolicies.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 block mb-1">
            Etkilenen Poliçeler:
          </span>
          <div className="flex flex-wrap gap-1">
            {insight.affectedPolicies.map((policyId, idx) => (
              <span
                key={idx}
                className="text-xs bg-white bg-opacity-80 px-2 py-1 rounded border border-gray-300 font-mono"
              >
                {policyId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Financial Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {insight.potentialSavings !== undefined && insight.potentialSavings > 0 && (
          <div className="p-3 bg-green-100 rounded-lg border border-green-300">
            <span className="text-xs font-semibold text-green-700 block mb-1">
              💰 Potansiyel Tasarruf
            </span>
            <p className="text-lg font-bold text-green-800">
              {insight.potentialSavings.toLocaleString("tr-TR")} TL
            </p>
          </div>
        )}
        {insight.riskExposure !== undefined && insight.riskExposure > 0 && (
          <div className="p-3 bg-red-100 rounded-lg border border-red-300">
            <span className="text-xs font-semibold text-red-700 block mb-1">
              ⚠️ Risk Tutarı
            </span>
            <p className="text-lg font-bold text-red-800">
              {insight.riskExposure.toLocaleString("tr-TR")} TL
            </p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200">
        <span className="text-xs font-semibold text-gray-600 block mb-1">💡 Öneri:</span>
        <p className="text-sm text-gray-800">{insight.recommendation}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-300">
        {insight.type === "overlap" && (
          <button
            onClick={() => onAction?.("optimize_coverage")}
            className="btn-primary text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            ✂️ Teminatı Optimize Et
          </button>
        )}
        {insight.type === "gap" && (
          <button
            onClick={() => onAction?.("close_gap")}
            className="btn-primary text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            🛡️ Boşluğu Kapat
          </button>
        )}
        {insight.type === "concentration_risk" && (
          <button
            onClick={() => onAction?.("diversify")}
            className="btn-primary text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            🔀 Dağıtımı İyileştir
          </button>
        )}
        <button
          onClick={() => onAction?.("view_details")}
          className="btn-secondary text-sm px-4 py-2 rounded-md border border-gray-400 hover:bg-white transition-colors"
        >
          📊 Detayları Gör
        </button>
      </div>
    </div>
  );
}
