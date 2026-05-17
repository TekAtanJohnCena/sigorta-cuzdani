"use client";

import { useState } from "react";
import Link from "next/link";
import "@/app/landing.css"; // Ensure landing typography is available

export default function DemoRequestPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    policyCount: "",
    message: "",
    date: "",
    time: "",
  });

  const nextStep = () => {
    // Basic validation before step 2
    if (!formData.name || !formData.email || !formData.company || !formData.phone || !formData.policyCount) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      alert("Lütfen tarih ve saat seçin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Demo talebi gönderilemedi');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Demo request failed:', error);
      alert(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Next 7 days
    if (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 2); // Skip weekend roughly
    }
    return d.toISOString().split("T")[0];
  });

  const availableTimes = ["10:00", "11:30", "13:00", "14:30", "16:00"];

  if (isSuccess) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, var(--primary-600), var(--accent-600))", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)" }}>
        <div className="card" style={{ maxWidth: 600, width: "100%", padding: "var(--space-8)", textAlign: "center", animation: "fade-in 0.5s ease" }}>
          <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }}>✅</div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Demo Talebiniz Alındı!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Sayın {formData.name}, demo toplantısı talebiniz başarıyla ekibimize iletilmiştir. {formData.date} saat {formData.time} için programınız oluşturuldu. Gerekli toplantı bağlantısı e-posta adresinize ({formData.email}) gönderilecektir.
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, var(--primary-600), var(--accent-600))", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6)" }}>
      <div className="card" style={{ maxWidth: 640, width: "100%", margin: "0 auto", padding: "var(--space-8)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--primary-600)" }}>Sigorta Cüzdanı</span>
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-primary)" }}>Bir Demo Planlayalım</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>Ekibimizle kişiselleştirilmiş bir demo görüşmesi oluşturun</p>
        </div>

        {/* Steps Indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: step >= 1 ? "var(--primary-600)" : "var(--neutral-200)", color: step >= 1 ? "white" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>1</div>
          <div style={{ width: 40, height: 2, background: step >= 2 ? "var(--primary-600)" : "var(--neutral-200)", alignSelf: "center" }} />
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: step >= 2 ? "var(--primary-600)" : "var(--neutral-200)", color: step >= 2 ? "white" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>2</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)", color: "var(--text-primary)" }}>Kişisel Bilgiler</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <div>
                  <label className="input-label">Ad Soyad *</label>
                  <input type="text" className="input" style={{ width: "100%" }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Email Adresi *</label>
                  <input type="email" className="input" style={{ width: "100%" }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <div>
                  <label className="input-label">Şirket Adı *</label>
                  <input type="text" className="input" style={{ width: "100%" }} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Telefon Numarası *</label>
                  <input type="tel" className="input" style={{ width: "100%" }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>

              <div style={{ marginBottom: "var(--space-4)" }}>
                <label className="input-label">Tahmini Poliçe Sayısı *</label>
                <select className="input" style={{ width: "100%" }} value={formData.policyCount} onChange={e => setFormData({...formData, policyCount: e.target.value})} required>
                  <option value="" disabled>Poliçe sayısını seçin</option>
                  <option value="0-50">0 - 50</option>
                  <option value="50-100">50 - 100</option>
                  <option value="100-500">100 - 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div style={{ marginBottom: "var(--space-6)" }}>
                <label className="input-label">Ekstra Mesaj (İsteğe Bağlı)</label>
                <textarea className="input" style={{ width: "100%", height: 80, resize: "none" }} placeholder="Özel ihtiyaçlarınızı veya sorularınızı bize bildirin..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-primary btn-lg" onClick={nextStep}>Sonraki Adım →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)", color: "var(--text-primary)" }}>Tarih ve Saat Seçin</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
                {/* Date Selection */}
                <div>
                  <label className="input-label">Tercih Edilen Tarih *</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {availableDates.slice(0, 5).map(date => {
                       const d = new Date(date);
                       const dayStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
                       return (
                         <div 
                           key={date}
                           onClick={() => setFormData({...formData, date, time: ""})}
                           style={{
                             padding: "var(--space-3)",
                             borderRadius: "var(--radius-md)",
                             border: formData.date === date ? "2px solid var(--primary-500)" : "1px solid var(--border-medium)",
                             background: formData.date === date ? "var(--primary-50)" : "transparent",
                             cursor: "pointer",
                             fontWeight: formData.date === date ? 600 : 400,
                             color: formData.date === date ? "var(--primary-700)" : "var(--text-primary)",
                             textAlign: "center"
                           }}
                         >
                           {dayStr}
                         </div>
                       )
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="input-label">Mevcut Saatler</label>
                  {!formData.date ? (
                    <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--text-tertiary)", background: "var(--neutral-50)", borderRadius: "var(--radius-md)", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 24, marginBottom: 8 }}>📅</span>
                      Önce bir tarih seçin
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", alignContent: "start" }}>
                      {availableTimes.map(time => (
                        <div 
                          key={time}
                          onClick={() => setFormData({...formData, time})}
                          style={{
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: formData.time === time ? "2px solid var(--primary-500)" : "1px solid var(--border-medium)",
                            background: formData.time === time ? "var(--primary-500)" : "transparent",
                            color: formData.time === time ? "white" : "var(--text-primary)",
                            cursor: "pointer",
                            fontWeight: 600,
                            textAlign: "center"
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="btn btn-secondary btn-lg" onClick={prevStep}>← Önceki</button>
                <button type="submit" className="btn btn-success btn-lg" disabled={isSubmitting || !formData.date || !formData.time}>
                  {isSubmitting ? "Gönderiliyor..." : "Demo Rezervasyonu Yap"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
