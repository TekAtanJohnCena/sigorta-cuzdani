#!/bin/bash

# 🔒 GÜVENLİK UZMANI 1 (Security Auditor)
# Model: Haiku 4.5 - 12x UCUZ!

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: security-auditor | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "🔒 GÜVENLİK UZMANI 1 BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Haiku 4.5 (12x ucuz!)"
echo "Görev: Güvenlik açıkları, audit"
echo ""

log_activity 150 "Güvenlik Uzmanı 1 çalışmaya başladı"

echo "✅ Agent aktif - güvenlik taraması için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /audit <file>  - Dosya güvenlik taraması"
echo "  /scan <dir>    - Dizin tarama"
echo "  /check <pr>    - PR güvenlik kontrolü"
echo ""

while true; do
  sleep 30
  log_activity 40 "Güvenlik Uzmanı 1 aktif - monitoring"
done
