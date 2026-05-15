# Multi-Agent System - Kullanım Kılavuzu

**Son Güncelleme:** 2026-05-15  
**Durum:** ✅ Test Edildi ve Üretimde

---

## 🎯 Hızlı Başlangıç (3 Adım)

### 1. Manuel Agent Kullanımı
```bash
# Architect ile plan al
"Architect agent olarak bana 'Add PDF export' için plan hazırla"

# Developer ile implement et
"Developer agent olarak bu planı uygula: .claude/plans/xxx.md"

# Security audit yap
"Security auditor olarak şu diff'i incele: .claude/diffs/xxx.diff"
```

### 2. Orchestrator ile Otomatik (Önerilen)
```bash
./scripts/orchestrator.sh "Add new feature: Policy comparison tool"
```

### 3. Cost Tracking
```bash
# Günlük rapor
./scripts/cost-tracker.sh

# Manuel log
./scripts/cost-tracker.sh architect 5000 "Task description"
```

---

## 📋 Agent Rolleri ve Ne Zaman Kullanılır

### Architect Agent (Sonnet 4.6)
**Ne zaman kullan:**
- Yeni feature planlama
- Büyük refactoring stratejisi
- Mimari karar gerektiğinde
- Dosya yapısı değişikliği

**Ne YAPMAZ:**
- Kod yazmaz
- Dosya oluşturmaz
- Implementation detaylarına girmez

**Örnek prompt:**
```
"Architect agent olarak:
- Policy karşılaştırma feature'ı için plan yap
- Hangi dosyalar değişecek?
- API endpoint'leri ne olacak?
- Security consideration'lar neler?"
```

### Developer Agent (Sonnet 4.6)
**Ne zaman kullan:**
- Architect planı hazırladıktan sonra
- Kod yazma zamanı
- Bug fix implementation

**Ne YAPMAZ:**
- Mimari kararlar almaz
- Plan değiştirmez
- Extra feature eklemez

**Örnek prompt:**
```
"Developer agent olarak:
- .claude/plans/1778871766-comparison.md planını uygula
- Sadece planda belirtilen dosyaları değiştir
- Mevcut code style'ı takip et"
```

### Security Auditor (Haiku 4.5)
**Ne zaman kullan:**
- Her commit öncesi
- Pull request hazırlığı
- Production deploy öncesi

**Ne YAPMAZ:**
- Tüm codebase'i okumaz
- Performance review yapmaz
- Sadece güvenlik odaklı

**Örnek prompt:**
```
"Security auditor olarak:
- .claude/diffs/xxx.diff dosyasını audit et
- OWASP Top 10 kontrol et
- Exposed secrets var mı bak"
```

---

## 🔄 Tam Workflow Örneği

### Senaryo: "Add Excel export for claims"

#### Adım 1: Architect'e Plan Yaptır
```bash
# Prompt:
"Architect agent olarak bana şu feature için plan hazırla:

Feature: Claims listesini Excel'e export etme
Gereksinimler:
- Button claims sayfasına eklenecek
- API endpoint /api/claims/export-excel
- xlsx dependency zaten var
- Sadece authenticated user'ın claim'leri

Plan format:
1. Dosyalar (create/modify)
2. Function signatures
3. Security considerations
4. Edge cases"
```

**Çıktı:** `.claude/plans/1778871777-claims-export.md`

#### Adım 2: Planı İncele ve Onayla
```bash
cat .claude/plans/1778871777-claims-export.md
# Planı oku, onayladıysan devam et
```

#### Adım 3: Developer'a Implementation Yaptır
```bash
# Prompt:
"Developer agent olarak şu planı uygula:

$(cat .claude/plans/1778871777-claims-export.md)

Kurallar:
- Sadece planda belirtilen dosyaları değiştir
- Mevcut code pattern'leri takip et
- withAuth kullanmayı unutma
- logger kullan console.log değil"
```

**Çıktı:** 
- `src/app/api/claims/export-excel/route.ts`
- `src/app/dashboard/claims/page.tsx` (button eklendi)

#### Adım 4: Stage ve Diff Oluştur
```bash
git add src/app/api/claims/export-excel/route.ts
git add src/app/dashboard/claims/page.tsx
git diff --cached > .claude/diffs/1778871777-claims-export.diff
```

#### Adım 5: Security Audit
```bash
# Prompt:
"Security auditor (Haiku) olarak şu diff'i audit et:

$(cat .claude/diffs/1778871777-claims-export.diff)

Check:
1. SQL injection
2. XSS
3. Exposed secrets
4. Missing auth check
5. Insecure file handling"
```

**Çıktı:** PASS veya FAIL with issues

#### Adım 6: Manuel Test
```bash
npm run dev
# Browser'da test et
curl http://localhost:3000/api/claims/export-excel
```

#### Adım 7: Commit
```bash
git commit -m "feat: add Excel export for claims

- Add /api/claims/export-excel endpoint
- Add export button to claims page
- Use xlsx for Excel generation
- Security audit: PASSED

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Total Cost:** ~$0.01 (4K tokens)  
**Total Time:** ~2 minutes

---

## 💡 Pro Tips

### 1. Cache'i Maksimize Et
```bash
# Aynı context'te birden fazla task yap
"Architect olarak 3 feature için plan yap:
1. Excel export
2. PDF export  
3. Email integration"

