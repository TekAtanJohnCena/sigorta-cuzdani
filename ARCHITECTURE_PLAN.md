# Sigorta Cuzdani - Kurumsal Mimari ve Gelistirme Plani

**Tarih:** 2026-05-11  
**Hedef:** Bankalara ve filo yonetim sirketlerine satilabilecek, gercek is sureclerini cozen kurumsal urun  
**Mevcut Durum:** MVP-demo asama — temel altyapi var, is mantiklari yuzeysel veya mock

---

## 1. MEVCUT DURUM ANALIZI

### Calisan Moduller (Gercek Veri + Is Mantigi)
| Modul | Durum | Eksik |
|-------|-------|-------|
| Police Yonetimi | Firebase CRUD + AI extraction calisiyor | - |
| AI Analiz | Bedrock + Gemini entegrasyonu mevcut | Maliyet optimizasyonu |
| Finansal Ozet | Prim, odeme takvimleri | Gercek muhasebe entegrasyonu |
| Uyari Sistemi | localStorage bazli | Push notification yok |

### Calismayan / Yuzeysel Moduller (KRITIK)
| Modul | Sorun | Etki |
|-------|-------|------|
| Risk Aciklari | Sektorel veri statik, limit analizi dogru ama tetiklenmiyor aktif | Deger onerisi zayif |
| Varlik Envanteri | CRUD var ama eslestirme yuzeysel, ERP/Excel import yok | Sigortasiz varlik tespiti guvenilmez |
| Teklif & Yenileme | %100 mock — hicbir sigorta sirketi API'si yok | Demo tiyatrosu |
| Hasar Merkezi | Kanban UI var ama status degisimi sadece frontend | Gercek surec yonetimi yok |

---

## 2. MIMARI VIZYON

```
                    ┌─────────────────────────────────────┐
                    │         SIGORTA CUZDANI              │
                    │   Enterprise Insurance Platform       │
                    └─────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
   ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
   │  FRONTEND   │          │  BACKEND    │          │  DATA LAYER │
   │  Next.js    │          │  API Routes │          │  Firebase   │
   │  App Router │          │  + Services │          │  + Storage  │
   └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
          │                         │                         │
          │              ┌──────────┼──────────┐              │
          │              │          │          │              │
   ┌──────▼──────┐ ┌────▼────┐ ┌──▼───┐ ┌───▼────┐  ┌─────▼─────┐
   │  UI Layer   │ │ Engine  │ │ AI   │ │ Notif  │  │ Firestore │
   │  Components │ │ Layer   │ │ Layer│ │ Layer  │  │ Rules &   │
   │  + Hooks    │ │ Business│ │ LLM  │ │ Email  │  │ Functions │
   └─────────────┘ │ Logic   │ │ Svc  │ │ Push   │  └───────────┘
                    └─────────┘ └──────┘ └────────┘
```

### Mimari Ilkeler
1. **Engine-First Design** — Her is sureci kendi engine dosyasinda, UI'dan bagimsiz
2. **Event-Driven** — Firestore triggers ile otomatik aksiyonlar
3. **Multi-Tenant Isolation** — Her islem tenantId ile izole
4. **Audit Trail** — Her state degisimi loglanir
5. **Offline-Ready Metadata** — Kritik kurallar client-side, AI opsiyonel

---

## 3. MODUL BAZLI DETAYLI PLAN

---

### 3.1 RISK ACIKLARI MOTORU (Oncelik: KRITIK)

**Mevcut Sorun:**
- Sektorel benchmark verisi statik ama DOGRU yapilandirilmis
- `limitBenchmarkEngine.ts` calisir ama sadece company profile varsa tetiklenir
- Risk mining engine (AI) sadece tekil police analizi yapar, portfolyo capinda calistigi belirsiz
- Kullanici aksiyon alamiyor (sadece "eksik" diyor, ne yapmali soylenmiyor)

**Hedef Mimari:**

