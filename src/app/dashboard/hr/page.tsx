"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { getEmployeesByTenant, addEmployee, updateEmployee } from "@/lib/firebase/employees";
import { Policy, POLICY_TYPE_LABELS } from "@/types/policy";
import { Employee, InsuranceStatus, INSURANCE_STATUS_LABELS, INSURANCE_STATUS_COLORS, INSURANCE_STATUS_ICONS } from "@/types/employee";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";

const MOCK_EMPLOYEES: Employee[] = [
  { id: "emp-001", tenantId: "tenant-001", fullName: "Ayşe Kara", department: "Mühendislik", position: "Kıdemli Yazılım Geliştirici", startDate: "2023-03-01", isActive: true, insuranceStatus: "covered", healthPolicyId: "pol-003", insuranceCoverageStartDate: "2023-03-01", createdAt: "2023-03-01T00:00:00Z", updatedAt: "2023-03-01T00:00:00Z" },
  { id: "emp-002", tenantId: "tenant-001", fullName: "Mehmet Yılmaz", department: "Satış", position: "Satış Müdürü", startDate: "2022-06-15", isActive: true, insuranceStatus: "covered", healthPolicyId: "pol-003", insuranceCoverageStartDate: "2022-06-15", createdAt: "2022-06-15T00:00:00Z", updatedAt: "2022-06-15T00:00:00Z" },
  { id: "emp-003", tenantId: "tenant-001", fullName: "Fatma Demir", department: "İnsan Kaynakları", position: "İK Uzmanı", startDate: "2024-01-10", isActive: true, insuranceStatus: "covered", healthPolicyId: "pol-003", createdAt: "2024-01-10T00:00:00Z", updatedAt: "2024-01-10T00:00:00Z" },
  { id: "emp-004", tenantId: "tenant-001", fullName: "Ali Çelik", department: "Finans", position: "Mali Kontrolör", startDate: "2025-03-01", isActive: true, insuranceStatus: "pending_addition", pendingRequestType: "addition", pendingRequestDate: "2025-03-01", createdAt: "2025-03-01T00:00:00Z", updatedAt: "2025-03-01T00:00:00Z" },
  { id: "emp-005", tenantId: "tenant-001", fullName: "Zeynep Arslan", department: "Mühendislik", position: "Ürün Müdürü", startDate: "2024-09-15", isActive: true, insuranceStatus: "covered", healthPolicyId: "pol-003", createdAt: "2024-09-15T00:00:00Z", updatedAt: "2024-09-15T00:00:00Z" },
];

const DEPARTMENTS = ["Mühendislik", "Satış", "İnsan Kaynakları", "Finans", "Operasyon", "Hukuk", "Pazarlama", "Yönetim", "Muhasebe"];

