"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { getAssetsByTenant, createAsset, deleteAsset } from "@/lib/firebase/assets";
import { Policy, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS } from "@/types/policy";
import { Asset, AssetCategory, ASSET_CATEGORY_LABELS, ASSET_CATEGORY_ICONS } from "@/types/asset";
import { analyzeAssetPortfolio } from "@/lib/engines/assetMatchEngine";
import { formatCurrency } from "@/lib/utils/currency";
import { MOCK_POLICIES } from "@/lib/mockData";

const MOCK_ASSETS: Asset[] = [
  { id: "asset-001", tenantId: "tenant-001", category: "vehicle", name: "34 YT 2025", description: "2024 Model VW Transporter — Kurye Aracı", estimatedValue: 1_800_000, currency: "TRY", linkedPolicyIds: [], createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-01-15T10:00:00Z" },
  { id: "asset-002", tenantId: "tenant-001", category: "property", name: "Levent Merkez Ofis", description: "Büyükdere Cad. No:123, 3 katlı ofis", estimatedValue: 12_000_000, currency: "TRY", linkedPolicyIds: [], createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-01-15T10:00:00Z" },
  { id: "asset-003", tenantId: "tenant-001", category: "equipment", name: "Sunucu Odası Ekipmanları", description: "20 adet Dell PowerEdge + UPS + Rack", estimatedValue: 2_500_000, currency: "TRY", linkedPolicyIds: [], createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-02-01T10:00:00Z" },
  { id: "asset-004", tenantId: "tenant-001", category: "vehicle", name: "06 ABC 789", description: "2023 Model Ford Courier — Ankara Operasyon", estimatedValue: 1_200_000, currency: "TRY", linkedPolicyIds: [], createdAt: "2025-03-01T10:00:00Z", updatedAt: "2025-03-01T10:00:00Z" },
];

export default function AssetsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [dbAssets, setDbAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newCategory, setNewCategory] = useState<AssetCategory>("vehicle");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return; }
      if (!appUser) { setLoading(false); return; }
      try {
        const [policiesData, assetsData] = await Promise.all([
          getPoliciesByTenant(appUser.tenantId),
          getAssetsByTenant(appUser.tenantId),
        ]);
        setDbPolicies(policiesData as Policy[]);
        setDbAssets(assetsData);
      } catch (e) {
        console.error("Assets: Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [appUser, authLoading, isDemoMode]);

  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;
  const assets = isDemoMode ? MOCK_ASSETS : dbAssets;
  const activePolicies = policies.filter(p => p.status === "active");

  const analysis = useMemo(() => {
    return analyzeAssetPortfolio(assets, activePolicies);
  }, [assets, activePolicies]);

  async function handleCreateAsset() {
    if (!newName || !newValue) return;
    setSaving(true);
    try {
      const assetData = {
        tenantId: isDemoMode ? "tenant-001" : (appUser?.tenantId || ""),
        category: newCategory,
        name: newName,
        description: newDesc || undefined,
        estimatedValue: parseFloat(newValue) || 0,
        currency: "TRY" as const,
        linkedPolicyIds: [],
      };

      if (isDemoMode) {
        const mockNew: Asset = { ...assetData, id: `asset-demo-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setDbAssets(prev => [mockNew, ...prev]);
      } else {
        const id = await createAsset(assetData);
        const newAsset: Asset = { ...assetData, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setDbAssets(prev => [newAsset, ...prev]);
      }

      setShowModal(false);
      setNewName(""); setNewDesc(""); setNewValue(""); setNewCategory("vehicle");
    } catch (e) {
      console.error(e);
      alert("Varlık oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAsset(id: string) {
    if (!confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;
    try {
      if (!isDemoMode) await deleteAsset(id);
      setDbAssets(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Varlık verileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">🏗️ Varlık Envanteri</h1>
          <p className="page-subtitle">Şirket varlıklarınızı kaydedin, sigorta kapsamını otomatik kontrol edin</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            📥 Excel İçe Aktar
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Yeni Varlık Ekle
          </button>
        </div>
      </div>

      {/* ERP Banner */}
      <div style={{ 
        background: "linear-gradient(135deg, var(--neutral-800), var(--neutral-900))", 
        color: "white", borderRadius: "var(--radius-xl)", padding: "var(--space-5) var(--space-6)", 
        marginBottom: "var(--space-8)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div style={{ fontSize: 36 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", marginBottom: 2 }}>SAP ve Logo Entegrasyonu Çok Yakında!</div>
            <div style={{ color: "var(--neutral-300)", fontSize: "var(--text-sm)" }}>Araç ve demirbaşlarınızı ERP sisteminizden tek tıkla senkronize edin. Çift veri girişi yapmaktan kurtulun.</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
          Erken Erişim İste
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stats-card" data-color="blue">
          <div className="stats-icon">📦</div>
          <div className="stats-value">{assets.length}</div>
          <div className="stats-label">Toplam Varlık</div>
        </div>
        <div className="stats-card" data-color="green">
          <div className="stats-icon">✅</div>
          <div className="stats-value">{analysis.insuredCount}</div>
          <div className="stats-label">Sigortalı Varlık</div>
        </div>
        <div className="stats-card" data-color={analysis.uninsuredCount > 0 ? "red" : "green"}>
          <div className="stats-icon">⚠️</div>
          <div className="stats-value">{analysis.uninsuredCount}</div>
          <div className="stats-label">Sigortasız Varlık</div>
          {analysis.uninsuredCount > 0 && (
            <div className="stats-change negative" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
              Acil değerlendirme gerekli
            </div>
          )}
        </div>
        <div className="stats-card" data-color={analysis.uninsuredValue > 0 ? "amber" : "teal"}>
          <div className="stats-icon">💰</div>
          <div className="stats-value" style={{ fontSize: "var(--text-xl)" }}>{formatCurrency(analysis.uninsuredValue)}</div>
          <div className="stats-label">Korumasız Değer</div>
        </div>
      </div>

      {/* Varlık Listesi */}
      {assets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏗️</div>
          <div className="empty-state-title">Henüz Varlık Kaydedilmemiş</div>
          <div className="empty-state-description">
            Araçlarınızı, ofislerinizi ve ekipmanlarınızı kaydedin — sistem otomatik olarak sigorta kapsamını kontrol etsin.
          </div>
          <button className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowModal(true)}>
            + İlk Varlığı Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {analysis.results.map(({ asset, matchedPolicies, isInsured }) => (
            <div
              key={asset.id}
              className="card"
              style={{
                padding: "var(--space-5)",
                borderLeft: `4px solid ${isInsured ? "var(--success-500)" : "var(--danger-500)"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "2rem" }}>{ASSET_CATEGORY_ICONS[asset.category]}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{asset.name}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      {ASSET_CATEGORY_LABELS[asset.category]}
                      {asset.description && ` · ${asset.description}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "var(--text-lg)" }}>{formatCurrency(asset.estimatedValue)}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Tahmini Değer</div>
                  </div>

                  <span style={{
                    padding: "4px 12px", borderRadius: 99, fontSize: "var(--text-xs)", fontWeight: 700,
                    background: isInsured ? "var(--success-100)" : "var(--danger-100)",
                    color: isInsured ? "var(--success-800)" : "var(--danger-800)",
                  }}>
                    {isInsured ? "✅ Sigortalı" : "⚠️ Sigortasız"}
                  </span>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--text-tertiary)", fontSize: 14 }}
                    onClick={() => handleDeleteAsset(asset.id)}
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Eşleşen poliçeler */}
              {isInsured && matchedPolicies.length > 0 && (
                <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {matchedPolicies.map(p => (
                    <span key={p.id} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 6,
                      background: "var(--success-50)", border: "1px solid var(--success-200)",
                      fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--success-800)",
                    }}>
                      {POLICY_TYPE_ICONS[p.policyType]} {POLICY_TYPE_LABELS[p.policyType]} — {p.insuranceCompany}
                    </span>
                  ))}
                </div>
              )}

              {/* Sigortasız uyarı */}
              {!isInsured && (
                <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "var(--danger-50)", border: "1px solid var(--danger-200)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", color: "var(--danger-800)", fontWeight: 500 }}>
                  ⚠️ Bu varlığı kapsayan aktif bir {asset.category === "vehicle" ? "Kasko/Trafik" : asset.category === "property" ? "Yangın/DASK/İşyeri" : "İşyeri/Mühendislik"} poliçesi bulunamadı. Poliçe yükleyerek kapsamı güncelleyin.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Yeni Varlık Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🏗️ Yeni Varlık Ekle</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label className="label">Varlık Kategorisi</label>
                <select className="input" value={newCategory} onChange={e => setNewCategory(e.target.value as AssetCategory)}>
                  <option value="vehicle">🚗 Araç</option>
                  <option value="property">🏢 Taşınmaz / Bina</option>
                  <option value="equipment">💻 Ekipman / Cihaz</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {newCategory === "vehicle" ? "Plaka" : newCategory === "property" ? "Bina / Lokasyon Adı" : "Ekipman Adı"}
                </label>
                <input
                  className="input"
                  placeholder={newCategory === "vehicle" ? "Örn: 34 ABC 123" : newCategory === "property" ? "Örn: Levent Merkez Ofis" : "Örn: Sunucu Odası"}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Açıklama (Opsiyonel)</label>
                <input
                  className="input"
                  placeholder="Marka, model, adres detayı vb."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tahmini Değer (₺)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Örn: 2000000"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>İptal</button>
              <button
                className="btn btn-primary"
                onClick={handleCreateAsset}
                disabled={!newName || !newValue || saving}
              >
                {saving ? "Kaydediliyor..." : "📦 Varlık Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal (Placeholder) */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal" style={{ maxWidth: 520, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📥 Excel&apos;den İçe Aktar</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowImportModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>📊</div>
              <h3 style={{ fontWeight: 700, fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Verilerinizi Tek Tıkla Aktarın</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)", padding: "0 var(--space-4)" }}>
                Araç filonuzu, bina ve cihaz kayıtlarınızı excel şablonumuza uygun olarak hazırlayıp buraya yükleyebilirsiniz.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "0 var(--space-8)" }}>
                <button className="btn btn-secondary">
                  📄 Şablonu İndir (.xlsx)
                </button>
                <div style={{ border: "2px dashed var(--neutral-300)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", background: "var(--neutral-50)", cursor: "pointer" }}>
                  <div style={{ color: "var(--primary-600)", fontWeight: 600 }}>Dosya Seçin veya Sürükleyin</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>Desteklenen formatlar: .xlsx, .csv</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