```
src/lib/engines/
├── riskEngine/
│   ├── index.ts                    # Orchestrator
│   ├── sectorBenchmark.ts          # Mevcut sectorInsurance.ts genisletilmis
│   ├── limitAdequacy.ts            # Mevcut limitBenchmarkEngine.ts
│   ├── coverageGapDetector.ts      # YENi - Teminat bosluk tespiti
│   ├── regulatoryCompliance.ts     # YENI - Yasal zorunluluk kontrolu
│   ├── historicalRiskScorer.ts     # YENI - Gecmis hasar/prim oraniyla risk skoru
│   └── actionRecommender.ts        # YENI - Somut aksiyon onerisi
```

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.1.1 | Company Profile Zorunlu Kilma | Onboarding'de sektor, ciro, calisan sayisi zorunlu → risk engine otomatik calissn |
| 3.1.2 | Coverage Gap Detector | Mevcut `getMissingCoverages` fonksiyonunu genisleterek: sadece "eksik" degil "neden eksik" ve "riski ne" aciklamasi |
| 3.1.3 | Regulatory Compliance Engine | Turk mevzuatina gore zorunlu police kontrolu (DASK, Trafik, ISG vb.) — firma tipine gore |
| 3.1.4 | Historical Risk Scorer | Hasar/prim orani (loss ratio), gecmis hasar sikligi, sektor ortalamasi kiyaslamasi |
| 3.1.5 | Action Recommender | Her risk icin: ne yapilmali, tahmini maliyet, oncelik, deadline |
| 3.1.6 | Risk Dashboard Refactor | Statik kart gorunumunden → interaktif risk haritasi, filtrelenebilir, export |
| 3.1.7 | Otomatik Risk Tarama | Her police ekleme/guncellemede background'da risk taramasi calistir |
| 3.1.8 | Risk Score API | `GET /api/risk/score` — tenant'in guncel risk skorunu JSON dondurir (harici entegrasyon icin) |

**Veri Modeli Eklentisi:**
```typescript
interface RiskAssessment {
  id: string;
  tenantId: string;
  assessmentDate: string;
  overallScore: number;        // 0-100
  scoreBreakdown: {
    coverageAdequacy: number;  // Teminat yeterliligi
    limitAdequacy: number;     // Limit yeterliligi
    regulatoryCompliance: number; // Yasal uyum
    lossHistory: number;       // Hasar gecmisi
    diversification: number;   // Cesitlendirme
  };
  gaps: RiskGap[];
  recommendations: RiskRecommendation[];
  nextReviewDate: string;
}

interface RiskGap {
  type: 'missing_coverage' | 'insufficient_limit' | 'regulatory' | 'expiring';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  financialExposure: number;   // Sigortasiz risk tutari
  recommendation: string;
  estimatedCost: { min: number; max: number };
  deadline?: string;           // Yasal deadline varsa
}

interface RiskRecommendation {
  priority: number;
  action: string;
  expectedBenefit: string;
  estimatedCost: { min: number; max: number };
  timeframe: 'immediate' | '30_days' | '90_days' | '6_months';
}
```

---

### 3.2 VARLIK ENVANTERI (Oncelik: YUKSEK)

**Mevcut Sorun:**
- Manuel giris var ama olceklenemiyor (banka/filo 500+ varlik girer)
- Excel import placeholder — calismaz
- ERP entegrasyonu banner var, fonksiyon yok
- Eslestirme tip bazli — ince ayar yok (hangi arac hangi kasko?)

**Hedef Mimari:**

```
src/lib/engines/
├── assetEngine/
│   ├── index.ts                    # Orchestrator
│   ├── matcher.ts                  # Mevcut assetMatchEngine genisletilmis
│   ├── bulkImporter.ts            # YENI - Excel/CSV toplu import
│   ├── depreciationCalculator.ts  # YENI - Deger kaybı hesaplamasi
│   ├── coverageAdequacy.ts        # YENI - Varlik degerine gore teminat yeterliligi
│   └── alertGenerator.ts          # YENI - Sigortasiz/eksik teminatlı varlik uyarilari
```

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.2.1 | Excel/CSV Bulk Import | xlsx parse (SheetJS) — kolon eslestirme UI, validation, preview |
| 3.2.2 | Gelismis Eslestirme | Plaka/adres bazli direkt eslestirme, fuzzy matching, confidence score |
| 3.2.3 | Varlik Detay Sayfasi | Tek varlik icin: bagli policeler, teminat yeterliligi, deger kaybı grafigi |
| 3.2.4 | Deger Kaybi Hesaplama | Arac: yil bazli %20 azalan, Bina: sabit, Ekipman: ekonomik omur |
| 3.2.5 | Otomatik Teminat Kontrolu | Varlik degeri vs police teminat limiti → eksik teminat uyarisi |
| 3.2.6 | Toplu Islem | Secili varliklari toplu sil/guncelle/export |
| 3.2.7 | Varlik-Police Baglama UI | Drag-drop veya dropdown ile manuel baglama imkani |
| 3.2.8 | API Entegrasyon Katmani | REST endpoint: `POST /api/assets/bulk` — ERP/dis sistem entegrasyonu |

