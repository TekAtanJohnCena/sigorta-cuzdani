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
