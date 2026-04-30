// ============================================
// Employee Types — Personel Tipi Tanımları
// ============================================

export type InsuranceStatus =
  | 'covered'           // Kapsam altında
  | 'pending_addition'  // Ekleme bekliyor (zeyil)
  | 'pending_removal'   // Çıkarma bekliyor (zeyil)
  | 'not_covered';      // Kapsamda değil

export interface Employee {
  id: string;
  tenantId: string;
  fullName: string;
  tcKimlik?: string;
  birthDate?: string;
  startDate: string;     // İşe giriş tarihi
  endDate?: string;      // İşten çıkış tarihi (varsa)
  department: string;
  position: string;
  isActive: boolean;

  // Sigorta bilgileri
  healthPolicyId?: string;          // Bağlı sağlık poliçesi
  insuranceStatus: InsuranceStatus;
  insuranceCoverageStartDate?: string;

  // Zeyil talep bilgisi
  pendingRequestType?: 'addition' | 'removal';
  pendingRequestDate?: string;

  createdAt: string;
  updatedAt: string;
}

export const INSURANCE_STATUS_LABELS: Record<InsuranceStatus, string> = {
  covered: 'Kapsam Altında',
  pending_addition: 'Ekleme Bekliyor',
  pending_removal: 'Çıkarma Bekliyor',
  not_covered: 'Kapsamda Değil',
};

export const INSURANCE_STATUS_COLORS: Record<InsuranceStatus, string> = {
  covered: 'var(--success-600)',
  pending_addition: 'var(--warning-600)',
  pending_removal: 'var(--warning-600)',
  not_covered: 'var(--danger-500)',
};

export const INSURANCE_STATUS_ICONS: Record<InsuranceStatus, string> = {
  covered: '✅',
  pending_addition: '⏳',
  pending_removal: '⏳',
  not_covered: '❌',
};