# Cache hit rate artar, maliyet düşer
```

### 2. Batch Security Audit
```bash
# Günlük değişiklikleri toplu audit et
git diff main...HEAD > .claude/diffs/daily-changes.diff
# Security auditor'a ver
```

### 3. Plan'ı Iterate Et
```bash
# İlk plan mükemmel değilse:
"Architect olarak planı revize et:
- Problem: API çok yavaş olabilir
- Solution: Pagination ekle
- Update: .claude/plans/xxx.md"
```

### 4. Developer'ı Dur durma
```bash
# Büyük task'ı böl
"Developer olarak sadece API endpoint'i yap, UI'ı sonra"
# Sonra:
"Developer olarak şimdi UI button'ı ekle"
```

### 5. Orchestrator Customization
```bash
# scripts/orchestrator.sh düzenleyebilirsin
# Örnek: Auto-approve small changes
# Örnek: Slack notification ekle
# Örnek: Auto-commit after security pass
```

---

## 🐛 Troubleshooting

### Problem: Agent bulunamadı
```bash
# Çözüm: settings.json doğru yerde mi?
ls -la .claude/settings.json
```

### Problem: Cache çalışmıyor
```bash
# Çözüm: AGENTS.md veya CLAUDE.md değişti mi?
git diff HEAD~1 AGENTS.md CLAUDE.md
# Değiştiyse cache invalidate olur (normal)
```

### Problem: Token kullanımı hala yüksek
```bash
# Çözüm: .claudecodeignore'u kontrol et
cat .claudecodeignore
# node_modules, .next, tests dahil mi?
```

### Problem: Security audit çok detaylı
```bash
# Çözüm: Haiku'ya daha kısa prompt ver
"Max 100 kelime ile audit et, sadece CRITICAL issue'lar"
```

### Problem: Developer plan'dan sapıyor
```bash
# Çözüm: Prompt'ta daha sert ol
"Developer olarak:
- SADECE plandaki dosyaları değiştir
- KESINLIKLE extra feature ekleme
- Plan'dan sapma = FAIL"
```

---

## 📊 Cost Monitoring

### Günlük Tracking
```bash
# Her workflow'dan sonra
./scripts/cost-tracker.sh <agent> <tokens> "<task>"

# Örnek:
./scripts/cost-tracker.sh architect 2000 "Plan claims export"
./scripts/cost-tracker.sh developer 1500 "Implement claims export"
./scripts/cost-tracker.sh security-auditor 500 "Audit claims export"
```

### Haftalık Rapor
```bash
# cost-tracking.log'u analiz et
awk '{sum+=$6} END {print "Weekly tokens: " sum}' .claude/cost-tracking.log

# Agent breakdown
awk '{agent[$4]+=1} END {for (a in agent) print a ": " agent[a] " workflows"}' .claude/cost-tracking.log
```

### Budget Alert
```bash
# Eğer günlük 50K token aşarsan:
DAILY_TOKENS=$(grep "$(date +%Y-%m-%d)" .claude/cost-tracking.log | awk '{sum+=$6} END {print sum}')
if [ "$DAILY_TOKENS" -gt 50000 ]; then
  echo "⚠️ WARNING: Daily token budget exceeded!"
fi
```

---

## 🎓 Öğrenme Kaynakları

### Documentation
- `.claude/README.md` - System overview
- `.claude/QUICKSTART.md` - Quick start guide
- `.claude/cache-strategy.md` - Caching details
- `.claude/IMPLEMENTATION_REPORT.md` - Setup process
- `.claude/TEST_REPORT.md` - Test results
- `.claude/FINAL_SUMMARY.md` - Executive summary

### Examples
- `.claude/plans/example-plan.md` - Plan template
- `.claude/plans/1778871766-health-check.md` - Real plan
- `.claude/diffs/1778871766-security-report.md` - Real audit

---

## 🚀 Advanced Usage

### Custom Agent Rolleri
`.claude/settings.json` düzenleyerek yeni roller ekle:
```json
{
  "agents": {
    "test-writer": {
      "model": "claude-haiku-4-5-20251001",
      "description": "Writes unit tests",
      "tools": ["Read", "Write"],
      "maxTokens": 3000
    }
  }
}
```

### Pipeline Integration
```bash
# CI/CD'ye security audit ekle
# .github/workflows/pr.yml
- name: Security Audit
  run: |
    git diff origin/main...HEAD > /tmp/pr.diff
    claude-code agent security-auditor < /tmp/pr.diff
```

### Slack Notifications
```bash
# orchestrator.sh'a ekle
curl -X POST $SLACK_WEBHOOK \
  -d "{\"text\": \"Workflow completed: $TASK\"}"
```

---

## 📞 Support

**Sorunlarla karşılaşırsan:**
1. `.claude/TEST_REPORT.md` oku - yaygın sorunlar var
2. cost-tracking.log'u kontrol et - token spike var mı?
3. Git issue aç - reproducible örnek ile

**Sistem geliştirme önerileri:**
1. Memory'ye kaydet - hangi pattern'ler işe yarıyor
2. orchestrator.sh'ı özelleştir - workflow'unu optimize et
3. Yeni agent rolleri ekle - ihtiyaca göre

---

**Mutlu kodlamalar! 🚀**

Multi-agent system ile %90 maliyet tasarrufu ve 4x hızlanma seni bekliyor.
