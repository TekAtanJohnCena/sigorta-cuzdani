# Pixel Agents VS Code Extension Setup

## 🎯 Amaç
Kod yazarken VS Code'un yan panelinde AI agent aktivitelerini görmek için.

## 📦 Kurulum

### 1. VS Code Extension Yükle
```bash
# GitHub'dan pixel-agents extension'ı yükle
# Veya VS Code marketplace'den "Pixel Agents" ara
```

### 2. Extension'ı Aktifleştir
1. VS Code'u aç
2. Ctrl+Shift+P → "Pixel Agents: Show Panel"
3. Sağ tarafta agent paneli açılır

## 📋 Dosya Yapısı

### `.vscode/pixel-agents.json`
Extension'ın okuyacağı config dosyası:
- 7 agent tanımı (emoji, renk, rol, model)
- Log dosyası yolu (`.claude/cost-tracking.log`)
- Ayarlar (refresh interval, notification)

### `.claude/cost-tracking.log`
Agent aktivitelerinin kaydedildiği log dosyası:
```
2026-05-15 22:00:00 | Agent: manager | Tokens: 800 | Task: Rapor hazırlandı
2026-05-15 22:05:00 | Agent: developer | Tokens: 6500 | Task: API implement edildi
```

## 🔧 Kullanım

### Extension Panelinde Göreceksin:
- 👔 Müdür (Sonnet 4.5) → Son aktivite + token
- 🏗️ Mimar (Sonnet 4.6) → Son aktivite + token
- 💻 Yazılımcı (Sonnet 4.6) → Son aktivite + token
- 🔒 Güvenlik 1 (Haiku 4.5) → Son aktivite + token
- 🛡️ Güvenlik 2 (Haiku 4.5) → Son aktivite + token
- 🧪 QA Tester (Haiku 4.5) → Son aktivite + token
- 📝 Dokümantasyon (Haiku 4.5) → Son aktivite + token

### Özellikler:
- ✅ Real-time güncelleme (5 saniyede bir)
- ✅ Agent başına token sayacı
- ✅ Son aktivite zamanı
- ✅ Aktif/pasif göstergesi
- ✅ Renk kodlu agent kartları
- ✅ Notification (yeni aktivite geldiğinde)

## 🎨 Görsel

Sağ panelde göreceğin:
```
┌─────────────────────────────┐
│ 🤖 PIXEL AGENTS            │
├─────────────────────────────┤
│ 👔 Müdür                    │
│    "Rapor hazırlandı"       │
│    800 tokens • 10:30       │
├─────────────────────────────┤
│ 🏗️ Mimar                    │
│    "Mimari tasarım"         │
│    3000 tokens • 10:25      │
├─────────────────────────────┤
│ 💻 Yazılımcı                │
│    "API implement"          │
│    6500 tokens • 10:28      │
└─────────────────────────────┘
```

## 🚨 Önemli Notlar

1. **Extension yüklü olmalı:** Pixel Agents VS Code extension
2. **Log formatı önemli:** cost-tracking.log doğru formatta olmalı
3. **Refresh otomatik:** 5 saniyede bir güncellenir
4. **7 agent:** Hepsi config'de tanımlı

## 🔗 Linkler

- Extension GitHub: (pixel-agents extension repo)
- Log dosyası: `.claude/cost-tracking.log`
- Config: `.vscode/pixel-agents.json`
