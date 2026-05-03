/**
 * Enhanced Portfolio Analysis Engine
 * Implements advanced asset protection logic and under-insurance detection
 * Analyzes total assets vs total coverage limits across entire portfolio
 */

import type { Policy } from "@/types/policy";
import type { CrossPolicyInsight, InsightPriority } from "@/lib/ai/types";
import { logger } from "@/lib/logger";

export interface AssetProtectionAnalysis {
  totalAssetValue: number;
  totalCoverageLimit: number;
  coverageRatio: number; // totalCoverage / totalAssets (should be >= 0.8)
  underInsuranceGap: number; // Amount of under-insurance in TL
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  insights: CrossPolicyInsight[];
}

export interface CompanyAssets {
  realEstate?: {
    buildings: number; // Building value in TL
    land: number; // Land value in TL
  };
  vehicles?: {
    fleet: number; // Total vehicle value in TL
    count: number;
  };
  inventory?: {
    stock: number; // Inventory value in TL
    equipment: number; // Equipment value in TL
  };
  liabilities?: {
    employeeCount: number;
    annualRevenue: number;
  };
}

/**
 * Enhanced Portfolio Analysis Engine Class
 */
export class EnhancedPortfolioAnalysisEngine {
  /**
   * Main asset protection analysis method
   */
  async analyzeAssetProtection(
    policies: Policy[],
    companyAssets?: CompanyAssets
  ): Promise<AssetProtectionAnalysis> {
    logger.info("Starting asset protection analysis", "EnhancedPortfolioAnalysisEngine", {
      policyCount: policies.length,
      hasAssetData: !!companyAssets,
    });

    // Calculate total coverage limits from policies
    const totalCoverageLimit = this.calculateTotalCoverage(policies);

    // Estimate or use provided asset values
    const totalAssetValue = companyAssets
      ? this.calculateTotalAssets(companyAssets)
      : this.estimateAssetsFromPolicies(policies);

    // Calculate coverage ratio
    const coverageRatio = totalAssetValue > 0 ? totalCoverageLimit / totalAssetValue : 0;
    const underInsuranceGap = Math.max(0, totalAssetValue * 0.8 - totalCoverageLimit);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(coverageRatio);

    // Generate insights
    const insights = this.generateAssetProtectionInsights(
      totalAssetValue,
      totalCoverageLimit,
      coverageRatio,
      underInsuranceGap,
      policies,
      companyAssets
    );

    logger.info("Asset protection analysis complete", "EnhancedPortfolioAnalysisEngine", {
      totalAssets: totalAssetValue,
      totalCoverage: totalCoverageLimit,
      coverageRatio: coverageRatio.toFixed(2),
      riskLevel,
      insightCount: insights.length,
    });

    return {
      totalAssetValue,
      totalCoverageLimit,
      coverageRatio,
      underInsuranceGap,
      riskLevel,
      insights,
    };
  }

  /**
   * Calculate total coverage limits from all policies
   */
  private calculateTotalCoverage(policies: Policy[]): number {
    let total = 0;

    for (const policy of policies) {
      if (!policy.coverages) continue;

      for (const coverage of policy.coverages) {
        // Sum all coverage limits (convert to TL if needed)
        const amount = coverage.amount || 0;
        const currency = coverage.currency || "TRY";

        // Simple currency conversion (in production, use real-time rates)
        const inTRY =
          currency === "USD"
            ? amount * 34
            : currency === "EUR"
              ? amount * 37
              : amount;

        total += inTRY;
      }
    }

    return total;
  }

  /**
   * Calculate total asset value from company profile
   */
  private calculateTotalAssets(assets: CompanyAssets): number {
    let total = 0;

    if (assets.realEstate) {
      total += assets.realEstate.buildings || 0;
      total += assets.realEstate.land || 0;
    }

    if (assets.vehicles) {
      total += assets.vehicles.fleet || 0;
    }

    if (assets.inventory) {
      total += assets.inventory.stock || 0;
      total += assets.inventory.equipment || 0;
    }

    // Add liability-based asset estimation
    if (assets.liabilities) {
      // Annual revenue can indicate asset scale
      const revenueBasedAssets = (assets.liabilities.annualRevenue || 0) * 0.3;
      total += revenueBasedAssets;
    }

    return total;
  }

  /**
   * Estimate asset values from policy coverage limits (heuristic)
   */
  private estimateAssetsFromPolicies(policies: Policy[]): number {
    // If no company asset data provided, estimate based on policy limits
    // Assumption: Companies typically insure ~80% of their assets
    const totalCoverage = this.calculateTotalCoverage(policies);
    return totalCoverage / 0.8; // Reverse-calculate estimated assets
  }

