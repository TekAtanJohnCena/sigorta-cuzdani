// ============================================
// Risk Mining Engine - "Mayın Analizi"
// Deep risk detection for Turkish insurance policies
// ============================================

import type {
  RiskAlert,
  RiskAnalysisResult,
  PolicyType,
  RiskSeverity,
  RiskCategory,
} from "../types";

/**
 * Turkish insurance domain rules and thresholds
 */
export const TURKISH_INSURANCE_RULES = {
  // Mandatory coverages by policy type (TSB regulations)
  mandatoryCoverages: {
    kasko: [
      "Çarpma-Çarpışma-Devrilme",
      "Yangın-İnfilak",
      "Hırsızlık",
      "Cam Kırılması",
    ],
    trafik: ["Trafik Mali Sorumluluk"],
    yangin: ["Yangın", "Yıldırım Düşmesi", "İnfilak", "Deprem (DASK)"],
    isyeri: [
      "Yangın",
      "İşveren Mali Sorumluluk",
      "DASK",
      "3. Şahıs Mali Sorumluluk",
    ],
    saglik: ["Yatarak Tedavi", "Ameliyat"],
  },

  // Minimum recommended limits (TRY)
  minimumLimits: {
    "trafik-imm": 500000, // İhtiyari Mali Mesuliyet
    "isyeri-yangın": 1000000,
    "isyeri-sorumluluk": 500000,
    "kasko-ferdi-kaza": 100000,
  },

  // Red flag keywords (claim rejection risks)
  exclusionKeywords: [
    "teminat dışı",
    "istisna",
    "hariç tutulur",
    "dahil değildir",
    "karşılanmaz",
    "kapsam dışı",
    "muaf",
    "sorumlu değildir",
  ],

  // Ambiguous wording patterns
  ambiguousPatterns: [
    /makul\s+sürede/i,
    /gerekli\s+özen/i,
    /derhal\s+bildirmek/i,
    /en\s+kısa\s+süre/i,
    /uygun\s+görülen/i,
  ],

  // Deductible thresholds (excessive = claim barrier)
  excessiveDeductible: {
    kasko: 0.05, // >5% of vehicle value
    yangin: 0.03, // >3% of property value
    saglik: 2000, // >2000 TL fixed deductible
  },
};

/**
 * Dangerous clause patterns specific to Turkish market
 */
const DANGEROUS_CLAUSES = [
  {
    pattern: /alkollü.*teminat dışı/i,
    risk: "Alkol durumu tüm kazaları kapsam dışı bırakabilir",
    severity: "CRITICAL" as RiskSeverity,
  },
  {
    pattern: /bakımsızlık.*istisna/i,
    risk: "Bakımsızlık tanımı belirsiz - çoğu hasar reddedilebilir",
    severity: "CRITICAL" as RiskSeverity,
  },
  {
    pattern: /yıpranma.*hariç/i,
    risk: "Yıpranma ile hasar ayrımı subjektif - anlaşmazlık riski",
    severity: "WARNING" as RiskSeverity,
  },
  {
    pattern: /kasıt.*teminat dışı/i,
    risk: "Kasıt ispatı sigorta şirketine bırakılmış - savunma zorluğu",
    severity: "WARNING" as RiskSeverity,
  },
];

export class RiskMiningEngine {
  /**
   * Deep risk analysis for a single policy
   * Focuses on Turkish insurance market specifics
   */
  async analyzePolicy(
    policyId: string,
    policyType: PolicyType,
    policyText: string,
    coverages: Array<{ name: string; amount: number; currency: string; deductible?: number }>,
    companyProfile?: { sector?: string; annualRevenue?: number; employeeCount?: number }
  ): Promise<RiskAnalysisResult> {
    const alerts: RiskAlert[] = [];

    // 1. Check mandatory coverages
    alerts.push(...this.checkMandatoryCoverages(policyType, coverages));

    // 2. Check coverage limits vs market standards
    alerts.push(
      ...this.checkLimitAdequacy(policyType, coverages, companyProfile)
    );

    // 3. Scan for dangerous exclusion clauses
    alerts.push(...this.scanDangerousClauses(policyText));

    // 4. Check deductible levels
    alerts.push(...this.checkDeductibles(policyType, coverages));

    // 5. Scan for ambiguous wording
    alerts.push(...this.scanAmbiguousWording(policyText));

    // Sort by severity
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Generate summary
    const summary = {
      criticalCount: sortedAlerts.filter((a) => a.severity === "CRITICAL").length,
      warningCount: sortedAlerts.filter((a) => a.severity === "WARNING").length,
      infoCount: sortedAlerts.filter((a) => a.severity === "INFO").length,
      totalRiskExposure: this.calculateTotalRiskExposure(sortedAlerts),
      actionableInsights: sortedAlerts.filter((a) => a.remediationSteps.length > 0).length,
    };

    return {
      policyId,
      analyzedAt: new Date().toISOString(),
      alerts: sortedAlerts,
      summary,
    };
  }