export default function HRPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [formData, setFormData] = useState({ fullName: "", department: "", position: "", startDate: "", addToHealth: false });

  useEffect(() => {
    async function load() {
      if (isDemoMode) {
        setEmployees(MOCK_EMPLOYEES);
        setLoading(false);
        return;
      }
      if (!appUser) { setLoading(false); return; }
      try {
        const [policiesData, empData] = await Promise.all([
          getPoliciesByTenant(appUser.tenantId),
          getEmployeesByTenant(appUser.tenantId),
        ]);
        setDbPolicies(policiesData as Policy[]);
        setEmployees(empData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [appUser, authLoading, isDemoMode]);

  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;
  const healthPolicy = policies.find(p => p.policyType === "saglik" && p.status === "active");

  const stats = useMemo(() => {
    const active = employees.filter(e => e.isActive);
    const covered = active.filter(e => e.insuranceStatus === "covered").length;
    const pending = active.filter(e => ["pending_addition", "pending_removal"].includes(e.insuranceStatus)).length;
    const notCovered = active.filter(e => e.insuranceStatus === "not_covered").length;
    const costPerPerson = healthPolicy && active.length > 0
      ? Math.round(healthPolicy.premium.totalPremium / active.length)
      : 0;
    return { total: active.length, covered, pending, notCovered, costPerPerson };
  }, [employees, healthPolicy]);

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department))).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (!e.isActive) return false;
      if (filterDept !== "all" && e.department !== filterDept) return false;
      if (filterStatus !== "all" && e.insuranceStatus !== filterStatus) return false;
      return true;
    });
  }, [employees, filterDept, filterStatus]);

  async function handleAddEmployee() {
    if (!formData.fullName || !formData.department || !formData.position || !formData.startDate) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const insuranceStatus: InsuranceStatus = formData.addToHealth
        ? (healthPolicy ? "pending_addition" : "not_covered")
        : "not_covered";

      const newEmp: Omit<Employee, "id" | "createdAt" | "updatedAt"> = {
        tenantId: isDemoMode ? "tenant-001" : (appUser?.tenantId || ""),
        fullName: formData.fullName,
        department: formData.department,
        position: formData.position,
        startDate: formData.startDate,
        isActive: true,
        insuranceStatus,
        healthPolicyId: formData.addToHealth && healthPolicy ? healthPolicy.id : undefined,
        pendingRequestType: formData.addToHealth ? "addition" : undefined,
        pendingRequestDate: formData.addToHealth ? now.split("T")[0] : undefined,
      };

      if (isDemoMode) {
        setEmployees(prev => [...prev, { ...newEmp, id: `emp-${Date.now()}`, createdAt: now, updatedAt: now }]);
      } else {
        const id = await addEmployee(newEmp);
        setEmployees(prev => [...prev, { ...newEmp, id, createdAt: now, updatedAt: now }]);
      }

      setShowAddModal(false);
      setFormData({ fullName: "", department: "", position: "", startDate: "", addToHealth: false });
    } catch (e) {
      console.error(e);
      alert("Personel eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestZeyil(employee: Employee, type: "addition" | "removal") {
    const newStatus: InsuranceStatus = type === "addition" ? "pending_addition" : "pending_removal";
    const now = new Date().toISOString();

    if (isDemoMode) {
      setEmployees(prev => prev.map(e => e.id === employee.id ? { ...e, insuranceStatus: newStatus, pendingRequestType: type, pendingRequestDate: now.split("T")[0] } : e));
    } else {
      await updateEmployee(employee.id, { insuranceStatus: newStatus, pendingRequestType: type, pendingRequestDate: now.split("T")[0], updatedAt: now });
      setEmployees(prev => prev.map(e => e.id === employee.id ? { ...e, insuranceStatus: newStatus } : e));
    }
  }

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">👥 İK & Personel Yönetimi</h1>
          <p className="page-subtitle">Grup sağlık sigortası kapsam yönetimi ve zeyil takibi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Yeni Personel Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stats-card" data-color="blue">
          <div className="stats-icon">👥</div>
          <div className="stats-value">{stats.total}</div>
          <div className="stats-label">Toplam Aktif Personel</div>
        </div>
        <div className="stats-card" data-color="green">
          <div className="stats-icon">✅</div>
          <div className="stats-value">{stats.covered}</div>
          <div className="stats-label">Sigorta Kapsamında</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11, color: "var(--success-600)" }}>
            %{stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0} kapsam oranı
          </div>
        </div>
        <div className="stats-card" data-color={stats.pending > 0 ? "amber" : "green"}>
          <div className="stats-icon">⏳</div>
          <div className="stats-value">{stats.pending}</div>
          <div className="stats-label">Bekleyen Zeyil Talebi</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            {stats.pending > 0 ? "Acente onayı bekleniyor" : "Bekleyen talep yok"}
          </div>
        </div>
        <div className="stats-card" data-color="teal">
          <div className="stats-icon">💰</div>
          <div className="stats-value" style={{ fontSize: "var(--text-xl)" }}>
            {stats.costPerPerson > 0 ? formatCurrency(stats.costPerPerson) : "—"}
          </div>
          <div className="stats-label">Kişi Başı Yıllık Prim</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            {healthPolicy ? `${healthPolicy.insuranceCompany} · ${POLICY_TYPE_LABELS["saglik"]}` : "Sağlık poliçesi bulunamadı"}
          </div>
        </div>
      </div>

      {/* Health Policy Info */}
      {healthPolicy ? (
        <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--success-50)", border: "1px solid var(--success-200)", padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.5rem" }}>🏥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--success-900)" }}>Aktif Grup Sağlık Poliçesi</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--success-700)" }}>
              {healthPolicy.insuranceCompany} · {healthPolicy.policyNumber} · {formatCurrency(healthPolicy.premium.totalPremium)}/yıl
            </div>
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--success-800)", fontWeight: 600 }}>
            Poliçe No: {healthPolicy.policyNumber}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--warning-50)", border: "1px solid var(--warning-200)", padding: "var(--space-4) var(--space-5)" }}>
          <span style={{ color: "var(--warning-800)", fontWeight: 600 }}>⚠️ Aktif grup sağlık poliçesi bulunamadı. Personel zeyil talepleri oluşturabilmek için önce bir sağlık poliçesi ekleyin.</span>
        </div>
      )}

      {/* Filtreler */}
      <div className="card" style={{ padding: "var(--space-3) var(--space-4)", marginBottom: "var(--space-4)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <select className="input" style={{ width: "auto" }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tüm Departmanlar</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tüm Durumlar</option>
          <option value="covered">✅ Kapsam Altında</option>
          <option value="pending_addition">⏳ Ekleme Bekliyor</option>
          <option value="pending_removal">⏳ Çıkarma Bekliyor</option>
          <option value="not_covered">❌ Kapsamda Değil</option>
        </select>
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
          {filtered.length} personel gösteriliyor
        </span>
      </div>

      {/* Tablo */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-200)" }}>
                {["Ad Soyad", "Departman", "Pozisyon", "İşe Giriş", "Sigorta Durumu", "İşlemler"].map(h => (
                  <th key={h} style={{ padding: "var(--space-3) var(--space-4)", textAlign: "left", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, idx) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--neutral-100)", background: idx % 2 === 0 ? "white" : "var(--neutral-25, #fafafa)" }}>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--primary-700)" }}>
                        {emp.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      {emp.fullName}
                    </div>
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{emp.department}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{emp.position}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>{formatDateShort(emp.startDate)}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: emp.insuranceStatus === "covered" ? "var(--success-100)" : emp.insuranceStatus === "not_covered" ? "var(--danger-100)" : "var(--warning-100)", color: INSURANCE_STATUS_COLORS[emp.insuranceStatus] }}>
                      {INSURANCE_STATUS_ICONS[emp.insuranceStatus]} {INSURANCE_STATUS_LABELS[emp.insuranceStatus]}
                    </span>
                    {emp.pendingRequestDate && (
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>Talep: {formatDateShort(emp.pendingRequestDate)}</div>
                    )}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {emp.insuranceStatus === "not_covered" && healthPolicy && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleRequestZeyil(emp, "addition")} style={{ fontSize: 11 }}>
                          + Zeyil Ekle
                        </button>
                      )}
                      {emp.insuranceStatus === "covered" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleRequestZeyil(emp, "removal")} style={{ fontSize: 11, color: "var(--danger-600)" }}>
                          − Zeyil Çıkar
                        </button>
                      )}
                      {["pending_addition", "pending_removal"].includes(emp.insuranceStatus) && (
                        <span style={{ fontSize: 11, color: "var(--warning-600)", fontStyle: "italic" }}>Onay bekleniyor…</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-tertiary)" }}>
                    Seçili filtrelere uygun personel bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Personel Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">👤 Yeni Personel Ekle</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label className="label">Ad Soyad</label>
                <input className="input" placeholder="Örn: Ahmet Yılmaz" value={formData.fullName} onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <label className="label">Departman</label>
                  <select className="input" value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))}>
                    <option value="">— Seçin —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Pozisyon</label>
                  <input className="input" placeholder="Örn: Yazılım Geliştirici" value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">İşe Giriş Tarihi</label>
                <input type="date" className="input" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))} max={new Date().toISOString().split("T")[0]} />
              </div>
              {healthPolicy && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "var(--space-4)", background: "var(--success-50)", border: "1px solid var(--success-200)", borderRadius: "var(--radius-md)" }}>
                  <input type="checkbox" id="addToHealth" checked={formData.addToHealth} onChange={e => setFormData(f => ({ ...f, addToHealth: e.target.checked }))} style={{ marginTop: 2, accentColor: "var(--success-600)" }} />
                  <label htmlFor="addToHealth" style={{ cursor: "pointer" }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--success-900)" }}>
                      Grup Sağlık Sigortasına Ekle
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--success-700)", marginTop: 2 }}>
                      {healthPolicy.insuranceCompany} · {healthPolicy.policyNumber} için zeyil (ek) talebi oluşturulacak
                    </div>
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>İptal</button>
              <button
                className="btn btn-primary"
                onClick={handleAddEmployee}
                disabled={!formData.fullName || !formData.department || !formData.position || !formData.startDate || saving}
              >
                {saving ? "Kaydediliyor..." : "Personeli Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