  /**
   * Determine risk level based on coverage ratio
   */
  private determineRiskLevel(coverageRatio: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (coverageRatio >= 0.8) return "LOW"; // 80%+ coverage = safe
    if (coverageRatio >= 0.6) return "MEDIUM"; // 60-79% = moderate risk
    if (coverageRatio >= 0.4) return "HIGH"; // 40-59% = high risk
    return "CRITICAL"; // <40% = critical under-insurance
  }

  /**
   * Generate cross-policy insights for asset protection
   */
  private generateAssetProtectionInsights(
    totalAssets: number,
    totalCoverage: number,
    coverageRatio: number,
    underInsuranceGap: number,
    policies: Policy[],
    companyAssets?: CompanyAssets
  ): CrossPolicyInsight[] {
    const insights: CrossPolicyInsight[] = [];

    // Insight 1: Overall under-insurance warning
    if (coverageRatio < 0.8) {
      const priority: InsightPriority = coverageRatio < 0.4 ? "high" : coverageRatio < 0.6 ? "medium" : "low";

      insights.push({
        type: "gap",
        title: "Eksik Sigorta (Under-Insurance) Tespit Edildi",
        description: `Toplam varlık değeriniz ${this.formatCurrency(totalAssets)} TL iken, toplam teminat limitiniz sadece ${this.formatCurrency(totalCoverage)} TL (${(coverageRatio * 100).toFixed(0)}%). Büyük bir hasar durumunda ${this.formatCurrency(underInsuranceGap)} TL'lik açık kalabilir.`,
        affectedPolicies: policies.map((p) => p.policyNumber),
        riskExposure: underInsuranceGap,
        recommendation: `Portföyünüzü güçlendirmek için eksik ${this.formatCurrency(underInsuranceGap)} TL teminat ekleyin. Özellikle ${this.identifyWeakestCoverage(policies)} poliçenizin limitlerini artırın.`,
        priority,
      });
    }

    // Insight 2: Property-specific under-insurance
    if (companyAssets?.realEstate) {
      const propertyValue =
        (companyAssets.realEstate.buildings || 0) + (companyAssets.realEstate.land || 0);
      const propertyPolicies = policies.filter(
        (p) => p.policyType === "yangin" || p.policyType === "isyeri" || p.policyType === "dask"
      );
      const propertyCoverage = propertyPolicies.reduce((sum, p) => {
        return (
          sum +
          (p.coverages?.reduce((cSum, c) => cSum + (c.amount || 0), 0) || 0)
        );
      }, 0);

      if (propertyCoverage < propertyValue * 0.8) {
        insights.push({
          type: "gap",
          title: "Gayrimenkul Teminatı Yetersiz",
          description: `Bina ve arazi değeriniz ${this.formatCurrency(propertyValue)} TL iken, yangın ve deprem teminatınız sadece ${this.formatCurrency(propertyCoverage)} TL. Enflasyon nedeniyle bina değerleri yıllık %60 artarken, teminat limitleriniz güncel değil.`,
          affectedPolicies: propertyPolicies.map((p) => p.policyNumber),
          riskExposure: propertyValue * 0.8 - propertyCoverage,
          recommendation:
            "İşyeri ve DASK poliçelerinizin bina bedellerini güncel ekspertiz raporuna göre artırın. TSB kurallarına göre minimum metrekare başına 2.000 TL olmalı.",
          priority: "high",
        });
      }
    }

    // Insight 3: Vehicle fleet under-insurance
    if (companyAssets?.vehicles && companyAssets.vehicles.count > 0) {
      const fleetValue = companyAssets.vehicles.fleet;
      const vehiclePolicies = policies.filter(
        (p) => p.policyType === "kasko" || p.policyType === "trafik"
      );
      const vehicleCoverage = vehiclePolicies.reduce((sum, p) => {
        return (
          sum +
          (p.coverages?.reduce((cSum, c) => cSum + (c.amount || 0), 0) || 0)
        );
      }, 0);

      if (vehicleCoverage < fleetValue * 0.9) {
        insights.push({
          type: "gap",
          title: "Araç Filosu Teminatı Eksik",
          description: `${companyAssets.vehicles.count} araçlık filonuzun toplam değeri ${this.formatCurrency(fleetValue)} TL iken, kasko teminatınız ${this.formatCurrency(vehicleCoverage)} TL. Araç değerleri her yıl %50 düşerken, prim indirimi için limitleri düşürme riski var.`,
          affectedPolicies: vehiclePolicies.map((p) => p.policyNumber),
          riskExposure: fleetValue * 0.9 - vehicleCoverage,
          recommendation:
            "Kasko poliçelerinizin değerlerini güncel ekspertiz raporlarıyla eşleştirin. Çalınan veya total hasarlı araç için yetersiz tazminat alabilirsiniz.",
          priority: "medium",
        });
      }
    }

    // Insight 4: Liability coverage adequacy
    if (companyAssets?.liabilities?.employeeCount) {
      const employeeCount = companyAssets.liabilities.employeeCount;
      const liabilityPolicies = policies.filter((p) =>
        ["sorumluluk", "isyeri"].includes(p.policyType)
      );
      const liabilityCoverage = liabilityPolicies.reduce((sum, p) => {
        const employerLiability = p.coverages?.find((c) =>
          c.name.toLowerCase().includes("işveren mali sorumluluk")
        );
        return sum + (employerLiability?.amount || 0);
      }, 0);

      const recommendedLiability = employeeCount * 500000; // 500k TL per employee (2024 standard)

      if (liabilityCoverage < recommendedLiability) {
        insights.push({
          type: "gap",
          title: "İşveren Mali Sorumluluk Limiti Düşük",
          description: `${employeeCount} çalışanınız için önerilen minimum İşveren Mali Sorumluluk teminatı ${this.formatCurrency(recommendedLiability)} TL iken, mevcut limitiniz ${this.formatCurrency(liabilityCoverage)} TL. İş kazası durumunda yetersiz kalabilir.`,
          affectedPolicies: liabilityPolicies.map((p) => p.policyNumber),
          riskExposure: recommendedLiability - liabilityCoverage,
          recommendation:
            "İşveren Mali Sorumluluk limitinizi çalışan başına minimum 500.000 TL'ye çıkarın. 6331 sayılı İş Sağlığı ve Güvenliği Kanunu gereği yeterli teminat zorunlu.",
          priority: "high",
        });
      }
    }

    // Insight 5: Overall asset diversification
    if (policies.length > 0) {
      const uniqueCompanies = new Set(policies.map((p) => p.insuranceCompany)).size;
      const concentrationRatio = 1 - uniqueCompanies / policies.length;

      if (concentrationRatio > 0.7) {
        // 70%+ policies with same company
        const dominantCompany = this.findDominantInsurer(policies);
        insights.push({
          type: "concentration_risk",
          title: "Sigorta Şirketi Konsantrasyonu",
          description: `Poliçelerinizin %${(concentrationRatio * 100).toFixed(0)}'si ${dominantCompany} şirketinde. Bu şirketin mali zorluğa düşmesi veya hasar ödemesinde gecikme yaşaması durumunda tüm portföyünüz risk altında.`,
          affectedPolicies: policies
            .filter((p) => p.insuranceCompany === dominantCompany)
            .map((p) => p.policyNumber),
          recommendation:
            "Risk dağılımı için en az 2-3 farklı sigorta şirketi ile çalışın. TSB'nin mali güvenilirlik raporlarını inceleyerek A+ ve üzeri şirketleri tercih edin.",
          priority: "medium",
        });
      }
    }

    return insights;
  }

