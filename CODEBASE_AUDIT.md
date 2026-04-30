# 🔍 Sigorta Cüzdanı — Kod Tabanı Güvenlik & Mimari Denetim Raporu

> **Tarih:** 30 Nisan 2026  
> **Denetçi:** Kıdemli B2B Insurtech Yazılım Mimarı  
> **Kapsam:** Tüm `src/` dizini, API rotaları, Firestore katmanı, Auth akışı, Proxy  
> **Amaç:** Kurumsal güvenlik denetimi öncesi durum tespiti ve stratejik yol haritası

---

## 1. KRİTİK GÜVENLİK AÇIKLARI

### 🔴 K-01: API Route'larında Server-Side Auth Yok

**Dosya:** `src/app/api/policies/route.ts`  
**Etki:** Herhangi biri `tenantId` değerini body'de değiştirerek başka bir şirketin hesabına poliçe yazabilir.

```
// MEVCUT — tenantId client'tan geliyor, doğrulanmıyor
const tenantId = sanitize(body.tenantId, 128);
```

**Gerekli:** Firebase ID Token → server-side doğrulama → `tenantId`'yi token'dan çıkar.

---

### 🔴 K-02: `getPolicyById` Tenant İzolasyonu Yok

**Dosya:** `src/lib/firebase/firestore.ts:67-71`  
**Etki:** Herhangi bir oturum açmış kullanıcı, başka bir tenant'ın `policyId`'sini biliyorsa detayını görebilir.

```typescript
// MEVCUT — tenantId kontrolü yok
export async function getPolicyById(id: string) {
  const snap = await getDoc(doc(db, POLICIES_COLLECTION, id));
  return { id: snap.id, ...snap.data() };
}
```

**Gerekli:** `tenantId` parametresi ekle, dönen verinin `tenantId`'si eşleşmezse `null` dön.

---

### 🔴 K-03: `deletePolicy` Tenant İzolasyonu Yok

**Dosya:** `src/lib/firebase/firestore.ts:83-85`  
**Etki:** Herhangi bir kullanıcı, herhangi bir poliçeyi silebilir.

```typescript
// MEVCUT — sadece ID ile siliyor, yetki kontrolü yok
export async function deletePolicy(id: string) {
  await deleteDoc(doc(db, POLICIES_COLLECTION, id));
}
```

**Gerekli:** Önce dokümanı oku → `tenantId` eşleşmesini doğrula → sonra sil.

---

### 🔴 K-04: Proxy'de Eski Route Referansı

**Dosya:** `src/proxy.ts:42`  
**Etki:** Token hatalarında `/emre` redirect'i hâlâ aktif (eski admin path).

```typescript
// satır 42 — /efsun olmalı
if (pathname.startsWith("/emre")) {
```

---

### 🟡 K-05: `.env.local` İçinde Açık Credentials

**Dosya:** `.env.local`  
**Etki:** AWS Access Key, Gemini API Key ve admin şifreleri düz metin olarak saklanıyor. Git'e push edilirse tam erişim sağlanır.

**Gerekli:** Key rotation + `.gitignore` doğrulaması + Render/Vercel environment variables kullanımı.

---

### 🟡 K-06: Admin Credentials Zayıf

**Dosya:** `.env.local:20-21`

```
ADMIN_USERNAME=emre
ADMIN_PASSWORD=emre
```

**Gerekli:** Güçlü parola + brute-force koruması (rate limiting mevcut, 5 deneme/15dk — iyi).

---

### 🟡 K-07: `checkTenantExpiry` Fail-Open

**Dosya:** `src/lib/firebase/firestore.ts:163-164`

```typescript
catch { return { expired: false }; } // Hata durumunda erişime izin veriyor
```

**Etki:** Firestore hatası durumunda süresi dolmuş tenant'lar sisteme erişebilir.

---

## 2. MİMARİ SORUNLAR

### 🟠 M-01: Client-Side Firestore SDK ile Veri Okuma

**Etkilenen:** Tüm dashboard sayfaları (12 sayfa)  
**Sorun:** `getPoliciesByTenant` client-side Firestore SDK kullanıyor. Firestore Security Rules deploy edilmezse, client tarafından herhangi bir koleksiyona erişim mümkün.  
**Öneri:** API route'ları üzerinden server-side okuma + Firebase Admin SDK.

---

### 🟠 M-02: Sayfa Bazlı Veri Çekme Tekrarı (DRY İhlali)

