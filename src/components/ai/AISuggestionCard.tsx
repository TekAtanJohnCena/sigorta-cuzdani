"use client";

import React from "react";
import type { RiskAlert, RiskSeverity } from "@/lib/ai/types";

interface AISuggestionCardProps {
  alert: RiskAlert;
  onAction?: (actionType: string) => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    badgeColor: "bg-red-600",
    icon: "🚨",
    label: "KRİTİK",
  },
  WARNING: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-900",
    badgeColor: "bg-yellow-600",
    icon: "⚠️",
    label: "UYARI",
  },
  INFO: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    badgeColor: "bg-blue-600",
    icon: "ℹ️",
    label: "BİLGİ",
  },
} as const;

const CATEGORY_LABELS = {
  exclusion: "İstisna Maddesi",
  deductible: "Yüksek Muafiyet",
  coverage_gap: "Teminat Eksikliği",
  limit_inadequacy: "Yetersiz Limit",
  claim_barrier: "Hasar Engeli",
} as const;

export function AISuggestionCard({ alert, onAction }: AISuggestionCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} border-l-4 rounded-lg p-4 md:p-6 mb-4 transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl" role="img" aria-label={config.label}>
            {config.icon}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`${config.badgeColor} text-white text-xs font-bold px-2 py-1 rounded uppercase`}
              >
                {config.label}
              </span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {CATEGORY_LABELS[alert.category]}
              </span>
              {alert.regulatoryRisk && (
                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                  📋 TSB Uyarısı
                </span>
              )}
            </div>
            <h3 className="text-base md:text-lg font-bold mt-2">{alert.title}</h3>
          </div>
        </div>
        {alert.confidenceScore && (
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs text-gray-500">Güven</span>
            <span className="text-sm font-bold">%{alert.confidenceScore}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm md:text-base leading-relaxed mb-4">{alert.description}</p>

      {/* Affected Coverages */}
      {alert.affectedCoverages && alert.affectedCoverages.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 block mb-1">
            Etkilenen Teminatlar:
          </span>
          <div className="flex flex-wrap gap-1">
            {alert.affectedCoverages.map((coverage, idx) => (
              <span
                key={idx}
                className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded border border-gray-300"
              >
                {coverage}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Financial Impact */}
      {alert.financialImpact && (
        <div className="mb-3 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
          <span className="text-xs font-semibold text-gray-600 block mb-1">
            💰 Finansal Etki:
          </span>
          <p className="text-sm">{alert.financialImpact}</p>
        </div>
      )}

      {/* Industry Benchmark */}
      {alert.industryBenchmark && (
        <div className="mb-3 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
          <span className="text-xs font-semibold text-gray-600 block mb-1">
            📊 Piyasa Karşılaştırması:
          </span>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-500">Standart:</span>
              <p className="font-semibold">{alert.industryBenchmark.typical}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Sizinki:</span>
              <p className="font-semibold text-red-700">{alert.industryBenchmark.current}</p>
            </div>
          </div>
          {alert.industryBenchmark.deviation !== undefined && (
            <p className="text-xs text-gray-600 mt-1">
              Fark: {alert.industryBenchmark.deviation > 0 ? "+" : ""}
              {alert.industryBenchmark.deviation.toFixed(0)}%
            </p>
          )}
        </div>
      )}

      {/* Remediation Steps */}
      {alert.remediationSteps && alert.remediationSteps.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-semibold text-gray-600 block mb-2">
            🔧 Düzeltme Adımları:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {alert.remediationSteps.map((step, idx) => (
              <li key={idx} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
          {alert.estimatedRemediationCost && (
            <p className="text-xs text-gray-600 mt-2">
              Tahmini ek prim: ~{alert.estimatedRemediationCost.toLocaleString("tr-TR")} TL/yıl
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
        {alert.severity === "CRITICAL" && (
          <button
            onClick={() => onAction?.("contact_agent")}
            className="btn-primary text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            📞 Acentemle Paylaş
          </button>
        )}
        {alert.category === "coverage_gap" && (
          <button
            onClick={() => onAction?.("request_amendment")}
            className="btn-secondary text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            📝 Zeyilname Talep Et
          </button>
        )}
        {alert.category === "limit_inadequacy" && (
          <button
            onClick={() => onAction?.("increase_limit")}
            className="btn-secondary text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            📈 Limiti Artır
          </button>
        )}
        <button
          onClick={() => onAction?.("learn_more")}
          className="text-sm px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          📖 Daha Fazla Bilgi
        </button>
      </div>
    </div>
  );
}
