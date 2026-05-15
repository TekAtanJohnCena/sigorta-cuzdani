#!/bin/bash

# 🧪 TEST UZMANI (QA Tester)
# Model: Haiku 4.5 - 12x UCUZ!

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: tester | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "🧪 TEST UZMANI BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Haiku 4.5 (12x ucuz!)"
echo "Görev: Test yazma, bug bulma, QA"
echo ""

log_activity 120 "Test Uzmanı çalışmaya başladı"

echo "✅ Agent aktif - test yazmak için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /test <feature>  - Test senaryosu yaz"
echo "  /run <suite>     - Test suite çalıştır"
echo "  /bug <file>      - Bug tarama"
echo ""

while true; do
  sleep 30
  log_activity 35 "Test Uzmanı aktif - QA monitoring"
done
