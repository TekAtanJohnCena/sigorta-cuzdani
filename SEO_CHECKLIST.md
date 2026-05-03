# 🚀 Sigorta Cüzdanı SEO İyileştirme Checklist

## ✅ Tamamlanan İyileştirmeler

### 1. Temel SEO Yapısı
- [x] **robots.txt** - Arama motorları için yönlendirme kuralları
- [x] **sitemap.xml** - Dinamik site haritası (Next.js 13+ API)
- [x] **Metadata API** - Next.js App Router metadata yapısı
- [x] **Canonical URLs** - Tekrarlanan içerik önleme
- [x] **Open Graph Tags** - Sosyal medya paylaşım optimizasyonu
- [x] **Twitter Cards** - Twitter paylaşım önizlemeleri
- [x] **JSON-LD Structured Data** - Zengin snippet'ler için yapılandırılmış veri

### 2. Teknik SEO
- [x] **Mobile-First Design** - Responsive tasarım
- [x] **Semantic HTML** - Doğru HTML5 etiketleri (header, main, footer, section)
- [x] **Lang Attribute** - `lang="tr"` dil tanımlaması
- [x] **Alt Text** - Görsel açıklamaları (icon.svg, opengraph-image)
- [x] **Preconnect Links** - Harici kaynaklara hızlı bağlantı
- [x] **Theme Color** - Mobil tarayıcılar için tema rengi
- [x] **Manifest.json** - PWA desteği ve uygulama bilgileri

### 3. İçerik SEO
- [x] **Title Tags** - Optimize edilmiş başlık yapısı
- [x] **Meta Description** - Çekici ve açıklayıcı meta açıklamalar
- [x] **Keywords** - Hedef anahtar kelimeler eklendi
- [x] **H1-H6 Hierarchy** - Başlık hiyerarşisi (landing page'de mevcut)
- [x] **Internal Linking** - Sayfa içi bağlantılar
- [x] **Schema Markup** - Organization, SoftwareApplication, WebSite schema'ları

### 4. Performans Optimizasyonu
- [x] **Next.js Image Optimization** - Otomatik görsel optimizasyonu
- [x] **Code Splitting** - Sayfa bazlı kod ayrımı
- [x] **Bundle Analyzer** - Bundle boyutu analizi mevcut
- [x] **Remove Console Logs** - Production'da console.log temizleme

### 5. Güvenlik Headers (SEO'ya dolaylı etki)
- [x] **CSP (Content Security Policy)** - XSS koruması
- [x] **X-Frame-Options** - Clickjacking koruması
- [x] **HSTS** - HTTPS zorunluluğu
- [x] **X-Content-Type-Options** - MIME sniffing koruması

---

## 📋 Manuel Yapılması Gerekenler

### 1. Google Search Console Kurulumu
```bash
# Google Search Console'a gidin: https://search.google.com/search-console
1. Site mülkiyetini doğrulayın
2. Verification code'u alın
3. src/app/layout.tsx içindeki verification.google alanına ekleyin
```

### 2. Google Analytics / Tag Manager
```typescript
// src/app/layout.tsx <head> bölümüne ekleyin:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `,
  }}
