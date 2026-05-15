#!/bin/bash

# 🚀 PIXEL AGENTS - AUTO STARTER
# Tüm agentları arka planda başlatır

echo "🚀 Pixel Agents Başlatılıyor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Log file temizle (opsiyonel)
# > .claude/cost-tracking.log

# Her agent için PID dosyası
PID_DIR=".pixel-agents/pids"
mkdir -p "$PID_DIR"

# Önceki agent'ları temizle
cleanup() {
  echo "🧹 Mevcut agentlar durduruluyor..."
  for pidfile in "$PID_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
      pid=$(cat "$pidfile")
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null
        echo "  ✅ Agent durduruldu (PID: $pid)"
      fi
      rm "$pidfile"
    fi
  done
}

# Ctrl+C yakalandığında temizlik
trap cleanup EXIT INT TERM

# Mevcut agentları durdur
cleanup

echo ""
echo "👥 7 Agent Başlatılıyor..."
echo ""

# 1. Manager
echo "👔 Müdür başlatılıyor..."
bash .pixel-agents/agents/manager.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/manager.pid"
sleep 1

# 2. Architect
echo "🏗️ Mimar başlatılıyor..."
bash .pixel-agents/agents/architect.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/architect.pid"
sleep 1

# 3. Developer
echo "💻 Yazılımcı başlatılıyor..."
bash .pixel-agents/agents/developer.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/developer.pid"
sleep 1

# 4. Security 1
echo "🔒 Güvenlik Uzmanı 1 başlatılıyor..."
bash .pixel-agents/agents/security-1.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/security-1.pid"
sleep 1

# 5. Security 2
echo "🛡️ Güvenlik Uzmanı 2 başlatılıyor..."
bash .pixel-agents/agents/security-2.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/security-2.pid"
sleep 1

# 6. Tester
echo "🧪 Test Uzmanı başlatılıyor..."
bash .pixel-agents/agents/tester.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/tester.pid"
sleep 1

# 7. Documentation
echo "📝 Dokümantasyon Uzmanı başlatılıyor..."
bash .pixel-agents/agents/documentation.sh > /dev/null 2>&1 &
echo $! > "$PID_DIR/documentation.pid"
sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 7 Agent Başarıyla Başlatıldı!"
echo ""
echo "📊 Durum:"
echo "  • Loglar: .claude/cost-tracking.log"
echo "  • PID'ler: .pixel-agents/pids/"
echo "  • Pixel Agents panelini kontrol et!"
echo ""
echo "🛑 Durdurmak için: bash stop-agents.sh"
echo "   veya Ctrl+C (bu terminalde)"
echo ""

# Keep alive
echo "⏳ Agentlar çalışıyor... (Ctrl+C ile durdur)"
wait