**Veri Modeli Genisletme:**
```typescript
interface Asset {
  // ... mevcut alanlar
  
  // YENI ALANLAR
  acquisitionDate?: string;      // Edinim tarihi
  acquisitionCost?: number;      // Alis maliyeti
  currentMarketValue?: number;   // Guncel piyasa degeri
  depreciationMethod?: 'linear' | 'declining' | 'none';
  usefulLifeYears?: number;      // Ekonomik omur
  
  // Arac icin
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  
  // Bina icin
  address?: string;
  squareMeters?: number;
  constructionYear?: number;
  
  // Eslestirme
  matchConfidence?: number;      // 0-100
  lastMatchDate?: string;
  manuallyLinked?: boolean;      // Kullanici elle bagladi mi
}
```

---

### 3.3 TEKLIF & YENILEME MOTORU (Oncelik: KRITIK)

**Mevcut Sorun:**
- %100 mock data — hicbir gercek sigorta sirketi entegrasyonu yok
- Animasyonlu "tarama" tamamen tiyatro
- Regulasyon: Dogrudan police satisi icin acente/broker lisansi gerekir
- ANCAK: Teklif toplama, karsilastirma ve yonlendirme yasal

**Stratejik Karar: Marketplace Modeli**
Dogrudan police satmak yerine:
1. Kullanicinin ihtiyacini belirle (mevcut police + varlik + risk analizi)
2. Partner acentelerden/brokerlardan teklif topla (API veya manual)
3. Karsilastirma ve oneri sun
4. Yenileme sureci takibi (hatirlatma, dokuman, onay)

**Hedef Mimari:**

```
src/lib/engines/
├── renewalEngine/
│   ├── index.ts                    # Orchestrator
│   ├── expiryTracker.ts           # Vade takibi ve zamanlama
│   ├── requirementBuilder.ts      # Police tipine gore gereksinim belirleme
│   ├── quoteRequestGenerator.ts   # YENI - Teklif talebi olusturma
│   ├── quoteComparator.ts         # YENI - Teklif karsilastirma motoru
│   ├── renewalWorkflow.ts         # YENI - Yenileme is akisi (state machine)
│   └── partnerIntegration.ts      # YENI - Broker/acente API katmani

src/app/api/renewals/
├── route.ts                        # Yenileme listesi
├── [id]/route.ts                   # Tek yenileme detay
├── [id]/quotes/route.ts            # O yenileme icin teklifler
└── request-quote/route.ts          # Teklif talebi gonder
```

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.3.1 | Renewal Workflow Engine | State machine: upcoming → quote_requested → quotes_received → comparing → selected → renewed / lapsed |
| 3.3.2 | Teklif Talep Formu | Kullanici mevcut policesini secip teklif talep eder → sistem bilgileri derler |
| 3.3.3 | Teklif Toplama Altyapisi | Phase 1: Manuel giris (broker e-posta ile gonderir, kullanici sisteme girer). Phase 2: Partner API |
| 3.3.4 | Karsilastirma Motoru | Ayni tipteki teklifleri: prim, teminat genisligi, muafiyet, ozel sartlar bazinda karsilastir |
| 3.3.5 | AI Destekli Oneri | Mevcut police + risk profili + butce ile en uygun teklifi AI ile secindir |
| 3.3.6 | Otomatik Hatirlatma | 60/30/15/7 gun kala e-posta + in-app uyari, escalation zinciri |
| 3.3.7 | Yenileme Dokuman Paketi | Otomatik dokuman listesi: mevcut police, hasar gecmisi, varlik listesi → broker'a hazir paket |
| 3.3.8 | Partner Portal (Phase 2) | Broker/acente'nin tekliflerini dogrudan sisteme girmesi icin portal |

