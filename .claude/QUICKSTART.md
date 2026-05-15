# Multi-Agent System - Hızlı Başlangıç

## 🚀 Hemen Test Et

### 1. Manuel Agent Kullanımı (Claude Code içinde)

```bash
# Architect: Plan oluştur
/agent architect "Add PDF export feature for policies"

# Developer: Planı uygula
/agent developer "Implement the plan from .claude/plans/latest-plan.md"

# Security: Değişiklikleri audit et
git diff | /agent security-auditor
```

### 2. Tam Workflow (Orchestrator ile)

```bash
# Tek komutla tüm pipeline
./scripts/orchestrator.sh "Add Excel export for claims"

# Script sırasıyla:
# 1. Architect'e plan yaptırır
# 2. Planı size gösterir (onay bekler)
# 3. Developer'a implement ettirir
# 4. Security audit yapar
# 5. Sonuç raporlar
```

### 3. Cost Tracking

```bash
# Token kullanımını logla
./scripts/cost-tracker.sh architect 5000 "Initial planning"

# Günlük rapor göster
./scripts/cost-tracker.sh
```

## 📊 Agent Rolleri

| Agent | Model | Görev | Token Limiti |
|-------|-------|-------|--------------|
| **Architect** | Sonnet 4.6 | Plan yapar, kod YAZMAZ | 4K |
| **Developer** | Sonnet 4.6 | Planı implement eder | 8K |
| **Security Auditor** | Haiku 4.5 | Sadece diff audit eder | 2K |

## 💡 Kullanım Örnekleri

### Senaryo 1: Yeni Feature
```bash
# Orchestrator ile tam pipeline
./scripts/orchestrator.sh "Add notification preferences page"
```

### Senaryo 2: Bug Fix (Hızlı)
```bash
# Sadece architect'e sor
/agent architect "Fix: Login button not working on mobile"

# Sonra kendin implement et veya developer'a ver
```

### Senaryo 3: Security-Only Check
```bash
# Sadece değişiklikleri audit et
git add .
git diff --cached | /agent security-auditor
```

### Senaryo 4: Büyük Refactoring
```bash
# Önce plan al
/agent architect "Refactor: Split monolithic API routes into modules"

# Planı incele (.claude/plans/xxx-plan.md)
cat .claude/plans/*-plan.md

# Onayladıysan implement et
/agent developer "Execute plan from .claude/plans/latest-plan.md"
```

## 🎯 Maliyet Optimizasyon İpuçları

1. **Architect'i Tekrar Kullan:** Aynı context'te birden fazla task için architect cache'i aktif kalır
2. **Batch İşlemler:** Birden fazla küçük değişiklik yerine toplu plan yap
3. **Security Auditor Akıllıca Kullan:** Haiku zaten ucuz, her değişiklikte çalıştır
4. **Developer'ı Spesifik Yönlendir:** Ne kadar spesifik plan, o kadar az token

## 📁 Dosya Yapısı

```
.claude/
├── settings.json          # Agent konfigürasyonları
├── cache-strategy.md      # Caching stratejisi
├── QUICKSTART.md          # Bu dosya
├── plans/                 # Architect'in planları
│   └── 1715789234-plan.md
├── diffs/                 # Audit için diff'ler
│   └── 1715789456-changes.diff
└── cost-tracking.log      # Token kullanım logu

scripts/
├── orchestrator.sh        # Tam workflow
└── cost-tracker.sh        # Maliyet takibi
```

## ⚠️ Önemli Notlar

- **Architect asla kod yazmaz** - Sadece plan yapar
- **Developer planı takip eder** - Kendi kararlarını almaz
- **Security Auditor sadece diff okur** - Tüm codebase'i okumaz (maliyet!)
- **Orchestrator onay bekler** - Kötü planları durdurabilirsin

## 🔧 Troubleshooting

**Agent bulunamadı hatası:**
```bash
# settings.json doğru yerde mi kontrol et
ls -la .claude/settings.json
```

**Cache çalışmıyor gibi:**
```bash
# AGENTS.md ve CLAUDE.md değişti mi kontrol et
git diff AGENTS.md CLAUDE.md
```

**Token kullanımı hala yüksek:**
```bash
# .claudecodeignore'un çalıştığını doğrula
cat .claudecodeignore
```

## 📞 Yardım

Sorun yaşarsan:
1. `.claude/cost-tracking.log` dosyasını incele
2. Hangi agent'ta takıldığını belirle
3. Agent'e daha spesifik prompt ver