  /**
   * Identify weakest coverage area in portfolio
   */
  private identifyWeakestCoverage(policies: Policy[]): string {
    const coverageByType: Record<string, number> = {};

    for (const policy of policies) {
      const type = policy.policyType;
      const totalCoverage =
        policy.coverages?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      coverageByType[type] = (coverageByType[type] || 0) + totalCoverage;
    }

    // Find policy type with lowest coverage
    let weakest = "genel";
    let lowestCoverage = Infinity;

    for (const [type, coverage] of Object.entries(coverageByType)) {
      if (coverage < lowestCoverage) {
        lowestCoverage = coverage;
        weakest = type;
      }
    }

    const typeLabels: Record<string, string> = {
      kasko: "Kasko",
      trafik: "Trafik",
      yangin: "Yangın",
      isyeri: "İşyeri",
      dask: "DASK",
      saglik: "Sağlık",
      sorumluluk: "Sorumluluk",
    };

    return typeLabels[weakest] || weakest;
  }

  /**
   * Find dominant insurer by policy count
   */
  private findDominantInsurer(policies: Policy[]): string {
    const counts: Record<string, number> = {};

    for (const policy of policies) {
      const company = policy.insuranceCompany;
      counts[company] = (counts[company] || 0) + 1;
    }

    let dominant = "Bilinmeyen";
    let maxCount = 0;

    for (const [company, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = company;
      }
    }

    return dominant;
  }

  /**
   * Format currency with thousand separators
   */
  private formatCurrency(amount: number): string {
    return amount.toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}

/**
 * Singleton instance
 */
export const enhancedPortfolioAnalysisEngine = new EnhancedPortfolioAnalysisEngine();
