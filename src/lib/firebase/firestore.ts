// ============================================
// SERVER-SIDE ONLY Firestore Operations
// Uses Firebase Admin SDK — bypasses security rules
// NEVER import this file in client components
// ============================================

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "./adminApp";

// Initialize Admin SDK
const adminDb = getFirestore(getAdminApp());

const POLICIES_COLLECTION = "policies";
const PORTFOLIO_METADATA_COLLECTION = "portfolioMetadata";
const INSIGHTS_COLLECTION = "insights";
const TENANTS_COLLECTION = "tenants";
const COMPANY_PROFILES_COLLECTION = "companyProfiles";

// ============================================
// TRANSACTIONAL POLICY CREATION
// Ensures atomicity: Policy + Portfolio Metadata update
// If either fails, both rollback
// ============================================

export async function savePolicyToFirestore(
  policyData: Record<string, unknown>,
  tenantId: string
) {
  // Simple version (no transaction) — kept for backward compatibility
  const docRef = await adminDb.collection(POLICIES_COLLECTION).add({
    ...policyData,
    tenantId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

/**
 * ENTERPRISE-GRADE: Transactional policy creation
 *
 * Atomically creates a policy and updates portfolio metadata (count, last updated).
 * If portfolio metadata update fails, the policy creation is rolled back.
 *
 * Use this for production B2B flows where consistency is critical.
 */
export async function savePolicyWithTransaction(
  policyData: Record<string, unknown>,
  tenantId: string
): Promise<string> {
  const policyRef = adminDb.collection(POLICIES_COLLECTION).doc();
  const metadataRef = adminDb.collection(PORTFOLIO_METADATA_COLLECTION).doc(tenantId);

  await adminDb.runTransaction(async (transaction) => {
    const metadataSnap = await transaction.get(metadataRef);

    const currentCount = metadataSnap.exists
      ? (metadataSnap.data()?.policyCount || 0)
      : 0;

    // Step 1: Write policy
    transaction.set(policyRef, {
      ...policyData,
      tenantId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Step 2: Update metadata atomically
    transaction.set(
      metadataRef,
      {
        tenantId,
        policyCount: currentCount + 1,
        lastPolicyAdded: FieldValue.serverTimestamp(),
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return policyRef.id;
}

/**
 * BATCH WRITE VERSION (Alternative)
 *
 * Use batch writes when you don't need to read existing data.
 * Faster than transactions but doesn't support read-before-write.
 */
export async function savePolicyBatch(
  policyData: Record<string, unknown>,
  tenantId: string
): Promise<string> {
  const batch = adminDb.batch();
  const policyRef = adminDb.collection(POLICIES_COLLECTION).doc();

  batch.set(policyRef, {
    ...policyData,
    tenantId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // If you have other writes (e.g., update tenant stats), add them here
  // batch.update(tenantStatsRef, { policyCount: FieldValue.increment(1) });

  await batch.commit();

  return policyRef.id;
}

// PolicyDocument — Firestore'dan gelen dinamik tipler
interface PolicyDocument {
  id: string;
  tenantId?: string;
  createdAt?: FirebaseFirestore.Timestamp | string | number;
  updatedAt?: FirebaseFirestore.Timestamp | string | number;
  [key: string]: unknown;
}

export async function getPoliciesByTenant(tenantId: string): Promise<PolicyDocument[]> {
  const snapshot = await adminDb
    .collection(POLICIES_COLLECTION)
    .where("tenantId", "==", tenantId)
    .get();

  // Sort on client side to avoid requiring a composite index in Firestore
  const docs: PolicyDocument[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  return docs.sort((a: PolicyDocument, b: PolicyDocument) => {
    const aDate = a.createdAt instanceof Object && 'toDate' in a.createdAt
      ? (a.createdAt as FirebaseFirestore.Timestamp).toDate()
      : new Date(a.createdAt || 0);
    const bDate = b.createdAt instanceof Object && 'toDate' in b.createdAt
      ? (b.createdAt as FirebaseFirestore.Timestamp).toDate()
      : new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime();
  });
}

// ============================================
// G-10: Cursor-based Pagination
// Geriye dönük uyumlu — mevcut usePolicies hook'u etkilenmiyor
// ============================================

export interface PaginatedPoliciesResult {
  policies: Record<string, unknown>[];
  /** Sonraki sayfa için cursor — null ise son sayfadayız */
  nextCursor: FirebaseFirestore.DocumentSnapshot | null;
  /** Bu sayfada dönen kayıt sayısı */
  count: number;
  /** Daha fazla kayıt var mı? */
  hasMore: boolean;
}

/**
 * Cursor-based paginated policy fetching.
 * Ana şablonda 25 kayıt/sayfa önerilir.
 *
 * Kullanım:
 *   const { policies, nextCursor, hasMore } = await getPoliciesByTenantPaginated(tenantId);
 *   // Sonraki sayfa:
 *   const page2 = await getPoliciesByTenantPaginated(tenantId, { pageSize: 25, cursor: nextCursor });
 */
export async function getPoliciesByTenantPaginated(
  tenantId: string,
  options: { pageSize?: number; cursor?: FirebaseFirestore.DocumentSnapshot | null } = {}
): Promise<PaginatedPoliciesResult> {
  const { pageSize = 25, cursor = null } = options;

  // pageSize + 1 çekerek hasMore'u hesaplıyoruz (ekstra sorgu yok)
  const fetchSize = pageSize + 1;

  let query = adminDb
    .collection(POLICIES_COLLECTION)
    .where("tenantId", "==", tenantId)
    .orderBy("createdAt", "desc")
    .limit(fetchSize);

  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();

  const hasMore = snapshot.docs.length > pageSize;
  const docs = snapshot.docs.slice(0, pageSize);

  return {
    policies: docs.map((d) => ({ id: d.id, ...d.data() })),
    nextCursor: hasMore ? docs[docs.length - 1] : null,
    count: docs.length,
    hasMore,
  };
}

/**
 * Fetch all policies (for global automation tasks)
 */
export async function getAllPolicies() {
  const snapshot = await adminDb.collection(POLICIES_COLLECTION).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all users belonging to a tenant
 */
export async function getUsersByTenant(tenantId: string) {
  const snapshot = await adminDb
    .collection("users")
    .where("tenantId", "==", tenantId)
    .get();
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getPolicyById(id: string, tenantId?: string) {
  const docRef = adminDb.collection(POLICIES_COLLECTION).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) return null;

  const data = snap.data();

  // G-02: Tenant izolasyonu — eşleşmezse erişimi engelle
  if (tenantId && data?.tenantId !== tenantId) {
    console.warn(`[SECURITY] Cross-tenant access blocked: requested=${tenantId}, actual=${data?.tenantId}, policyId=${id}`);
    return null;
  }

  return { id: snap.id, ...data };
}

export async function updatePolicy(
  id: string,
  data: Record<string, unknown>
) {
  await adminDb.collection(POLICIES_COLLECTION).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deletePolicy(id: string, tenantId?: string) {
  const docRef = adminDb.collection(POLICIES_COLLECTION).doc(id);

  // G-03: Önce dokümanı oku, tenant eşleşmesini doğrula
  if (tenantId) {
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Poliçe bulunamadı: ${id}`);
    }
    if (snap.data()?.tenantId !== tenantId) {
      console.error(`[SECURITY] Unauthorized delete attempt: requested=${tenantId}, actual=${snap.data()?.tenantId}, policyId=${id}`);
      throw new Error("Bu poliçeyi silme yetkiniz yok.");
    }
  }
  await docRef.delete();
}

// ============================================
// AI INSIGHTS PERSISTENCE (Server-side Admin SDK)
// Client-side write kapalı — sadece API route'larından yazılabilir
// ============================================

export async function saveAnalysisResults(
  tenantId: string,
  analysisData: Record<string, unknown>
): Promise<void> {
  // Use tenantId as doc ID to keep only the latest one per tenant (or we could use addDoc for history)
  await adminDb.collection(INSIGHTS_COLLECTION).doc(tenantId).set({
    ...analysisData,
    tenantId,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getLastAnalysisByTenant(tenantId: string) {
  const snap = await adminDb.collection(INSIGHTS_COLLECTION).doc(tenantId).get();
  if (!snap.exists) return null;
  return snap.data();
}

// ============================================
// Tenant Management (for Super Admin /emre)
// ============================================

export async function getAllTenants() {
  const snapshot = await adminDb.collection(TENANTS_COLLECTION).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTenantById(tenantId: string) {
  const snap = await adminDb.collection(TENANTS_COLLECTION).doc(tenantId).get();
  if (!snap.exists) return null;
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

  const docRef = await adminDb.collection(TENANTS_COLLECTION).add({
    ...data,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTenant(id: string, data: Record<string, unknown>) {
  await adminDb.collection(TENANTS_COLLECTION).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteTenant(id: string) {
  await adminDb.collection(TENANTS_COLLECTION).doc(id).delete();
}

export async function checkTenantExpiry(tenantId: string): Promise<{ expired: boolean; endDate?: string }> {
  try {
    const snap = await adminDb.collection(TENANTS_COLLECTION).doc(tenantId).get();
    if (!snap.exists) return { expired: false }; // No record = old/admin user, allow access
    const data = snap.data();
    if (!data?.endDate) return { expired: false };
    const endDate = new Date(data.endDate);
    const now = new Date();
    return { expired: now > endDate, endDate: data.endDate };
  } catch (error) {
    console.error(`[SECURITY] [FAIL-CLOSED] Tenant expiry verification failed. Access denied for tenantId=${tenantId}. Error: ${(error as Error).message}`);
    return { expired: true }; // Fail closed — block access on error
  }
}

// ============================================
// Company Profile (Şirket Profili)
// Limit Benchmarking & AI Analiz Zenginleştirme
// ============================================

export async function saveCompanyProfile(
  tenantId: string,
  profile: { sector: string; annualRevenue: number; employeeCount: number }
) {
  await adminDb.collection(COMPANY_PROFILES_COLLECTION).doc(tenantId).set({
    ...profile,
    tenantId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getCompanyProfile(tenantId: string) {
  const snap = await adminDb.collection(COMPANY_PROFILES_COLLECTION).doc(tenantId).get();
  if (!snap.exists) return null;
  return snap.data() as { sector: string; annualRevenue: number; employeeCount: number; tenantId: string };
}

// ============================================
// POLICY COMPARISON & SHARE LINKS
// ============================================

import { nanoid } from "nanoid";

const COMPARISONS_COLLECTION = "comparisons";
const SHARE_LINKS_COLLECTION = "shareLinks";

export async function saveComparison(
  tenantId: string,
  policyIds: string[],
  metadata: { createdBy: string; title?: string; notes?: string }
): Promise<string> {
  const docRef = await adminDb.collection(COMPARISONS_COLLECTION).add({
    tenantId,
    policyIds,
    ...metadata,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function createShareLink(
  tenantId: string,
  comparisonId: string,
  policyIds: string[]
): Promise<{ token: string; expiresAt: string }> {
  const token = nanoid(10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  await adminDb.collection(SHARE_LINKS_COLLECTION).doc(token).set({
    tenantId,
    comparisonId,
    policyIds,
    createdAt: now.toISOString(),
    expiresAt,
    accessCount: 0,
    isActive: true,
  });

  return { token, expiresAt };
}

export async function validateShareLink(token: string) {
  const docRef = adminDb.collection(SHARE_LINKS_COLLECTION).doc(token);
  const snap = await docRef.get();

  if (!snap.exists) return null;
  const data = snap.data()!;

  if (new Date(data.expiresAt) < new Date()) {
    await docRef.update({ isActive: false });
    return null;
  }

  if (!data.isActive) return null;

  await docRef.update({
    accessCount: (data.accessCount || 0) + 1,
    lastAccessedAt: new Date().toISOString(),
  });

  return data;
}

export async function getPoliciesByIds(
  policyIds: string[],
  tenantId: string
): Promise<any[]> {
  const snapshot = await adminDb
    .collection(POLICIES_COLLECTION)
    .where(FieldValue.documentId(), "in", policyIds)
    .where("tenantId", "==", tenantId)
    .get();

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
