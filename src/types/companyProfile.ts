// ============================================
// Company Profile — Şirket Profili Tipi
// Limit Benchmarking ve AI Analizi için kullanılır
// ============================================

import { SectorKey } from '@/lib/data/sectorInsurance';

export interface CompanyProfile {
  sector: SectorKey;
  annualRevenue: number;   // Yıllık ciro (TRY)
  employeeCount: number;   // Çalışan sayısı
  updatedAt?: string;
}
