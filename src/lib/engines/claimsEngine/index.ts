import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { ClaimStatus, CommunicationEntry } from '@/types/claim';
import { validateTransition, calculateSLA, buildStatusHistoryEntry, calculateResolutionDays } from './workflow';
import { logger } from '@/lib/logger';

export { validateTransition, calculateSLA, ClaimWorkflowError } from './workflow';
export { validateFile, uploadClaimDocument } from './documentManager';

const adminDb = getFirestore(getAdminApp());
const CLAIMS_COLLECTION = 'claims';

export async function transitionClaimStatus(
  claimId: string,
  targetStatus: ClaimStatus,
  note?: string
): Promise<void> {
  const claimRef = adminDb.collection(CLAIMS_COLLECTION).doc(claimId);

  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(claimRef);
    if (!snap.exists) throw new Error(`Claim not found: ${claimId}`);

    const data = snap.data()!;
    const currentStatus = data.status as ClaimStatus;

    validateTransition(currentStatus, targetStatus);

    const historyEntry = buildStatusHistoryEntry(targetStatus, note);
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      status: targetStatus,
      statusHistory: FieldValue.arrayUnion(historyEntry),
      updatedAt: FieldValue.serverTimestamp(),
      'sla.currentStatus': targetStatus,
      'sla.statusEnteredAt': now,
    };

    if (targetStatus === 'paid' || targetStatus === 'rejected') {
      updateData.resolutionDays = calculateResolutionDays(data.createdAt, now);
    }

    transaction.update(claimRef, updateData);
  });

  logger.audit('claim_status_change', '', undefined, { claimId, targetStatus, note });
}

export async function addCommunicationEntry(
  claimId: string,
  entry: Omit<CommunicationEntry, 'id'>
): Promise<string> {
  const entryWithId: CommunicationEntry = {
    ...entry,
    id: `comm_${Date.now()}`,
  };

  await adminDb.collection(CLAIMS_COLLECTION).doc(claimId).update({
    communications: FieldValue.arrayUnion(entryWithId),
    updatedAt: FieldValue.serverTimestamp(),
  });

  logger.info(`Communication added to claim ${claimId}`, 'ClaimsEngine', { channel: entry.channel });
  return entryWithId.id;
}

export async function getClaimWithSLA(claimId: string) {
  const snap = await adminDb.collection(CLAIMS_COLLECTION).doc(claimId).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  const sla = calculateSLA(
    data.status,
    data.sla?.statusEnteredAt || data.updatedAt || data.createdAt,
    data.policyType || 'default'
  );

  return { id: snap.id, ...data, sla };
}
