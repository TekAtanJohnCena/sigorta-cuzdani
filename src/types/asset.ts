// ============================================
// Asset Types — Varlık Envanteri Tip Tanımları
// ============================================

export type AssetCategory = 'vehicle' | 'property' | 'equipment';

export interface Asset {
  id: string;
  tenantId: string;
  companyId?: string;
  category: AssetCategory;
  name: string;           // "34 ABC 123" veya "Levent Merkez Ofis"
  description?: string;
  estimatedValue: number;
  currency: 'TRY' | 'USD' | 'EUR';
  linkedPolicyIds: string[];

  // Detay alanları
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  address?: string;
  squareMeters?: number;

  createdAt: string;
  updatedAt: string;
}

export interface BulkImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: keyof Asset | 'skip';
}

export const IMPORTABLE_FIELDS: { field: keyof Asset; label: string; required: boolean }[] = [
  { field: 'name', label: 'Varlık Adı', required: true },
  { field: 'category', label: 'Kategori (vehicle/property/equipment)', required: true },
  { field: 'estimatedValue', label: 'Tahmini Değer', required: true },
  { field: 'currency', label: 'Para Birimi', required: false },
  { field: 'description', label: 'Açıklama', required: false },
  { field: 'licensePlate', label: 'Plaka', required: false },
  { field: 'brand', label: 'Marka', required: false },
  { field: 'model', label: 'Model', required: false },
  { field: 'year', label: 'Yıl', required: false },
  { field: 'address', label: 'Adres', required: false },
];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  vehicle: 'Araç',
  property: 'Taşınmaz / Bina',
  equipment: 'Ekipman / Cihaz',
};

export const ASSET_CATEGORY_ICONS: Record<AssetCategory, string> = {
  vehicle: '🚗',
  property: '🏢',
  equipment: '💻',
};

// Varlık kategorisine göre eşleşmesi beklenen poliçe tipleri
export const ASSET_POLICY_MAP: Record<AssetCategory, string[]> = {
  vehicle: ['kasko', 'trafik'],
  property: ['yangin', 'dask', 'isyeri'],
  equipment: ['isyeri', 'muhendislik'],
};