**Veri Modeli:**
```typescript
interface RenewalProcess {
  id: string;
  tenantId: string;
  policyId: string;
  policyType: PolicyType;
  currentInsurer: string;
  currentPremium: number;
  expiryDate: string;
  
  status: RenewalStatus;
  statusHistory: { status: RenewalStatus; timestamp: string; note?: string }[];
  
  // Teklif yonetimi
  quoteRequests: QuoteRequest[];
  receivedQuotes: ReceivedQuote[];
  selectedQuoteId?: string;
  
  // Aksiyonlar
  assignedTo?: string;           // Sorumlu kisi
  nextActionDate?: string;
  notes: string[];
  
  createdAt: string;
  updatedAt: string;
}

type RenewalStatus = 
  | 'upcoming'           // Vade yaklasıyor
  | 'quote_requested'    // Teklif talep edildi
  | 'quotes_received'    // Teklifler geldi
  | 'comparing'          // Karsilastirma yapiliyor
  | 'selected'           // Teklif secildi
  | 'renewed'            // Yenilendi
  | 'lapsed';            // Vade gecti (yenilenmedi)

interface QuoteRequest {
  id: string;
  requestDate: string;
  targetBrokers: string[];       // Kimlerden teklif istendi
  requirements: string;          // Ozel gereksinimler
  deadline: string;
  status: 'sent' | 'partial' | 'complete';
}

interface ReceivedQuote {
  id: string;
  brokerName: string;
  insurerName: string;
  receivedDate: string;
  annualPremium: number;
  coverages: { name: string; limit: number; deductible?: number }[];
  specialConditions: string[];
  validUntil: string;
  documentUrl?: string;
  aiScore?: number;              // AI karsilastirma skoru
  aiNotes?: string;
}
```

---

### 3.4 HASAR MERKEZI (Oncelik: KRITIK)

**Mevcut Sorun:**
- Kanban UI guzel ama backend'de status degisimi tam calismiyor
- Dokuman yukleme placeholder — upload islemi eksik
- Eksper atama, sure takibi, SLA yok
- Hasar dosyasi yasam dongusu yonetilmiyor
- Sigorta sirketi ile iletisim takibi yok

**Hedef Mimari:**

```
src/lib/engines/
├── claimsEngine/
│   ├── index.ts                    # Orchestrator
│   ├── workflow.ts                 # State machine + business rules
│   ├── documentManager.ts         # Belge yonetimi + validation
│   ├── slaTracker.ts             # YENI - Sure takibi ve escalation
│   ├── communicationLog.ts       # YENI - Iletisim gecmisi
│   ├── estimator.ts              # YENI - Hasar tutari tahmini (AI)
│   └── reporter.ts              # YENI - Hasar raporu olusturma
```

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.4.1 | Status Workflow Backend | Firestore'da status degisimi + validation (gecersiz gecisleri engelle) + audit log |
| 3.4.2 | Dokuman Yukleme | Firebase Storage'a dosya yukleme, tip kontrolu (PDF/JPG/PNG), boyut limiti |
| 3.4.3 | Dokuman Checklist | Police tipine gore gereken belgeler → yuklenen/eksik gosterimi |
| 3.4.4 | SLA Tracker | Her status icin max sure tanimla → asim varsa uyari + escalation |
| 3.4.5 | Iletisim Logu | Sigorta sirketi ile her iletisimi kaydet (tarih, kanal, ozet, sonuc) |
| 3.4.6 | Hasar Timeline | Tek hasar icin tam zaman cizelgesi: olay → bildirim → eksper → karar → odeme |
| 3.4.7 | Hasar Raporu Export | PDF rapor: olay detayi, belgeler, zaman cizelgesi, tutar → sigorta sirketine gonderilebilir |
| 3.4.8 | AI Hasar Tahmini | Gecmis hasar verisi + police tipi + olay aciklamasi → tahmini onay tutari |
| 3.4.9 | Toplu Hasar Takibi | Dashboard: acik hasar sayisi, ortalama cozum suresi, onay orani, toplam tahsilat |

