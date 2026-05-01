// ============================================
// Asset Types — Varlık Envanteri Tip Tanımları
// ============================================

export type AssetCategory = 'vehicle' | 'property' | 'equipment';

export interface Asset {
  id: string;
  tenantId: string;
  category: AssetCategory;
  name: string;           // "34 ABC 123" veya "Levent Merkez Ofis"
  description?: string;
  estimatedValue: number;
  currency: 'TRY' | 'USD' | 'EUR';
  linkedPolicyIds: string[]; // Hangi poliçelerle korunuyor (UI'da computed)
  createdAt: string;
  updatedAt: string;
}

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