**Etkilenen:** 10+ sayfa aynı pattern'i tekrarlıyor:

```typescript
// Bu blok 10 farklı dosyada birebir tekrar ediyor
useEffect(() => {
  async function load() {
    if (isDemoMode) { setLoading(false); return; }
    if (!appUser) { setLoading(false); return; }
    try {
      const data = await getPoliciesByTenant(appUser.tenantId);
      setDbPolicies(data as Policy[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
  if (!authLoading) load();
}, [appUser, authLoading, isDemoMode]);
```

**Öneri:** `usePolicies()` custom hook oluştur — data fetching, caching ve loading state'i merkezileştir.

---

### 🟠 M-03: Pagination Yok

**Dosya:** `src/lib/firebase/firestore.ts:32-44`  
**Sorun:** `getPoliciesByTenant` TÜM poliçeleri tek seferde çekiyor. 500+ poliçesi olan bir firma için performans sorunu.  
**Öneri:** Firestore `limit()` + `startAfter()` cursor-based pagination.

---

### 🟠 M-04: Client-Side Sıralama

**Dosya:** `src/lib/firebase/firestore.ts:40-44`

```typescript
// Firestore composite index gerektirmemek için client-side sort
return docs.sort((a: any, b: any) => { ... });
```

**Öneri:** Composite index oluşturup Firestore `orderBy` kullan.

---

### 🟡 M-05: Mock Veri Production Kodu İçinde

**Etkilenen:** `claims/page.tsx`, `hr/page.tsx`, `ai-analysis/page.tsx`  
**Sorun:** 50+ satırlık MOCK veri sabitleri production bundle'a dahil oluyor.  
**Öneri:** Mock veriyi `src/lib/mockData.ts`'de merkezileştir (zaten MOCK_POLICIES orada) veya dynamic import ile lazy load et.

---

## 3. SİGORTACILIK İŞ MANTIĞI HATALARI

### 🔴 İ-01: `isyeri` Poliçe Tipi Eksik

**Dosya:** `src/app/api/policies/route.ts:37-40`

```typescript
const ALLOWED_TYPES = [
  "kasko", "trafik", "yangin", "saglik", "nakliyat",
  "dask", "ferdi_kaza", "sorumluluk", "muhendislik", "tarim", "diger"
];
// ❌ "isyeri" yok — İşyeri poliçesi yüklenemiyor!
```

**Etki:** En yaygın B2B poliçe tiplerinden biri olan İşyeri sigortası sisteme kaydedilemiyor.

---

### 🟡 İ-02: Poliçe Status Otomatik Güncellenmiyor

**Sorun:** Poliçe status'ü sadece kaydedilirken set ediliyor. Vade geçtikten sonra `active` olarak kalıyor.  
**Öneri:** CRON job (`/api/automation`) veya client-side computed status.

---

### 🟡 İ-03: Tarih Formatı Doğrulaması Eksik

**Dosya:** `src/app/api/policies/route.ts:77-78`

```typescript
startDate: body.baslangicTarihi as string || new Date().toISOString(),
```

**Sorun:** Tarih geçerliliği sadece `bitisTarihi` için kontrol ediliyor, `baslangicTarihi` için yok. Geçersiz format direkt Firestore'a yazılıyor.

---

### 🟡 İ-04: `any` Tip Kullanımı Yaygın

**Etkilenen dosyalar:**
- `ai-analysis/page.tsx:54` — `useState<any>(null)`
- `firestore.ts:40` — `(a: any, b: any)`
- `firestore.ts:90` — `analysisData: any`

**Etki:** Runtime hataları, TypeScript'in sağladığı güvenlik katmanının devre dışı kalması.

---

## 4. PERFORMANS İYİLEŞTİRME ÖNERİLERİ

| # | Alan | Mevcut | Hedef |
|---|------|--------|-------|
| P-01 | Veri çekme | Her sayfa bağımsız fetch | `usePolicies` hook + React Context cache |
| P-02 | Bundle size | Mock data production'da | Code splitting + lazy import |
| P-03 | Pagination | Tüm veri tek seferde | Cursor-based (25 kayıt/sayfa) |
| P-04 | Sıralama | Client-side sort | Firestore composite index |
| P-05 | Re-render | Her navigation'da yeniden fetch | `staleTime` + SWR/React Query |

---

## 5. MODÜLER GÖREV PLANI

> Her görev izole olarak tek bir bileşeni etkiler. Bağımsız olarak uygulanabilir.

