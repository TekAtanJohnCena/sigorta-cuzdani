"use client";

export default function RenewalsPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div style={{ textAlign: "center", maxWidth: 520, padding: "var(--space-8)" }}>
        {/* Animated Icon */}
        <div style={{
          width: 100, height: 100, borderRadius: "var(--radius-full)",
          background: "linear-gradient(135deg, var(--primary-500), #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto var(--space-6)", fontSize: 44,
          boxShadow: "0 20px 60px rgba(59, 85, 230, 0.3)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}>
          🚀
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "var(--text-2xl)", fontWeight: 900,
          background: "linear-gradient(135deg, var(--primary-600), #7c3aed)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: "var(--space-3)",
        }}>
          Teklif & Yenileme Motoru
        </h1>

        <p style={{
          fontSize: "var(--text-base)", color: "var(--text-secondary)",
          lineHeight: 1.7, marginBottom: "var(--space-6)",
        }}>
          Yapay zeka destekli otomatik teklif toplama motorumuz gelistirme asamasindadir.
          Poliçe vadeleriniz yaklastiginda piyasadaki en uygun teklifleri otomatik olarak
          toplayip karsilastiracak.
        </p>

        {/* Features */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)",
          marginBottom: "var(--space-8)", textAlign: "left",
        }}>
          {[
            { icon: "🤖", text: "AI Destekli Piyasa Taramasi" },
            { icon: "⚖️", text: "Otomatik Teklif Karsilastirma" },
            { icon: "📊", text: "Teminat Baz Analizi" },
            { icon: "🔔", text: "Vade Hatirlatma Entegrasyonu" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--bg-secondary)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
          padding: "var(--space-2) var(--space-5)",
          background: "var(--primary-50)", border: "1px solid var(--primary-200)",
          borderRadius: "var(--radius-full)", fontSize: "var(--text-sm)",
          color: "var(--primary-700)", fontWeight: 700,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--primary-500)", animation: "pulse-glow 2s ease-in-out infinite",
          }} />
          Gelistirme Asamasinda — Yakin Zamanda Aktif
        </div>
      </div>
    </div>
  );
}
