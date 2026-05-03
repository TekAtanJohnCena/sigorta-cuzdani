/**
 * Turkish Insurance Domain Rules
 * Hardcoded TSB (Türkiye Sigorta Birliği) regulations and industry standards
 * Used to inject expert domain knowledge into AI prompts
 */

import type { PolicyType } from "@/lib/ai/types";

/**
 * ZDS (Zorunlu Deprem Sigortası / DASK) Rules
 * Updated: 2024-2025 rates (verified with TCIP/DASK official tariff)
 */
export const ZDS_RULES = {
  minimumBuildingValues: {
    residential: {
      minValuePerM2: 1500, // TL/m2 - 2024-2025 tariff
      maxValuePerM2: 5000, // TL/m2 - 2024-2025 tariff
      description: "Konut için asgari bina bedeli metrekare başına 1.500 TL (TCIP 2024)",
      riskZones: {
        zone1: { rate: 0.55, description: "1. derece deprem bölgesi (en yüksek risk)" },
        zone2: { rate: 0.44, description: "2. derece deprem bölgesi" },
        zone3: { rate: 0.275, description: "3. derece deprem bölgesi" },
        zone4: { rate: 0.22, description: "4. derece deprem bölgesi" },
        zone5: { rate: 0.11, description: "5. derece deprem bölgesi (en düşük risk)" },
      },
    },
    commercial: {
      minValuePerM2: 2000, // TL/m2 - 2024-2025 tariff
      maxValuePerM2: 8000, // TL/m2 - 2024-2025 tariff
      description: "İşyeri için asgari bina bedeli metrekare başına 2.000 TL (TCIP 2024)",
    },
  },
  mandatoryCoverage: {
    earthquake: "Deprem hasarı",
    fire: "Deprem sonucu çıkan yangın",
    explosion: "Deprem sonucu patlama",
    landslide: "Deprem sonucu toprak kayması",
  },
  exclusions: [
    "Mobilya ve ev eşyaları (sadece bina yapısı)",
    "İşletme zararı",
    "Kira kaybı",
    "Deprem sonrası kurtarma masrafları",
  ],
  legalRequirement: "2012/3305 sayılı Bakanlar Kurulu Kararı ile zorunlu",
} as const;

/**
 * Traffic Insurance İMM (İhtiyari Mali Mesuliyet) Rules
 * Updated: 2024-2025 legal minimums (Karayolları Trafik Kanunu)
 */
export const TRAFFIC_IMM_RULES = {
  legalMinimums2024: {
    bodily: 5000000, // TL - Kişi başı bedeni hasar minimum (2024 güncelleme)
    property: 500000, // TL - Maddi hasar minimum (2024 güncelleme)
    description: "2024-2025 yasal minimum limitler - TSB resmi tavsiyesi",
    legalBasis: "Karayolları Trafik Kanunu ve TSB Genelge 2024/01",
  },
  recommendedLimits: {
    personal: {
      bodily: 10000000, // TL
      property: 2000000, // TL
      description: "Bireysel araç kullanıcıları için önerilen",
    },
    commercial: {
      bodily: 25000000, // TL
      property: 5000000, // TL
      description: "Ticari araç/filolar için önerilen",
    },
  },
  keyRisks: [
    {
      scenario: "Çoklu yaralanmalı kaza",
      exposure: "5-10 kişi yaralanması durumunda 50M+ TL sorumluluk",
      recommendation: "Minimum 10M TL bedeni hasar limiti",
    },
    {
      scenario: "Lüks araç hasarı",
      exposure: "Yüksek değerli araçlarda 2M+ TL maddi hasar",
      recommendation: "Minimum 2M TL maddi hasar limiti",
    },
  ],
  exclusions: [
    "Alkollü sürüş (prim ödenir ama rücu edilir)",
    "Ehliyetsiz sürüş",
    "Sürücü ve araç sahiplerinin bedeni zararları (Trafik sigortası kapsar)",
  ],
} as const;

/**
 * Health Insurance Waiting Period (Bekleme Süresi) Rules
 */
