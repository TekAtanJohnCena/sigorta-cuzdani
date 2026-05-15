#!/bin/bash

# 👔 MÜDÜR AGENT (Manager)
# Model: Sonnet 4.5 - Az token, sadece raporlama

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: manager | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "👔 MÜDÜR AGENT BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Sonnet 4.5 (az token kullanımı)"
echo "Görev: Raporlama, koordinasyon, proje takibi"
echo ""

# İlk aktivite logu
log_activity 250 "Müdür agent çalışmaya başladı"

echo "✅ Agent aktif - raporlama için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /report  - Günlük ilerleme raporu oluştur"
echo "  /status  - Ekip durumu kontrol et"
echo "  /summary - Sprint özeti hazırla"
echo ""

# Keep alive loop
while true; do
  sleep 30
  # Her 30 saniyede bir heartbeat
  log_activity 50 "Müdür agent aktif - monitoring"
done
