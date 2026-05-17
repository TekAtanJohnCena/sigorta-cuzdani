# Pixel Agents System v2 - Operasyon Kılavuzu

## Felsefe

**"Opus koordine eder, Sonnet yaratır, Haiku doğrular."**

Ben (Opus 4.6) = Müdür. Minimum token harcarım. İş dağıtırım.
Alt ajanlar = Claude Code'un `Agent` tool'u ile spawn edilir.

## Ekip (7 Ajan)

| # | Rol | Model | Spawn Method | Token Bütçe |
|---|-----|-------|--------------|-------------|
| 1 | **Müdür** (Ben) | Opus 4.6 | Ana conversation | Minimal |
| 2 | **Mimar** | Sonnet | `Agent → subagent_type: Plan` | Orta |
| 3 | **Yazılımcı** | Sonnet | `Agent → subagent_type: general-purpose` | Yüksek |
| 4 | **Keşifçi** | Sonnet | `Agent → subagent_type: Explore` | Düşük |
| 5 | **Güvenlik** | Haiku | `Agent → model: haiku` | Düşük |
| 6 | **Test** | Haiku | `Agent → model: haiku` | Düşük |
| 7 | **Reviewer** | Haiku | `Agent → model: haiku` | Düşük |

## Workflow'lar

### Feature Geliştirme
```
Kullanıcı: "X feature'ı ekle"
  → Müdür: Görevi anlar, 1 cümle ile Mimar'a atar
  → Mimar (Plan agent): Dosya listesi + veri akışı planlar
  → Müdür: Planı kullanıcıya gösterir, onay alır
  → Yazılımcı (general-purpose agent): Planı implement eder
  → Güvenlik (haiku): Değişiklikleri tarar
  → Reviewer (haiku): Clean code kontrol
  → Müdür: Özet rapor verir
```

### Bug Fix
```
Kullanıcı: "X bozuk"
  → Müdür: Keşifçi'ye atar
  → Keşifçi (Explore agent): Sorunu bulur, dosya/satır raporlar
  → Müdür: Bulgularla Yazılımcı'ya atar
  → Yazılımcı: Fix yapar
  → Test (haiku): Fix'i doğrular
  → Müdür: Özet verir
```

### Refactoring
```
Kullanıcı: "X'i refactor et"
  → Keşifçi: Mevcut yapıyı analiz eder
  → Mimar: Yeni yapıyı planlar
  → Yazılımcı: Implement eder
  → Reviewer: Kontrol eder
```

## Kurallar

1. **Müdür asla kod yazmaz** - Sadece koordine eder
2. **Paralel çalıştır** - Bağımsız işler aynı anda (Security + Test + Review)
3. **Background kullan** - Uzun süren işleri background'da çalıştır
4. **Kullanıcı onayı** - Feature/refactor planları onay gerektirir
5. **Haiku önce** - Analiz/doğrulama işleri her zaman Haiku'da
6. **Sonuç odaklı** - Her ajan kısa, net sonuç döner

## Maliyet Optimizasyonu

- Opus (Müdür): ~100-200 token/iş (sadece delegate + özet)
- Sonnet (Mimar): ~500-1500 token/plan
- Sonnet (Yazılımcı): ~2000-8000 token/feature (asıl iş burada)
- Sonnet (Keşifçi): ~300-800 token/araştırma
- Haiku (Güvenlik/Test/Review): ~200-500 token/kontrol

**Toplam tasarruf:** Opus'un her şeyi yapmasına göre ~60-70% daha ucuz
