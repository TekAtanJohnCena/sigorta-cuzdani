import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { logger } from '@/lib/logger';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export function validateFile(contentType: string, sizeBytes: number): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { valid: false, error: `Desteklenmeyen dosya tipi: ${contentType}. Izin verilen: PDF, JPG, PNG, WebP` };
  }
  if (sizeBytes > MAX_SIZE_BYTES) {
    return { valid: false, error: `Dosya boyutu cok buyuk: ${(sizeBytes / 1024 / 1024).toFixed(1)}MB. Maksimum: 10MB` };
  }
  return { valid: true };
}

export async function uploadClaimDocument(
  tenantId: string,
  claimId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) {
    logger.warn('Firebase Storage bucket not configured — simulating upload', 'DocumentManager');
    return {
      success: true,
      url: `https://storage.simulated/${tenantId}/claims/${claimId}/${fileName}`,
      fileName,
    };
  }

  try {
    const bucket = getStorage(getAdminApp()).bucket(storageBucket);
    const filePath = `tenants/${tenantId}/claims/${claimId}/${Date.now()}_${fileName}`;
    const file = bucket.file(filePath);

    await file.save(fileBuffer, {
      metadata: { contentType },
    });

    await file.makePublic();
    const url = `https://storage.googleapis.com/${storageBucket}/${filePath}`;

    logger.info(`Document uploaded: ${filePath}`, 'DocumentManager', { tenantId, claimId });
    return { success: true, url, fileName };
  } catch (error) {
    logger.error('Document upload failed', 'DocumentManager', error);
    return { success: false, error: 'Dosya yuklenemedi. Lutfen tekrar deneyin.' };
  }
}
