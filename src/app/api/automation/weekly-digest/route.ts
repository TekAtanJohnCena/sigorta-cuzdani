import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // --- Security Check ---
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron attempt', 'WeeklyDigest', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing CRON_SECRET' } },
        { status: 401 }
      );
    }
  } else {
    logger.warn('CRON_SECRET not configured — running in dev mode (no auth required)', 'WeeklyDigest');
  }

  // --- Firebase Admin SDK check ---
  const hasFirebaseCredentials = !!(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  if (!hasFirebaseCredentials) {
    logger.warn('Firebase Admin credentials missing — simulating cron run', 'WeeklyDigest');
    return NextResponse.json({
      success: true,
      simulation: true,
      data: {
        message: 'Cron endpoint çalışıyor ancak Firebase credentials eksik. .env ayarlandığında gerçek digest emails gönderilecek.',
        checkedAt: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
      },
    });
  }

  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getAdminApp } = await import('@/lib/firebase/adminApp');
    const { sendWeeklyDigest } = await import('@/lib/engines/notificationEngine/weeklyDigest');

    const adminDb = getFirestore(getAdminApp());

    // --- Fetch all active tenants ---
    const tenantsSnapshot = await adminDb.collection('tenants').where('status', '==', 'active').get();

    if (tenantsSnapshot.empty) {
      logger.info('No active tenants found', 'WeeklyDigest');
      return NextResponse.json({
        success: true,
        data: {
          tenantsProcessed: 0,
          totalEmailsSent: 0,
          checkedAt: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`,
        },
      });
    }

    // --- Process each tenant ---
    const summary = {
      tenantsProcessed: 0,
      totalEmailsSent: 0,
      byTenant: [] as { tenantId: string; companyId: string; emailsSent: number }[],
    };

    for (const tenantDoc of tenantsSnapshot.docs) {
      const tenantData = tenantDoc.data();
      const tenantId = tenantDoc.id;
      const companyId = tenantData.companyId || tenantId;

      try {
        const emailsSent = await sendWeeklyDigest(tenantId, companyId);

        summary.tenantsProcessed++;
        summary.totalEmailsSent += emailsSent;
        summary.byTenant.push({ tenantId, companyId, emailsSent });
      } catch (tenantError) {
        logger.error(`Failed to send weekly digest for tenant: ${tenantId}`, 'WeeklyDigest', tenantError);
        // Continue with next tenant even if one fails
      }
    }

    // --- Summary Log ---
    const duration = Date.now() - startTime;

    logger.info('=== WEEKLY DIGEST SUMMARY ===', 'WeeklyDigest', {
      tenantsProcessed: summary.tenantsProcessed,
      totalEmailsSent: summary.totalEmailsSent,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    if (summary.byTenant.length > 0) {
      logger.info('Per-tenant breakdown', 'WeeklyDigest', { tenants: summary.byTenant });
    }

    return NextResponse.json({
      success: true,
      data: {
        tenantsProcessed: summary.tenantsProcessed,
        totalEmailsSent: summary.totalEmailsSent,
        checkedAt: new Date().toISOString(),
        duration: `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Weekly digest cron job failed', 'WeeklyDigest', { error, duration: `${duration}ms` });

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Weekly digest cron job failed' } },
      { status: 500 }
    );
  }
}
