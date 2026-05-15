# 🚀 Pixel Agents Extension - Hızlı Kurulum

## ✅ Extension Yüklü - Şimdi Ne Yapmalısın?

### 1️⃣ Workspace'i Yeniden Aç
```bash
# VS Code'u kapat
# sigorta-cuzdani.code-workspace dosyasını aç
```

VEYA

VS Code'da: File → Open Workspace → `sigorta-cuzdani.code-workspace` seç

### 2️⃣ Extension Panelini Aç
Sol tarafta "Pixel Agents" ikonuna tıkla (ports yanında)

### 3️⃣ Manuel Agent Ekle (Eğer Boş Görünüyorsa)

Extension panelinde "**+ Agent**" butonuna tıkla ve şunları ekle:

#### 👔 Müdür
```
Name: Müdür
Model: Sonnet 4.5
Role: Raporlama
Log Pattern: Agent: manager
```

#### 🏗️ Mimar
```
Name: Mimar
Model: Sonnet 4.6
Role: Mimari
Log Pattern: Agent: architect
```

#### 💻 Yazılımcı
```
Name: Yazılımcı
Model: Sonnet 4.6
Role: Kod
Log Pattern: Agent: developer
```

#### 🔒 Güvenlik 1
```
Name: Güvenlik 1
Model: Haiku 4.5
Role: Güvenlik
Log Pattern: Agent: security-auditor
```

#### 🛡️ Güvenlik 2
```
Name: Güvenlik 2
Model: Haiku 4.5
Role: Penetrasyon
Log Pattern: Agent: security-auditor-2
```

#### 🧪 QA Tester
```
Name: QA Tester
Model: Haiku 4.5
Role: Test
Log Pattern: Agent: tester
```

#### 📝 Dokümantasyon
```
Name: Dokümantasyon
Model: Haiku 4.5
Role: Doküman
Log Pattern: Agent: documentation
```

### 4️⃣ Log Dosyasını Ayarla

Extension ayarlarında:
```
Log File: .claude/cost-tracking.log
Refresh Interval: 5000ms
```

### 5️⃣ Test Et

Extension panelinde şunu görmelisin:
- 👔 Müdür (500 tokens, "VS Code extension config")
- 💻 Yazılımcı (1200 tokens, ".vscode/settings.json")
- 📝 Dokümantasyon (350 tokens, "Extension kılavuzu")
- 🧪 QA (400 tokens, "Extension test")

## 📁 Hazırlanan Dosyalar

✅ `.vscode/settings.json` - VS Code workspace ayarları  
✅ `.vscode/pixel-agents.json` - Agent tanımları  
✅ `.agents.json` - Extension config (root)  
✅ `sigorta-cuzdani.code-workspace` - Workspace file  
✅ `.claude/cost-tracking.log` - Agent aktivite logları (21 kayıt)

## 🔍 Sorun Giderme

### Extension boş görünüyor?
1. Workspace file'ı aç (sigorta-cuzdani.code-workspace)
2. VS Code'u reload et (Ctrl+Shift+P → Reload Window)
3. Extension panelini kapat/aç
4. Manuel "+ Agent" ile ekle

### Loglar görünmüyor?
1. Extension ayarlarında log path'i kontrol et: `.claude/cost-tracking.log`
2. Dosya var mı kontrol et: `ls -la .claude/cost-tracking.log`
3. Format doğru mu: `cat .claude/cost-tracking.log | tail -5`

### Extension çalışmıyor?
1. Extension aktif mi: Extensions → Pixel Agents → Enable
2. Workspace settings yüklendi mi: Settings → Pixel Agents
3. Log dosyası okunabiliyor mu: Permissions check

## 🎯 Sonuç

Şimdi kod yazarken yan panelde 7 agentını görmelisin:
- 👔💻🏗️ Hangi agent ne yapıyor
- 🔒🛡️ Token kullanımı
- 🧪📝 Son aktivite zamanı
- ⚡ Cache hit/miss

**Extension şimdi senin agent ekibini izliyor!** 🎉
