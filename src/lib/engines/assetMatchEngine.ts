// ============================================
// Asset Match Engine
// Varlıkları mevcut poliçelerle eşleştirerek
// sigortasız varlıkları tespit eder.
// ============================================

import { Asset, ASSET_POLICY_MAP } from '@/types/asset';
import { Policy } from '@/types/policy';

export interface AssetMatchResult {
  asset: Asset;
  matchedPolicies: Policy[];
  isInsured: boolean;
}

/**
 * Tek bir varlığı aktif poliçelerle eşleştirir.
 *
 * Eşleştirme mantığı:
 * 1. Varlık kategorisine göre beklenen poliçe tiplerini belirle (ASSET_POLICY_MAP)
 * 2. Aktif poliçeler arasında eşleşen tipleri bul
 * 3. Bonus: Poliçenin notes veya coverages alanında varlık adı (plaka vb.) geçiyorsa direkt eşleştir
 */
export function matchAssetToPolicies(
  asset: Asset,
  activePolicies: Policy[]
): AssetMatchResult {
  const expectedTypes = ASSET_POLICY_MAP[asset.category] || [];

  const matchedPolicies = activePolicies.filter(policy => {
    // Tip bazlı eşleştirme
    const typeMatch = expectedTypes.includes(policy.policyType);

    // İçerik bazlı eşleştirme (plaka, adres vb. poliçede geçiyor mu?)
    const nameNormalized = asset.name.toLowerCase().replace(/\s+/g, '');
    const contentMatch =
      policy.notes?.toLowerCase().replace(/\s+/g, '').includes(nameNormalized) ||
      policy.policyHolder?.address?.toLowerCase().replace(/\s+/g, '').includes(nameNormalized) ||
      policy.coverages?.some(c => c.name.toLowerCase().replace(/\s+/g, '').includes(nameNormalized));

    return typeMatch || contentMatch;
  });

  return {
    asset,
    matchedPolicies,
    isInsured: matchedPolicies.length > 0,
  };
}

/**
 * Tüm varlıkları toplu eşleştirir ve istatistik döner.
 */
export function analyzeAssetPortfolio(
  assets: Asset[],
  activePolicies: Policy[]
): {
  results: AssetMatchResult[];
  insuredCount: number;
  uninsuredCount: number;
  totalValue: number;
  uninsuredValue: number;
} {
  const results = assets.map(asset => matchAssetToPolicies(asset, activePolicies));
  const insuredCount = results.filter(r => r.isInsured).length;
  const uninsuredCount = results.filter(r => !r.isInsured).length;
  const totalValue = assets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const uninsuredValue = results
    .filter(r => !r.isInsured)
    .reduce((sum, r) => sum + r.asset.estimatedValue, 0);

  return { results, insuredCount, uninsuredCount, totalValue, uninsuredValue };
}
