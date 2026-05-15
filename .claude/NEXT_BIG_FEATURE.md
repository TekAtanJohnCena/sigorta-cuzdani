# İlk Büyük Feature: Policy Comparison Tool

**Tarih:** 2026-05-15  
**Orchestrator:** v2 (production-grade)  
**Öncelik:** Phase 1 Critical

---

## 🎯 Feature Özeti

**Ne:** Kullanıcılar mevcut poliçelerini side-by-side karşılaştırabilsin  
**Neden:** B2B satışta "hangi poliçe daha iyi?" sorusuna görsel cevap  
**Değer:** Yenileme döneminde alternatif teklifleri karşılaştırma

---

## 📋 Gereksinimler

### Fonksiyonel
1. Poliçe seçim UI (2-4 poliçe aynı anda)
2. Side-by-side karşılaştırma tablosu
3. Highlight differences (coverage, price, provider)
4. Export to PDF (karşılaştırma raporu)
5. Share link (read-only, expiring)

### Teknik
- `/dashboard/policies/compare?ids=1,2,3`
- API: `/api/policies/compare` (POST with policy IDs)
- Component: `<PolicyComparisonTable>`
- PDF: Existing pdf-lib dependency
- Auth: withAuth wrapper (tenant-scoped)

### Security-Critical
- ✅ Tenant isolation (user sadece kendi poliçelerini görmeli)
- ✅ Share link authentication (token-based, 24h expiry)
- ✅ No PII in share URLs
- ✅ Rate limiting (max 10 comparisons/minute)

---

## 🧪 Test Plan

### Unit Tests
- [ ] Policy comparison logic
- [ ] Difference highlighting algorithm
- [ ] PDF generation with mock data

### Integration Tests
- [ ] API endpoint authentication
- [ ] Tenant isolation validation
- [ ] Share link token generation/validation

### E2E Tests
- [ ] Select 2 policies → Compare
- [ ] Export to PDF
- [ ] Generate share link → Open in incognito

### Security Tests
- [ ] Try accessing other tenant's policies
- [ ] Try expired share link
- [ ] Try SQL injection in policy IDs
- [ ] Try XSS in policy names

---

## 💡 Neden Bu Feature İdeal v2 Test Case

### 1. **Security-Sensitive** ✅
- Tenant isolation kritik
- Share link security
- PII exposure riski

→ v2'nin auto-retry security loop'u test edilecek

### 2. **Orta Kompleksite** ✅
- 4-5 dosya (route, component, utils, types)
- Frontend + backend
- PDF generation

→ Developer'ın birden fazla dosyada çalışması test edilecek

### 3. **Gerçek Business Value** ✅
- Memory'de Phase 1 öncelikli değil ama önemli
- Demo için harika (B2B satış)
- Kullanıcı hemen kullanacak

### 4. **Retry Senaryoları Olası** ✅
Potansiyel security fails:
- İlk denemede tenant check unutulabilir
- Share link'te token exp check unutulabilir
- PDF'te user data sanitization unutulabilir

→ v2'nin feedback loop'u devreye girecek

---

## 📊 Beklenen Workflow

### İdeal Senaryo (1 retry)
```
Attempt 1:
  Architect: "5 dosya, tenant isolation, share links"
  Developer: Implements
  Security: "❌ FAIL - Share link missing expiry check"

Attempt 2:
  Developer: Adds token expiration
  Security: "✅ PASS"

Result: Safe, production-ready comparison tool
Cost: ~6K tokens ($0.016)
Time: ~30 seconds
```

### Worst Case (3 retries)
```
Attempt 1: Security FAIL (tenant isolation missing)
Attempt 2: Security FAIL (XSS in policy names)
Attempt 3: Security PASS

Result: Production-ready after 3 iterations
Cost: ~10K tokens ($0.026)
Time: ~60 seconds
```

---

## 🚀 Execution Plan

### Step 1: Plan
```bash
./scripts/orchestrator-v2.sh "Add policy comparison tool with side-by-side view and PDF export"
```

### Step 2: Monitor
```bash
# Başka terminalde log izle
tail -f .claude/logs/*-workflow.log
```

### Step 3: Test
```bash
npm run dev
# Browser: http://localhost:3000/dashboard/policies/compare?ids=1,2
```

### Step 4: Review
```bash
# Security report
cat .claude/diffs/*-audit.md

# Code changes
git diff --cached

# Cost
cat .claude/logs/*-workflow.log | grep "tokens"
```

---

## 📈 Success Metrics

### Fonksiyonel
- ✅ 2-4 poliçe karşılaştırılabiliyor
- ✅ Farklar highlight ediliyor
- ✅ PDF export çalışıyor
- ✅ Share link 24h sonra expire oluyor

### Teknik
- ✅ <500ms response time (API)
- ✅ Mobile responsive (comparison table)
- ✅ No console errors

### Security
- ✅ 0 vulnerabilities in audit
- ✅ Tenant isolation validated
- ✅ No PII in URLs
- ✅ Rate limiting enforced

### Süreç
- ✅ v2 orchestrator başarıyla çalıştı
- ✅ ≤3 retry yeterli oldu
- ✅ Cost <$0.03
- ✅ Time <90 seconds

---

## 🎯 Alternatif Features (Eğer Comparison Çok Kolay Gelirse)

### Seçenek 1: Claims Dashboard Enhancement
- Hasar timeline görselleştirme
- Status workflow diagram
- Document gallery

**Avantaj:** UI-heavy, security daha az kritik  
**Dezavantaj:** v2'nin security loop'unu test edemeyiz

### Seçenek 2: Risk Engine Activation
- Company profile form
- Automated risk scanning
- Risk score calculation

**Avantaj:** Backend-heavy, business logic  
**Dezavantaj:** Daha kompleks, ilk test için fazla

### Seçenek 3: Asset Import Enhancement
- Excel/CSV validation
- Smart column mapping
- Duplicate detection

**Avantaj:** Veri işleme, hata senaryoları çok  
**Dezavantaj:** Frontend az, demo için sıkıcı

---

## 💬 Karar

**Öneri:** **Policy Comparison Tool** ile başla çünkü:

1. ✅ Security-sensitive (v2 test için ideal)
2. ✅ Görsel output (demo için harika)
3. ✅ Gerçek business value
4. ✅ Orta kompleksite (ne çok kolay ne çok zor)
5. ✅ Retry senaryoları olası

**Alternatif:** Eğer user başka bir feature isterse, o da olabilir.

---

## 🏁 Ready to Execute

```bash
# Test orchestrator v2
./scripts/orchestrator-v2.sh "Add policy comparison tool with side-by-side view, PDF export, and shareable links"

# Sonra rapor
cat .claude/logs/*-workflow.log
```

**Beklenti:** 
- 1-2 retry
- Security PASS
- Production-ready code
- <$0.02 cost

🚀 **Let's build!**
