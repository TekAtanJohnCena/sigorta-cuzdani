// ============================================
// Sektör Bazlı Sigorta Gereksinimleri Bilgi Tabanı
// Tüm veriler sektör araştırmalarına dayalı statik referans datadır.
// ============================================

export type SectorKey =
  | 'teknoloji'
  | 'uretim'
  | 'lojistik'
  | 'perakende'
  | 'insaat'
  | 'saglik_hizmetleri'
  | 'turizm'
  | 'finans'
  | 'tarim'
  | 'genel';

export interface SectorRequirement {
  label: string;
  description: string;
  requiredTypes: string[];        // Mutlaka olması gerekenler
  recommendedTypes: string[];     // Önerilen / sektörde yaygın
  benchmarks: {
    avgPolicyCount: number;         // Ortalama poliçe adedi
    avgPremiumPerEmployee: number;  // Kişi başı yıllık prim (TRY)
    cyberInsuranceAdoption?: number; // Siber sigorta penetrasyon oranı (%)
    topRisk: string;                // En büyük sektör riski
  };
}

export interface RecommendedCoverage {
  key: string;            // Benzersiz anahtar
  label: string;          // Türkçe poliçe adı
  icon: string;           // Emoji ikon
  severity: 'critical' | 'warning' | 'info';
  why: string;            // Neden gerekli — kısa açıklama
  detail: string;         // Uzun açıklama
  adoptionRate: number;   // Sektördeki penetrasyon oranı (%)
  estimatedAnnualCost: { min: number; max: number }; // Tahmini yıllık maliyet (TRY)
  mapsToPolicyType?: string; // Policy tipine eşleme (varsa)
}

export const SECTOR_DATA: Record<SectorKey, SectorRequirement> = {
  teknoloji: {
    label: 'Teknoloji / Yazılım',
    description: 'Yazılım geliştirme, SaaS, IT hizmetleri, e-ticaret şirketleri',
    requiredTypes: ['yangin', 'saglik', 'dask', 'sorumluluk'],
    recommendedTypes: ['siber_risk', 'is_durması', 'anahtar_personel', 'muhendislik'],
    benchmarks: {
      avgPolicyCount: 6,
      avgPremiumPerEmployee: 14500,
      cyberInsuranceAdoption: 82,
      topRisk: 'Veri ihlali ve siber saldırı',
    },
  },
  uretim: {
    label: 'İmalat / Üretim',
    description: 'Fabrikasyon, montaj, sanayi üretimi yapan şirketler',
    requiredTypes: ['yangin', 'saglik', 'dask', 'muhendislik', 'sorumluluk', 'is_kazasi'],
    recommendedTypes: ['nakliyat', 'makine_kırılması', 'is_durması', 'cevre_kirliligi'],
    benchmarks: {
      avgPolicyCount: 8,
      avgPremiumPerEmployee: 18000,
      topRisk: 'Makine arızası ve iş kazası',
    },
  },
  lojistik: {
    label: 'Lojistik / Nakliyat',
    description: 'Kargo, taşımacılık, depolama, lojistik hizmetleri',
    requiredTypes: ['nakliyat', 'kasko', 'trafik', 'saglik', 'sorumluluk'],
    recommendedTypes: ['yangin', 'is_kazasi', 'dask', 'cmr'],
    benchmarks: {
      avgPolicyCount: 7,
      avgPremiumPerEmployee: 16000,
      topRisk: 'Kargo hasarı ve trafik kazası',
    },
  },
  perakende: {
    label: 'Perakende / Ticaret',
    description: 'Mağaza, toptan ticaret, e-ticaret platformları',
    requiredTypes: ['yangin', 'hirsizlik', 'saglik', 'dask', 'sorumluluk'],
    recommendedTypes: ['is_durması', 'nakliyat', 'cam_kirılması', 'kredi_sigortası'],
    benchmarks: {
      avgPolicyCount: 5,
      avgPremiumPerEmployee: 11000,
      topRisk: 'Hırsızlık ve yangın',
    },
  },
  insaat: {
    label: 'İnşaat / Yapı',
    description: 'Konut, ticari bina, altyapı inşaatı yapan şirketler',
    requiredTypes: ['insaat_all_risk', 'sorumluluk', 'saglik', 'is_kazasi', 'makine_kırılması'],
    recommendedTypes: ['dask', 'yangin', 'nakliyat', 'tamamlama_garantisi'],
    benchmarks: {
      avgPolicyCount: 7,
      avgPremiumPerEmployee: 22000,
      topRisk: 'İş kazası ve inşaat hasarı',
    },
  },
  saglik_hizmetleri: {
    label: 'Sağlık Hizmetleri',
    description: 'Klinik, poliklinik, tıp merkezi, eczane',
    requiredTypes: ['mesleki_sorumluluk', 'saglik', 'yangin', 'dask', 'tibbi_malpraktis'],
    recommendedTypes: ['siber_risk', 'is_kazasi', 'sorumluluk'],
    benchmarks: {
      avgPolicyCount: 6,
      avgPremiumPerEmployee: 19000,
      cyberInsuranceAdoption: 55,
      topRisk: 'Malpraktis ve veri ihlali',
    },
  },
  turizm: {
    label: 'Turizm / Otelcilik',
    description: 'Otel, tatil köyü, seyahat acentesi, restoran',
    requiredTypes: ['yangin', 'saglik', 'dask', 'sorumluluk'],
    recommendedTypes: ['is_kazasi', 'is_durması', 'cam_kirılması', 'elektronik_cihaz'],
    benchmarks: {
      avgPolicyCount: 5,
      avgPremiumPerEmployee: 12000,
      topRisk: 'Yangın ve misafir yaralanması',
    },
  },
  finans: {
    label: 'Finans / Sigortacılık',
    description: 'Banka, aracı kurum, sigorta şirketi, muhasebe',
    requiredTypes: ['sorumluluk', 'mesleki_sorumluluk', 'saglik', 'yangin', 'siber_risk'],
    recommendedTypes: ['anahtar_personel', 'dask', 'is_kazasi'],
    benchmarks: {
      avgPolicyCount: 7,
      avgPremiumPerEmployee: 20000,
      cyberInsuranceAdoption: 91,
      topRisk: 'Siber saldırı ve yasal uyumsuzluk',
    },
  },
  tarim: {
    label: 'Tarım / Gıda',
    description: 'Tarımsal üretim, gıda işleme, hayvancılık',
    requiredTypes: ['tarim_sigortasi', 'sorumluluk', 'saglik', 'yangin'],
    recommendedTypes: ['nakliyat', 'dask', 'is_kazasi', 'hayvan_sigortası'],
    benchmarks: {
      avgPolicyCount: 5,
      avgPremiumPerEmployee: 9000,
      topRisk: 'Hava koşulları ve ürün hasarı',
    },
  },
  genel: {
    label: 'Genel / Diğer',
    description: 'Sektör belirtilmemiş veya karma faaliyet',
    requiredTypes: ['yangin', 'saglik', 'dask', 'sorumluluk'],
    recommendedTypes: ['is_kazasi', 'is_durması', 'nakliyat'],
    benchmarks: {
      avgPolicyCount: 5,
      avgPremiumPerEmployee: 12000,
      topRisk: 'Yangın ve iş kazası',
    },
  },
};