### Faz 1 — Kritik Güvenlik (1-2 Hafta)

| # | Görev | Dosya(lar) | Öncelik |
|---|-------|-----------|---------|
| G-01 | ~~API route'larına Firebase Admin token doğrulama ekle~~ | ~~`api/policies/route.ts`, `lib/api/withAuth.ts`~~ | ✅ Tamamlandı |
| G-02 | ~~`getPolicyById`'ye tenant kontrolü ekle~~ | ~~`lib/firebase/firestore.ts`~~ | ✅ Tamamlandı |
| G-03 | ~~`deletePolicy`'ye tenant kontrolü ekle~~ | ~~`lib/firebase/firestore.ts`~~ | ✅ Tamamlandı |
| G-04 | ~~`isyeri` poliçe tipini ALLOWED_TYPES'a ekle~~ | ~~`api/policies/route.ts`~~ | ✅ Tamamlandı |
| G-05 | ~~Proxy'deki `/emre` referansını `/efsun` yap~~ | ~~`proxy.ts:42`~~ | ✅ Tamamlandı |
| G-06 | Admin credentials güçlendir | `.env.local` | 🟡 |
| G-07 | ~~Firestore Security Rules deploy et~~ | ~~`firestore.rules`~~ | ✅ Tamamlandı |

### Faz 2 — Mimari İyileştirme (2-3 Hafta)

| # | Görev | Dosya(lar) | Öncelik |
|---|-------|-----------|---------|
| G-08 | ~~`usePolicies()` custom hook oluştur~~ | ~~`lib/hooks/usePolicies.ts` (YENİ)~~ | ✅ Tamamlandı |
| G-09 | ~~10 dashboard sayfasını hook'a migrate et~~ | ~~`dashboard/page.tsx`, `dashboard/policies/page.tsx`~~ | ✅ Tamamlandı |
| G-10 | ~~Pagination ekle (getPoliciesByTenantPaginated)~~ | ~~`lib/firebase/firestore.ts`~~ | ✅ Tamamlandı |
| G-11 | ~~`startDate` tarih doğrulaması ekle~~ | ~~`api/policies/route.ts`~~ | ✅ Tamamlandı |
| G-12 | ~~Mock verileri merkezi dosyaya taşı~~ | ~~`claims`, `hr` sayfaları~~ | ✅ Tamamlandı |
| G-13 | ~~`any` tipleri kaldır, proper interface yaz~~ | ~~Çeşitli dosyalar~~ | ✅ Tamamlandı |

### Faz 3 — Performans & Kalite (1-2 Hafta)

| # | Görev | Dosya(lar) | Öncelik |
|---|-------|-----------|---------|
| G-14 | ~~Firestore composite index oluştur~~ | ~~`firestore.indexes.json` (YENİ)~~ | ✅ Tamamlandı |
| G-15 | ~~Poliçe status CRON güncellemesi ekle~~ | ~~`api/automation/`~~ | ✅ Tamamlandı |
| G-16 | ~~React Error Boundary ekle~~ | ~~`dashboard/error.tsx`~~ | ✅ Tamamlandı |
| G-17 | ~~`checkTenantExpiry` fail-closed yap~~ | ~~`lib/firebase/firestore.ts`~~ | ✅ Tamamlandı |
| G-18 | ~~Bundle analizi + code splitting~~ | ~~`next.config.ts`~~ | ✅ Tamamlandı |

---

## 6. GENEL DEĞERLENDİRME

| Kriter | Skor | Not |
|--------|------|-----|
| **Veri Güvenliği** | 4/10 | Client-side Firestore, tenant izolasyonu eksik |
| **Auth & Yetkilendirme** | 6/10 | Firebase Auth + proxy mevcut, API seviyesi zayıf |
| **Ölçeklenebilirlik** | 5/10 | Pagination yok, client-side sort |
| **Kod Kalitesi** | 7/10 | Tutarlı pattern, iyi loglama, DRY ihlali var |
| **İş Mantığı** | 7/10 | Kapsamlı sigorta tipleri, küçük eksikler |
| **UI/UX** | 8/10 | Profesyonel tasarım, iyi loading state'ler |

**Toplam Olgunluk:** MVP+ seviyesi — Demo ve pilot müşteriler için uygun, kurumsal denetim için Faz 1 görevlerinin tamamlanması şart.

---

*Bu rapor salt okunur bir durum tespiti belgesidir. Hiçbir kod değişikliği yapılmamıştır.*
