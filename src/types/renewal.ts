import { PolicyType } from './policy';

export type RenewalStatus =
  | 'upcoming'           // Vade yaklasıyor
  | 'quote_requested'    // Teklif talep edildi
  | 'quotes_received'    // Teklifler geldi
  | 'comparing'          // Karsilastirma yapiliyor
  | 'selected'           // Teklif secildi
  | 'renewed'            // Yenilendi
  | 'lapsed';            // Vade gecti (yenilenmedi)

export interface RenewalProcess {
  id: string;
  tenantId: string;
  companyId: string;
  policyId: string;
  policyNumber: string;
  policyType: PolicyType;
  currentInsurer: string;
  currentPremium: number;
  expiryDate: string;

  status: RenewalStatus;
  statusHistory: { status: RenewalStatus; timestamp: string; note?: string }[];

  receivedQuotes: ReceivedQuote[];
  selectedQuoteId?: string;

  assignedTo?: string;
  nextActionDate?: string;
  notes: string[];

  createdAt: string;
  updatedAt: string;
}

export interface ReceivedQuote {
  id: string;
  brokerName: string;
  insurerName: string;
  receivedDate: string;
  annualPremium: number;
  coverages: { name: string; limit: number; deductible?: number }[];
  specialConditions: string[];
  validUntil: string;
  documentUrl?: string;
  score?: number;
}

export const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  upcoming: 'Vade Yaklasıyor',
  quote_requested: 'Teklif Talep Edildi',
  quotes_received: 'Teklifler Geldi',
  comparing: 'Karsilastiriliyor',
  selected: 'Teklif Secildi',
  renewed: 'Yenilendi',
  lapsed: 'Vade Gecti',
};

export const RENEWAL_STATUS_ICONS: Record<RenewalStatus, string> = {
  upcoming: '⏰',
  quote_requested: '📨',
  quotes_received: '📬',
  comparing: '⚖️',
  selected: '✅',
  renewed: '🎉',
  lapsed: '❌',
};

export const VALID_RENEWAL_TRANSITIONS: Record<RenewalStatus, RenewalStatus[]> = {
  upcoming: ['quote_requested', 'lapsed'],
  quote_requested: ['quotes_received', 'lapsed'],
  quotes_received: ['comparing', 'lapsed'],
  comparing: ['selected', 'quotes_received', 'lapsed'],
  selected: ['renewed', 'comparing'],
  renewed: [],
  lapsed: ['upcoming'],
};