**Veri Modeli Genisletme:**
```typescript
interface Claim {
  // ... mevcut alanlar
  
  // YENI ALANLAR
  // SLA Takibi
  slaDeadlines: Record<ClaimStatus, string>;  // Her durum icin deadline
  isOverdue: boolean;
  overdueBy?: number;                          // Gun
  
  // Iletisim
  communications: CommunicationEntry[];
  
  // Finansal
  deductibleAmount?: number;      // Muafiyet
  netPayableAmount?: number;      // Net odenecek
  paymentDate?: string;
  paymentReference?: string;
  
  // Atama
  assignedExpertName?: string;
  assignedExpertPhone?: string;
  expertReportUrl?: string;
  
  // Analitik
  resolutionDays?: number;        // Cozum suresi (gun)
  aiEstimatedAmount?: number;     // AI tahmini
}

interface CommunicationEntry {
  id: string;
  date: string;
  channel: 'phone' | 'email' | 'portal' | 'in_person';
  direction: 'inbound' | 'outbound';
  contactPerson: string;
  summary: string;
  nextAction?: string;
  nextActionDate?: string;
}

// SLA Tanimları (gun)
const CLAIM_SLA: Record<PolicyType, Record<string, number>> = {
  kasko: { submitted_to_expert: 2, expert_to_review: 5, review_to_decision: 3, decision_to_payment: 10 },
  trafik: { submitted_to_expert: 1, expert_to_review: 3, review_to_decision: 2, decision_to_payment: 7 },
  yangin: { submitted_to_expert: 3, expert_to_review: 10, review_to_decision: 5, decision_to_payment: 15 },
  saglik: { submitted_to_expert: 0, expert_to_review: 3, review_to_decision: 2, decision_to_payment: 5 },
  // ...
};
```

---

### 3.5 BILDIRIM & OTOMASYON MOTORU (Oncelik: YUKSEK)

**Mevcut Sorun:**
- Uyarilar localStorage'da — cihaz degistirince kaybolur
- E-posta gonderimi kodu var ama tetiklenmiyor
- Otomatik hatirlatma cron job'u yok

**Hedef Mimari:**

```
src/lib/engines/
├── notificationEngine/
│   ├── index.ts                    # Orchestrator
│   ├── triggers.ts                # Hangi olay → hangi bildirim
│   ├── channels.ts                # E-posta, in-app, push
│   ├── templates.ts               # Bildirim sablonlari
│   ├── scheduler.ts               # Zamanlanmis bildirimler
│   └── preferences.ts            # Kullanici tercihleri
```

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.5.1 | Bildirim Firestore Collection | `notifications` collection — read/unread, type, payload |
| 3.5.2 | Event-Driven Triggers | Police eklenince → risk taramasi, vade yaklasinca → hatirlatma, hasar status degisince → bildirim |
| 3.5.3 | E-posta Entegrasyonu | Mevcut Nodemailer kodunu aktif et, template sistemi |
| 3.5.4 | Scheduled Jobs | Next.js API route + cron (Vercel Cron veya Firebase Scheduled Functions) |
| 3.5.5 | Bildirim Merkezi UI | In-app bildirim paneli, badge sayac, okundu/okunmadi |
| 3.5.6 | Escalation Zinciri | X gun yanit yoksa → ust yoneticiye bildirim |

---

### 3.6 RAPORLAMA & ANALYTICS (Oncelik: ORTA)

**Yapilacaklar:**

| Adim | Is | Detay |
|------|----|-------|
| 3.6.1 | Executive Dashboard | C-level icin tek sayfa: toplam prim, risk skoru, acik hasarlar, yaklaşan vadeler |
| 3.6.2 | PDF Rapor Engine | Aylik portfolyo raporu PDF olarak olustur + e-posta |
| 3.6.3 | Custom Report Builder | Tarih araliği, police tipi, departman bazli filtreleme + export |
| 3.6.4 | Trend Analizi | Prim degisimi, hasar sikligi, risk skoru trend grafikleri |
| 3.6.5 | Benchmark Raporu | Sirketin sektorel ortalamaya gore konumu |

---

## 4. TEKNIK ALTYAPI IYILESTIRMELERI

### 4.1 Veritabani Tasarimi

