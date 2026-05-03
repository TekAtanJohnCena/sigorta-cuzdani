// ============================================
// Limit Benchmark Engine
// Şirket profil verileriyle poliçe limitlerinin
// yeterliliğini analiz eder.
// ============================================

import { Policy, PolicyType, POLICY_TYPE_LABELS } from '@/types/policy';
import { CompanyProfile } from '@/types/companyProfile';

export interface LimitWarning {
  policyType: PolicyType;
  policyLabel: string;
  insuranceCompany: string;
  policyNumber: string;
  currentLimit: number;
  recommendedLimit: number;
  gap: number;          // recommendedLimit - currentLimit
  gapPercent: number;   // gap / recommendedLimit * 100
  severity: 'critical' | 'warning';
  explanation: string;
}

/**
 * Her sektörün poliçe tiplerine göre önerilen limit katsayıları.
 * multiplier × base (revenue veya employeeCount) = önerilen minimum limit
 */
export const LIMIT_BENCHMARKS: Record<string, Record<string, { multiplier: number; base: 'revenue' | 'employee'; label: string }>> = {
  teknoloji: {
    sorumluluk: { multiplier: 0.10, base: 'revenue', label: 'Mesleki/Genel Sorumluluk' },
    yangin: { multiplier: 0.15, base: 'revenue', label: 'Yangın & İşyeri' },
    saglik: { multiplier: 18000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  uretim: {
    sorumluluk: { multiplier: 0.12, base: 'revenue', label: 'Mesleki/Genel Sorumluluk' },
    yangin: { multiplier: 0.20, base: 'revenue', label: 'Yangın & İşyeri' },
    muhendislik: { multiplier: 0.08, base: 'revenue', label: 'Mühendislik/Makine' },
    saglik: { multiplier: 15000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  lojistik: {
    nakliyat: { multiplier: 0.10, base: 'revenue', label: 'Emtia Nakliyat' },
    sorumluluk: { multiplier: 0.08, base: 'revenue', label: 'Sorumluluk' },
    saglik: { multiplier: 14000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  perakende: {
    yangin: { multiplier: 0.15, base: 'revenue', label: 'Yangın & Hırsızlık' },
    sorumluluk: { multiplier: 0.08, base: 'revenue', label: 'Sorumluluk' },
    saglik: { multiplier: 12000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  insaat: {
    sorumluluk: { multiplier: 0.15, base: 'revenue', label: 'İnşaat Sorumluluk' },
    muhendislik: { multiplier: 0.10, base: 'revenue', label: 'İnşaat All-Risk' },
    saglik: { multiplier: 16000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  saglik_hizmetleri: {
    sorumluluk: { multiplier: 0.12, base: 'revenue', label: 'Mesleki Sorumluluk / Malpraktis' },
    yangin: { multiplier: 0.10, base: 'revenue', label: 'Yangın' },
    saglik: { multiplier: 20000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  turizm: {
    yangin: { multiplier: 0.15, base: 'revenue', label: 'Yangın & İşyeri' },
    sorumluluk: { multiplier: 0.10, base: 'revenue', label: 'Sorumluluk' },
    saglik: { multiplier: 13000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  finans: {
    sorumluluk: { multiplier: 0.15, base: 'revenue', label: 'Mesleki Sorumluluk' },
    yangin: { multiplier: 0.10, base: 'revenue', label: 'Yangın' },
    saglik: { multiplier: 22000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  tarim: {
    sorumluluk: { multiplier: 0.08, base: 'revenue', label: 'Sorumluluk' },
    yangin: { multiplier: 0.12, base: 'revenue', label: 'Yangın' },
    saglik: { multiplier: 10000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
  genel: {
    sorumluluk: { multiplier: 0.10, base: 'revenue', label: 'Sorumluluk' },
    yangin: { multiplier: 0.15, base: 'revenue', label: 'Yangın' },
    saglik: { multiplier: 14000, base: 'employee', label: 'Grup Sağlık (kişi başı)' },
  },
};

/**
 * Aktif poliçelerin limitlerini şirket profiliyle kıyaslar.
 * Yetersiz bulduklarını LimitWarning[] olarak döner.
 */
export function analyzeLimitAdequacy(
  policies: Policy[],
  profile: CompanyProfile
): LimitWarning[] {
  const warnings: LimitWarning[] = [];
  const sectorBenchmarks = LIMIT_BENCHMARKS[profile.sector] || LIMIT_BENCHMARKS['genel'];
  const activePolicies = policies.filter(p => p.status === 'active');

  for (const [policyType, benchmark] of Object.entries(sectorBenchmarks)) {
    // Bu tipteki poliçeleri bul
    const matchingPolicies = activePolicies.filter(p => p.policyType === policyType);

    if (matchingPolicies.length === 0) continue; // Poliçe yoksa zaten risk-gaps'te gösteriliyor

    // Önerilen minimum limiti hesapla
    const recommendedLimit = benchmark.base === 'revenue'
      ? profile.annualRevenue * benchmark.multiplier
      : profile.employeeCount * benchmark.multiplier;

    for (const policy of matchingPolicies) {
      // Poliçedeki toplam teminat limitini hesapla
      const currentLimit = policy.coverages?.reduce((sum, c) => sum + c.amount, 0) || 0;

      if (currentLimit < recommendedLimit) {
        const gap = recommendedLimit - currentLimit;
        const gapPercent = Math.round((gap / recommendedLimit) * 100);

        warnings.push({
          policyType: policyType as PolicyType,
          policyLabel: POLICY_TYPE_LABELS[policyType as PolicyType] || policyType,
          insuranceCompany: policy.insuranceCompany,
          policyNumber: policy.policyNumber,
          currentLimit,
          recommendedLimit: Math.round(recommendedLimit),
          gap: Math.round(gap),
          gapPercent,
          severity: gapPercent > 50 ? 'critical' : 'warning',
          explanation: benchmark.base === 'revenue'
            ? `${profile.sector} sektöründe yıllık cirosu ₺${(profile.annualRevenue / 1_000_000).toFixed(1)}M olan şirketler için önerilen ${benchmark.label} limiti en az ₺${(recommendedLimit / 1_000_000).toFixed(1)}M'dir. Mevcut limitiniz ₺${(currentLimit / 1_000_000).toFixed(1)}M ile %${gapPercent} yetersiz kalıyor.`
            : `${profile.employeeCount} çalışanlı bir şirket için önerilen ${benchmark.label} limiti kişi başı ₺${benchmark.multiplier.toLocaleString('tr-TR')}'dir (toplam ₺${(recommendedLimit / 1_000_000).toFixed(1)}M). Mevcut limitiniz ₺${(currentLimit / 1_000_000).toFixed(1)}M ile yetersiz.`,
        });
      }
    }
  }

  // Kritik olanları öne al
  return warnings.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return b.gapPercent - a.gapPercent;
  });
}
