# Multi-Agent AI System Configuration

## 🎯 Amaç

Bu dizin, **maliyet-optimize edilmiş multi-agent AI mimarisi** için konfigürasyon dosyalarını içerir.

### Sorun: Monolitik Yapının Maliyeti
- Her request'te tüm context (30K+ tokens) okunuyordu
- Sonnet 4.6: $3/1M input tokens
- 100 iteration = $9

### Çözüm: Role-Based Agents + Prompt Caching
- **Architect:** Sadece plan yapar (4K token limiti)
- **Developer:** Planı implement eder (8K token limiti)
- **Security Auditor:** Haiku ile sadece diff okur (2K token, $0.25/M)
- Prompt caching ile 80%+ cache hit rate
- **100 iteration = ~$1.2 (87% tasarruf)**

## 📁 Dosyalar

- **settings.json**: Agent tanımları ve workflow konfigürasyonu
- **cache-strategy.md**: Prompt caching stratejisi ve maliyet analizi
- **QUICKSTART.md**: Hızlı başlangıç kılavuzu
- **plans/**: Architect'in oluşturduğu planlar
- **diffs/**: Security audit için git diff'ler
- **cost-tracking.log**: Token kullanım logu

## 🚀 Hızlı Başlangıç

```bash
# Tam workflow (önerilen)
./scripts/orchestrator.sh "Add new feature"

# Manuel agent kullanımı
/agent architect "Plan the feature"
/agent developer "Implement the plan"
git diff | /agent security-auditor
```

Detaylı kullanım için: `.claude/QUICKSTART.md`

## 📊 Agent Özellikleri

| Agent | Model | Prompt Caching | Use Case |
|-------|-------|----------------|----------|
| Architect | Sonnet 4.6 | ✅ Evet | Planlama, mimari kararlar |
| Developer | Sonnet 4.6 | ✅ Evet | Kod implementasyonu |
| Security Auditor | Haiku 4.5 | ❌ Hayır | Düşük maliyetli güvenlik audit |

## 🔧 Maintenance

### Cache'i Yenile
Cache'i yenileme gerekir eğer:
- `AGENTS.md` veya `CLAUDE.md` değişirse
- Proje yapısı büyük ölçüde değişirse
- Memory files güncellenirse

### Cost Tracking
```bash
# Günlük token kullanımı
./scripts/cost-tracker.sh

# Manuel log
./scripts/cost-tracker.sh architect 5000 "Task description"
```

## ⚙️ Konfigürasyon Değiştirme

`settings.json` dosyasını düzenleyerek:
- Token limitlerini ayarlayabilirsin
- Yeni agent rolleri ekleyebilirsin
- Workflow adımlarını özelleştirebilirsin

## 📈 Performans Metrikleri

**Target KPIs:**
- Architect cache hit rate: >80%
- Developer cache hit rate: >70%
- Average tokens per request: <2K (monolitik yapıda 30K)
- Cost per 100 iterations: <$1.5

## 🔗 İlgili Dosyalar

- `../../.claudecodeignore`: Context'e dahil edilmeyecek dosyalar
- `../../scripts/orchestrator.sh`: Ana workflow script
- `../../scripts/cost-tracker.sh`: Maliyet izleme script
