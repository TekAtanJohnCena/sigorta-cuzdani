// ============================================
// Sigorta Cüzdanı — Policy Types
// ============================================

export type PolicyType =
  | 'kasko'
  | 'trafik'
  | 'yangin'
  | 'saglik'
  | 'isyeri'
  | 'nakliyat'
  | 'muhendislik'
  | 'sorumluluk'
  | 'ferdi_kaza'
  | 'dask'
  | 'diger';

export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending_review';
export type PaymentType = 'cash' | 'installment';
export type Currency = 'TRY' | 'USD' | 'EUR';
export type InstallmentStatus = 'paid' | 'pending' | 'overdue';

export interface Coverage {
  name: string;
  amount: number;
  currency: Currency;
  deductible?: number;
  deductibleType?: 'percentage' | 'amount';
}

export interface Installment {
  id: string;
  dueDate: string; // ISO 8601
  amount: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface PolicyParty {
  name: string;
  taxId: string;
  address: string;
}

export interface PremiumInfo {
  netPremium: number;
  bsmv: number;
  thgf: number;
  totalPremium: number;
  currency: Currency;
  paymentType: PaymentType;
  installmentCount?: number;
  installmentAmount?: number;
  installments?: Installment[];
}

export interface AIExtractionMeta {
  confidenceScore: number;
  extractedAt: string;
  model: string;
  manuallyReviewed: boolean;
  reviewedBy?: string;
  corrections?: Record<string, unknown>;
}

export interface PolicyDocument {
  originalPdf: string;
  storagePath?: string;
  thumbnailUrl?: string;
  pageCount: number;
  fileName: string;
  fileSize: number; // bytes
}

export interface Policy {
  id: string;
  tenantId: string;

  // Core
  policyType: PolicyType;
  policyNumber: string;
  insuranceCompany: string;
  agencyName: string;
  agencyCode?: string;

  // Dates
  startDate: string; // ISO 8601
  endDate: string;
  createdAt: string;
  updatedAt: string;

  // Parties
  policyHolder: PolicyParty;
  insured: PolicyParty;

  // Coverage
  coverages: Coverage[];

  // Premium
  premium: PremiumInfo;

  // AI
  aiExtraction: AIExtractionMeta;

  // Document
  documents: PolicyDocument;

  // Status & Meta
  status: PolicyStatus;
  tags: string[];
  department?: string;
  notes?: string;
}

// ============================================
// Display helpers
// ============================================

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  kasko: 'Kasko',
  trafik: 'Trafik',
  yangin: 'Yangın',
  saglik: 'Sağlık',
  isyeri: 'İşyeri',
  nakliyat: 'Nakliyat',
  muhendislik: 'Mühendislik',
  sorumluluk: 'Sorumluluk',
  ferdi_kaza: 'Ferdi Kaza',
  dask: 'DASK',
  diger: 'Diğer',
};

export const POLICY_TYPE_ICONS: Record<PolicyType, string> = {
  kasko: '🚗',
  trafik: '🚦',
  yangin: '🔥',
  saglik: '🏥',
  isyeri: '🏢',
  nakliyat: '🚢',
  muhendislik: '⚙️',
  sorumluluk: '⚖️',
  ferdi_kaza: '🛡️',
  dask: '🏠',
  diger: '📋',
};

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  active: 'Aktif',
  expired: 'Süresi Dolmuş',
  cancelled: 'İptal Edilmiş',
  pending_review: 'İnceleme Bekliyor',
};

export const POLICY_TYPE_COLORS: Record<PolicyType, string> = {
  kasko: 'blue',
  trafik: 'amber',
  yangin: 'red',
  saglik: 'green',
  isyeri: 'teal',
  nakliyat: 'blue',
  muhendislik: 'gray',
  sorumluluk: 'amber',
  ferdi_kaza: 'teal',
  dask: 'amber',
  diger: 'gray',
};
