#!/bin/bash

# 💻 YAZILIMCI AGENT (Developer)
# Model: Sonnet 4.6 - Kod yazma

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: developer | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "💻 YAZILIMCI AGENT BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Sonnet 4.6"
echo "Görev: Kod yazma, feature implementation"
echo ""

log_activity 400 "Yazılımcı agent çalışmaya başladı"

echo "✅ Agent aktif - kod yazmak için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /code <feature>   - Feature implement et"
echo "  /fix <bug>        - Bug düzelt"
echo "  /refactor <file>  - Kod refactor et"
echo ""

while true; do
  sleep 30
  log_activity 120 "Yazılımcı agent aktif - coding"
done