  /**
   * Check if policy has all mandatory coverages
   */
  private checkMandatoryCoverages(
    policyType: PolicyType,
    coverages: Array<{ name: string; amount: number }>
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const mandatoryList = (TURKISH_INSURANCE_RULES.mandatoryCoverages as Record<string, string[]>)[policyType] || [];

    for (const mandatoryCoverage of mandatoryList) {
      const found = coverages.some((c) =>
        c.name.toLowerCase().includes(mandatoryCoverage.toLowerCase())
      );

      if (!found) {
        alerts.push({
          id: `missing-mandatory-${mandatoryCoverage}`,
          title: `Zorunlu Teminat Eksik: ${mandatoryCoverage}`,
          description: `Bu ${policyType} poliçesinde "${mandatoryCoverage}" teminatı bulunamadı. TSB düzenlemelerine göre bu teminat zorunludur.`,
          severity: "CRITICAL",
          category: "coverage_gap",
          affectedCoverages: [],
          regulatoryRisk: true,
          financialImpact: `Bu teminatsız bir hasar durumunda tüm masraflar şirketinize ait olacaktır.`,
          remediationSteps: [
            `Sigorta şirketinizle iletişime geçin`,
            `"${mandatoryCoverage}" teminatını poliçeye ekletin`,
            `Zeyilname ile poliçeyi güncelleyin`,
          ],
          estimatedRemediationCost:
            policyType === "kasko" ? 500 : policyType === "isyeri" ? 2000 : 1000,
          confidenceScore: 95,
        });
      }
    }

    return alerts;
  }