// ============================================
// Önerilen teminat detayları (tüm sektörler için)
// ============================================

export const COVERAGE_DETAILS: Record<string, RecommendedCoverage> = {
  siber_risk: {
    key: 'siber_risk',
    label: 'Siber Sorumluluk & Veri İhlali',
    icon: '🔐',
    severity: 'critical',
    why: 'Fidye yazılımı, KVKK veri ihlali ve DDoS saldırılarına karşı koruma',
    detail: 'Veri ihlali durumunda KVKK kapsamındaki idari para cezaları (100K – 10M TL arası), müşteri bildirimi maliyetleri, sistem kurtarma masrafları ve itibar hasarını karşılar. Siber saldırı sonrası şirketlerin %60\'ı 6 ay içinde kapanmaktadır.',
    adoptionRate: 82,
    estimatedAnnualCost: { min: 25000, max: 120000 },
    mapsToPolicyType: 'sorumluluk',
  },
  is_durması: {
    key: 'is_durması',
    label: 'İş Durması (Kar Kaybı)',
    icon: '⏸️',
    severity: 'critical',
    why: 'Hasar sonrası iş yapamadığınız süredeki ciro kaybını karşılar',
    detail: 'Yangın, su baskını veya büyük bir hasar sonrası ofis/fabrika kapandığında, maaşlar ödemeye devam ederken ciro sıfırlanır. İş durması sigortası bu süredeki sabit maliyetleri ve net kârı karşılar. Yangın poliçesi aldınız ama iş durması klozunu atladıysanız asıl riski kapsamamış olursunuz.',
    adoptionRate: 58,
    estimatedAnnualCost: { min: 15000, max: 80000 },
  },
  anahtar_personel: {
    key: 'anahtar_personel',
    label: 'Anahtar Personel (Key Person)',
    icon: '🧑‍💼',
    severity: 'warning',
    why: 'CEO, CTO gibi kritik kişilerin iş göremez hale gelmesi durumunda şirkete gelir',
    detail: 'Şirketin kilit kişileri (kurucu, baş mühendis, satış müdürü) hayatını kaybederse veya uzun süreli iş göremez olursa şirket ciddi gelir kaybı yaşar. Key Person sigortası bu kayba karşı şirkete tazminat öder; yeni yönetici bulma sürecini finanse eder.',
    adoptionRate: 41,
    estimatedAnnualCost: { min: 18000, max: 75000 },
  },
  mesleki_sorumluluk: {
    key: 'mesleki_sorumluluk',
    label: 'Mesleki Sorumluluk (E&O)',
    icon: '📜',
    severity: 'critical',
    why: 'Hizmetlerinizden kaynaklanan müşteri zararları için yasal sorumluluk',
    detail: 'Verdiğiniz danışmanlık, yazılım veya hizmet nedeniyle müşterinizin zarara uğraması durumunda karşınıza çıkacak tazminat davalarını karşılar. Teknoloji şirketleri için yazılım hataları, danışmanlar için hatalı tavsiye bu kapsamda değerlendirilebilir.',
    adoptionRate: 67,
    estimatedAnnualCost: { min: 20000, max: 150000 },
    mapsToPolicyType: 'sorumluluk',
  },
  is_kazasi: {
    key: 'is_kazasi',
    label: 'İşveren Sorumluluk & İş Kazası',
    icon: '⛑️',
    severity: 'warning',
    why: 'Çalışanların iş yerinde yaralanması durumunda işveren sorumluluğu',
    detail: 'SGK iş kazası tazminatlarının ötesinde, çalışanlar işvereninize dava açabilir. İşveren sorumluluk sigortası bu tür davaların hukuki masrafları ve tazminatlarını karşılar. 10+ çalışanı olan tüm şirketler için önerilir.',
    adoptionRate: 63,
    estimatedAnnualCost: { min: 8000, max: 45000 },
  },
  makine_kırılması: {
    key: 'makine_kırılması',
    label: 'Makine Kırılması & Elektronik Cihaz',
    icon: '⚙️',
    severity: 'warning',
    why: 'Üretim makinalarının arızalanması ve onarım maliyetleri',
    detail: 'Üretim makinaları arızalandığında sadece onarım değil, duran üretim nedeniyle ciro da kaybedilir. Makine kırılması sigortası hem onarım/yenileme maliyetini hem de iş durması tazminatını (klozu varsa) karşılar.',
    adoptionRate: 71,
    estimatedAnnualCost: { min: 12000, max: 60000 },
    mapsToPolicyType: 'muhendislik',
  },
  tibbi_malpraktis: {
    key: 'tibbi_malpraktis',
    label: 'Tıbbi Malpraktis',
    icon: '🏥',
    severity: 'critical',
    why: 'Tıbbi hata sonucu hastalara verilen zararlar için zorunlu sorumluluk',
    detail: 'Sağlık kuruluşları için hem bireysel doktorlar hem de kurum düzeyinde malpraktis sigortası giderek zorunlu hale gelmektedir. Mahkeme kararları yıllar sürebilir ve tazminat miktarları son derece yüksek olabilir.',
    adoptionRate: 88,
    estimatedAnnualCost: { min: 35000, max: 200000 },
    mapsToPolicyType: 'sorumluluk',
  },
  nakliyat_ext: {
    key: 'nakliyat_ext',
    label: 'Emtia Nakliyat (Genişletilmiş)',
    icon: '🚢',
    severity: 'info',
    why: 'Taşınan malların transit sürede zarar görmesi durumunda koruma',
    detail: 'Standart kargo sigortasının ötesinde, özellikle uluslararası sevkiyatlarda "tüm riskler" kapsamlı nakliyat sigortası kritiktir. Özellikle değerli mal taşıyan lojistik firmaları için genişletilmiş kapsam önerilir.',
    adoptionRate: 79,
    estimatedAnnualCost: { min: 10000, max: 40000 },
    mapsToPolicyType: 'nakliyat',
  },
  cam_kirılması: {
    key: 'cam_kirılması',
    label: 'Cam Kırılması',
    icon: '🪟',
    severity: 'info',
    why: 'Vitrin ve cam yüzeylerin kırılması durumunda hızlı tamirat',
    detail: 'Özellikle mağaza, showroom veya cam cephe kullanan ofisler için yararlıdır. Işyeri poliçesine ek klozu olarak eklenebilir.',
    adoptionRate: 52,
    estimatedAnnualCost: { min: 3000, max: 15000 },
    mapsToPolicyType: 'yangin',
  },
};

// ============================================
// Sektöre göre eksik teminatları döndür
// ============================================

export function getMissingCoverages(
  sectorKey: SectorKey,
  existingPolicyTypes: string[]
): RecommendedCoverage[] {
  const sector = SECTOR_DATA[sectorKey];
  if (!sector) return [];

  const allRecommended = [...sector.requiredTypes, ...sector.recommendedTypes];
  const missing: RecommendedCoverage[] = [];

  for (const coverageKey of allRecommended) {
    // Check if a matching policy type exists
    const isCovered = existingPolicyTypes.some(t =>
      t === coverageKey ||
      (COVERAGE_DETAILS[coverageKey]?.mapsToPolicyType === t)
    );

    if (!isCovered && COVERAGE_DETAILS[coverageKey]) {
      missing.push(COVERAGE_DETAILS[coverageKey]);
    }
  }

  return missing.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export const SECTOR_OPTIONS = Object.entries(SECTOR_DATA).map(([key, val]) => ({
  value: key as SectorKey,
  label: val.label,
}));
