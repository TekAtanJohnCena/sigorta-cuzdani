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
      color: "text-green-600",
      bgColor: "bg-green-100",
      ringColor: "text-green-500",
      label: "Mükemmel",
      icon: "✅",
      description: "Portföyünüz çok iyi durumda",
    };
  } else if (score >= 60) {
    return {
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      ringColor: "text-blue-500",
      label: "İyi",
      icon: "👍",
      description: "Birkaç iyileştirme yapılabilir",
    };
  } else if (score >= 40) {
    return {
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      ringColor: "text-yellow-500",
      label: "Orta",
      icon: "⚠️",
      description: "Önemli eksiklikler tespit edildi",
    };
  } else {
    return {
      color: "text-red-600",
      bgColor: "bg-red-100",
      ringColor: "text-red-500",
      label: "Düşük",
      icon: "🚨",
      description: "Acil aksiyonlar gerekli",
    };
  }
}

export function InsuranceHealthScore({ score, breakdown }: InsuranceHealthScoreProps) {
  const config = getScoreConfig(score);

  // Calculate stroke dasharray for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">{config.icon}</span>
        Sigorta Sağlık Skoru
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className={`${config.ringColor} transition-all duration-1000 ease-out`}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${config.color}`}>{score}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
          <div className={`mt-4 ${config.bgColor} ${config.color} px-4 py-2 rounded-full font-semibold`}>
            {config.label}
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{config.description}</p>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Detaylı Analiz
            </h3>

            <div className="space-y-3">
              {/* Critical Issues */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-lg">🚨</span>
                  <span className="text-sm font-medium text-gray-700">Kritik Sorunlar</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{breakdown.criticalIssues}</span>
              </div>

              {/* Warnings */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <span className="text-sm font-medium text-gray-700">Uyarılar</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{breakdown.warningIssues}</span>
              </div>

              {/* Coverage Gaps */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-lg">📋</span>
                  <span className="text-sm font-medium text-gray-700">Teminat Boşlukları</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{breakdown.coverageGaps}</span>
              </div>

              {/* Optimization Score */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">💡</span>
                  <span className="text-sm font-medium text-gray-700">Optimizasyon Fırsatları</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{breakdown.optimization}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation CTA */}
      {score < 70 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 AI Önerisi:</strong> Skorunuzu artırmak için aşağıdaki önerilere göz atın.
            Kritik sorunları çözerek portföyünüzü güçlendirebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
