// ============================================
// Hasar Bildirimi Gereksinimleri Bilgi Tabanı
// Her poliçe tipi için gerekli evraklar ve adımlar.
// Tüm veriler sigorta mevzuatına ve standart uygulamaya dayanır.
// ============================================

import { PolicyType } from '@/types/policy';

export interface RequiredDocument {
  name: string;
  description: string;
  mandatory: boolean;
}

export interface ClaimTypeInfo {
  label: string;
  icon: string;
  color: string;
  requiredDocs: RequiredDocument[];
  processSteps: string[];
  avgProcessingDays: number;
  importantNotes: string[];
  notificationDeadlineDays: number; // Hasarı kaç gün içinde bildirmeli
}

export const CLAIM_REQUIREMENTS: Partial<Record<PolicyType, ClaimTypeInfo>> = {
  kasko: {
    label: 'Kasko Hasarı',
    icon: '🚗',
    color: 'var(--primary-500)',
    notificationDeadlineDays: 5,
    requiredDocs: [
      { name: 'Kaza Tespit Tutanağı', description: 'Trafik polisi veya İkili Kaza Tespit Tutanağı. Trafik kazası ise mutlaka polis tutanağı.', mandatory: true },
      { name: 'Ehliyet Fotokopisi', description: 'Sürücünün geçerli ehliyet fotokopisi (ön-arka)', mandatory: true },
      { name: 'Araç Ruhsatı', description: 'Araç ruhsatının fotokopisi veya dijital kopyası', mandatory: true },
      { name: 'Hasar Fotoğrafları', description: 'Hasarlı bölgelerin en az 4 farklı açıdan fotoğrafları, tercihen kazadan hemen sonra çekilmiş', mandatory: true },
      { name: 'Tamir Faturası / Keşif', description: 'Servis tamir keşfi veya faturası (ön tamir yapılmışsa)', mandatory: false },
      { name: 'Karşı Taraf Bilgileri', description: 'Karşı araç plakası, sürücü bilgileri, sigorta poliçe no (3. şahıs hasarı varsa)', mandatory: false },
    ],
    processSteps: [
      'Hasarı en geç 5 iş günü içinde sigorta şirketine veya acenteye bildirin',
      'Bu sistem üzerinden hasarı kayıt altına alın',
      'Gerekli belgeleri yükleyin',
      'Sigorta şirketi eksper atar (1-3 iş günü)',
      'Eksper araç incelemesi yapar',
      'Hasar bedeli onaylanır ve tamir/ödeme başlar',
      'Ortalama 15 iş günü içinde sonuçlanır',
    ],
    avgProcessingDays: 15,
    importantNotes: [
      'Kazadan sonra mümkünse aracı hareket ettirmeden önce fotoğraf çekin',
      'Karşı tarafın sigorta poliçe numarasını mutlaka alın',
      'Alkollü araç kullanımı teminat kapsamı dışındadır',
      'Aracı yetkili servise götürün, ön tamir hasar tespitini zorlaştırır',
    ],
  },

  trafik: {
    label: 'Trafik / 3. Şahıs Hasarı',
    icon: '🚦',
    color: 'var(--warning-500)',
    notificationDeadlineDays: 5,
    requiredDocs: [
      { name: 'Kaza Tespit Tutanağı', description: 'Polis veya ikili kaza tutanağı zorunludur', mandatory: true },
      { name: 'Ehliyet ve Ruhsat', description: 'Sürücü ehliyeti ve araç ruhsatı', mandatory: true },
      { name: '3. Şahıs Hasar Belgesi', description: 'Karşı aracın hasar tespit belgesi veya tamir keşfi', mandatory: true },
      { name: 'Yaralanma Raporu', description: 'Varsa sağlık kuruluşundan alınan yaralanma raporu', mandatory: false },
    ],
    processSteps: [
      'Kazayı bildirin (acil durumlarda 112 veya 155)',
      'Kaza tutanağını doldurun veya polis çağırın',
      'Karşı tarafın bilgilerini alın',
      'Sigorta şirketinizi bilgilendirin',
      'Eksper incelemesi ve hasar tespiti',
      '3. şahıs tazminatı sigorta şirketi tarafından ödenir',
    ],
    avgProcessingDays: 10,
    importantNotes: [
      'Trafik sigortası yalnızca 3. şahıs hasarlarını karşılar, kendi araç hasarı kaskoda',
      'Ölümlü kazalarda polis tutanağı zorunludur',
      'Tazminat talebini makul sürede yapın (zamanaşımı: 2 yıl)',
    ],
  },

  yangin: {
    label: 'Yangın / İşyeri Hasarı',
    icon: '🔥',
    color: 'var(--danger-500)',
    notificationDeadlineDays: 3,
    requiredDocs: [
      { name: 'İtfaiye Raporu', description: 'Yangın ihbarı yapıldıysa itfaiye müdahale raporu', mandatory: true },
      { name: 'Polis/Jandarma Tutanağı', description: 'Hırsızlık veya sabotaj şüphesi varsa zorunlu', mandatory: false },
      { name: 'Hasar Fotoğrafları/Video', description: 'Tüm hasarlı alanların belgelenmesi', mandatory: true },
      { name: 'Mal Listesi', description: 'Hasar gören mal/demirbaş ve tahmini değerleri', mandatory: true },
      { name: 'Tapu / Kira Sözleşmesi', description: 'Mülkiyet veya kiracılık belgesi', mandatory: true },
      { name: 'Fatura ve İspat Belgeleri', description: 'Hasarlı malların satın alma fatura/belgeleri', mandatory: false },
    ],
    processSteps: [
      'Yangın söndürme ve tahliye — insan güvenliği önce',
      'Hasarı 3 gün içinde sigorta şirketine bildirin',
      'Hasarlı alanı eksper gelene kadar değiştirmeyin (delil koruma)',
      'Fotoğraf ve video ile belgeleme yapın',
      'Eksper hasar tespiti yapar (genellikle 2-5 gün içinde)',
      'Hasar raporu hazırlanır ve onay süreci başlar',
      'Tazminat kararı (ortalama 30 gün)',
    ],
    avgProcessingDays: 30,
    importantNotes: [
      'Hasar gören alanı temizlemeyin — eksper gelmeden önceki hali korunmalı',
      'Hasarlı mallara ait fatura ve belgeler tazminat hesabında kritik',
      'Kira kaybı ve iş durması teminatı varsa ayrı beyan yapılmalı',
    ],
  },

  saglik: {
    label: 'Sağlık / Tıbbi Tedavi',
    icon: '🏥',
    color: 'var(--success-500)',
    notificationDeadlineDays: 30,
    requiredDocs: [
      { name: 'Doktor Raporu / Epikriz', description: 'Tedavi edilen hastaneden alınan epikriz veya doktor raporu', mandatory: true },
      { name: 'Tedavi Faturaları', description: 'Tüm tedavi, ilaç, ameliyat masrafları faturaları', mandatory: true },
      { name: 'Eczane Faturaları', description: 'Reçeteli ilaç harcamaları (reçete ile birlikte)', mandatory: false },
      { name: 'Reçeteler', description: 'Tüm reçete kopyaları', mandatory: false },
      { name: 'Laboratuvar Sonuçları', description: 'Tahlil, görüntüleme ve test sonuçları', mandatory: false },
    ],
    processSteps: [
      'Anlaşmalı sağlık kuruluşlarına gidin (onay gerekmez)',
      'Anlaşmasız sağlık kuruluşu için önce sigorta şirketinden ön onay alın',
      'Tüm tedavi belgelerini ve faturaları saklayın',
      'Tedavi sonrası belgeleri sisteme yükleyin veya acenteye iletin',
      'Tazminat hesaplanır ve ödenir (14-21 gün)',
    ],
    avgProcessingDays: 14,
    importantNotes: [
      'Anlaşmalı hastanelerde direkt fatura uygulanır, ön ödeme yapmazsınız',
      'Yurt dışı tedavi için mutlaka ön onay alınız',
      'Ameliyat için 24 saat öncesinden onay alınması gerekebilir',
    ],
  },

  nakliyat: {
    label: 'Nakliyat / Emtia Hasarı',
    icon: '🚢',
    color: 'var(--primary-600)',
    notificationDeadlineDays: 7,
    requiredDocs: [
      { name: 'Konşimento / İrsaliye', description: 'Taşıma belgesi (konşimento, CMR, irsaliye)', mandatory: true },
      { name: 'Hasar Tespit Tutanağı', description: 'Taşıyıcı veya gümrük tarafından düzenlenen hasar tutanağı', mandatory: true },
      { name: 'Fatura', description: 'Hasarlı malların ticari faturası', mandatory: true },
      { name: 'Hasar Fotoğrafları', description: 'Hasarlı ambalaj ve malların fotoğrafları', mandatory: true },
      { name: 'Packing List', description: 'Sevkiyat paket listesi', mandatory: false },
      { name: 'Taşıyıcı Protestosu', description: 'Taşıyıcıya yapılan yazılı hasar bildirimi', mandatory: false },
    ],
    processSteps: [
      'Hasarı teslimat anında veya hemen sonrasında belgeleyin',
      'Taşıyıcıya yazılı bildirim yapın (hasar protestosu)',
      '7 gün içinde sigorta şirketine bildirin',
      'Belgeleri eksiksiz iletinmesi çok önemlidir',
      'Eksper incelemesi (gerekirse)',
      'Hasar tazminatı hesaplanır',
    ],
    avgProcessingDays: 21,
    importantNotes: [
      'Malı teslim alırken hasarlı ise konşimento üzerine not düşürün',
      'Hasarlı malları imha etmeyin — eksper görmeden',
      'Taşıyıcıya sorumluluk tazminatı davası açma hakkınız saklıdır',
    ],
  },

  dask: {
    label: 'DASK / Deprem Hasarı',
    icon: '🏠',
    color: 'var(--warning-600)',
    notificationDeadlineDays: 15,
    requiredDocs: [
      { name: 'Tapu Belgesi', description: 'Deprem hasarına uğrayan binanın tapu belgesi', mandatory: true },
      { name: 'Nüfus Cüzdanı', description: 'Sigortalının kimlik belgesi', mandatory: true },
      { name: 'Hasar Fotoğrafları', description: 'Yapısal ve içerik hasarının fotoğrafları', mandatory: true },
      { name: 'Belediye Hasar Tespit Belgesi', description: 'Mümkünse belediye veya yetkili kurumdan hasar tespiti', mandatory: false },
    ],
    processSteps: [
      'Deprem sonrası güvenli ortamda hasar tespiti yapın',
      'DASK\'ı 444 DASK (444 3275) hattından arayın veya web sitesinden bildirin',
      '15 gün içinde resmi başvuru yapın',
      'Eksper incelemesi gerçekleştirilir',
      'Hasar tazminatı DASK teminat limitleri dahilinde ödenir',
    ],
    avgProcessingDays: 45,
    importantNotes: [
      'DASK yalnızca depremden kaynaklanan yapısal hasarı karşılar, eşya değil',
      'Konut değeri DASK limitini aşıyorsa ek deprem sigortası gerekir',
      'Deprem verisi Kandilli Rasathanesi kayıtlarıyla doğrulanır',
    ],
  },

  sorumluluk: {
    label: 'Sorumluluk Tazminat Talebi',
    icon: '⚖️',
    color: 'var(--warning-500)',
    notificationDeadlineDays: 10,
    requiredDocs: [
      { name: 'Tazminat Talebi / İhtar', description: '3. şahıstan gelen yazılı tazminat talebi veya ihtar', mandatory: true },
      { name: 'Olay Tutanağı', description: 'Olayın nasıl gerçekleştiğinin yazılı açıklaması', mandatory: true },
      { name: 'Zarar Belgesi', description: '3. şahsın uğradığı zararın belgesi (fatura, rapor)', mandatory: true },
      { name: 'Dava Dilekçesi', description: 'Varsa mahkeme celbi veya dava dilekçesi', mandatory: false },
    ],
    processSteps: [
      'Talebi aldığınız anda sigorta şirketinizi bilgilendirin',
      'Yazışmaları kayıt altına alın',
      'Sigorta şirketi hukuki savunmayı üstlenir',
      'Uzlaşma veya mahkeme kararı beklenir',
      'Tazminat sigorta şirketi tarafından ödenir',
    ],
    avgProcessingDays: 60,
    importantNotes: [
      'Hiçbir tazminatı sigorta şirketi onayı olmadan ödemeyin',
      'Tüm yazışmalar sigorta şirketiyle koordineli yürütülmeli',
      'Poliçe limitini aşan tazminat şirkete aittir',
    ],
  },
};

export const DEFAULT_CLAIM_INFO: ClaimTypeInfo = {
  label: 'Sigorta Hasarı',
  icon: '📋',
  color: 'var(--neutral-500)',
  notificationDeadlineDays: 7,
  requiredDocs: [
    { name: 'Olay Belgesi', description: 'Hasarı belgeleyen resmi evrak veya tutanak', mandatory: true },
    { name: 'Hasar Fotoğrafları', description: 'Hasara ilişkin fotoğraf ve görsel belgeler', mandatory: true },
    { name: 'Kimlik Belgesi', description: 'Sigortalının kimlik fotokopisi', mandatory: true },
  ],
  processSteps: [
    'Hasarı sigorta şirketinize bildirin',
    'Gerekli belgeleri toplayın',
    'Eksper incelemesini bekleyin',
    'Hasar tazminatını alın',
  ],
  avgProcessingDays: 20,
  importantNotes: [
    'Hasarı bildirme sürelerine dikkat edin',
    'Belgeleri eksiksiz ve zamanında iletin',
  ],
};