**Yeni Firestore Collections:**
```
├── tenants/{tenantId}
│   ├── policies/{policyId}
│   ├── claims/{claimId}
│   ├── assets/{assetId}
│   ├── renewals/{renewalId}         # YENI
│   ├── riskAssessments/{assessId}   # YENI
│   ├── notifications/{notifId}      # YENI
│   ├── communications/{commId}      # YENI
│   ├── reports/{reportId}           # YENI
│   └── auditLog/{logId}            # YENI
```

### 4.2 API Katmani Standardizasyonu

Tum API route'lari icin:
```typescript
// Standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  metadata?: { timestamp: string; requestId: string };
}

// Standard middleware chain
// auth → tenant isolation → rate limit → validation → handler → audit log
```

### 4.3 Guvenlik Katmani
| Alan | Uygulama |
|------|----------|
| Auth | Firebase Auth + custom claims (role, tenantId) |
| Data Isolation | Tum sorgularda tenantId filtresi (Firestore Security Rules) |
| API Security | Rate limiting, input validation (zod), CORS |
| Audit | Her yazma isleminde audit log |
| KVKK | Kisisel veri sifreleme, silme hakki, veri tasima |

### 4.4 Performance
| Alan | Uygulama |
|------|----------|
| Caching | React Query / SWR ile client-side cache |
| Pagination | Firestore cursor-based pagination (buyuk veri setleri) |
| Background Jobs | AI analiz, rapor olusturma → async queue |
| Bundle Size | Dynamic import, route-based code splitting (zaten kismen var) |

---

## 5. UYGULAMA ONCELIK SIRASI

### Phase 1 — Temel Deger (2-3 Hafta)
> Amac: Platformun gercek is sureclerini cozdugunu kanitla

1. **Hasar Merkezi backend** (3.4.1-3.4.4) — Status workflow, dokuman yukleme, checklist
2. **Risk Engine aktiflesme** (3.1.1-3.1.3) — Onboarding'de profil zorunlu, risk otomatik calissin
3. **Varlik Import** (3.2.1-3.2.2) — Excel import + gelismis eslestirme
4. **Bildirim altyapisi** (3.5.1-3.5.2) — Firestore notifications + event triggers

### Phase 2 — Is Sureci Tamamlama (2-3 Hafta)
> Amac: End-to-end surec yonetimi

5. **Yenileme Workflow** (3.3.1-3.3.4) — State machine, teklif toplama, karsilastirma
6. **Hasar SLA & Timeline** (3.4.5-3.4.7) — Iletisim logu, timeline, PDF rapor
7. **Risk Action Recommender** (3.1.5-3.1.6) — Somut aksiyon onerileri, interaktif dashboard
8. **E-posta & Scheduled Jobs** (3.5.3-3.5.4) — Hatirlatmalar aktif

### Phase 3 — Kurumsal Ozellikler (2-3 Hafta)
> Amac: Banka/filo musterisinin ihtiyaclari

9. **Varlik detay + deger kaybi** (3.2.3-3.2.5) — Detay sayfasi, depreciation
10. **Raporlama** (3.6.1-3.6.3) — Executive dashboard, PDF rapor, custom builder
11. **AI hasar tahmini** (3.4.8) — Gecmis veriye dayali tahmin
12. **Partner Portal temeli** (3.3.8) — Broker teklif girisi

### Phase 4 — Olceklendirme (Surekli)
> Amac: Uretim ortami stabilitesi

13. API standardizasyonu + rate limiting
14. Firestore Security Rules sıkılastırma
15. Performance optimizasyonu (pagination, caching)
16. KVKK uyumluluk (veri silme, export, consent)
17. Monitoring & alerting (hata takibi, uptime)

---

## 6. BASARI KRITERLERI

Her modul icin "tamamlandi" demek icin:

| Kriter | Aciklama |
|--------|----------|
| Gercek Veri | Mock data degil, Firebase'den gercek CRUD |
| Is Mantigi | Engine dosyasinda, test edilebilir, UI'dan bagimsiz |
| State Machine | Her surec (hasar, yenileme) belirli durum gecisleri |
| Audit Trail | Kim, ne zaman, ne yapti — izlenebilir |
| Multi-tenant | Veri izolasyonu, tenant karismasiz |
| Hata Yonetimi | Kullaniciya anlamli hata mesaji, log'a teknik detay |
| Mobile Responsive | Tum UI'lar mobilde kullanilabilir |

