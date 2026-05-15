#!/bin/bash

# 🏗️ MİMAR AGENT (Architect)
# Model: Sonnet 4.6 - Mimari tasarım

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: architect | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "🏗️ MİMAR AGENT BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Sonnet 4.6"
echo "Görev: Sistem mimarisi, teknik kararlar"
echo ""

log_activity 300 "Mimar agent çalışmaya başladı"

echo "✅ Agent aktif - mimari planlama için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /plan <feature>  - Feature için mimari plan"
echo "  /review <pr>     - PR mimari inceleme"
echo "  /design <system> - Sistem tasarımı"
echo ""

while true; do
  sleep 30
  log_activity 80 "Mimar agent aktif - tasarım review"
done
