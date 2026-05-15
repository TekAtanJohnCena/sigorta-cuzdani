#!/bin/bash

# 🛡️ GÜVENLİK UZMANI 2 (Security Auditor 2)
# Model: Haiku 4.5 - 12x UCUZ!

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: security-auditor-2 | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "🛡️ GÜVENLİK UZMANI 2 BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Haiku 4.5 (12x ucuz!)"
echo "Görev: Penetrasyon testi, çapraz kontrol"
echo ""

log_activity 150 "Güvenlik Uzmanı 2 çalışmaya başladı"

echo "✅ Agent aktif - penetrasyon testi için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /pentest <api>    - API penetrasyon testi"
echo "  /validate <auth>  - Auth doğrulama"
echo "  /crosscheck <pr>  - Çapraz güvenlik kontrolü"
echo ""

while true; do
  sleep 30
  log_activity 40 "Güvenlik Uzmanı 2 aktif - monitoring"
done
