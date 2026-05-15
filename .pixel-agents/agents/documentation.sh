#!/bin/bash

# 📝 DOKÜMANTASYON UZMANI (Documentation)
# Model: Haiku 4.5 - 12x UCUZ!

LOG_FILE=".claude/cost-tracking.log"

log_activity() {
  local tokens=$1
  local task="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp | Agent: documentation | Tokens: $tokens | Task: $task" >> "$LOG_FILE"
}

echo "📝 DOKÜMANTASYON UZMANI BAŞLATILDI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: Haiku 4.5 (12x ucuz!)"
echo "Görev: Kod dokümantasyonu, kılavuzlar"
echo ""

log_activity 100 "Dokümantasyon Uzmanı çalışmaya başladı"

echo "✅ Agent aktif - dokümantasyon için bekleniyor..."
echo ""
echo "Komutlar:"
echo "  /doc <file>     - Dosya dokümantasyonu"
echo "  /readme <dir>   - README oluştur"
echo "  /guide <topic>  - Kullanım kılavuzu yaz"
echo ""

while true; do
  sleep 30
  log_activity 30 "Dokümantasyon Uzmanı aktif - writing"
done