export const HEALTH_WAITING_PERIOD_RULES = {
  standard: {
    general: 30, // days - Genel sağlık hizmetleri için
    surgery: 90, // days - Ameliyat gerektiren durumlar için
    maternity: 300, // days - Doğum için (10 ay)
    dentistry: 60, // days - Diş tedavileri için
  },
  preExistingConditions: {
    chronic: 365, // days - Kronik hastalıklar için (diyabet, hipertansiyon)
    highRisk: 730, // days - Yüksek riskli hastalıklar (kanser, kalp hastalıkları)
    description:
      "Mevcut hastalıklar için bekleme süresi genellikle 1-2 yıl veya tamamen istisna",
  },
  exceptions: {
    emergency: 0, // Acil durumlar için bekleme süresi yok
    accident: 0, // Kaza sonucu tedaviler için bekleme süresi yok
    preventive: 30, // Check-up ve önleyici hizmetler için
  },
  industryPractices: [
    "Grup sağlık sigortalarında (işveren) bekleme süresi daha kısa",
    "Yıllık primi peşin ödeyenlere bekleme süresi indirimi",
    "İlk poliçede bekleme var, yenileme poliçelerinde yok",
    "Taşınabilirlik haklarında önceki sigorta süresi sayılır",
  ],
} as const;

/**
 * Kasko Insurance Common Exclusions
 */
export const KASKO_EXCLUSIONS = {
  standard: [
    "Bakımsızlık nedeniyle oluşan hasarlar",
    "Lastik, cam dışındaki aşınma ve yıpranma",
    "Çalınan veya hasara uğrayan aksesuar ve ek donanım (özel madde yoksa)",
    "Anahtar kaybı sonucu çalınma (Anahtar kaybı klozu yoksa)",
    "Hırsızlık sonrası 45 gün içinde bulunan araçtaki hasarlar (bazı poliçelerde)",
  ],
  dangerousKeywords: [
    "istisna",
    "kapsam dışı",
    "hariç tutulur",
    "teminat verilmez",
    "tazmin edilmez",
    "bakımsızlık",
    "kullanım hatası",
  ],
} as const;

/**
 * Workplace Insurance (İşyeri Sigortası) Mandatory Coverages
 */
export const WORKPLACE_MANDATORY = {
  required: [
    {
      coverage: "Yangın",
      minLimit: 1000000, // TL - Minimum bina değeri
      description: "İşyeri binaları için zorunlu yangın sigortası",
    },
    {
      coverage: "İşveren Mali Sorumluluk",
      minLimit: 500000, // TL per employee
      description:
        "Çalışan başına minimum 500.000 TL - İş kazası ve meslek hastalıkları için",
    },
    {
      coverage: "DASK (Zorunlu Deprem Sigortası)",
      applicableTo: "Tüm bina sahipleri",
      description: "İşyeri binası için deprem sigortası",
    },
    {
      coverage: "3. Şahıs Mali Sorumluluk",
      minLimit: 1000000, // TL
      description: "Müşteri ve ziyaretçilere karşı sorumluluk",
    },
  ],
  optional: [
    "Cam kırılması",
    "İşletme zararı (durma teminatı)",
    "Makine kırılması",
    "Elektronik cihaz sigortası",
    "Nakliye sigortası",
  ],
} as const;

/**
 * Premium Inflation Adjustment Rules (Prim Enflasyon Uyarlaması)
 */
export const PREMIUM_INFLATION_RULES = {
  annualInflation2024: 65, // % - Türkiye TÜFE 2023 sonu
  recommendedAdjustment: {
    kasko: 50, // % - Araç değeri düşerken onarım maliyeti artıyor
    health: 70, // % - Sağlık enflasyonu TÜFE'nin üzerinde
    property: 60, // % - İnşaat maliyetleri ile bağlantılı
    liability: 40, // % - Nispeten daha stabil
  },
  warningThresholds: {
    undervaluedByMoreThan: 30, // % - Limit mevcut değerin %30 altındaysa uyar
    lastUpdateOlderThan: 365, // days - 1 yıldan eski limit uyar
  },
} as const;

/**
 * Zeyilname (Policy Endorsement) Processing Rules for B2B
 * Critical for tracking mid-term adjustments and inflation corrections
 */
