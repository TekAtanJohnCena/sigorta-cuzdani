"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { getLastAnalysisByTenant } from "@/lib/firebase/firestore";
import type { AIAnalysisResult } from "@/lib/mockData";
import { InsuranceHealthScore } from "@/components/ai/InsuranceHealthScore";
import { CrossPolicyInsightCard } from "@/components/ai/CrossPolicyInsightCard";

export default function AiAnalysisPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

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

  async function handleAnalyzePortfolio() {
    if (!appUser && !isDemoMode) return;
    
    setHasStarted(true);
    setAnalyzing(true);
    setAiAnalysis(null);
    
    if (isDemoMode) {
      // G-12: Lazy load mock data
      import("@/lib/mockData").then(({ MOCK_AI_ANALYSIS }) => {
        setTimeout(() => {
          setAiAnalysis(MOCK_AI_ANALYSIS);
          setAnalyzing(false);
        }, 2000); // Give user time to see the analysis pulse
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
        <p style={{ color: "var(--text-tertiary)" }}>Analizler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">Yapay Zeka Portföy Analizi</h1>
        <p className="page-subtitle">Kıdemli Risk Analistimiz, poliçelerinizdeki israf ve zafiyetleri tarıyor.</p>
      </div>

      {!hasStarted && !aiAnalysis && (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-12)", background: "var(--primary-50)", border: "1px solid var(--primary-200)" }}>
          <div style={{ fontSize: "5rem", marginBottom: "var(--space-4)" }}>🤖</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-900)", marginBottom: "var(--space-2)" }}>Kapsamlı Portföy Röntgeni</h2>
          <p style={{ maxWidth: 600, margin: "0 auto var(--space-6)", color: "var(--primary-700)", lineHeight: 1.6 }}>
            Portföyünüzü saniyeler içinde baştan uca tarar. Çakışan teminatları, gereksiz ödediğiniz primleri ve şirketinizi riske atan poliçe eksikliklerini raporlar. Uzman düzeyindeki tasarruf önerilerini incelemek için analiz başlatın.
          </p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleAnalyzePortfolio}
            style={{ 
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              border: "none",
              boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)"
            }}
          >
            ✨ Portföyü Analiz Et
          </button>
        </div>
      )}

      {analyzing && (
        <div style={{ textAlign: "center", padding: "var(--space-12)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="pulse-circle" style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--primary-500)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white" }}>
            🧠
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Yapay Zeka Analizi Sürüyor...</h2>
          <p style={{ color: "var(--text-tertiary)" }}>Çakışmalar aranıyor, risk primleri hesaplanıyor.</p>
        </div>
      )}

      {aiAnalysis && !analyzing && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "2rem", background: "var(--success-100)", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✅</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Analiz Raporu Tamamlandı</h2>
                <div style={{ color: "var(--text-tertiary)", fontSize: "0.9rem", marginTop: 2 }}>{new Date().toLocaleString()}</div>
              </div>
            </div>
            <button onClick={handleAnalyzePortfolio} className="btn btn-secondary btn-sm">🔄 Yeniden Analiz Et</button>
          </div>

          {/* Insurance Health Score */}
          <InsuranceHealthScore
            score={aiAnalysis.riskSkoru}
            breakdown={{
              criticalIssues: aiAnalysis.riskAciklari?.filter((r) => r.riskSeviyesi === 'yuksek').length || 0,
              warningIssues: aiAnalysis.riskAciklari?.filter((r) => r.riskSeviyesi !== 'yuksek').length || 0,
              coverageGaps: aiAnalysis.riskAciklari?.length || 0,
              optimization: aiAnalysis.optimizasyonOnerileri?.length || 0,
            }}
          />

          <div className="card" style={{ marginBottom: "var(--space-6)", backgroundColor: "var(--primary-50)", border: "1px solid var(--primary-200)", backgroundImage: "linear-gradient(120deg, var(--primary-50), white)", display: "flex", gap: "2rem", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1rem", color: "var(--primary-700)", textTransform: "uppercase", fontWeight: 800, marginBottom: "8px", letterSpacing: "0.5px" }}>Aktüeryal Değerlendirme Özeti</h3>
              <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--primary-900)", lineHeight: 1.6, margin: 0 }}>&quot;{aiAnalysis.ozet}&quot;</p>
            </div>

            {aiAnalysis.toplamTahminiTasarruf > 0 && (
              <div style={{ background: "linear-gradient(135deg, var(--success-500), var(--success-600))", color: "white", padding: "12px 20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", minWidth: 160 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4, color: "rgba(255,255,255,0.9)" }}>Yıllık Net Tasarruf</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>{formatCurrency(aiAnalysis.toplamTahminiTasarruf)}</div>
              </div>
            )}
          </div>

          {/* Cross-Policy Insights - Çakışmalar */}
          {aiAnalysis.cakismalar && aiAnalysis.cakismalar.length > 0 && (
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--warning-800)" }}>
                🔄 Çapraz Poliçe Analizleri
              </h3>
              {aiAnalysis.cakismalar.map((c, i) => (
                <CrossPolicyInsightCard
                  key={i}
                  insight={{
                    type: "overlap",
                    title: c.teminatAdi,
                    description: c.aciklama,
                    affectedPolicies: c.ilgiliPoliceler || [],
                    potentialSavings: c.tahminiBosaOdenenTutar,
                    recommendation: "Bu çakışan teminatları optimize ederek yıllık prim giderinizi azaltabilirsiniz.",
                    priority: c.tahminiBosaOdenenTutar > 5000 ? "high" : c.tahminiBosaOdenenTutar > 2000 ? "medium" : "low",
                  }}
                  onAction={(actionType) => {
                    if (actionType === "optimize_coverage") {
                      alert("✂️ Teminat optimizasyon özelliği yakında aktif olacak.");
                    } else if (actionType === "view_details") {
                      alert("📊 Detaylı analiz sayfası hazırlanıyor.");
                    }
                  }}
                />
              ))}
            </div>
          )}

          <div className="grid-2">
            {/* Çakışmalar - Legacy fallback */}
            {(!aiAnalysis.cakismalar || aiAnalysis.cakismalar.length === 0) && (
              <div className="card" style={{ borderTop: "4px solid var(--warning-500)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-6)" }}>
                  <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--warning-800)" }}>Gereksiz Ödenen Primler (Çakışmalar)</h3>
                </div>
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--neutral-50)", borderRadius: 8, color: "var(--text-tertiary)" }}>
                  Portföyünüzde prim israfı yaratan çakışan teminat bulunamadı.
                </div>
              </div>
            )}

            {/* Risk Açıkları - Using CrossPolicyInsightCard */}
            {aiAnalysis.riskAciklari?.length > 0 ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--danger-800)" }}>
                  🚨 Felaket Senaryoları (Teminat Açıkları)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {aiAnalysis.riskAciklari.map((r, i) => (
                    <CrossPolicyInsightCard
                      key={i}
                      insight={{
                        type: "gap",
                        title: r.eksikTeminat,
                        description: r.aciklama,
                        affectedPolicies: [r.ilgiliPoliceTipi],
                        riskExposure: r.riskSeviyesi === 'yuksek' ? 50000 : 25000,
                        recommendation: `Bu teminat eksikliğini ${r.ilgiliPoliceTipi} poliçesi ile kapatmanız önerilir.`,
                        priority: r.riskSeviyesi === 'yuksek' ? "high" : "medium",
                      }}
                      onAction={(actionType) => {
                        if (actionType === "close_gap") {
                          alert("🛡️ Teminat boşluğu kapatma özelliği yakında eklenecek.");
                        } else if (actionType === "view_details") {
                          alert("📊 Detaylı risk analizi hazırlanıyor.");
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ borderTop: "4px solid var(--danger-500)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-6)" }}>
                  <span style={{ fontSize: "1.5rem" }}>🚨</span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--danger-800)" }}>Felaket Senaryoları (Teminat Açıkları)</h3>
                </div>
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--neutral-50)", borderRadius: 8, color: "var(--text-tertiary)" }}>
                  Portföyünüz ana hatlarıyla güvende. Kritik bir risk açığı tespit edilmedi.
                </div>
              </div>
            )}
            
            {/* Optimizasyon Önerileri */}
            {aiAnalysis.optimizasyonOnerileri?.length > 0 && (
              <div className="card" style={{ borderTop: "4px solid var(--primary-500)", gridColumn: "1 / -1", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-6)" }}>
                  <span style={{ fontSize: "1.5rem" }}>💡</span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--primary-800)" }}>Yönetim ve Tasarruf Tavsiyeleri</h3>
                </div>
                
                <div className="grid-2">
                  {aiAnalysis.optimizasyonOnerileri.map((o, i) => (
                    <div key={i} style={{ padding: "1.25rem", backgroundColor: "white", borderRadius: "8px", border: "1px solid var(--neutral-200)", borderLeft: "4px solid var(--primary-400)" }}>
                      <div style={{ fontWeight: 800, color: "var(--neutral-900)", fontSize: "1.1rem", marginBottom: "8px" }}>{o.baslik}</div>
                      <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{o.aciklama}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limit Uyarıları (AI tarafından üretilir) */}
            {aiAnalysis.limitUyarilari && aiAnalysis.limitUyarilari.length > 0 && (
              <div className="card" style={{ borderTop: "4px solid var(--info-500)", gridColumn: "1 / -1", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-6)" }}>
                  <span style={{ fontSize: "1.5rem" }}>📏</span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--info-800)" }}>Teminat Limit Uyarıları</h3>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {aiAnalysis.limitUyarilari.map((l, i) => (
                    <div key={i} style={{ padding: "1.25rem", backgroundColor: "white", borderRadius: "8px", border: "1px solid var(--neutral-200)", borderLeft: "4px solid var(--info-400)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ fontWeight: 800, color: "var(--neutral-900)", fontSize: "1.1rem" }}>{l.policeTipi || "Poliçe"}</div>
                        {l.mevcutLimit != null && l.onerilenLimit != null && (
                          <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--danger-600)", fontWeight: 700 }}>{formatCurrency(l.mevcutLimit)}</span>
                            {" → "}
                            <span style={{ color: "var(--success-600)", fontWeight: 700 }}>{formatCurrency(l.onerilenLimit)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{l.aciklama}</div>
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
