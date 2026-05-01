// ============================================
// Assets Firestore CRUD — Varlık Envanteri
// Pattern: claims.ts ile aynı yapıda
// ============================================

import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Asset } from '@/types/asset';

const ASSETS_COLLECTION = 'assets';

export async function getAssetsByTenant(tenantId: string): Promise<Asset[]> {
  const q = query(
    collection(db, ASSETS_COLLECTION),
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
    } as Asset;
  });
}

export async function createAsset(
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, ASSETS_COLLECTION), {
    ...assetData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateAsset(
  id: string,
  data: Partial<Omit<Asset, 'id' | 'tenantId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, ASSETS_COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteAsset(id: string): Promise<void> {
  await deleteDoc(doc(db, ASSETS_COLLECTION, id));
}
