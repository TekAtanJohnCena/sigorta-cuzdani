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
    const aDate = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0);
    const bDate = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime();
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

// ============================================
// Tenant Management (for Super Admin /emre)
// ============================================
const TENANTS_COLLECTION = "tenants";

export async function getAllTenants() {
  const snap = await getDocs(collection(db, TENANTS_COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTenantById(tenantId: string) {
  const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createTenant(data: {
  companyName: string;
  email: string;
  packageType: 'demo' | 'monthly' | 'yearly';
  durationDays: number;
  notes?: string;
}) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + data.durationDays);

  const docRef = await addDoc(collection(db, TENANTS_COLLECTION), {
    ...data,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateTenant(id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, TENANTS_COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTenant(id: string) {
  await deleteDoc(doc(db, TENANTS_COLLECTION, id));
}

export async function checkTenantExpiry(tenantId: string): Promise<{ expired: boolean; endDate?: string }> {
  try {
    const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId));
    if (!snap.exists()) return { expired: false }; // No record = old/admin user, allow access
    const data = snap.data();
    if (!data.endDate) return { expired: false };
    const endDate = new Date(data.endDate);
    const now = new Date();
    return { expired: now > endDate, endDate: data.endDate };
  } catch {
    return { expired: false }; // Fail open — don't block on error
  }
}