---

## 7. REGULASYON NOTU

| Konu | Durum | Aksiyon |
|------|-------|---------|
| Police Satisi | YAPAMAYIZ — acente/broker lisansi gerekir | Marketplace modeli: teklif topla, karsilastir, yonlendir |
| Hasar Bildirimi | YAPABILIRIZ — bilgi kaydi ve takip | Tam fonksiyon |
| Risk Analizi | YAPABILIRIZ — danismanlik niteligi | Tam fonksiyon |
| Varlik Yonetimi | YAPABILIRIZ — envanter yonetimi | Tam fonksiyon |
| Veri Saklama | KVKK uyumlu olmali | Sifreli saklama, silme hakki |
| Finansal Veri | Muhasebe yazilimi DEGIL | Sadece takip/ozet, muhasebe entegrasyonu opsiyonel |

---

## 8. TEKNIK STACK KARARLARI

| Karar | Secim | Neden |
|-------|-------|-------|
| State Management | React Query (TanStack Query) | Server state cache, auto refetch, optimistic updates |
| Form Validation | Zod + React Hook Form | Type-safe, API validation ile paylasilir |
| File Upload | Firebase Storage + resumable upload | Buyuk dosya destegi, progress tracking |
| PDF Generation | @react-pdf/renderer | Server-side PDF, Turkce karakter destegi |
| Excel Parse | SheetJS (xlsx) | Client-side parse, buyuk dosya destegi |
| Cron Jobs | Vercel Cron / Firebase Scheduled Functions | Serverless, olceklenebilir |
| Email | Resend (production) / Nodemailer (dev) | Resend: deliverability, template, analytics |
| Monitoring | Sentry | Error tracking, performance monitoring |

---

## 9. DOSYA YAPISI (HEDEF)

```
src/
├── app/
│   ├── api/
│   │   ├── risk/                    # Risk analizi API'leri
│   │   ├── claims/                  # Hasar yonetimi API'leri
│   │   ├── renewals/                # Yenileme API'leri
│   │   ├── assets/                  # Varlik API'leri
│   │   ├── notifications/           # Bildirim API'leri
│   │   └── reports/                 # Rapor API'leri
│   └── dashboard/
│       ├── risk-gaps/               # Risk analizi sayfasi (mevcut, refactor)
│       ├── claims/                  # Hasar merkezi (mevcut, genisletilecek)
│       ├── assets/                  # Varlik envanteri (mevcut, genisletilecek)
│       ├── renewals/                # Yenileme merkezi (mevcut, refactor)
│       └── reports/                 # YENI — Raporlama
├── lib/
│   ├── engines/
│   │   ├── riskEngine/             # Risk analiz motoru
│   │   ├── claimsEngine/           # Hasar is sureci motoru
│   │   ├── renewalEngine/          # Yenileme motoru
│   │   ├── assetEngine/            # Varlik yonetim motoru
│   │   └── notificationEngine/    # Bildirim motoru
│   ├── firebase/                   # Mevcut — genisletilecek
│   ├── ai/                         # Mevcut — stabil
│   └── validation/                 # Zod schemas
└── types/
    ├── policy.ts                   # Mevcut
    ├── claim.ts                    # Genisletilecek
    ├── asset.ts                    # Genisletilecek
    ├── renewal.ts                  # YENI
    ├── risk.ts                     # YENI
    ├── notification.ts             # YENI
    └── report.ts                   # YENI
```

---

## 10. SONUC

Bu plan, Sigorta Cuzdani'ni "demo gosterisi" seviyesinden "kurumsal urun" seviyesine cikaracak adimları tanımlar. Odak noktalari:

1. **Her modulu gercekten calistir** — mock data kaldir, engine-based is mantigi ekle
2. **State machine'ler** — hasar ve yenileme surecleri belirli kurallara gore ilerlesin
3. **Otomasyon** — hatirlatma, risk tarama, SLA takibi otomatik olsun
4. **Veri butunlugu** — audit trail, tenant izolasyonu, validation
5. **Regulasyona uyum** — satmadan yonlendir, KVKK'ya uy

Her phase sonunda demosu yapilabilir, satilabilir bir artis hedefleniyor. Tek seferde "her seyi yap" degil, katmanli ilerleme.
