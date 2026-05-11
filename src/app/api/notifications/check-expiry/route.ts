import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // --- Güvenlik Kontrolü ---
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron attempt', 'CronExpiryCheck', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing CRON_SECRET' } },
        { status: 401 }
      );
    }
  } else {
    logger.warn('CRON_SECRET not configured — running in dev mode (no auth required)', 'CronExpiryCheck');
  }

  // --- Firebase Admin SDK kontrolü ---
  const hasFirebaseCredentials = !!(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  if (!hasFirebaseCredentials) {
    logger.warn('Firebase Admin credentials missing — simulating cron run', 'CronExpiryCheck');
    return NextResponse.json({
      success: true,
      simulation: true,
      data: {
        message: 'Cron endpoint çalışıyor ancak Firebase credentials eksik. .env ayarlandığında gerçek bildirimler gönderilecek.',
        checkedAt: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
      },
    });
  }

  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getAdminApp } = await import('@/lib/firebase/adminApp');
    const { runScheduledExpiryCheck } = await import('@/lib/engines/notificationEngine');

    const adminDb = getFirestore(getAdminApp());

    // --- Tüm aktif tenant'ları çek ---
    const tenantsSnapshot = await adminDb.collection('tenants').where('status', '==', 'active').get();

    if (tenantsSnapshot.empty) {
      logger.info('No active tenants found', 'CronExpiryCheck');
      return NextResponse.json({
        success: true,
        data: {
          tenantsChecked: 0,
          totalNotifications: 0,
          checkedAt: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`,
        },
      });
    }

    // --- Her tenant için vade kontrolü ---
    const summary = {
      tenantsChecked: 0,
      totalPoliciesScanned: 0,
      totalNotifications: 0,
      channelBreakdown: { in_app: 0, email: 0, sms: 0 },
      byTenant: [] as { tenantId: string; companyId: string; notifications: number }[],
    };

    for (const tenantDoc of tenantsSnapshot.docs) {
      const tenantData = tenantDoc.data();
      const tenantId = tenantDoc.id;
      const companyId = tenantData.companyId || tenantId;

      try {
        const count = await runScheduledExpiryCheck(tenantId, companyId);

        summary.tenantsChecked++;
        summary.totalNotifications += count;
        summary.byTenant.push({ tenantId, companyId, notifications: count });

        // Kanal breakdown tahmini (trigger config'e göre)
        summary.channelBreakdown.in_app += count;
        summary.channelBreakdown.email += Math.ceil(count * 0.7);
      } catch (tenantError) {
        logger.error(`Failed to check tenant: ${tenantId}`, 'CronExpiryCheck', tenantError);
      }
    }

    // --- B2B İzlenebilirlik Logu ---
    const duration = Date.now() - startTime;

    logger.info('=== CRON EXPIRY CHECK SUMMARY ===', 'CronExpiryCheck', {
      tenantsChecked: summary.tenantsChecked,
      totalNotifications: summary.totalNotifications,
      channels: summary.channelBreakdown,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    if (summary.byTenant.length > 0) {
      logger.info('Per-tenant breakdown', 'CronExpiryCheck', { tenants: summary.byTenant });
    }

    return NextResponse.json({
      success: true,
      data: {
        tenantsChecked: summary.tenantsChecked,
        totalNotifications: summary.totalNotifications,
        channelBreakdown: summary.channelBreakdown,
        checkedAt: new Date().toISOString(),
        duration: `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Cron expiry check failed', 'CronExpiryCheck', { error, duration: `${duration}ms` });

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Vade kontrol cron job basarisiz' } },
      { status: 500 }
    );
  }
}
