import { NextRequest, NextResponse } from 'next/server';
import { runScheduledExpiryCheck } from '@/lib/engines/notificationEngine';
import { getUnreadNotifications, markAsRead, getUnreadCount } from '@/lib/engines/notificationEngine/channels/inApp';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const userId = request.headers.get('x-user-id');

  if (!tenantId || !userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing tenant or user ID' } },
      { status: 401 }
    );
  }

  try {
    const [notifications, unreadCount] = await Promise.all([
      getUnreadNotifications(tenantId, userId),
      getUnreadCount(tenantId, userId),
    ]);

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    logger.error('Failed to fetch notifications', 'NotificationsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Bildirimler yuklenemedi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { tenantId, companyId } = body;

    if (!tenantId || !companyId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'tenantId and companyId required' } },
        { status: 400 }
      );
    }

    const count = await runScheduledExpiryCheck(tenantId, companyId);

    return NextResponse.json({
      success: true,
      data: { notificationsSent: count, checkedAt: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Failed to run expiry check', 'NotificationsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Vade kontrolu basarisiz' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'notificationId required' } },
        { status: 400 }
      );
    }

    await markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to mark notification as read', 'NotificationsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Bildirim guncellenemedi' } },
      { status: 500 }
    );
  }
}