export const ZEYILNAME_RULES = {
  mandatoryReasons: [
    {
      code: "LIMIT_ARTIRIMI",
      description: "Enflasyon nedeniyle teminat limitlerinin artırılması",
      triggerCondition: "Poliçe süresi 6+ ay geçti ve limit artırımı yapılmadı",
      recommendedAction: "Bina/araç değerlerini yeniden ekspertiz yaptırıp limit artırın",
    },
    {
      code: "ADRES_DEGISIKLIK",
      description: "İşyeri veya riziko adresinin değişmesi",
      triggerCondition: "Adres değişikliği bildirildi",
      recommendedAction: "Yeni adresin risk profili değerlendirilmeli (deprem bölgesi vb.)",
    },
    {
      code: "TEMINAT_EKLEME",
      description: "Yeni teminat eklenmesi (örn: Terör teminatı, Sel teminatı)",
      triggerCondition: "Şirket aktivitesi veya varlık portföyü değişti",
      recommendedAction: "Mevcut poliçeye zeyilname ile ek teminat ekleyin",
    },
    {
      code: "CAYMA",
      description: "Sigorta ettiren cayma hakkını kullanıyor (14 gün soğuma süresi)",
      triggerCondition: "Poliçe başlangıcından 14 gün içinde",
      legalBasis: "Sigortacılık Kanunu Madde 12 - Cayma Hakkı",
    },
  ],
  inflationAdjustmentFormula: {
    description: "Zeyilname ile limit artırımı hesaplama",
    formula: "Yeni Limit = Eski Limit × (1 + TÜFE / 100)",
    example: "1.000.000 TL × (1 + 65/100) = 1.650.000 TL",
    premiumImpact: "Limit artırımı oranında ek prim tahsil edilir (pro-rata)",
  },
  processingTimeline: {
    standard: "3-5 iş günü",
    urgent: "1 iş günü (ek ücret ile)",
    automaticApproval: "Sadece limit artırımı zeyilnameleri otomatik onay",
  },
} as const;

/**
 * Industry Benchmark Data (Sektör Karşılaştırma Verileri)
 */
export const INDUSTRY_BENCHMARKS = {
  kasko: {
    averageDeductible: 2, // % - Ortalama muafiyet oranı
    coverageRate: 95, // % - Ortalama araç değeri karşılama oranı
    typicalPremiumRate: 3.5, // % - Araç değerinin ortalama %3.5'i prim
  },
  health: {
    averageWaitingPeriod: 30, // days
    averageCoveragePerPerson: 500000, // TL
    typicalAnnualPremium: 8000, // TL per person
  },
  workplace: {
    averageLimitPerM2: 5000, // TL - Building value per m2
    averageLiabilityCoverage: 2000000, // TL
    typicalPremiumRate: 0.5, // % of insured value
  },
} as const;

/**
 * TSB (Türkiye Sigorta Birliği) Compliance Rules
 */
export const TSB_COMPLIANCE = {
  mandatoryDisclosures: [
    "Poliçe sahibi bilgilendirilme formu imzalanmalı",
    "Ön bilgilendirme formu teslim edilmeli",
    "Soğuma süresi hakları (14 gün) bildirilmeli",
    "Şikayet başvuru kanalları belirtilmeli",
  ],
  dataRetention: {
    policyDocuments: 10, // years - Poliçe belgeleri 10 yıl saklanmalı
    claimFiles: 10, // years - Hasar dosyaları 10 yıl saklanmalı
  },
  digitalization: {
    ePolicy: "2024 itibariyle e-poliçe yasal olarak geçerli",
    eSignature: "Nitelikli elektronik imza ile geçerli",
  },
} as const;

/**
 * Generate domain context prompt for AI
 */
