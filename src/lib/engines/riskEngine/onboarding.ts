import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { CompanyOnboardingStatus } from '@/types/risk';
import { logger } from '@/lib/logger';

const adminDb = getFirestore(getAdminApp());

export async function checkOnboardingComplete(tenantId: string): Promise<CompanyOnboardingStatus> {
  const profileSnap = await adminDb.collection('companyProfiles').doc(tenantId).get();

  if (!profileSnap.exists) {
    return {
      tenantId,
      companyId: tenantId,
      profileComplete: false,
    };
  }

  const data = profileSnap.data()!;
  const profileComplete = !!(data.sector && data.annualRevenue && data.employeeCount);

  return {
    tenantId,
    companyId: data.companyId || tenantId,
    profileComplete,
    sector: data.sector,
    annualRevenue: data.annualRevenue,
    employeeCount: data.employeeCount,
    completedAt: data.completedAt,
  };
}

export async function requireCompanyProfile(tenantId: string): Promise<boolean> {
  const status = await checkOnboardingComplete(tenantId);
  return status.profileComplete;
}

export async function saveCompanyProfile(
  tenantId: string,
  companyId: string,
  profile: { sector: string; annualRevenue: number; employeeCount: number }
): Promise<void> {
  const profileRef = adminDb.collection('companyProfiles').doc(tenantId);

  await profileRef.set({
    tenantId,
    companyId,
    sector: profile.sector,
    annualRevenue: profile.annualRevenue,
    employeeCount: profile.employeeCount,
    completedAt: new Date().toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  logger.audit('company_profile_saved', tenantId, undefined, { sector: profile.sector });
  logger.info('Company profile saved — risk engine can now run', 'Onboarding', { tenantId });
}
