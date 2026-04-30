"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { POLICY_TYPE_LABELS } from "@/types/policy";
import { getQuotesForPolicy, SEARCH_STEPS, MockQuote } from "@/lib/mockQuoteData";

function QuoteEngineContent() {
  const searchParams = useSearchParams();
  const policyType = (searchParams.get("policyType") || "kasko") as any;
  const currentPremium = parseFloat(searchParams.get("currentPremium") || "0");
  const company = searchParams.get("company") || "Mevcut Şirket";

  const [phase, setPhase] = useState<"searching" | "results">("searching");
  const [stepIndex, setStepIndex] = useState(0);
  const [quotes, setQuotes] = useState<MockQuote[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<MockQuote | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Step through search animation
    const interval = setInterval(() => {
      setStepIndex(i => {
        if (i >= SEARCH_STEPS.length - 1) {
          clearInterval(interval);
          const q = getQuotesForPolicy(policyType, currentPremium);
          setQuotes(q);
          setTimeout(() => setPhase("results"), 600);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [policyType, currentPremium]);

  const bestQuote = quotes.length > 0 ? [...quotes].sort((a, b) => a.annualPremium - b.annualPremium)[0] : null;
  const maxSaving = bestQuote && currentPremium > 0 ? currentPremium - bestQuote.annualPremium : 0;

  function handleSelect(q: MockQuote) {
    setSelectedQuote(q);
    setShowModal(true);
  }

  // ── SEARCH PHASE ──
  if (phase === "searching") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-6)" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary-500), #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, animation: "pulse-glow 2s ease-in-out infinite"
        }}>🔍</div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Piyasa Taranıyor...
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 440 }}>
            {POLICY_TYPE_LABELS[policyType] || policyType} poliçeniz için {company}'ın mevcut teklifini 15 farklı şirketle karşılaştırıyoruz.
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ width: "100%", height: 6, background: "var(--neutral-200)", borderRadius: 99, marginBottom: "var(--space-4)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, var(--primary-500), #7c3aed)",
              width: `${((stepIndex + 1) / SEARCH_STEPS.length) * 100}%`,
              transition: "width 0.8s ease"
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {SEARCH_STEPS.map((step, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                opacity: i <= stepIndex ? 1 : 0.3, transition: "opacity 0.4s"
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: i < stepIndex ? "var(--success-500)" : i === stepIndex ? "var(--primary-500)" : "var(--neutral-300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "white", fontWeight: 800
                }}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: i === stepIndex ? 600 : 400, color: i === stepIndex ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS PHASE ──
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/dashboard/renewals" style={{ color: "var(--primary-600)", fontSize: "var(--text-sm)", fontWeight: 500, textDecoration: "none" }}>
          ← Yenileme Merkezine Dön
        </Link>
      </div>

      <h1 className="page-title" style={{ marginBottom: "var(--space-2)" }}>Karşılaştırma Raporu</h1>
      <p className="page-subtitle" style={{ marginBottom: "var(--space-6)" }}>
        {POLICY_TYPE_LABELS[policyType]} poliçeniz için 15 şirketten derlenen en iyi teklifler
      </p>

      {/* Savings Header */}
      {maxSaving > 0 && (
        <div style={{
          background: "linear-gradient(135deg, var(--success-600), #059669)",
          borderRadius: "var(--radius-xl)", padding: "var(--space-5) var(--space-6)",
          marginBottom: "var(--space-6)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)"
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 4 }}>💰 Potansiyel Tasarruf</div>
            <div style={{ color: "white", fontSize: "var(--text-3xl)", fontWeight: 900 }}>{formatCurrency(maxSaving)}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)" }}>
              mevcut priminize ({formatCurrency(currentPremium)}) kıyasla yıllık %{Math.round((maxSaving / currentPremium) * 100)} daha ucuz
            </div>
          </div>
          <div style={{ fontSize: 48 }}>🎯</div>
        </div>
      )}

      {/* Current Policy */}
      <div className="card" style={{ marginBottom: "var(--space-4)", borderLeft: "4px solid var(--neutral-300)", background: "var(--neutral-50)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Mevcut Poliçeniz</div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{company}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "var(--text-primary)" }}>{formatCurrency(currentPremium)}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>yıllık prim</div>
          </div>
        </div>
      </div>

      {/* Quote Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        {quotes.sort((a, b) => a.annualPremium - b.annualPremium).map((q, idx) => {
          const saving = currentPremium > 0 ? currentPremium - q.annualPremium : 0;
          const isFirst = idx === 0;
          return (
            <div key={q.id} className="card card-hover" style={{
              borderLeft: isFirst ? "4px solid var(--success-500)" : "4px solid var(--border-light)",
              position: "relative", overflow: "visible"
            }}>
              {q.badge && (
                <div style={{
                  position: "absolute", top: -10, right: 16,
                  background: isFirst ? "var(--success-500)" : "var(--primary-500)",
                  color: "white", borderRadius: 99, padding: "2px 12px",
                  fontSize: "var(--text-xs)", fontWeight: 700
                }}>{q.badge}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <div style={{ fontSize: 32, width: 52, height: 52, borderRadius: "var(--radius-md)", background: "var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {q.logo}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{q.company}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {"★".repeat(q.rating).split("").map((_, i) => (
                        <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
                      ))}
                      <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-xs)", marginLeft: 6 }}>Müşteri puanı: {q.customerScore}/100</span>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
                      {q.coverageSummary.map(c => (
                        <span key={c} style={{ background: "var(--primary-50)", color: "var(--primary-700)", borderRadius: 99, padding: "1px 8px", fontSize: "var(--text-xs)", fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: "var(--text-2xl)", color: isFirst ? "var(--success-600)" : "var(--text-primary)" }}>
                      {formatCurrency(q.annualPremium)}
                    </div>
                    {saving > 0 && (
                      <div style={{ color: "var(--success-600)", fontSize: "var(--text-sm)", fontWeight: 700 }}>
                        -{formatCurrency(saving)} tasarruf
                      </div>
                    )}
                    {saving < 0 && (
                      <div style={{ color: "var(--danger-500)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                        +{formatCurrency(Math.abs(saving))} daha pahalı
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSelect(q)}
                    style={{
                      background: isFirst ? "linear-gradient(135deg, var(--success-500), var(--success-600))" : "linear-gradient(135deg, var(--primary-500), #7c3aed)",
                      color: "white", border: "none", borderRadius: "var(--radius-md)",
                      padding: "var(--space-3) var(--space-5)", fontWeight: 700, cursor: "pointer",
                      fontSize: "var(--text-sm)", whiteSpace: "nowrap"
                    }}>
                    Bu Teklifi Seç →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }}
          onClick={() => { setShowModal(false); setSubmitted(false); }}>
          <div style={{
            background: "var(--bg-secondary)", borderRadius: "var(--radius-2xl)",
            padding: "var(--space-8)", maxWidth: 480, width: "90%",
            boxShadow: "var(--shadow-2xl)", animation: "scaleIn 0.25s ease-out"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
              <div style={{ fontSize: 56, marginBottom: "var(--space-3)" }}>🚀</div>
              <h2 style={{ fontWeight: 900, fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
                Çok Yakında!
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong>{selectedQuote?.company}</strong> ile online yenileme entegrasyonumuz tamamlanmak üzere. Bu özelliği ilk kullananlardan olmak için bekleme listesine katılın.
              </p>
            </div>

            {!submitted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <input
                  type="email" placeholder="E-posta adresiniz" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  style={{ textAlign: "center", fontSize: "var(--text-base)" }}
                />
                <button onClick={() => { if (email) setSubmitted(true); }}
                  style={{
                    background: "linear-gradient(135deg, var(--primary-500), #7c3aed)",
                    color: "white", border: "none", borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)", fontWeight: 700, cursor: "pointer", fontSize: "var(--text-base)"
                  }}>
                  🔔 Beni Bilgilendir
                </button>
                <div style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                  247 şirket zaten bekleme listesinde
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", background: "var(--success-50)", border: "1px solid var(--success-200)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>✅</div>
                <div style={{ fontWeight: 700, color: "var(--success-700)" }}>Listeye eklendiniz!</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--success-600)", marginTop: 4 }}>Özellik hazır olduğunda sizi ilk biz bilgilendireceğiz.</div>
              </div>
            )}

            <button onClick={() => { setShowModal(false); setSubmitted(false); }}
              style={{ width: "100%", marginTop: "var(--space-4)", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "var(--text-sm)" }}>
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteEnginePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}><p style={{ color: "var(--text-tertiary)" }}>Yükleniyor...</p></div>}>
      <QuoteEngineContent />
    </Suspense>
  );
}
