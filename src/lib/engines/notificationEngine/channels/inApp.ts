import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { NotificationCategory, NotificationPriority, NotificationChannel, NotificationRecipient } from '@/types/notification';
import { logger } from '@/lib/logger';

const adminDb = getFirestore(getAdminApp());
const NOTIFICATIONS_COLLECTION = 'notifications';

interface InAppPayload {
  tenantId: string;
  companyId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  body: string;
  actionUrl?: string;
  recipient: NotificationRecipient;
  departmentId?: string;
  metadata?: Record<string, unknown>;
}

export async function sendInAppNotification(payload: InAppPayload): Promise<void> {
  try {
    const docRef = await adminDb.collection(NOTIFICATIONS_COLLECTION).add({
      tenantId: payload.tenantId,
      companyId: payload.companyId,
      category: payload.category,
      priority: payload.priority,
      channels: payload.channels,
      status: 'sent',
      title: payload.title,
      body: payload.body,
      actionUrl: payload.actionUrl || null,
      recipient: payload.recipient,
      departmentId: payload.departmentId || null,
      metadata: payload.metadata || {},
      sentAt: new Date().toISOString(),
      readAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info(`In-app notification created: ${docRef.id}`, 'InAppChannel', {
      tenantId: payload.tenantId,
      category: payload.category,
    });
  } catch (error) {
    logger.error('Failed to create in-app notification', 'InAppChannel', error);
    throw error;
  }
}

export async function getUnreadNotifications(
  tenantId: string,
  userId: string,
  limit = 20
): Promise<Record<string, unknown>[]> {
  const snapshot = await adminDb
    .collection(NOTIFICATIONS_COLLECTION)
    .where('tenantId', '==', tenantId)
    .where('recipient.userId', '==', userId)
    .where('status', '==', 'sent')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function markAsRead(notificationId: string): Promise<void> {
  await adminDb.collection(NOTIFICATIONS_COLLECTION).doc(notificationId).update({
    status: 'read',
    readAt: new Date().toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getUnreadCount(tenantId: string, userId: string): Promise<number> {
  const snapshot = await adminDb
    .collection(NOTIFICATIONS_COLLECTION)
    .where('tenantId', '==', tenantId)
    .where('recipient.userId', '==', userId)
    .where('status', '==', 'sent')
    .count()
    .get();

  return snapshot.data().count;
}