/>
```

### 3. Favicon ve Icon Dosyaları Oluşturma
```bash
# Aşağıdaki dosyaları public/ klasörüne ekleyin:
- favicon.ico (32x32)
- icon-192.png (192x192)
- icon-512.png (512x512)
- apple-touch-icon.png (180x180)
- og-image.png (1200x630) - Sosyal medya paylaşım görseli
- logo.png (Logo dosyası)
```

### 4. Environment Variables
```bash
# .env.local dosyasına ekleyin:
NEXT_PUBLIC_SITE_URL=https://sigortacuzdani.net
NEXT_PUBLIC_SITE_NAME="Sigorta Cüzdanı"
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics ID
```

### 5. Yandex Webmaster Tools (Türkiye için önemli)
```bash
# https://webmaster.yandex.com/
1. Site ekleyin
2. Verification code'u alın
3. src/app/layout.tsx içindeki verification.yandex alanına ekleyin
```

### 6. İçerik İyileştirmeleri
- [ ] Blog/İçerik sayfası ekleyin (`/blog`)
- [ ] SSS sayfası (`/sss`) - FAQStructuredData ile
- [ ] Müşteri hikayeleri/case study sayfası
- [ ] Video içerik (YouTube entegrasyonu)
- [ ] Poliçe tiplerine özel alt sayfalar (`/cozumler/kasko`, `/cozumler/saglik`)

### 7. Backlink Stratejisi
- [ ] Sigorta firmaları ile ortaklık
- [ ] Teknoloji bloglarında makale yayınlama
- [ ] Startup dizinlerine kayıt (Startup.ist, Webrazzi, vb.)
- [ ] LinkedIn Company Page optimizasyonu

### 8. Local SEO (Eğer fiziksel ofis varsa)
```json
// Google My Business için schema ekleyin
{
  "@type": "LocalBusiness",
  "name": "Sigorta Cüzdanı",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Adres bilgisi",
    "addressLocality": "İstanbul",
    "addressRegion": "İstanbul",
    "postalCode": "34XXX",
    "addressCountry": "TR"
  },
  "telephone": "+90-XXX-XXX-XX-XX"
}
```

---

## 🎯 Hedef Anahtar Kelimeler

### Ana Kelimeler (Yüksek Hacim)
1. **sigorta yönetimi** (1,000+ aylık arama)
2. **poliçe takibi** (800+ aylık arama)
3. **kurumsal sigorta** (500+ aylık arama)
4. **sigorta yazılımı** (400+ aylık arama)

### Uzun Kuyruk Kelimeler (Dönüşüm Odaklı)
1. "kurumsal sigorta yönetim sistemi"
2. "otomatik poliçe takip programı"
3. "şirket sigortaları nasıl yönetilir"
4. "ai destekli sigorta analizi"
5. "vade takip sistemi sigorta"

### Yerel Kelimeler
1. "istanbul sigorta yönetim platformu"
2. "türkiye sigorta yazılımı"
3. "kvkk uyumlu sigorta sistemi"

---

## 📊 Performans Metrikleri (Hedefler)

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Skorları
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 95

---

## 🔄 Düzenli Bakım Görevleri

### Haftalık
- [ ] Google Search Console hata kontrolü
- [ ] Organik trafik analizi
- [ ] Broken link kontrolü

### Aylık
- [ ] Sitemap güncelliği kontrolü
- [ ] Anahtar kelime sıralama takibi
- [ ] Backlink profili analizi
- [ ] Rakip analizi

### Üç Ayda Bir
- [ ] İçerik güncelleme (blog yazıları)
- [ ] Schema markup kontrolü
- [ ] Mobile usability testi
- [ ] Page speed optimization

---

## 🛠️ Faydalı Araçlar

- **Google Search Console**: https://search.google.com/search-console
- **Google Analytics**: https://analytics.google.com
- **PageSpeed Insights**: https://pagespeed.web.dev
- **Schema Markup Validator**: https://validator.schema.org
- **Yandex Webmaster**: https://webmaster.yandex.com
- **Ahrefs** (Backlink analizi - Ücretli)
- **SEMrush** (Anahtar kelime araştırma - Ücretli)

---

## 📈 Beklenen Sonuçlar

### 3 Ay Sonra
- Google'da indexlenme: %100
- Organik trafik: 100-200 ziyaretçi/ay
- Demo talepleri: 5-10/ay

### 6 Ay Sonra
- Hedef kelimelerde ilk 3 sayfa: %60
- Organik trafik: 500-1,000 ziyaretçi/ay
- Demo talepleri: 20-30/ay

### 12 Ay Sonra
- Hedef kelimelerde ilk sayfa: %40
- Organik trafik: 2,000-3,000 ziyaretçi/ay
- Demo talepleri: 50-80/ay

---

**Not**: SEO uzun vadeli bir stratejidir. İlk sonuçları görmek 3-6 ay sürebilir. Düzenli içerik üretimi ve teknik optimizasyon çok önemlidir.
