import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { RenewalProcess, RenewalStatus, ReceivedQuote, VALID_RENEWAL_TRANSITIONS } from '@/types/renewal';
import { logger } from '@/lib/logger';

const adminDb = getFirestore(getAdminApp());
const RENEWALS_COLLECTION = 'renewals';

export class RenewalWorkflowError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'RenewalWorkflowError';
  }
}

// --- State Machine ---

export function validateRenewalTransition(current: RenewalStatus, target: RenewalStatus): void {
  const allowed = VALID_RENEWAL_TRANSITIONS[current];
  if (!allowed || !allowed.includes(target)) {
    throw new RenewalWorkflowError(
      `Gecersiz gecis: ${current} → ${target}. Izin verilen: ${allowed?.join(', ') || 'yok'}`,
      'INVALID_TRANSITION'
    );
  }
}

// --- Create Renewal Process ---

export async function createRenewalProcess(data: {
  tenantId: string;
  companyId: string;
  policyId: string;
  policyNumber: string;
  policyType: string;
  currentInsurer: string;
  currentPremium: number;
  expiryDate: string;
}): Promise<string> {
  const now = new Date().toISOString();
  const docRef = adminDb.collection(RENEWALS_COLLECTION).doc();

  const renewal: Omit<RenewalProcess, 'id'> & { id: string } = {
    id: docRef.id,
    tenantId: data.tenantId,
    companyId: data.companyId,
    policyId: data.policyId,
    policyNumber: data.policyNumber,
    policyType: data.policyType as RenewalProcess['policyType'],
    currentInsurer: data.currentInsurer,
    currentPremium: data.currentPremium,
    expiryDate: data.expiryDate,
    status: 'upcoming',
    statusHistory: [{ status: 'upcoming', timestamp: now }],
    receivedQuotes: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set({ ...renewal, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

  logger.info(`Renewal process created: ${docRef.id}`, 'RenewalEngine', { tenantId: data.tenantId, policyId: data.policyId });
  return docRef.id;
}

// --- Transition Status ---

export async function transitionRenewalStatus(
  renewalId: string,
  targetStatus: RenewalStatus,
  note?: string
): Promise<void> {
  const ref = adminDb.collection(RENEWALS_COLLECTION).doc(renewalId);

  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists) throw new Error(`Renewal not found: ${renewalId}`);

    const data = snap.data()!;
    validateRenewalTransition(data.status as RenewalStatus, targetStatus);

    transaction.update(ref, {
      status: targetStatus,
      statusHistory: FieldValue.arrayUnion({
        status: targetStatus,
        timestamp: new Date().toISOString(),
        ...(note && { note }),
      }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  logger.audit('renewal_status_change', '', undefined, { renewalId, targetStatus });
}

// --- Add Quote ---

export async function addQuoteToRenewal(
  renewalId: string,
  quote: Omit<ReceivedQuote, 'id'>
): Promise<string> {
  const quoteWithId: ReceivedQuote = {
    ...quote,
    id: `quote_${Date.now()}`,
  };

  const ref = adminDb.collection(RENEWALS_COLLECTION).doc(renewalId);

  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists) throw new Error(`Renewal not found: ${renewalId}`);

    const data = snap.data()!;
    const currentStatus = data.status as RenewalStatus;

    // Auto-transition to quotes_received if first quote and status is quote_requested
    const updates: Record<string, unknown> = {
      receivedQuotes: FieldValue.arrayUnion(quoteWithId),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (currentStatus === 'quote_requested') {
      updates.status = 'quotes_received';
      updates.statusHistory = FieldValue.arrayUnion({
        status: 'quotes_received',
        timestamp: new Date().toISOString(),
        note: 'Ilk teklif geldi',
      });
    }

    transaction.update(ref, updates);
  });

  logger.info(`Quote added to renewal ${renewalId}`, 'RenewalEngine', {
    insurer: quote.insurerName,
    premium: quote.annualPremium,
  });

  return quoteWithId.id;
}

// --- Select Quote ---

export async function selectQuote(renewalId: string, quoteId: string): Promise<void> {
  const ref = adminDb.collection(RENEWALS_COLLECTION).doc(renewalId);

  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists) throw new Error(`Renewal not found: ${renewalId}`);

    const data = snap.data()!;
    const quotes = (data.receivedQuotes || []) as ReceivedQuote[];
    const quote = quotes.find(q => q.id === quoteId);

    if (!quote) throw new Error(`Quote not found: ${quoteId}`);

    validateRenewalTransition(data.status as RenewalStatus, 'selected');

    transaction.update(ref, {
      selectedQuoteId: quoteId,
      status: 'selected',
      statusHistory: FieldValue.arrayUnion({
        status: 'selected',
        timestamp: new Date().toISOString(),
        note: `${quote.insurerName} teklifi secildi (${quote.annualPremium} TL)`,
      }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  logger.audit('renewal_quote_selected', '', undefined, { renewalId, quoteId });
}

// --- Get Renewals for Tenant ---

export async function getRenewalsByTenant(tenantId: string): Promise<RenewalProcess[]> {
  const snap = await adminDb
    .collection(RENEWALS_COLLECTION)
    .where('tenantId', '==', tenantId)
    .orderBy('expiryDate', 'asc')
    .get();

  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as RenewalProcess));
}
