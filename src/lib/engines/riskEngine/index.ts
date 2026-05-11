import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { Policy } from '@/types/policy';
import { CompanyProfile } from '@/types/companyProfile';
import { RiskAssessment, RiskGap, RiskRecommendation } from '@/types/risk';
import { analyzeLimitAdequacy } from '@/lib/engines/limitBenchmarkEngine';
import { getMissingCoverages, type SectorKey } from '@/lib/data/sectorInsurance';
import { logger } from '@/lib/logger';

export { checkOnboardingComplete, requireCompanyProfile } from './onboarding';

const adminDb = getFirestore(getAdminApp());

export async function runFullRiskAssessment(
  tenantId: string,
  companyId: string
): Promise<RiskAssessment> {
  logger.info('Running full risk assessment', 'RiskEngine', { tenantId });

  const [policies, profile] = await Promise.all([
    fetchActivePolicies(tenantId),
    fetchCompanyProfile(tenantId),
  ]);

  if (!profile) {
    throw new Error('Company profile required for risk assessment. Complete onboarding first.');
  }

  const gaps = computeGaps(policies, profile);
  const recommendations = generateRecommendations(gaps);
  const scoreBreakdown = computeScore(policies, profile, gaps);
  const overallScore = Math.round(
    scoreBreakdown.coverageAdequacy * 0.35 +
    scoreBreakdown.limitAdequacy * 0.30 +
    scoreBreakdown.regulatoryCompliance * 0.20 +
    scoreBreakdown.diversification * 0.15
  );

  const assessment: RiskAssessment = {
    id: `ra_${Date.now()}`,
    tenantId,
    companyId,
    assessmentDate: new Date().toISOString(),
    overallScore,
    scoreBreakdown,
    gaps,
    recommendations,
    nextReviewDate: getNextReviewDate(),
    createdAt: new Date().toISOString(),
  };

  await adminDb.collection('riskAssessments').doc(assessment.id).set({
    ...assessment,
    createdAt: FieldValue.serverTimestamp(),
  });

  logger.info(`Risk assessment complete: score ${overallScore}`, 'RiskEngine', {
    tenantId,
    gapCount: gaps.length,
    score: overallScore,
  });

  return assessment;
}

async function fetchActivePolicies(tenantId: string): Promise<Policy[]> {
  const snap = await adminDb
    .collection('policies')
    .where('tenantId', '==', tenantId)
    .where('status', '==', 'active')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Policy));
}

async function fetchCompanyProfile(tenantId: string): Promise<CompanyProfile | null> {
  const snap = await adminDb.collection('companyProfiles').doc(tenantId).get();
  if (!snap.exists) return null;
  return snap.data() as CompanyProfile;
}

function computeGaps(policies: Policy[], profile: CompanyProfile): RiskGap[] {
  const gaps: RiskGap[] = [];
  const sector = (profile.sector || 'genel') as SectorKey;
  const existingTypes = policies.map(p => p.policyType);

  // 1. Missing coverages
  const missingCoverages = getMissingCoverages(sector, existingTypes);
  for (const mc of missingCoverages) {
    gaps.push({
      type: 'missing_coverage',
      severity: mc.severity === 'critical' ? 'critical' : mc.severity === 'warning' ? 'high' : 'medium',
      title: `Eksik Teminat: ${mc.label}`,
      description: mc.why || mc.detail,
      financialExposure: mc.estimatedAnnualCost.max * 10,
      policyType: (mc.mapsToPolicyType || undefined) as Policy['policyType'] | undefined,
      estimatedCost: mc.estimatedAnnualCost,
    });
  }

  // 2. Insufficient limits
  const limitWarnings = analyzeLimitAdequacy(policies, profile);
  for (const lw of limitWarnings) {
    gaps.push({
      type: 'insufficient_limit',
      severity: lw.severity === 'critical' ? 'critical' : 'high',
      title: `Yetersiz Limit: ${lw.policyLabel}`,
      description: lw.explanation,
      financialExposure: lw.gap,
      policyType: lw.policyType,
      estimatedCost: { min: 0, max: lw.gap * 0.01 },
    });
  }

  // 3. Regulatory (DASK, Trafik zorunlu)
  const mandatoryTypes: Array<Policy['policyType']> = ['dask', 'trafik'];
  for (const mt of mandatoryTypes) {
    if (!existingTypes.includes(mt)) {
      gaps.push({
        type: 'regulatory',
        severity: 'critical',
        title: `Yasal Zorunluluk: ${mt === 'dask' ? 'DASK' : 'Trafik Sigortasi'}`,
        description: `${mt === 'dask' ? 'DASK' : 'Trafik'} sigortasi yasal zorunluluktur. Eksiklik durumunda idari para cezasi uygulanir.`,
        financialExposure: mt === 'dask' ? 500000 : 100000,
        policyType: mt as Policy['policyType'],
        estimatedCost: { min: mt === 'dask' ? 1500 : 3000, max: mt === 'dask' ? 5000 : 8000 },
      });
    }
  }

  return gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function generateRecommendations(gaps: RiskGap[]): RiskRecommendation[] {
  return gaps.slice(0, 5).map((gap, i) => ({
    priority: i + 1,
    action: gap.type === 'missing_coverage'
      ? `${gap.title.replace('Eksik Teminat: ', '')} policesi alinmali`
      : gap.type === 'insufficient_limit'
        ? `${gap.title.replace('Yetersiz Limit: ', '')} limiti arttirilmali`
        : `${gap.title} icin acil aksiyon alinmali`,
    expectedBenefit: `${(gap.financialExposure / 1000).toFixed(0)}K TL risk azaltimi`,
    estimatedCost: gap.estimatedCost,
    timeframe: gap.severity === 'critical' ? 'immediate' : gap.severity === 'high' ? '30_days' : '90_days',
  }));
}

function computeScore(
  policies: Policy[],
  profile: CompanyProfile,
  gaps: RiskGap[]
): RiskAssessment['scoreBreakdown'] {
  const sector = (profile.sector || 'genel') as SectorKey;
  const existingTypes = policies.map(p => p.policyType);
  const missingCoverages = getMissingCoverages(sector, existingTypes);

  const totalExpected = missingCoverages.length + existingTypes.length;
  const coverageAdequacy = totalExpected > 0
    ? Math.round((existingTypes.length / totalExpected) * 100)
    : 100;

  const limitGaps = gaps.filter(g => g.type === 'insufficient_limit');
  const limitAdequacy = limitGaps.length === 0 ? 100 : Math.max(0, 100 - limitGaps.length * 20);

  const regulatoryGaps = gaps.filter(g => g.type === 'regulatory');
  const regulatoryCompliance = regulatoryGaps.length === 0 ? 100 : Math.max(0, 100 - regulatoryGaps.length * 40);

  const uniqueTypes = new Set(existingTypes).size;
  const diversification = Math.min(100, uniqueTypes * 15);

  return { coverageAdequacy, limitAdequacy, regulatoryCompliance, diversification };
}

function getNextReviewDate(): string {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return next.toISOString();
}
