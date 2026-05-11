import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, companyId, action } = body;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'tenantId required' } },
        { status: 400 }
      );
    }

    switch (action) {
      case 'assess': {
        const { runFullRiskAssessment } = await import('@/lib/engines/riskEngine');
        const assessment = await runFullRiskAssessment(tenantId, companyId || tenantId);
        return NextResponse.json({ success: true, data: assessment });
      }

      case 'check_onboarding': {
        const { checkOnboardingComplete } = await import('@/lib/engines/riskEngine');
        const status = await checkOnboardingComplete(tenantId);
        return NextResponse.json({ success: true, data: status });
      }

      case 'save_profile': {
        const { sector, annualRevenue, employeeCount } = body;
        if (!sector || !annualRevenue || !employeeCount) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'sector, annualRevenue, employeeCount required' } },
            { status: 400 }
          );
        }

        const { saveCompanyProfile } = await import('@/lib/engines/riskEngine/onboarding');
        await saveCompanyProfile(tenantId, companyId || tenantId, { sector, annualRevenue, employeeCount });

        // Auto-trigger risk assessment after profile save
        const { runFullRiskAssessment } = await import('@/lib/engines/riskEngine');
        const assessment = await runFullRiskAssessment(tenantId, companyId || tenantId);

        return NextResponse.json({
          success: true,
          data: { profileSaved: true, assessment },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'BAD_REQUEST', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Risk analizi basarisiz';
    logger.error('Risk API error', 'RiskAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message } },
      { status: 500 }
    );
  }
}
