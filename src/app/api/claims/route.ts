import { NextRequest, NextResponse } from 'next/server';
import { transitionClaimStatus, addCommunicationEntry, getClaimWithSLA, ClaimWorkflowError, validateFile, uploadClaimDocument } from '@/lib/engines/claimsEngine';
import { logger } from '@/lib/logger';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, action, ...payload } = body;

    if (!claimId || !action) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'claimId and action required' } },
        { status: 400 }
      );
    }

    switch (action) {
      case 'transition': {
        const { targetStatus, note } = payload;
        if (!targetStatus) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'targetStatus required' } },
            { status: 400 }
          );
        }
        await transitionClaimStatus(claimId, targetStatus, note);
        return NextResponse.json({ success: true, data: { claimId, newStatus: targetStatus } });
      }

      case 'add_communication': {
        const { channel, direction, contactPerson, summary, nextAction, nextActionDate } = payload;
        if (!channel || !contactPerson || !summary) {
          return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: 'channel, contactPerson, summary required' } },
            { status: 400 }
          );
        }
        const id = await addCommunicationEntry(claimId, {
          date: new Date().toISOString(),
          channel,
          direction: direction || 'outbound',
          contactPerson,
          summary,
          nextAction,
          nextActionDate,
        });
        return NextResponse.json({ success: true, data: { communicationId: id } });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'BAD_REQUEST', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof ClaimWorkflowError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 422 }
      );
    }
    logger.error('Claims API error', 'ClaimsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Islem basarisiz' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const claimId = request.nextUrl.searchParams.get('id');
  if (!claimId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'id query param required' } },
      { status: 400 }
    );
  }

  try {
    const claim = await getClaimWithSLA(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: claim });
  } catch (error) {
    logger.error('Claims GET error', 'ClaimsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Hasar bilgisi alinamadi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const claimId = formData.get('claimId') as string;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !claimId || !tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'file, claimId, tenantId required' } },
        { status: 400 }
      );
    }

    const validation = validateFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: validation.error } },
        { status: 422 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadClaimDocument(tenantId, claimId, file.name, buffer, file.type);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: result.error } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('Claims upload error', 'ClaimsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Dosya yuklenemedi' } },
      { status: 500 }
    );
  }
}
