#!/bin/bash

# 🛑 PIXEL AGENTS - STOPPER
# Tüm agentları durdurur

echo "🛑 Pixel Agents Durduruluyor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PID_DIR=".pixel-agents/pids"

if [ ! -d "$PID_DIR" ]; then
  echo "❌ Hiçbir agent çalışmıyor (PID dizini yok)"
  exit 0
fi

STOPPED=0
FAILED=0

for pidfile in "$PID_DIR"/*.pid; do
  if [ ! -f "$pidfile" ]; then
    continue
  fi

  agent_name=$(basename "$pidfile" .pid)
  pid=$(cat "$pidfile")

  if kill -0 "$pid" 2>/dev/null; then
    if kill "$pid" 2>/dev/null; then
      echo "✅ $agent_name durduruldu (PID: $pid)"
      STOPPED=$((STOPPED + 1))
    else
      echo "❌ $agent_name durdurulamadı (PID: $pid)"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "⚠️  $agent_name zaten durmuş (PID: $pid)"
  fi

  rm "$pidfile"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Özet:"
echo "  • Durduruldu: $STOPPED agent"
echo "  • Başarısız: $FAILED agent"
echo ""

if [ $STOPPED -gt 0 ]; then
  echo "✅ Agentlar başarıyla durduruldu!"
else
  echo "⚠️  Hiçbir agent çalışmıyordu"
fi
