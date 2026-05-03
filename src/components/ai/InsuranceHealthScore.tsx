"use client";

import React from "react";

interface InsuranceHealthScoreProps {
  score: number; // 0-100
  breakdown?: {
    criticalIssues: number;
    warningIssues: number;
    coverageGaps: number;
    optimization: number;
  };
}

function getScoreConfig(score: number) {
  if (score >= 80) {
    return {
      colorClass: "ai-text-gradient-success",
      badgeClass: "badge-green",
      ringColor: "var(--success-500)",
      label: "Mükemmel",
      icon: "✅",
      description: "Portföyünüz çok iyi durumda. Riskler optimize edilmiş.",
    };
  } else if (score >= 60) {
    return {
      colorClass: "ai-text-gradient-success",
      badgeClass: "badge-teal",
      ringColor: "var(--accent-500)",
      label: "İyi",
      icon: "👍",
      description: "Güvenli bölgedesiniz ancak bazı iyileştirmeler yapılabilir.",
    };
  } else if (score >= 40) {
    return {
      colorClass: "ai-text-gradient-warning",
      badgeClass: "badge-amber",
      ringColor: "var(--warning-500)",
      label: "Orta",
      icon: "⚠️",
      description: "Dikkat! Önemli teminat eksiklikleri tespit edildi.",
    };
  } else {
    return {
      colorClass: "ai-text-gradient-danger",
      badgeClass: "badge-red",
      ringColor: "var(--danger-500)",
      label: "Düşük",
      icon: "🚨",
      description: "Kritik seviye. Acil aksiyon almanız gerekiyor.",
    };
  }
}

export function InsuranceHealthScore({ score, breakdown }: InsuranceHealthScoreProps) {
  const config = getScoreConfig(score);

  // Circular progress calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from circumference (0%) to 0 (100%) in strokeDashoffset
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <div className="card mb-6">
      <div className="card-header">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.25rem" }}>
          <span>{config.icon}</span>
          Sigorta Sağlık Skoru
        </h2>
      </div>

      <div className="ai-grid-2" style={{ alignItems: "center" }}>
        {/* Score Gauge */}
        <div className="ai-score-card">
          <div style={{ position: "relative", width: "200px", height: "200px" }}>
            <svg className="ai-score-ring" width="200" height="200" viewBox="0 0 200 200">
              <circle
                className="ai-score-circle-bg"
                cx="100"
                cy="100"
                r={radius}
                strokeWidth="14"
                fill="none"
              />
              <circle
                className="ai-score-circle-progress"
                cx="100"
                cy="100"
                r={radius}
                stroke={config.ringColor}
                strokeWidth="14"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="ai-score-text-container">
              <span className={`ai-score-value ${config.colorClass}`}>{score}</span>
              <span className="ai-score-max">/ 100</span>
            </div>
          </div>
          
          <div className={`badge ${config.badgeClass} ai-score-label`}>
            {config.label}
          </div>
          <p style={{ marginTop: "12px", color: "var(--text-secondary)", textAlign: "center", maxWidth: "250px", fontSize: "0.9rem" }}>
            {config.description}
          </p>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em", marginBottom: "12px" }}>
              Detaylı Analiz Metrikleri
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Critical Issues */}
              <div className="ai-breakdown-item" style={{ backgroundColor: "var(--danger-50)", borderColor: "var(--danger-100)" }}>
                <div className="ai-flex-start">
                  <span style={{ fontSize: "1.2rem" }}>🚨</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Kritik Sorunlar</span>
                </div>
                <span className="ai-breakdown-value" style={{ color: "var(--danger-600)" }}>{breakdown.criticalIssues}</span>
              </div>

              {/* Warnings */}
              <div className="ai-breakdown-item" style={{ backgroundColor: "var(--warning-50)", borderColor: "var(--warning-100)" }}>
                <div className="ai-flex-start">
                  <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Uyarılar</span>
                </div>
                <span className="ai-breakdown-value" style={{ color: "var(--warning-600)" }}>{breakdown.warningIssues}</span>
              </div>

              {/* Coverage Gaps */}
              <div className="ai-breakdown-item" style={{ backgroundColor: "var(--info-50)", borderColor: "var(--info-100)" }}>
                <div className="ai-flex-start">
                  <span style={{ fontSize: "1.2rem" }}>📋</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Teminat Boşlukları</span>
                </div>
                <span className="ai-breakdown-value" style={{ color: "var(--info-600)" }}>{breakdown.coverageGaps}</span>
              </div>

              {/* Optimization Score */}
              <div className="ai-breakdown-item" style={{ backgroundColor: "var(--success-50)", borderColor: "var(--success-100)" }}>
                <div className="ai-flex-start">
                  <span style={{ fontSize: "1.2rem" }}>💡</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Optimizasyon Fırsatları</span>
                </div>
                <span className="ai-breakdown-value" style={{ color: "var(--success-600)" }}>{breakdown.optimization}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {score < 70 && (
        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "var(--info-50)", border: "1px solid var(--info-200)", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--info-900)", margin: 0 }}>
            <strong>💡 AI Önerisi:</strong> Skorunuzu artırmak için aşağıdaki önerilere göz atın.
            Kritik sorunları çözerek ve çakışan poliçeleri optimize ederek prim maliyetlerinizi düşürebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
