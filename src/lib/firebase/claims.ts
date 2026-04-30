// ============================================
// Claims Firestore CRUD
// ============================================

import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Claim, ClaimStatus, StatusChange } from '@/types/claim';

const CLAIMS_COLLECTION = 'claims';

export async function getClaimsByTenant(tenantId: string): Promise<Claim[]> {
  const q = query(
    collection(db, CLAIMS_COLLECTION),
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
    } as Claim;
  });
}

export async function createClaim(
  claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, CLAIMS_COLLECTION), {
    ...claimData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateClaimStatus(
  claimId: string,
  newStatus: ClaimStatus,
  note?: string
): Promise<void> {
  const statusChange: StatusChange = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    ...(note ? { note } : {}),
  };

  const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
  await updateDoc(claimRef, {
    status: newStatus,
    statusHistory: statusChange, // Firestore arrayUnion yerine direkt — basit MVP için
    updatedAt: Timestamp.now(),
  });
}
