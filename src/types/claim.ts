// ============================================
// Claim Types — Hasar Tipi Tanımları
// ============================================

import { PolicyType } from './policy';

export type ClaimStatus =
  | 'draft'           // Taslak
  | 'submitted'       // Bildirildi
  | 'expert_assigned' // Eksper Atandı
  | 'under_review'    // İnceleniyor
  | 'approved'        // Onaylandı
  | 'paid'            // Ödendi
  | 'rejected';       // Reddedildi

export interface StatusChange {
  status: ClaimStatus;
  timestamp: string;
  note?: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  url?: string;
  uploadedAt: string;
}

export interface Claim {
  id: string;
  tenantId: string;
  policyId: string;
  policyNumber: string;
  policyType: PolicyType;
  insuranceCompany: string;

  // Hasar detayları
  claimDate: string;           // Bildirimi tarihi
  incidentDate: string;        // Olay tarihi
  description: string;
  estimatedAmount?: number;
  approvedAmount?: number;

  // Durum takibi
  status: ClaimStatus;
  statusHistory: StatusChange[];

  // Belgeler
  documents: ClaimDocument[];

  createdAt: string;
  updatedAt: string;
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Taslak',
  submitted: 'Bildirildi',
  expert_assigned: 'Eksper Atandı',
  under_review: 'İnceleniyor',
  approved: 'Onaylandı',
  paid: 'Ödendi',
  rejected: 'Reddedildi',
};

export const CLAIM_STATUS_COLORS: Record<ClaimStatus, string> = {
  draft: 'var(--neutral-400)',
  submitted: 'var(--primary-500)',
  expert_assigned: 'var(--accent-500)',
  under_review: 'var(--warning-500)',
  approved: 'var(--success-500)',
  paid: 'var(--success-600)',
  rejected: 'var(--danger-500)',
};

export const CLAIM_STATUS_ICONS: Record<ClaimStatus, string> = {
  draft: '📝',
  submitted: '✅',
  expert_assigned: '🔍',
  under_review: '⏳',
  approved: '💰',
  paid: '🎉',
  rejected: '❌',
};

// Kanban sütunları için sıralama
export const CLAIM_STATUS_ORDER: ClaimStatus[] = [
  'draft',
  'submitted',
  'expert_assigned',
  'under_review',
  'approved',
  'paid',
];

// Geçerli durum geçişleri
export const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  draft: ['submitted'],
  submitted: ['expert_assigned', 'rejected'],
  expert_assigned: ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['paid'],
  paid: [],
  rejected: ['submitted'],
};

// SLA süreleri (gün cinsinden)
export const CLAIM_SLA_DAYS: Record<string, Record<string, number>> = {
  kasko: { submitted: 2, expert_assigned: 5, under_review: 3, approved: 10 },
  trafik: { submitted: 1, expert_assigned: 3, under_review: 2, approved: 7 },
  yangin: { submitted: 3, expert_assigned: 10, under_review: 5, approved: 15 },
  saglik: { submitted: 1, expert_assigned: 3, under_review: 2, approved: 5 },
  isyeri: { submitted: 2, expert_assigned: 7, under_review: 5, approved: 10 },
  nakliyat: { submitted: 2, expert_assigned: 7, under_review: 5, approved: 14 },
  dask: { submitted: 3, expert_assigned: 15, under_review: 10, approved: 30 },
  default: { submitted: 2, expert_assigned: 7, under_review: 5, approved: 14 },
};

export interface CommunicationEntry {
  id: string;
  date: string;
  channel: 'phone' | 'email' | 'portal' | 'in_person';
  direction: 'inbound' | 'outbound';
  contactPerson: string;
  summary: string;
  nextAction?: string;
  nextActionDate?: string;
}

export interface ClaimSLA {
  currentStatus: ClaimStatus;
  statusEnteredAt: string;
  deadlineDate: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface ClaimExtended extends Claim {
  companyId: string;
  communications: CommunicationEntry[];
  sla?: ClaimSLA;
  assignedExpertName?: string;
  assignedExpertPhone?: string;
  expertReportUrl?: string;
  deductibleAmount?: number;
  netPayableAmount?: number;
  paymentDate?: string;
  paymentReference?: string;
  resolutionDays?: number;
}
