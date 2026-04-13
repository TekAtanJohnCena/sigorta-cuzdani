import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
} from "firebase/firestore";

const POLICIES_COLLECTION = "policies";

export async function savePolicyToFirestore(
  policyData: Record<string, unknown>,
  tenantId: string
) {
  const docRef = await addDoc(collection(db, POLICIES_COLLECTION), {
    ...policyData,
    tenantId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getPoliciesByTenant(tenantId: string) {
  const q = query(
    collection(db, POLICIES_COLLECTION),
    where("tenantId", "==", tenantId)
  );
  const snap = await getDocs(q);
  // Sort on client side to avoid requiring a composite index in Firestore
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a: any, b: any) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

/**
 * Fetch all policies (for global automation tasks)
 */
export async function getAllPolicies() {
  const snap = await getDocs(collection(db, POLICIES_COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all users belonging to a tenant
 */
export async function getUsersByTenant(tenantId: string) {
  const q = query(
    collection(db, "users"),
    where("tenantId", "==", tenantId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getPolicyById(id: string) {
  const snap = await getDoc(doc(db, POLICIES_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updatePolicy(
  id: string,
  data: Record<string, unknown>
) {
  await updateDoc(doc(db, POLICIES_COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deletePolicy(id: string) {
  await deleteDoc(doc(db, POLICIES_COLLECTION, id));
}

// AI Insights Persistence
const INSIGHTS_COLLECTION = "insights";

export async function saveAnalysisResults(tenantId: string, analysisData: any) {
  // Use tenantId as doc ID to keep only the latest one per tenant (or we could use addDoc for history)
  await setDoc(doc(db, INSIGHTS_COLLECTION, tenantId), {
    ...analysisData,
    tenantId,
    createdAt: Timestamp.now(),
  });
}

export async function getLastAnalysisByTenant(tenantId: string) {
  const snap = await getDoc(doc(db, INSIGHTS_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  return snap.data();
}
