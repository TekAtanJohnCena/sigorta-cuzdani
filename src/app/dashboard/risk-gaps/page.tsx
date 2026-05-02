"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { Policy, POLICY_TYPE_LABELS } from "@/types/policy";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import {
  SECTOR_DATA,
  SECTOR_OPTIONS,
  getMissingCoverages,
  SectorKey,
  COVERAGE_DETAILS,
} from "@/lib/data/sectorInsurance";
import { formatCurrency } from "@/lib/utils/currency";
import { calculatePortfolioScore } from "@/lib/engines/portfolioScoreEngine";
import { analyzeLimitAdequacy, LimitWarning } from "@/lib/engines/limitBenchmarkEngine";
import { getCompanyProfile } from "@/lib/firebase/firestore";
import { CompanyProfile } from "@/types/companyProfile";
import Link from "next/link";

export default function RiskGapsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<SectorKey>("teknoloji");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return; }
      if (!appUser) { setLoading(false); return; }
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setDbPolicies(data as Policy[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    async function loadProfile() {
      if (!appUser) return;
      try {
        const profile = await getCompanyProfile(appUser.tenantId);
        if (profile) {
          setCompanyProfile({
            sector: profile.sector as SectorKey,
            annualRevenue: profile.annualRevenue,
            employeeCount: profile.employeeCount,
          });
          setSelectedSector(profile.sector as SectorKey);
        }
      } catch (e) {
        console.error("Failed to load company profile", e);
      }
    }
    if (!authLoading) {
      load();
      loadProfile();
    }
  }, [appUser, authLoading, isDemoMode]);

  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;
  const activePolicies = policies.filter(p => p.status === "active");
  const existingTypes = activePolicies.map(p => p.policyType as string);
  const portfolioScore = calculatePortfolioScore(policies);

  const sector = SECTOR_DATA[selectedSector];

  const missingCoverages = useMemo(
    () => getMissingCoverages(selectedSector, existingTypes),
    [selectedSector, existingTypes]
  );

  const coveredInSector = useMemo(() => {
    const allRequired = [...sector.requiredTypes, ...sector.recommendedTypes];
    return allRequired.filter(t =>
      existingTypes.some(e =>
        e === t || COVERAGE_DETAILS[t]?.mapsToPolicyType === e
      )
    ).length;
  }, [sector, existingTypes]);

  const totalInSector = sector.requiredTypes.length + sector.recommendedTypes.length;
  const coveragePct = Math.round((coveredInSector / totalInSector) * 100);

  const criticalCount = missingCoverages.filter(m => m.severity === "critical").length;
  const warningCount = missingCoverages.filter(m => m.severity === "warning").length;

  const estimatedMissingCost = missingCoverages.reduce(
    (sum, m) => sum + (m.estimatedAnnualCost.min + m.estimatedAnnualCost.max) / 2,
    0
  );

  // Limit Benchmarking — sadece şirket profili varsa hesapla
  const limitWarnings: LimitWarning[] = useMemo(() => {
    if (!companyProfile || !companyProfile.annualRevenue) return [];
    return analyzeLimitAdequacy(policies, companyProfile);
  }, [policies, companyProfile]);

  const criticalLimitCount = limitWarnings.filter(w => w.severity === 'critical').length;

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">🎯 Risk Açığı Analizi</h1>
          <p className="page-subtitle">Sektörünüzde bulunması gereken ama eksik olan sigorta teminatları</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>Sektör:</label>
          <select
            className="input"
            style={{ width: "auto", minWidth: 220 }}
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value as SectorKey)}
          >
            {SECTOR_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stats-card" data-color={coveragePct >= 80 ? "green" : coveragePct >= 50 ? "amber" : "red"}>
          <div className="stats-icon">🛡️</div>
          <div className="stats-value">{coveragePct}<span style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>%</span></div>
          <div className="stats-label">Sektör Kapsam Oranı</div>
          <div className="stats-change" style={{ color: coveragePct >= 80 ? "var(--success-600)" : "var(--warning-600)", background: "transparent", padding: 0, marginTop: 4, fontSize: 11, fontWeight: 600 }}>
            {coveredInSector}/{totalInSector} teminat mevcut
          </div>
        </div>

        <div className="stats-card" data-color={criticalCount > 0 ? "red" : "green"}>
          <div className="stats-icon">🚨</div>
          <div className="stats-value">{criticalCount}</div>
          <div className="stats-label">Kritik Risk Açığı</div>
          <div className="stats-change negative" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            {criticalCount > 0 ? "Acil değerlendirme gerekli" : "Kritik açık yok"}
          </div>
        </div>

        <div className="stats-card" data-color="amber">
          <div className="stats-icon">⚠️</div>
          <div className="stats-value">{warningCount}</div>
          <div className="stats-label">İncelenmesi Gereken</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            Sektörde önerilen teminatlar
          </div>
        </div>

        <div className="stats-card" data-color="blue">
          <div className="stats-icon">💰</div>
          <div className="stats-value" style={{ fontSize: "var(--text-xl)" }}>{formatCurrency(estimatedMissingCost)}</div>
          <div className="stats-label">Tahmini Yıllık Koruma Maliyeti</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            Eksik teminatların ortalama priminin toplamı
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        {/* Sol: Risk Açıkları */}
        <div>
          <div className="card-header" style={{ marginBottom: "var(--space-4)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--neutral-200)" }}>
            <div className="card-title">Eksik Teminatlar</div>
          </div>

          {missingCoverages.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-12)", background: "var(--success-50)", border: "1px solid var(--success-200)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🎉</div>
              <h3 style={{ color: "var(--success-800)", marginBottom: "var(--space-2)" }}>Portföyünüz Sektörel Standartlara Uygun</h3>
              <p style={{ color: "var(--success-700)", fontSize: "var(--text-sm)" }}>
                {sector.label} sektörü için önerilen tüm teminat alanları portföyünüzde mevcut.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {missingCoverages.map(coverage => (
                <div
                  key={coverage.key}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${coverage.severity === "critical" ? "var(--danger-500)" : coverage.severity === "warning" ? "var(--warning-500)" : "var(--info-500)"}`,
                    padding: "var(--space-5)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.8rem" }}>{coverage.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-primary)" }}>{coverage.label}</div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                          padding: "2px 8px", borderRadius: 4,
                          background: coverage.severity === "critical" ? "var(--danger-100)" : coverage.severity === "warning" ? "var(--warning-100)" : "var(--info-100)",
                          color: coverage.severity === "critical" ? "var(--danger-800)" : coverage.severity === "warning" ? "var(--warning-800)" : "var(--info-800)",
                        }}>
                          {coverage.severity === "critical" ? "KRİTİK EKSİK" : coverage.severity === "warning" ? "ÖNERİLEN" : "BİLGİ"}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 2 }}>Tahmini Yıllık Prim</div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                        {formatCurrency(coverage.estimatedAnnualCost.min)} – {formatCurrency(coverage.estimatedAnnualCost.max)}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 var(--space-3)" }}>
                    {coverage.detail}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    <span style={{ background: "var(--neutral-100)", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                      📊 {sector.label} sektöründeki şirketlerin %{coverage.adoptionRate}&apos;i bu teminata sahip
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Mevcut Portföy & Benchmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

          {/* Sektör Özeti */}
          <div className="card" style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--primary-900)", marginBottom: "var(--space-3)" }}>
              {sector.label}
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--primary-700)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>
              {sector.description}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Sektör Ort. Poliçe Adedi</span>
                <span style={{ fontWeight: 700 }}>{sector.benchmarks.avgPolicyCount} poliçe</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Kişi Başı Yıllık Prim</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(sector.benchmarks.avgPremiumPerEmployee)}</span>
              </div>
              {sector.benchmarks.cyberInsuranceAdoption && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Siber Sigorta Penetrasyonu</span>
                  <span style={{ fontWeight: 700 }}>%{sector.benchmarks.cyberInsuranceAdoption}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>En Büyük Sektör Riski</span>
                <span style={{ fontWeight: 600, color: "var(--danger-700)", textAlign: "right", maxWidth: 120 }}>{sector.benchmarks.topRisk}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Sizin Poliçe Adediz</span>
                <span style={{ fontWeight: 700, color: activePolicies.length >= sector.benchmarks.avgPolicyCount ? "var(--success-600)" : "var(--warning-600)" }}>
                  {activePolicies.length} poliçe {activePolicies.length < sector.benchmarks.avgPolicyCount ? "⚠️" : "✅"}
                </span>
              </div>
            </div>
          </div>

          {/* Mevcut Portföy Check Listesi */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
              Portföy Kontrol Listesi
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...sector.requiredTypes, ...sector.recommendedTypes].map(typeKey => {
                const isCovered = existingTypes.some(e =>
                  e === typeKey || COVERAGE_DETAILS[typeKey]?.mapsToPolicyType === e
                );
                const isRequired = sector.requiredTypes.includes(typeKey);
                const detail = COVERAGE_DETAILS[typeKey];
                const label = detail?.label ||
                  POLICY_TYPE_LABELS[typeKey as keyof typeof POLICY_TYPE_LABELS] ||
                  typeKey;

                return (
                  <div key={typeKey} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", padding: "6px 8px", borderRadius: "var(--radius-sm)", background: isCovered ? "var(--success-50)" : isRequired ? "var(--danger-50)" : "var(--neutral-50)" }}>
                    <span style={{ fontSize: 14 }}>{isCovered ? "✅" : isRequired ? "❌" : "⚠️"}</span>
                    <span style={{ flex: 1, fontWeight: isCovered ? 500 : 600, color: isCovered ? "var(--success-800)" : isRequired ? "var(--danger-800)" : "var(--warning-800)" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: isRequired ? "var(--danger-100)" : "var(--neutral-200)", color: isRequired ? "var(--danger-700)" : "var(--text-tertiary)" }}>
                      {isRequired ? "Zorunlu" : "Önerilen"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Limit Benchmarking Bölümü */}
      {limitWarnings.length > 0 && (
        <div style={{ marginBottom: "var(--space-8)" }}>
          <div className="card-header" style={{ marginBottom: "var(--space-4)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--neutral-200)" }}>
            <div className="card-title">📏 Yetersiz Teminat Limitleri</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {limitWarnings.map((warning, idx) => (
              <div
                key={`limit-${idx}`}
                className="card"
                style={{
                  borderLeft: `4px solid ${warning.severity === 'critical' ? 'var(--danger-500)' : 'var(--warning-500)'}`,
                  padding: "var(--space-5)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.8rem" }}>📏</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-primary)" }}>
                        {warning.policyLabel} — {warning.insuranceCompany}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                        padding: "2px 8px", borderRadius: 4,
                        background: warning.severity === 'critical' ? "var(--danger-100)" : "var(--warning-100)",
                        color: warning.severity === 'critical' ? "var(--danger-800)" : "var(--warning-800)",
                      }}>
                        {warning.severity === 'critical' ? `LİMİT %${warning.gapPercent} YETERSİZ` : `LİMİT %${warning.gapPercent} DÜŞÜK`}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 2 }}>Mevcut → Önerilen</div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>
                      <span style={{ color: "var(--danger-600)" }}>{formatCurrency(warning.currentLimit)}</span>
                      {" → "}
                      <span style={{ color: "var(--success-600)" }}>{formatCurrency(warning.recommendedLimit)}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 var(--space-3)" }}>
                  {warning.explanation}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, background: "var(--neutral-100)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, 100 - warning.gapPercent)}%`,
                      background: warning.severity === 'critical'
                        ? "linear-gradient(90deg, var(--danger-400), var(--danger-600))"
                        : "linear-gradient(90deg, var(--warning-400), var(--warning-600))",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)" }}>
                    {Math.min(100, 100 - warning.gapPercent)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profil yoksa bilgi mesajı */}
      {!companyProfile && (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)", background: "var(--info-50)", border: "1px solid var(--info-200)", marginBottom: "var(--space-8)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>📏</div>
          <h3 style={{ color: "var(--info-800)", marginBottom: "var(--space-2)", fontSize: "var(--text-base)" }}>Teminat Limit Analizi İçin Şirket Profilinizi Girin</h3>
          <p style={{ color: "var(--info-700)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", maxWidth: 500, margin: "0 auto var(--space-4)" }}>
            Ayarlar sayfasından şirketinizin yıllık cirosunu ve çalışan sayısını girerek, poliçe limitlerinin sektörel standartlara uygunluğunu analiz edebilirsiniz.
          </p>
          <Link href="/dashboard/settings" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
            ⚙️ Şirket Profilini Ayarla
          </Link>
        </div>
      )}
    </div>
  );
}
