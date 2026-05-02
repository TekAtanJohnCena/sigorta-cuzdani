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
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  setDoc,
  runTransaction,
  writeBatch,
} from "firebase/firestore";

const POLICIES_COLLECTION = "policies";
const PORTFOLIO_METADATA_COLLECTION = "portfolioMetadata";

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
  const docRef = await addDoc(collection(db, POLICIES_COLLECTION), {
    ...policyData,
    tenantId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
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
  return await runTransaction(db, async (transaction) => {
    // Step 1: Create new policy document reference
    const policyRef = doc(collection(db, POLICIES_COLLECTION));

    const policyDoc = {
      ...policyData,
      tenantId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Step 2: Read current portfolio metadata
    const metadataRef = doc(db, PORTFOLIO_METADATA_COLLECTION, tenantId);
    const metadataSnap = await transaction.get(metadataRef);

    const currentCount = metadataSnap.exists()
      ? (metadataSnap.data().policyCount || 0)
      : 0;

    // Step 3: Write policy + update metadata atomically
    transaction.set(policyRef, policyDoc);

    transaction.set(
      metadataRef,
      {
        tenantId,
        policyCount: currentCount + 1,
        lastPolicyAdded: Timestamp.now(),
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    return policyRef.id;
  });
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
  const batch = writeBatch(db);

  const policyRef = doc(collection(db, POLICIES_COLLECTION));

  batch.set(policyRef, {
    ...policyData,
    tenantId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // If you have other writes (e.g., update tenant stats), add them here
  // batch.update(tenantStatsRef, { policyCount: increment(1) });

  await batch.commit();

  return policyRef.id;
}

// PolicyDocument — Firestore'dan gelen dinamik tipler
interface PolicyDocument {
  id: string;
  tenantId?: string;
  createdAt?: Timestamp | string | number;
  updatedAt?: Timestamp | string | number;
  [key: string]: unknown;
}

export async function getPoliciesByTenant(tenantId: string): Promise<PolicyDocument[]> {
  const q = query(
    collection(db, POLICIES_COLLECTION),
    where("tenantId", "==", tenantId)
  );
  const snap = await getDocs(q);
  // Sort on client side to avoid requiring a composite index in Firestore
  const docs: PolicyDocument[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a: PolicyDocument, b: PolicyDocument) => {
    const aDate = a.createdAt instanceof Timestamp
      ? a.createdAt.toDate()
      : new Date(a.createdAt || 0);
    const bDate = b.createdAt instanceof Timestamp
      ? b.createdAt.toDate()
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
  nextCursor: DocumentSnapshot | null;
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
  options: { pageSize?: number; cursor?: DocumentSnapshot | null } = {}
): Promise<PaginatedPoliciesResult> {
  const { pageSize = 25, cursor = null } = options;

  // pageSize + 1 çekerek hasMore'u hesaplıyoruz (ekstra sorgu yok)
  const fetchSize = pageSize + 1;

  const constraints = [
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc"),
    limit(fetchSize),
    ...(cursor ? [startAfter(cursor)] : []),
  ];

  const q = query(collection(db, POLICIES_COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const hasMore = snap.docs.length > pageSize;
  const docs = snap.docs.slice(0, pageSize);

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

export async function getPolicyById(id: string, tenantId?: string) {
  const snap = await getDoc(doc(db, POLICIES_COLLECTION, id));
  if (!snap.exists()) return null;

  const data = snap.data();

  // G-02: Tenant izolasyonu — eşleşmezse erişimi engelle
  if (tenantId && data.tenantId !== tenantId) {
    console.warn(`[SECURITY] Cross-tenant access blocked: requested=${tenantId}, actual=${data.tenantId}, policyId=${id}`);
    return null;
  }

  return { id: snap.id, ...data };
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

export async function deletePolicy(id: string, tenantId?: string) {
  // G-03: Önce dokümanı oku, tenant eşleşmesini doğrula
  if (tenantId) {
    const snap = await getDoc(doc(db, POLICIES_COLLECTION, id));
    if (!snap.exists()) {
      throw new Error(`Poliçe bulunamadı: ${id}`);
    }
    if (snap.data().tenantId !== tenantId) {
      console.error(`[SECURITY] Unauthorized delete attempt: requested=${tenantId}, actual=${snap.data().tenantId}, policyId=${id}`);
      throw new Error("Bu poliçeyi silme yetkiniz yok.");
    }
  }
  await deleteDoc(doc(db, POLICIES_COLLECTION, id));
}

// AI Insights Persistence
const INSIGHTS_COLLECTION = "insights";

export async function saveAnalysisResults(
  tenantId: string,
  analysisData: Record<string, unknown>
): Promise<void> {
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
  } catch (error) {
    console.error(`[SECURITY] [FAIL-CLOSED] Tenant expiry verification failed. Access denied for tenantId=${tenantId}. Error: ${(error as Error).message}`);
    return { expired: true }; // Fail closed — block access on error
  }
}

// ============================================
// Company Profile (Şirket Profili)
// Limit Benchmarking & AI Analiz Zenginleştirme
// ============================================
const COMPANY_PROFILES_COLLECTION = "companyProfiles";

export async function saveCompanyProfile(
  tenantId: string,
  profile: { sector: string; annualRevenue: number; employeeCount: number }
) {
  await setDoc(doc(db, COMPANY_PROFILES_COLLECTION, tenantId), {
    ...profile,
    tenantId,
    updatedAt: Timestamp.now(),
  });
}

export async function getCompanyProfile(tenantId: string) {
  const snap = await getDoc(doc(db, COMPANY_PROFILES_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  return snap.data() as { sector: string; annualRevenue: number; employeeCount: number; tenantId: string };
}
