import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'tenantId required' } },
      { status: 400 }
    );
  }

  try {
    const { getRenewalsByTenant } = await import('@/lib/engines/renewalEngine');
    const renewals = await getRenewalsByTenant(tenantId);
    return NextResponse.json({ success: true, data: renewals });
  } catch (error) {
    logger.error('Renewals GET error', 'RenewalsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Yenileme listesi alinamadi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'action required' } },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create': {
        const { tenantId, companyId, policyId, policyNumber, policyType, currentInsurer, currentPremium, expiryDate } = payload;
        if (!tenantId || !policyId || !expiryDate) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'tenantId, policyId, expiryDate required' } },
            { status: 400 }
          );
        }

        const { createRenewalProcess } = await import('@/lib/engines/renewalEngine');
        const id = await createRenewalProcess({
          tenantId, companyId: companyId || tenantId,
          policyId, policyNumber: policyNumber || '',
          policyType: policyType || 'diger',
          currentInsurer: currentInsurer || '',
          currentPremium: currentPremium || 0,
          expiryDate,
        });
        return NextResponse.json({ success: true, data: { renewalId: id } });
      }

      case 'transition': {
        const { renewalId, targetStatus, note } = payload;
        if (!renewalId || !targetStatus) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'renewalId, targetStatus required' } },
            { status: 400 }
          );
        }

        const { transitionRenewalStatus } = await import('@/lib/engines/renewalEngine');
        await transitionRenewalStatus(renewalId, targetStatus, note);
        return NextResponse.json({ success: true, data: { renewalId, newStatus: targetStatus } });
      }

      case 'add_quote': {
        const { renewalId, brokerName, insurerName, annualPremium, coverages, specialConditions, validUntil } = payload;
        if (!renewalId || !insurerName || !annualPremium) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'renewalId, insurerName, annualPremium required' } },
            { status: 400 }
          );
        }

        const { addQuoteToRenewal } = await import('@/lib/engines/renewalEngine');
        const quoteId = await addQuoteToRenewal(renewalId, {
          brokerName: brokerName || '',
          insurerName,
          receivedDate: new Date().toISOString(),
          annualPremium,
          coverages: coverages || [],
          specialConditions: specialConditions || [],
          validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
        });
        return NextResponse.json({ success: true, data: { quoteId } });
      }

      case 'select_quote': {
        const { renewalId, quoteId } = payload;
        if (!renewalId || !quoteId) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'renewalId, quoteId required' } },
            { status: 400 }
          );
        }

        const { selectQuote } = await import('@/lib/engines/renewalEngine');
        await selectQuote(renewalId, quoteId);
        return NextResponse.json({ success: true, data: { renewalId, selectedQuoteId: quoteId } });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'BAD_REQUEST', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Yenileme islemi basarisiz';
    const code = (error as { code?: string }).code || 'INTERNAL';
    const status = code === 'INVALID_TRANSITION' ? 422 : 500;

    logger.error('Renewals API error', 'RenewalsAPI', error);
    return NextResponse.json(
      { success: false, error: { code, message } },
      { status }
    );
  }
}
