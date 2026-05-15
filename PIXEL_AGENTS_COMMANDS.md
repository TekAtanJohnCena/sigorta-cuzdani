# 🎯 PIXEL AGENTS - KOMUTLAR

## "+ Agent" Butonuna Tıkladığında Yazacağın Komutlar

Her agent için aşağıdaki komutu gir:

---

### 1️⃣ 👔 MÜDÜR (Manager)
```bash
bash .pixel-agents/agents/manager.sh
```

**Ne Yapar:**
- Sonnet 4.5 kullanır (az token)
- Her 30 saniyede log yazar
- Raporlama için beklenir
- Komutlar: /report, /status, /summary

---

### 2️⃣ 🏗️ MİMAR (Architect)
```bash
bash .pixel-agents/agents/architect.sh
```

**Ne Yapar:**
- Sonnet 4.6 kullanır
- Mimari tasarım için hazır bekler
- Her 30 saniyede aktivite logu
- Komutlar: /plan, /review, /design

---

### 3️⃣ 💻 YAZILIMCI (Developer)
```bash
bash .pixel-agents/agents/developer.sh
```

**Ne Yapar:**
- Sonnet 4.6 kullanır
- Kod yazmak için hazır bekler
- En çok token harcayan agent
- Komutlar: /code, /fix, /refactor

---

### 4️⃣ 🔒 GÜVENLİK UZMANI 1
```bash
bash .pixel-agents/agents/security-1.sh
```

**Ne Yapar:**
- Haiku 4.5 (12x UCUZ!)
- Güvenlik taraması yapar
- Az token harcar
- Komutlar: /audit, /scan, /check

---

### 5️⃣ 🛡️ GÜVENLİK UZMANI 2
```bash
bash .pixel-agents/agents/security-2.sh
```

**Ne Yapar:**
- Haiku 4.5 (12x UCUZ!)
- Penetrasyon testi yapar
- İkinci göz kontrolü
- Komutlar: /pentest, /validate, /crosscheck

---

### 6️⃣ 🧪 TEST UZMANI (QA)
```bash
bash .pixel-agents/agents/tester.sh
```

**Ne Yapar:**
- Haiku 4.5 (12x UCUZ!)
- Test senaryoları yazar
- Bug bulur
- Komutlar: /test, /run, /bug

---

### 7️⃣ 📝 DOKÜMANTASYON UZMANI
```bash
bash .pixel-agents/agents/documentation.sh
```

**Ne Yapar:**
- Haiku 4.5 (12x UCUZ!)
- Kod dokümantasyonu yazar
- README, kılavuzlar hazırlar
- Komutlar: /doc, /readme, /guide

---

## 🚀 HIZLI KURULUM

### Adım 1: Pixel Agents Panelini Aç
Sol tarafta Pixel Agents ikonuna tıkla (ports yanında)

### Adım 2: Her Agent İçin "+ Agent" Tıkla
7 kere tıklayacaksın

### Adım 3: Komutları Yapıştır
Yukarıdaki bash komutlarını sırayla yapıştır

### Adım 4: Her Agent İçin Terminal Açılacak
7 terminal penceresi açılacak ve her biri çalışmaya başlayacak

### Adım 5: Aktiviteleri Gör
Her agent kendi terminalinde:
- "Agent başlatıldı" mesajı
- Model bilgisi
- Kullanılabilir komutlar
- Her 30 saniyede aktivite logu

---

## 📊 NE GÖRECEKSIN?

### Pixel Agents Panelinde:
```
👔 Müdür          [250 tokens] "Aktif - monitoring"
🏗️ Mimar          [300 tokens] "Aktif - tasarım review"
💻 Yazılımcı      [400 tokens] "Aktif - coding"
🔒 Güvenlik 1     [150 tokens] "Aktif - monitoring"
🛡️ Güvenlik 2     [150 tokens] "Aktif - monitoring"
🧪 QA Tester      [120 tokens] "Aktif - QA monitoring"
📝 Dokümantasyon  [100 tokens] "Aktif - writing"
```

### Her Terminal'de:
```bash
👔 MÜDÜR AGENT BAŞLATILDI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: Sonnet 4.5 (az token kullanımı)
Görev: Raporlama, koordinasyon, proje takibi

✅ Agent aktif - raporlama için bekleniyor...

Komutlar:
  /report  - Günlük ilerleme raporu oluştur
  /status  - Ekip durumu kontrol et
  /summary - Sprint özeti hazırla
```

---

## 🎯 ÖZELLIKLER

### Her Agent:
- ✅ Kendi terminali var
- ✅ Her 30 saniyede log yazar (`.claude/cost-tracking.log`)
- ✅ Emoji ile tanınabilir
- ✅ Model bilgisi gösterir
- ✅ Token kullanımını loglar
- ✅ Keep-alive (sürekli çalışır)
- ✅ Komut setleri var (/report, /audit vs.)

### Log Formatı:
```
2026-05-15 23:40:00 | Agent: manager | Tokens: 250 | Task: Müdür agent çalışmaya başladı
2026-05-15 23:40:30 | Agent: manager | Tokens: 50 | Task: Müdür agent aktif - monitoring
```

---

## 💡 İPUCU

### Tüm Agentları Bir Anda Başlatmak İçin:
Eğer hepsini tek seferde başlatmak istersen:

```bash
bash .pixel-agents/agents/manager.sh &
bash .pixel-agents/agents/architect.sh &
bash .pixel-agents/agents/developer.sh &
bash .pixel-agents/agents/security-1.sh &
bash .pixel-agents/agents/security-2.sh &
bash .pixel-agents/agents/tester.sh &
bash .pixel-agents/agents/documentation.sh &
```

Veya:

```bash
for script in .pixel-agents/agents/*.sh; do
  bash "$script" &
done
```

---

## 🔍 SORUN GİDERME

### "Permission denied" hatası?
```bash
chmod +x .pixel-agents/agents/*.sh
```

### Log dosyası görünmüyor?
```bash
cat .claude/cost-tracking.log | tail -20
```

### Agent durdu?
Terminal penceresini yeniden aç ve komutu tekrar çalıştır

---

## ✅ ÖZET

**7 komut girmen gerekiyor (Pixel Agents panelinde "+ Agent"):**

1. `bash .pixel-agents/agents/manager.sh`
2. `bash .pixel-agents/agents/architect.sh`
3. `bash .pixel-agents/agents/developer.sh`
4. `bash .pixel-agents/agents/security-1.sh`
5. `bash .pixel-agents/agents/security-2.sh`
6. `bash .pixel-agents/agents/tester.sh`
7. `bash .pixel-agents/agents/documentation.sh`

**Her biri terminal açacak ve çalışmaya başlayacak!** 🎉

**Loglar:** `.claude/cost-tracking.log` dosyasına yazılacak  
**Refresh:** Her 30 saniyede aktivite  
**Keep-alive:** Sürekli çalışır (Ctrl+C ile durdur)
