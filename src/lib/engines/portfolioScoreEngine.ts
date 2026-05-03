// ============================================
// Portfolio Score Engine
// Poliçe listesinden deterministik skor hesaplar.
// Rastgele sayı üretilmez — her sonuç formüle dayanır.
// ============================================

import { Policy } from '@/types/policy';

export interface ScoreBreakdown {
  coverageAdequacy: number;   // Teminat çeşitliliği (0-100)
  expiryHealth: number;       // Vade sağlığı (0-100)
  paymentCompliance: number;  // Ödeme disiplini (0-100)
  diversification: number;    // Poliçe çeşitlendirmesi (0-100)
  costEfficiency: number;     // Maliyet etkinliği (0-100)
}

export interface PortfolioScore {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: ScoreBreakdown;
  label: string;
  color: string;
}

// Minimum olması önerilen poliçe tipleri (genel şirket için)
const BASELINE_REQUIRED_TYPES = ['yangin', 'saglik', 'dask', 'sorumluluk'];
const BASELINE_RECOMMENDED_TYPES = ['kasko', 'trafik', 'nakliyat', 'muhendislik', 'ferdi_kaza'];

function daysFromNow(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

// 1. Teminat Yeterliliği: Kaç tane "olması gereken" tipte poliçe var?
function calcCoverageAdequacy(policies: Policy[]): number {
  const existingTypes = new Set(policies.filter(p => p.status === 'active').map(p => p.policyType));
  const covered = BASELINE_REQUIRED_TYPES.filter(t => existingTypes.has(t as string)).length;
  const recCovered = BASELINE_RECOMMENDED_TYPES.filter(t => existingTypes.has(t as string)).length;
  
  // Zorunlu tipler 70 puan, önerilen tipler 30 puan
  const requiredScore = (covered / BASELINE_REQUIRED_TYPES.length) * 70;
  const recScore = (recCovered / BASELINE_RECOMMENDED_TYPES.length) * 30;
  return Math.round(requiredScore + recScore);
}

// 2. Vade Sağlığı: Yakında biten poliçe var mı?
function calcExpiryHealth(policies: Policy[]): number {
  const active = policies.filter(p => p.status === 'active');
  if (active.length === 0) return 100;

  let totalPenalty = 0;
  for (const p of active) {
    const days = daysFromNow(p.endDate);
    if (days < 0) totalPenalty += 60;       // Süresi geçmiş
    else if (days <= 7) totalPenalty += 40;  // 1 hafta içinde
    else if (days <= 30) totalPenalty += 20; // 1 ay içinde
    else if (days <= 90) totalPenalty += 5;  // 3 ay içinde
  }
  const avgPenalty = totalPenalty / active.length;
  return Math.max(0, Math.round(100 - avgPenalty));
}

// 3. Ödeme Disiplini: Taksit ödemeleri düzenli mi?
function calcPaymentCompliance(policies: Policy[]): number {
  const allInstallments = policies.flatMap(p => p.premium.installments || []);
  if (allInstallments.length === 0) return 100; // Tamamı peşin → mükemmel

  const total = allInstallments.length;
  const paid = allInstallments.filter(i => i.status === 'paid').length;
  const overdue = allInstallments.filter(i => {
    if (i.status === 'paid') return false;
    return daysFromNow(i.dueDate) < 0;
  }).length;

  const baseScore = (paid / total) * 100;
  const overduePenalty = (overdue / total) * 30;
  return Math.max(0, Math.round(baseScore - overduePenalty));
}

// 4. Çeşitlendirme: Kaç farklı poliçe tipi var?
function calcDiversification(policies: Policy[]): number {
  const distinctTypes = new Set(policies.filter(p => p.status === 'active').map(p => p.policyType));
  const MAX_USEFUL_TYPES = 8;
  return Math.min(100, Math.round((distinctTypes.size / MAX_USEFUL_TYPES) * 100));
}

// 5. Maliyet Etkinliği: Teminat/prim oranı makul mu?
function calcCostEfficiency(policies: Policy[]): number {
  const active = policies.filter(p => p.status === 'active');
  if (active.length === 0) return 100;

  let efficiencySum = 0;
  let counted = 0;

  for (const p of active) {
    if (p.coverages && p.coverages.length > 0 && p.premium.totalPremium > 0) {
      const totalCoverage = p.coverages.reduce((s, c) => s + c.amount, 0);
      const ratio = totalCoverage / p.premium.totalPremium;
      // İdeal oran: prim/teminat = ~%0.5-2 (yani ratio 50-200 olmalı)
      // ratio < 20 → çok az teminat (kötü), ratio > 500 → çok iyi
      const score = Math.min(100, Math.round(Math.log10(ratio + 1) * 40));
      efficiencySum += score;
      counted++;
    }
  }

  return counted > 0 ? Math.round(efficiencySum / counted) : 70;
}

// ============================================
// Ana hesaplama fonksiyonu
// ============================================
export function calculatePortfolioScore(policies: Policy[]): PortfolioScore {
  const breakdown: ScoreBreakdown = {
    coverageAdequacy: calcCoverageAdequacy(policies),
    expiryHealth: calcExpiryHealth(policies),
    paymentCompliance: calcPaymentCompliance(policies),
    diversification: calcDiversification(policies),
    costEfficiency: calcCostEfficiency(policies),
  };

  // Ağırlıklı ortalama
  const overall = Math.round(
    breakdown.coverageAdequacy * 0.30 +
    breakdown.expiryHealth * 0.25 +
    breakdown.paymentCompliance * 0.20 +
    breakdown.diversification * 0.15 +
    breakdown.costEfficiency * 0.10
  );

  const grade: PortfolioScore['grade'] =
    overall >= 90 ? 'A' :
    overall >= 75 ? 'B' :
    overall >= 55 ? 'C' :
    overall >= 35 ? 'D' : 'F';

  const label =
    grade === 'A' ? 'Mükemmel Portföy' :
    grade === 'B' ? 'İyi Düzeyde Korumalı' :
    grade === 'C' ? 'Geliştirilebilir' :
    grade === 'D' ? 'Yetersiz Kapsam' : 'Kritik Risk';

  const color =
    grade === 'A' ? 'var(--success-600)' :
    grade === 'B' ? 'var(--primary-600)' :
    grade === 'C' ? 'var(--warning-600)' :
    'var(--danger-600)';

  return { overall, grade, breakdown, label, color };
}

// Tek bir poliçenin kalite skoru
export function calculatePolicyQualityScore(policy: Policy): {
  score: number;
  grade: string;
  label: string;
  color: string;
} {
  let score = 0;

  // Teminat çeşitliliği (0-30 puan)
  score += Math.min(30, (policy.coverages?.length || 0) * 8);

  // Vade sağlığı (0-30 puan)
  const days = daysFromNow(policy.endDate);
  if (days > 180) score += 30;
  else if (days > 90) score += 20;
  else if (days > 30) score += 10;
  else if (days > 0) score += 5;

  // Ödeme disiplini (0-20 puan)
  const insts = policy.premium.installments || [];
  if (insts.length === 0) {
    score += 20; // Peşin ödeme
  } else {
    const paid = insts.filter(i => i.status === 'paid').length;
    score += Math.round((paid / insts.length) * 20);
  }

  // Teminat/prim oranı (0-20 puan)
  if (policy.coverages && policy.premium.totalPremium > 0) {
    const totalCoverage = policy.coverages.reduce((s, c) => s + c.amount, 0);
    const ratio = totalCoverage / policy.premium.totalPremium;
    score += Math.min(20, Math.round(Math.log10(ratio + 1) * 8));
  }

  score = Math.min(100, score);

  const grade = score >= 90 ? 'A+' : score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 45 ? 'C' : 'D';
  const label =
    grade === 'A+' ? '🌟 Mükemmel teminat kapsamı' :
    grade === 'A' ? '✅ İyi güvence seviyesi' :
    grade === 'B' ? '✅ Standart güvence seviyesi' :
    grade === 'C' ? '⚠️ Geliştirilebilir kapsam' :
    '⚠️ Risk açıkları olabilir';

  const color =
    score >= 90 ? 'var(--success-700)' :
    score >= 75 ? 'var(--success-600)' :
    score >= 60 ? 'var(--primary-600)' :
    'var(--warning-600)';

  return { score, grade, label, color };
}