export function generateDomainContext(policyType?: PolicyType): string {
  const baseContext = `# TÜRK SİGORTA MEVZUATI VE SEKTÖR BİLGİLERİ

## Genel Bilgiler
- Düzenleyici kurum: TSB (Türkiye Sigorta Birliği)
- 2024 yılı TÜFE: %${PREMIUM_INFLATION_RULES.annualInflation2024}
- Tüm analizlerde güncel piyasa değerleri dikkate alınmalı

## Yasal Zorunluluklar
${TSB_COMPLIANCE.mandatoryDisclosures.map((d) => `- ${d}`).join("\n")}

`;

  if (!policyType) return baseContext;

  switch (policyType) {
    case "dask":
      return (
        baseContext +
        `
## ZDS (DASK) Özel Kuralları
- Minimum bina değeri (konut): ${ZDS_RULES.minimumBuildingValues.residential.minValuePerM2} TL/m²
- Minimum bina değeri (işyeri): ${ZDS_RULES.minimumBuildingValues.commercial.minValuePerM2} TL/m²
- Zorunlu teminatlar: ${Object.values(ZDS_RULES.mandatoryCoverage).join(", ")}
- İstisnalar: ${ZDS_RULES.exclusions.join(", ")}
- Yasal dayanak: ${ZDS_RULES.legalRequirement}
`
      );

    case "trafik":
      return (
        baseContext +
        `
## Trafik Sigortası İMM Kuralları
- Yasal minimum bedeni hasar: ${TRAFFIC_IMM_RULES.legalMinimums2024.bodily.toLocaleString()} TL
- Yasal minimum maddi hasar: ${TRAFFIC_IMM_RULES.legalMinimums2024.property.toLocaleString()} TL
- Önerilen bireysel bedeni: ${TRAFFIC_IMM_RULES.recommendedLimits.personal.bodily.toLocaleString()} TL
- Önerilen bireysel maddi: ${TRAFFIC_IMM_RULES.recommendedLimits.personal.property.toLocaleString()} TL
- Kritik riskler:
${TRAFFIC_IMM_RULES.keyRisks.map((r) => `  * ${r.scenario}: ${r.exposure}`).join("\n")}
`
      );

    case "saglik":
      return (
        baseContext +
        `
## Sağlık Sigortası Bekleme Süreleri
- Genel tedaviler: ${HEALTH_WAITING_PERIOD_RULES.standard.general} gün
- Ameliyat: ${HEALTH_WAITING_PERIOD_RULES.standard.surgery} gün
- Doğum: ${HEALTH_WAITING_PERIOD_RULES.standard.maternity} gün
- Diş: ${HEALTH_WAITING_PERIOD_RULES.standard.dentistry} gün
- Kronik hastalıklar: ${HEALTH_WAITING_PERIOD_RULES.preExistingConditions.chronic} gün
- Mevcut hastalık notu: ${HEALTH_WAITING_PERIOD_RULES.preExistingConditions.description}
- İstisnalar: Acil durum ve kaza (${HEALTH_WAITING_PERIOD_RULES.exceptions.emergency} gün)
`
      );

    case "kasko":
      return (
        baseContext +
        `
## Kasko Sigortası Yaygın İstisnalar
${KASKO_EXCLUSIONS.standard.map((e) => `- ${e}`).join("\n")}

Dikkat edilmesi gereken kelimeler:
${KASKO_EXCLUSIONS.dangerousKeywords.map((k) => `- "${k}"`).join("\n")}

Enflasyon uyarısı: Araç değeri yıllık ortalama %${PREMIUM_INFLATION_RULES.recommendedAdjustment.kasko} düşüyor.
`
      );

    case "isyeri":
      return (
        baseContext +
        `
## İşyeri Sigortası Zorunlu Teminatlar
${WORKPLACE_MANDATORY.required.map((r) => `- ${r.coverage}: Min ${r.minLimit?.toLocaleString() || "N/A"} TL - ${r.description}`).join("\n")}

Opsiyonel ama önerilen:
${WORKPLACE_MANDATORY.optional.map((o) => `- ${o}`).join("\n")}

Enflasyon uyarısı: Bina değerleri yıllık %${PREMIUM_INFLATION_RULES.recommendedAdjustment.property} artış gösteriyor.
`
      );

    default:
      return baseContext;
  }
}

/**
 * Get industry benchmark for policy type
 */
export function getIndustryBenchmark(policyType: PolicyType): {
  typical: string;
  recommended: string;
} {
  switch (policyType) {
    case "kasko":
      return {
        typical: `Muafiyet: %${INDUSTRY_BENCHMARKS.kasko.averageDeductible}, Prim oranı: %${INDUSTRY_BENCHMARKS.kasko.typicalPremiumRate}`,
        recommended: `Kapsamlı kasko, cam muafiyetsiz, mini onarım klozu`,
      };

    case "saglik":
      return {
        typical: `Kişi başı teminat: ${INDUSTRY_BENCHMARKS.health.averageCoveragePerPerson.toLocaleString()} TL/yıl`,
        recommended: `Check-up dahil, yurtdışı acil sağlık, özel hastane tercihi`,
      };

    case "isyeri":
      return {
        typical: `M2 başı ${INDUSTRY_BENCHMARKS.workplace.averageLimitPerM2.toLocaleString()} TL, Mali sorumluluk ${INDUSTRY_BENCHMARKS.workplace.averageLiabilityCoverage.toLocaleString()} TL`,
        recommended: `İşletme zararı, makine kırılması, elektronik cihaz sigortası`,
      };

    default:
      return {
        typical: "Sektör ortalaması mevcut değil",
        recommended: "Detaylı inceleme önerilir",
      };
  }
}
