# 🤖 PIXEL AGENTS - OTOMATİK WORKFLOW

## 🎯 Nasıl Çalışacak?

### Senaryo 1: Sen Bir Task Veriyorsun
```bash
# Sen Claude Code'a task veriyorsun:
claude-code "Policy karşılaştırma feature ekle"
```

**Otomatik olarak şunlar olur:**
1. 🏗️ **Mimar Agent** → Mimari planı oluşturur
2. 💻 **Yazılımcı Agent** → Kodu yazar
3. 🔒 **Güvenlik Agent 1** → Security audit yapar
4. 🛡️ **Güvenlik Agent 2** → Çapraz kontrol yapar
5. 🧪 **QA Agent** → Test yazar
6. 📝 **Dokümantasyon Agent** → Doküman hazırlar
7. 👔 **Müdür Agent** → Final rapor verir

**Sen hiçbir şey yapmazsın! Sadece izlersin.**

---

## 🔄 Mevcut Orchestrator ile Entegrasyon

Zaten `scripts/orchestrator-v2.sh` var! Onu genişletelim:

### Şu Anki orchestrator-v2.sh:
```bash
# Sadece 3 agent var:
1. Architect (plan)
2. Developer (kod)
3. Security Auditor (audit)
```

### Yeni 7-Agent Workflow:
```bash
1. 👔 Manager → Task analizi
2. 🏗️ Architect → Plan
3. 💻 Developer → Kod
4. 🔒 Security 1 → Audit
5. 🛡️ Security 2 → Cross-check
6. 🧪 QA → Test
7. 📝 Documentation → Doküman
8. 👔 Manager → Final report
```

---

## 🚀 Otomatik Başlatma

### Yöntem 1: Claude Code Hook (Otomatik)

`.claude/settings.json` içinde tanımlı hook zaten var:
```json
{
  "hooks": {
    "SessionStart": [{
      "command": "node .pixel-agents/hooks/claude-hook.js"
    }]
  }
}
```

**Bu ne demek?**
- Claude Code başladığında hook çalışır
- Agentlar otomatik başlar
- Sen hiçbir şey yapmazsın!

### Yöntem 2: Task-Based (İhtiyaç Anında)

```bash
# Sen task verdiğinde:
claude-code "Feature ekle"

# Arka planda:
scripts/orchestrator-v2.sh "Feature ekle"
```

Orchestrator otomatik olarak:
1. Agentları başlatır
2. Workflow'u çalıştırır
3. Logları yazar
4. Pixel Agents panelinde gösterir

---

## 💬 Agentlara Nasıl Komut Verirsin?

### Yöntem 1: Task Dosyası (Önerilen)

Bir task dosyası oluştur:
```bash
echo "Policy karşılaştırma feature ekle" > .claude/tasks/current-task.txt
```

Orchestrator otomatik okur ve başlar.

### Yöntem 2: Orchestrator Direct

```bash
bash scripts/orchestrator-v2.sh "Policy karşılaştırma feature ekle"
```

### Yöntem 3: Terminal'den Agent'a Direkt

Eğer bir agent terminalini açtıysan:
```bash
# Manager terminalinde:
/report

# Security terminalinde:
/audit src/app/api/comparisons/
```

---

## 📊 Pixel Agents Paneli Ne İçin?

**Sadece izlemek için!**

Sen kod yazarken yan panelde:
- 👔 Müdür ne yapıyor?
- 💻 Yazılımcı hangi dosyayı yazıyor?
- 🔒 Güvenlik ne buldu?
- 🧪 QA testler geçiyor mu?

**Agentları manuel başlatmana gerek YOK!**

---

## 🔧 Güncellenmiş Orchestrator

Şimdi orchestrator-v2.sh'yi 7 agent'lı yapıyorum:

```bash
# PHASE 1: Manager - Task Analysis
claude-code agent --type manager --prompt "Task: $TASK. Analiz yap."

# PHASE 2: Architect - Design
claude-code agent --type architect --prompt "Task: $TASK. Plan oluştur."

# PHASE 3: Developer - Implementation
claude-code agent --type developer --prompt "Task: $TASK. Implement et."

# PHASE 4: Security 1 - Audit
claude-code agent --type security-auditor --prompt "Audit: $DIFF"

# PHASE 5: Security 2 - Cross-check
claude-code agent --type security-auditor-2 --prompt "Cross-check: $DIFF"

# PHASE 6: QA - Testing
claude-code agent --type tester --prompt "Test yaz: $FEATURE"

# PHASE 7: Documentation
claude-code agent --type documentation --prompt "Doküman hazırla: $FEATURE"

# PHASE 8: Manager - Report
claude-code agent --type manager --prompt "Final rapor ver"
```

Her phase sonrası log yazılır → Pixel Agents panelinde görürsün!

---

## 🎯 Sen Ne Yapacaksın?

### 1. İlk Kurulum (Bir Kez)
```bash
# Orchestrator'ı güncelle
bash scripts/setup-7-agents.sh
```

### 2. Task Ver (Her Yeni İş İçin)
```bash
# Yöntem A: Orchestrator ile
bash scripts/orchestrator-v2.sh "Yeni feature ekle"

# Yöntem B: Claude Code ile
claude-code "Yeni feature ekle"
```

### 3. İzle
- Pixel Agents panelini aç
- Agentların ne yaptığını gör
- Bekleme, otomatik ilerler!

### 4. Bitti!
- Müdür agent final rapor verir
- Sen kodu incelersin
- Beğendiysen commit!

---

## 🔄 Örnek Workflow

```bash
# 1. Task ver
$ bash scripts/orchestrator-v2.sh "PDF export feature"

# 2. Pixel Agents panelinde gör:
👔 Müdür: "Task analizi yapılıyor..." (200 tokens)
🏗️ Mimar: "Mimari plan oluşturuluyor..." (2500 tokens)
💻 Yazılımcı: "src/lib/pdf/export.ts yazılıyor..." (5000 tokens)
🔒 Güvenlik 1: "Security audit yapılıyor..." (400 tokens)
🛡️ Güvenlik 2: "Cross-check tamamlandı" (350 tokens)
🧪 QA: "Test senaryoları yazılıyor..." (300 tokens)
📝 Dokümantasyon: "README.md güncelleniyor..." (250 tokens)
👔 Müdür: "Final rapor hazır!" (150 tokens)

# 3. Toplam: 9,150 tokens, ~$0.03, 15 dakika
# 4. Kod hazır, commit et!
```

---

## ⚡ TLDR (Kısacası)

**Eski Yöntem (Yanlış):**
- Manuel olarak her agent'ı başlat ❌
- Her birine komut gir ❌
- Workflow'u sen yönet ❌

**Yeni Yöntem (Doğru):**
- Orchestrator'a task ver ✅
- Agentlar otomatik çalışır ✅
- Sen sadece Pixel Agents'te izlersin ✅

**Pixel Agents Paneli:**
- Görselleştirme içindir!
- Agentları başlatmak için DEĞİL!
- Sadece ne yaptıklarını görmek için!

---

## 📝 Yapılacaklar

1. ✅ 7 agent script'i hazır
2. ⏳ Orchestrator-v2.sh güncellenmeli (7 agent)
3. ⏳ Auto-start hook eklenmeli
4. ⏳ Task-based workflow kurulmalı

**Devam edeyim mi?** Orchestrator'ı güncelleyip otomatik workflow kuruyorum!
