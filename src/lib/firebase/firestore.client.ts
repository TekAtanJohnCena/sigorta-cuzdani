// ============================================
// CLIENT-SIDE ONLY Firestore Operations
// Uses Firebase Client SDK — subject to security rules
// Safe to import in client components and hooks
// ============================================

import { db } from "./config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

const POLICIES_COLLECTION = "policies";
const INSIGHTS_COLLECTION = "insights";
const COMPANY_PROFILES_COLLECTION = "companyProfiles";
const TENANTS_COLLECTION = "tenants";

// PolicyDocument — Firestore'dan gelen dinamik tipler
interface PolicyDocument {
  id: string;
  tenantId?: string;
  createdAt?: Timestamp | string | number;
  updatedAt?: Timestamp | string | number;
  [key: string]: unknown;
}

/**
 * CLIENT-SIDE: Fetch policies by tenant
 * Subject to Firestore security rules
 */
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

/**
 * CLIENT-SIDE: Fetch single policy by ID
 */
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

/**
 * CLIENT-SIDE: Get last AI analysis for tenant
 */
export async function getLastAnalysisByTenant(tenantId: string) {
  const snap = await getDoc(doc(db, INSIGHTS_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * CLIENT-SIDE: Get company profile
 */
export async function getCompanyProfile(tenantId: string) {
  const snap = await getDoc(doc(db, COMPANY_PROFILES_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  return snap.data() as { sector: string; annualRevenue: number; employeeCount: number; tenantId: string };
}

/**
 * CLIENT-SIDE: Save company profile (DEPRECATED - Use API instead)
 * This function is kept for backward compatibility but should use /api/company-profile
 * Note: Will fail due to Firestore security rules - policies/insights have write: false
 */
export async function saveCompanyProfile(
  tenantId: string,
  profile: { sector: string; annualRevenue: number; employeeCount: number }
) {
  throw new Error("saveCompanyProfile: Client-side writes are disabled. Use /api/company-profile endpoint instead.");
}

/**
 * CLIENT-SIDE: Update policy (DEPRECATED - Use API instead)
 */
export async function updatePolicy(id: string, data: Record<string, unknown>) {
  throw new Error("updatePolicy: Client-side writes are disabled. Use /api/policies endpoint instead.");
}

/**
 * CLIENT-SIDE: Delete policy (DEPRECATED - Use API instead)
 */
export async function deletePolicy(id: string, tenantId?: string) {
  throw new Error("deletePolicy: Client-side writes are disabled. Use /api/policies endpoint instead.");
}

/**
 * CLIENT-SIDE: Check tenant subscription expiry
 * Subject to Firestore security rules
 */
export async function checkTenantExpiry(tenantId: string): Promise<{ expired: boolean; endDate?: string }> {
  try {
    const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId));
    if (!snap.exists()) return { expired: false }; // No record = old/admin user, allow access
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
