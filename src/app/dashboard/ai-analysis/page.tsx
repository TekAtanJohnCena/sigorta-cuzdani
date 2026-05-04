"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { getLastAnalysisByTenant } from "@/lib/firebase/firestore.client";
import type { AIAnalysisResult } from "@/lib/mockData";
import { InsuranceHealthScore } from "@/components/ai/InsuranceHealthScore";
import { CrossPolicyInsightCard } from "@/components/ai/CrossPolicyInsightCard";
import "@/styles/ai-analysis.css"; // Özel AI Analiz Stilleri

const LOADING_STEPS = [
  "Poliçe havuzu taranıyor...",
  "Çapraz teminat haritası çıkarılıyor...",
  "Maliyet & risk açık noktaları saptanıyor...",
  "Aktüeryal skor hesaplanıyor...",
];

export default function AiAnalysisPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Load last analysis on mount
  useEffect(() => {
    async function loadLast() {
      if (isDemoMode) {
        setLoadingInitial(false);
        return;
      }
      if (!appUser) return;
      
      try {
        const last = await getLastAnalysisByTenant(appUser.tenantId);
        if (last) {
          setAiAnalysis(last as unknown as AIAnalysisResult);
          setHasStarted(true);
        }
      } catch (err) {
        console.error("Failed to load last analysis", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    
    if (!authLoading) {
      loadLast();
    }
  }, [appUser, authLoading, isDemoMode]);

  // Loading steps animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          if (prev >= LOADING_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  async function handleAnalyzePortfolio() {
    if (!appUser && !isDemoMode) return;
    
    setHasStarted(true);
    setAnalyzing(true);
    setAiAnalysis(null);
    
    if (isDemoMode) {
      // Lazy load mock data
      import("@/lib/mockData").then(({ MOCK_AI_ANALYSIS }) => {
        setTimeout(() => {
          setAiAnalysis(MOCK_AI_ANALYSIS);
          setAnalyzing(false);
        }, 4000); // 4 saniye sürecek şık bir loading
      });
      return;
    }

    try {
      const res = await fetch("/api/ai/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: appUser?.tenantId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
      } else {
        alert(data.error || data.message || "Analiz sırasında bir hata oluştu.");
        setHasStarted(false);
      }
    } catch (err) {
      console.error(err);
      alert("Analiz başarısız oldu.");
      setHasStarted(false);
    } finally {
      setAnalyzing(false);
    }
  }

  if (authLoading || loadingInitial) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="ai-pulse-ring" style={{ width: 60, height: 60, fontSize: "2rem" }}>⏳</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">Yapay Zeka Portföy Analizi</h1>
        <p className="page-subtitle">Şirketinizin poliçe envanterini milyarlarca veri noktası üzerinden analiz eden, otonom risk ve maliyet değerlendirmesi.</p>
      </div>

      {!hasStarted && !aiAnalysis && (
        <div className="ai-hero-container">
          <div className="ai-hero-content">
            <div className="ai-icon-large">🧠</div>
            <h2 className="ai-title-gradient">Portföyünüzü Yeni Baştan Keşfedin</h2>
            <p className="ai-subtitle">
              Sigorta Cüzdanı AI, yüzlerce sayfalık karmaşık poliçe metinlerini analiz eder. Poliçeleriniz arasındaki gizli çakışmaları, gereksiz ödediğiniz risk primlerini ve şirketinizi tehdit eden koruma boşluklarını saniyeler içinde raporlar.
            </p>
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleAnalyzePortfolio}
              style={{
                fontSize: "1.1rem",
                padding: "var(--space-4) var(--space-8)",
                boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
                borderRadius: "var(--radius-full)"
              }}
            >
              ✨ Derin Analizi Başlat
            </button>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="ai-hero-container" style={{ padding: "var(--space-16) var(--space-6)" }}>
          <div className="ai-pulse-ring">
            🧠
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "var(--space-2)" }}>AI Portföyü Analiz Ediyor</h2>
          <p style={{ color: "var(--text-secondary)" }}>Lütfen bekleyin, bu işlem portföy büyüklüğüne göre birkaç saniye sürebilir.</p>
          
          <div className="ai-loading-steps">
            {LOADING_STEPS.map((step, idx) => {
              const isActive = idx === loadingStepIndex;
              const isDone = idx < loadingStepIndex;
              return (
                <div key={idx} className={`ai-loading-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <span>{isDone ? '✅' : isActive ? '⏳' : '⚪'}</span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {aiAnalysis && !analyzing && (
        <div className="animate-fade-in">
          <div className="ai-dashboard-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontSize: "2rem", background: "var(--success-100)", width: 56, height: 56, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center" }}>✅</div>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Analiz Raporu Tamamlandı</h2>
                <div style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: 4, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="badge badge-dot badge-success"></span>
                  Analiz Tarihi: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
            <button onClick={handleAnalyzePortfolio} className="btn btn-secondary btn-sm" style={{ padding: "var(--space-2) var(--space-4)" }}>🔄 Yeniden Tarama Yap</button>
          </div>

          <div className="ai-grid-2">
            <div style={{ gridColumn: "1 / -1" }}>
              {/* Skore Tablosu */}
              <InsuranceHealthScore
                score={aiAnalysis.riskSkoru}
                breakdown={{
                  criticalIssues: aiAnalysis.riskAciklari?.filter((r) => r.riskSeviyesi === 'yuksek').length || 0,
                  warningIssues: aiAnalysis.riskAciklari?.filter((r) => r.riskSeviyesi !== 'yuksek').length || 0,
                  coverageGaps: aiAnalysis.riskAciklari?.length || 0,
                  optimization: aiAnalysis.optimizasyonOnerileri?.length || 0,
                }}
              />
            </div>
          </div>

          {/* Aktüeryal Değerlendirme & Tasarruf */}
          <div className="card" style={{ marginBottom: "var(--space-6)", backgroundColor: "var(--primary-50)", border: "1px solid var(--primary-200)", backgroundImage: "linear-gradient(120deg, var(--bg-secondary), var(--primary-50))", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontSize: "0.9rem", color: "var(--primary-700)", textTransform: "uppercase", fontWeight: 800, marginBottom: "8px", letterSpacing: "0.05em" }}>Aktüeryal Değerlendirme Özeti</h3>
              <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--primary-900)", lineHeight: 1.6, margin: 0 }}>&quot;{aiAnalysis.ozet}&quot;</p>
            </div>

            {aiAnalysis.toplamTahminiTasarruf > 0 && (
              <div style={{ background: "linear-gradient(135deg, var(--success-500), var(--success-600))", color: "white", padding: "16px 24px", borderRadius: "var(--radius-lg)", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)", minWidth: 200, flexShrink: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 6, color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em" }}>Yıllık Net Tasarruf Potansiyeli</div>
                <div style={{ fontSize: "2rem", fontWeight: 900 }}>{formatCurrency(aiAnalysis.toplamTahminiTasarruf)}</div>
              </div>
            )}
          </div>

          <div className="ai-grid-2">
            {/* Çakışmalar */}
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔄</span> Çapraz Poliçe Çakışmaları
              </h3>
              
              {aiAnalysis.cakismalar && aiAnalysis.cakismalar.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {aiAnalysis.cakismalar.map((c, i) => (
                    <CrossPolicyInsightCard
                      key={i}
                      insight={{
                        type: "overlap",
                        title: c.teminatAdi,
                        description: c.aciklama,
                        affectedPolicies: c.ilgiliPoliceler || [],
                        potentialSavings: c.tahminiBosaOdenenTutar,
                        recommendation: "Bu çakışan teminatları optimize ederek gereksiz prim giderlerinden kurtulabilirsiniz.",
                        priority: c.tahminiBosaOdenenTutar > 5000 ? "high" : c.tahminiBosaOdenenTutar > 2000 ? "medium" : "low",
                      }}
                      onAction={(actionType) => {
                        if (actionType === "optimize_coverage") {
                          alert("✂️ Teminat optimizasyon modülü yakında aktif edilecek.");
                        } else if (actionType === "view_details") {
                          alert("📊 Poliçe karşılaştırma ekranı yükleniyor...");
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="card" style={{ borderTop: "4px solid var(--success-500)", textAlign: "center", padding: "var(--space-8)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>✅</div>
                  <h4 style={{ color: "var(--success-700)", marginBottom: "var(--space-2)" }}>Temiz Portföy</h4>
                  <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Portföyünüzde prim israfı yaratan herhangi bir çakışma bulunmuyor.</p>
                </div>
              )}
            </div>

            {/* Risk Açıkları */}
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🚨</span> Kritik Teminat Boşlukları
              </h3>
              
              {aiAnalysis.riskAciklari?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {aiAnalysis.riskAciklari.map((r, i) => (
                    <CrossPolicyInsightCard
                      key={i}
                      insight={{
                        type: "gap",
                        title: r.eksikTeminat,
                        description: r.aciklama,
                        affectedPolicies: [r.ilgiliPoliceTipi],
                        riskExposure: r.riskSeviyesi === 'yuksek' ? 50000 : 25000,
                        recommendation: `Bu açık şirketiniz için finansal tehdit oluşturuyor. ${r.ilgiliPoliceTipi} kapsamına acilen ekletilmesi önerilir.`,
                        priority: r.riskSeviyesi === 'yuksek' ? "high" : "medium",
                      }}
                      onAction={(actionType) => {
                        if (actionType === "close_gap") {
                          alert("🛡️ Teminat satın alma & zeyilname talebi ekranı açılıyor.");
                        } else if (actionType === "view_details") {
                          alert("📊 Risk analiz detayı yükleniyor.");
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="card" style={{ borderTop: "4px solid var(--success-500)", textAlign: "center", padding: "var(--space-8)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>🛡️</div>
                  <h4 style={{ color: "var(--success-700)", marginBottom: "var(--space-2)" }}>Kapsamlı Koruma</h4>
                  <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Mevcut operasyonlarınız için kritik bir teminat açığı bulunmuyor.</p>
                </div>
              )}
            </div>
            
            {/* Optimizasyon Önerileri */}
            {aiAnalysis.optimizasyonOnerileri?.length > 0 && (
              <div style={{ gridColumn: "1 / -1", marginTop: "var(--space-4)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>💡</span> Yönetim ve İyileştirme Tavsiyeleri
                </h3>
                <div className="ai-grid-3">
                  {aiAnalysis.optimizasyonOnerileri.map((o, i) => (
                    <div key={i} className="card card-hover" style={{ borderTop: "3px solid var(--primary-500)", height: "100%" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.05rem", marginBottom: "8px" }}>{o.baslik}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{o.aciklama}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limit Uyarıları */}
            {aiAnalysis.limitUyarilari && aiAnalysis.limitUyarilari.length > 0 && (
              <div style={{ gridColumn: "1 / -1", marginTop: "var(--space-4)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📏</span> Teminat Limiti Yetersizlikleri
                </h3>
                <div className="ai-grid-2">
                  {aiAnalysis.limitUyarilari.map((l, i) => (
                    <div key={i} className="card" style={{ borderLeft: "4px solid var(--warning-500)", padding: "var(--space-5)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.05rem" }}>{l.policeTipi || "Poliçe"}</div>
                        {l.mevcutLimit != null && l.onerilenLimit != null && (
                          <div style={{ textAlign: "right", fontSize: "0.85rem", background: "var(--bg-primary)", padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                            <span style={{ color: "var(--danger-600)", fontWeight: 700 }}>{formatCurrency(l.mevcutLimit)}</span>
                            <span style={{ color: "var(--text-tertiary)", margin: "0 6px" }}>→</span>
                            <span style={{ color: "var(--success-600)", fontWeight: 700 }}>{formatCurrency(l.onerilenLimit)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{l.aciklama}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
