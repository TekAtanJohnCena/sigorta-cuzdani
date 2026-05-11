import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { Asset, AssetCategory, BulkImportResult, ColumnMapping } from '@/types/asset';
import { logger } from '@/lib/logger';

export { parseSpreadsheet } from './importer';

const adminDb = getFirestore(getAdminApp());
const ASSETS_COLLECTION = 'assets';

const VALID_CATEGORIES: AssetCategory[] = ['vehicle', 'property', 'equipment'];
const VALID_CURRENCIES = ['TRY', 'USD', 'EUR'];

interface RawRow {
  [key: string]: string | number | undefined;
}

export async function bulkCreateAssets(
  tenantId: string,
  companyId: string,
  rows: RawRow[],
  columnMapping: ColumnMapping[]
): Promise<BulkImportResult> {
  logger.info(`Bulk asset import started: ${rows.length} rows`, 'AssetEngine', { tenantId });

  const result: BulkImportResult = {
    totalRows: rows.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  const batch = adminDb.batch();
  let batchCount = 0;
  const MAX_BATCH = 400; // Firestore limit 500, keep margin

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const mapped = mapRowToAsset(row, columnMapping, tenantId, companyId);
      const validation = validateAsset(mapped);

      if (!validation.valid) {
        result.errors.push({ row: i + 2, message: validation.error! });
        result.errorCount++;
        continue;
      }

      const docRef = adminDb.collection(ASSETS_COLLECTION).doc();
      batch.set(docRef, {
        ...mapped,
        id: docRef.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      batchCount++;
      result.successCount++;

      if (batchCount >= MAX_BATCH) {
        await batch.commit();
        batchCount = 0;
      }
    } catch (err) {
      result.errors.push({ row: i + 2, message: `Beklenmeyen hata: ${(err as Error).message}` });
      result.errorCount++;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  logger.info(`Bulk import complete`, 'AssetEngine', {
    tenantId,
    success: result.successCount,
    errors: result.errorCount,
  });

  return result;
}

function mapRowToAsset(
  row: RawRow,
  mappings: ColumnMapping[],
  tenantId: string,
  companyId: string
): Partial<Asset> {
  const asset: Record<string, unknown> = { tenantId, companyId, linkedPolicyIds: [] };

  for (const mapping of mappings) {
    if (mapping.targetField === 'skip') continue;
    const value = row[mapping.sourceColumn];
    if (value === undefined || value === '') continue;

    if (mapping.targetField === 'estimatedValue' || mapping.targetField === 'year' || mapping.targetField === 'squareMeters') {
      asset[mapping.targetField] = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
    } else {
      asset[mapping.targetField] = String(value).trim();
    }
  }

  // Normalize category
  if (asset.category) {
    const cat = String(asset.category).toLowerCase();
    if (cat.includes('arac') || cat.includes('vehicle') || cat.includes('araç')) asset.category = 'vehicle';
    else if (cat.includes('bina') || cat.includes('property') || cat.includes('tasin')) asset.category = 'property';
    else if (cat.includes('ekip') || cat.includes('equipment') || cat.includes('cihaz')) asset.category = 'equipment';
  }

  // Normalize currency
  if (!asset.currency || !VALID_CURRENCIES.includes(String(asset.currency))) {
    asset.currency = 'TRY';
  }

  return asset as Partial<Asset>;
}

function validateAsset(asset: Partial<Asset>): { valid: boolean; error?: string } {
  if (!asset.name || String(asset.name).trim().length === 0) {
    return { valid: false, error: 'Varlik adi bos olamaz' };
  }
  if (!asset.category || !VALID_CATEGORIES.includes(asset.category as AssetCategory)) {
    return { valid: false, error: `Gecersiz kategori: ${asset.category}. vehicle/property/equipment olmali` };
  }
  if (!asset.estimatedValue || asset.estimatedValue <= 0) {
    return { valid: false, error: 'Tahmini deger 0\'dan buyuk olmali' };
  }
  return { valid: true };
}