  /**
   * Check if coverage limits are adequate
   */
  private checkLimitAdequacy(
    policyType: PolicyType,
    coverages: Array<{ name: string; amount: number; currency: string }>,
    companyProfile?: { sector?: string; annualRevenue?: number }
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    // Check İMM (İhtiyari Mali Mesuliyet) for traffic policies
    if (policyType === "trafik") {
      const imm = coverages.find((c) =>
        c.name.toLowerCase().includes("ihtiyari mali")
      );
      if (imm && imm.amount < TURKISH_INSURANCE_RULES.minimumLimits["trafik-imm"]) {
        alerts.push({
          id: "low-imm-limit",
          title: "İMM Limiti Düşük",
          description: `İhtiyari Mali Mesuliyet limitiniz ${imm.amount.toLocaleString("tr-TR")} TL. Önerilen minimum ${TURKISH_INSURANCE_RULES.minimumLimits["trafik-imm"].toLocaleString("tr-TR")} TL.`,
          severity: "WARNING",
          category: "limit_inadequacy",
          affectedCoverages: [imm.name],
          regulatoryRisk: false,
          financialImpact: `Ciddi bir kaza durumunda limit aşımı riski yüksek. Fark şirket kasasından ödenecek.`,
          remediationSteps: [
            "İMM limitini en az 500.000 TL'ye yükseltin",
            "Ek prim maliyeti yıllık ~200-400 TL civarındadır",
          ],
          estimatedRemediationCost: 300,
          confidenceScore: 90,
          industryBenchmark: {
            typical: "500.000 TL",
            current: `${imm.amount.toLocaleString("tr-TR")} TL`,
            deviation: ((TURKISH_INSURANCE_RULES.minimumLimits["trafik-imm"] - imm.amount) / imm.amount) * 100,
          },
        });
      }
    }

    // Check fire coverage for workplace policies
    if (policyType === "isyeri" && companyProfile?.annualRevenue) {
      const fire = coverages.find((c) => c.name.toLowerCase().includes("yangın"));
      if (fire && fire.amount < companyProfile.annualRevenue * 0.5) {
        alerts.push({
          id: "low-fire-limit",
          title: "Yangın Teminat Limiti Yetersiz",
          description: `Yangın teminat limitiniz (${fire.amount.toLocaleString("tr-TR")} TL) yıllık cironuzun (%${((fire.amount / companyProfile.annualRevenue) * 100).toFixed(0)}) altında. İşyerinizin yeniden inşa maliyetini karşılamayabilir.`,
          severity: "CRITICAL",
          category: "limit_inadequacy",
          affectedCoverages: [fire.name],
          regulatoryRisk: false,
          financialImpact: `Tam hasar durumunda yaklaşık ${(companyProfile.annualRevenue * 0.5 - fire.amount).toLocaleString("tr-TR")} TL açık kalacak.`,
          remediationSteps: [
            "İşyeri ekspertiz raporu alın",
            `Limiti en az ${(companyProfile.annualRevenue * 0.5).toLocaleString("tr-TR")} TL'ye çıkartın`,
            "DASK poliçesini de kontrol edin (deprem için ayrı)",
          ],
          estimatedRemediationCost: Math.floor((companyProfile.annualRevenue * 0.5 - fire.amount) * 0.002),
          confidenceScore: 85,
          industryBenchmark: {
            typical: `Cironun %50-100'ü`,
            current: `Cironun %${((fire.amount / companyProfile.annualRevenue) * 100).toFixed(0)}'ü`,
            deviation: -50,
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Scan policy text for dangerous exclusion clauses
   */
  private scanDangerousClauses(policyText: string): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    for (const clause of DANGEROUS_CLAUSES) {
      if (clause.pattern.test(policyText)) {
        alerts.push({
          id: `dangerous-clause-${clause.pattern.source.slice(0, 20)}`,
          title: "Tehlikeli İstisna Maddesi Tespit Edildi",
          description: clause.risk,
          severity: clause.severity,
          category: "exclusion",
          affectedCoverages: [],
          regulatoryRisk: false,
          financialImpact: "Hasar talebiniz bu madde nedeniyle reddedilebilir.",
          remediationSteps: [
            "Bu maddeyi avukatınıza inceletin",
            "Sigorta şirketinden bu istisnanın kapsamını netleştirmelerini isteyin",
            "Alternatif poliçelerde bu maddenin daha adil olup olmadığını karşılaştırın",
          ],
          confidenceScore: 80,
        });
      }
    }

    return alerts;
  }

  /**
   * Check if deductibles are excessive
   */
  private checkDeductibles(
    policyType: PolicyType,
    coverages: Array<{ name: string; amount: number; deductible?: number }>
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    const threshold = (TURKISH_INSURANCE_RULES.excessiveDeductible as Record<string, number>)[policyType];
    if (!threshold) return alerts;

    for (const coverage of coverages) {
      if (!coverage.deductible) continue;

      const ratio = coverage.deductible / coverage.amount;
      const isExcessive = typeof threshold === "number" && ratio > (threshold as number);

      if (isExcessive) {
        alerts.push({
          id: `high-deductible-${coverage.name}`,
          title: `Yüksek Muafiyet: ${coverage.name}`,
          description: `"${coverage.name}" teminatında muafiyet oranı %${(ratio * 100).toFixed(1)} (${coverage.deductible.toLocaleString("tr-TR")} TL). Bu çok yüksek bir oran - küçük hasarlarda tazminat alamayabilirsiniz.`,
          severity: "WARNING",
          category: "claim_barrier",
          affectedCoverages: [coverage.name],
          regulatoryRisk: false,
          financialImpact: `${coverage.deductible.toLocaleString("tr-TR")} TL'nin altındaki hasarlar kendi kasanızdan ödenecek.`,
          remediationSteps: [
            "Muafiyet oranını %3'ün altına düşürmeyi talep edin",
            "Sabit tutar yerine oransal muafiyet tercih edin",
          ],
          estimatedRemediationCost: Math.floor(coverage.amount * 0.005),
          confidenceScore: 75,
        });
      }
    }

    return alerts;
  }

  /**
   * Scan for ambiguous wording that could cause disputes
   */
  private scanAmbiguousWording(policyText: string): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    for (const pattern of TURKISH_INSURANCE_RULES.ambiguousPatterns) {
      const matches = policyText.match(pattern);
      if (matches) {
        alerts.push({
          id: `ambiguous-wording-${pattern.source.slice(0, 15)}`,
          title: "Belirsiz İfade Tespit Edildi",
          description: `Poliçe metninde "${matches[0]}" gibi belirsiz bir ifade var. Bu tür ifadeler hasar anında anlaşmazlık yaratabilir.`,
          severity: "INFO",
          category: "claim_barrier",
          affectedCoverages: [],
          regulatoryRisk: false,
          remediationSteps: [
            "Bu ifadelerin net tanımını sigorta şirketinden yazılı olarak isteyin",
            "Örnek vaka senaryolarıyla teminat kapsamını netleştirin",
          ],
          confidenceScore: 60,
        });
      }
    }

    return alerts;
  }

  /**
   * Calculate total financial risk exposure from alerts
   */
  private calculateTotalRiskExposure(alerts: RiskAlert[]): number {
    return alerts.reduce((sum, alert) => {
      // Extract numeric values from financialImpact if available
      const impactMatch = alert.financialImpact?.match(/(\d[\d.,]*)\s*TL/);
      if (impactMatch) {
        const amount = parseInt(impactMatch[1].replace(/[.,]/g, ""));
        return sum + amount;
      }
      return sum;
    }, 0);
  }
}

// Singleton instance
export const riskMiningEngine = new RiskMiningEngine();
