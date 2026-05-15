# 🚀 PIXEL AGENTS - HIZLI BAŞLANGIÇ

## ✅ Artık Çok Basit!

### 1. Agentları Başlat (Bir Terminal)
```bash
bash start-agents.sh
```

**Ne olur:**
- 7 agent arka planda başlar
- Her 30 saniyede log yazar
- Pixel Agents panelinde görebilirsin
- Terminal açık kalır (Ctrl+C ile durdur)

### 2. Pixel Agents Panelinde İzle
- VS Code'da sol taraftan "Pixel Agents" panelini aç
- 7 agentı görürsün:
  ```
  👔 Müdür (250 tokens)
  🏗️ Mimar (300 tokens)
  💻 Yazılımcı (400 tokens)
  🔒 Güvenlik 1 (150 tokens)
  🛡️ Güvenlik 2 (150 tokens)
  🧪 QA (120 tokens)
  📝 Dokümantasyon (100 tokens)
  ```

### 3. Durdurmak İçin
```bash
bash stop-agents.sh
```

VEYA

start-agents.sh terminalinde `Ctrl+C`

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: VS Code Açınca Otomatik Başlat

`.vscode/settings.json` içine ekle:
```json
{
  "terminal.integrated.profiles.linux": {
    "pixel-agents": {
      "path": "bash",
      "args": ["start-agents.sh"]
    }
  }
}
```

VS Code açınca terminal → "pixel-agents" profili seç → otomatik başlar!

### Senaryo 2: Sadece İzlemek İstiyorum

```bash
# Agentları arka planda başlat
bash start-agents.sh &

# Terminal'i kapat, agentlar çalışmaya devam eder
```

Pixel Agents panelinde izle!

### Senaryo 3: Task Vermek İstiyorum

```bash
# Önce agentları başlat
bash start-agents.sh

# Başka bir terminalde orchestrator çalıştır
bash scripts/orchestrator-v2.sh "Yeni feature ekle"
```

Orchestrator çalışırken agentlar loglarını yazar → Pixel Agents'te görürsün!

---

## 📊 Logları Kontrol Et

```bash
# Son aktiviteleri gör
tail -f .claude/cost-tracking.log

# Son 20 aktivite
tail -20 .claude/cost-tracking.log

# Belirli bir agent
grep "Agent: manager" .claude/cost-tracking.log

# Token toplamı
grep "Tokens:" .claude/cost-tracking.log | awk '{sum+=$6} END {print sum}'
```

---

## 🛠️ Komutlar

### Başlat
```bash
bash start-agents.sh
```

### Durdur
```bash
bash stop-agents.sh
```

### Yeniden Başlat
```bash
bash stop-agents.sh && bash start-agents.sh
```

### Durum Kontrol
```bash
# PID'leri gör
ls -la .pixel-agents/pids/

# Çalışan agentlar
ps aux | grep ".pixel-agents/agents"
```

---

## 🎨 Pixel Agents Paneli

### Ne Göreceğin:
- Her agent için real-time aktivite
- Token kullanımı
- Son görev
- Timestamp

### Nasıl Yenilenir:
- Otomatik 5 saniyede bir
- Veya panel'i kapat/aç

### Boş Görünüyorsa:
1. `bash start-agents.sh` çalıştır
2. 5 saniye bekle
3. Paneli yenile (kapat/aç)

---

## ❓ SSS

### Q: Her seferinde manuel başlatmam gerekiyor mu?
**A:** HAYIR! Bir kez `bash start-agents.sh` yeterli. Agentlar sürekli çalışır.

### Q: VS Code kapattığımda ne olur?
**A:** Agentlar durur. Yeniden açtığında `bash start-agents.sh` tekrar çalıştır.

### Q: Arka planda mı çalışıyor?
**A:** EVET! `bash start-agents.sh &` ile arka planda başlatabilirsin.

### Q: Agentlara nasıl komut veririm?
**A:** Orchestrator kullan: `bash scripts/orchestrator-v2.sh "Task açıklaması"`

### Q: Manuel agent terminallerini açmam gerekiyor mu?
**A:** HAYIR! Artık gerek yok. `start-agents.sh` hepsini otomatik başlatır.

### Q: Pixel Agents'te görmek için ne yapmam gerek?
**A:** Sadece `bash start-agents.sh` çalıştır. 5 saniye sonra panelde görünürler.

---

## 🎯 ÖZET

**ESKİ YOL (Yanlış):**
```bash
# Pixel Agents panelinde "+ Agent" 7 kez tıkla ❌
# Her birine komut yapıştır ❌
# 7 terminal penceresi aç ❌
```

**YENİ YOL (Doğru):**
```bash
bash start-agents.sh ✅
# HEPSİ BU! ✅
```

**Sonuç:**
- 7 agent otomatik başlar
- Arka planda çalışır
- Pixel Agents panelinde görürsün
- Tek komut: `bash start-agents.sh`

🎉 **ARTIK ÇOK BASIT!**
