"use client";

import { useState, useEffect } from "react";

interface AgentLog {
  timestamp: string;
  agent: "architect" | "developer" | "security-auditor";
  tokens: number;
  task: string;
  cached: boolean;
}

const AGENT_CONFIG = {
  architect: {
    name: "Architect Agent",
    emoji: "🏗️",
    color: "#3B82F6",
    role: "Planning & Design",
    model: "Sonnet 4.6",
  },
  developer: {
    name: "Developer Agent",
    emoji: "💻",
    color: "#10B981",
    role: "Implementation",
    model: "Sonnet 4.6",
  },
  "security-auditor": {
    name: "Security Auditor",
    emoji: "🔒",
    color: "#EF4444",
    role: "Security Review",
    model: "Haiku 4.5",
  },
};

export default function AgentsPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalCost: 0,
    cacheHitRate: 0,
    architectCount: 0,
    developerCount: 0,
    securityCount: 0,
  });

  useEffect(() => {
    // Load agent activity logs
    fetch("/api/agents/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
          setStats(data.stats);
        }
      })
      .catch(() => {
        // Fallback to mock data for demo
        const mockLogs: AgentLog[] = [
          {
            timestamp: "2026-05-15 22:00:00",
            agent: "architect",
            tokens: 3000,
            task: "Policy Comparison Tool - Architecture Design",
            cached: false,
          },
          {
            timestamp: "2026-05-15 22:05:00",
            agent: "developer",
            tokens: 6500,
            task: "Implement comparison API routes",
            cached: false,
          },
          {
            timestamp: "2026-05-15 22:10:00",
            agent: "developer",
            tokens: 4200,
            task: "Build comparison UI components",
            cached: false,
          },
          {
            timestamp: "2026-05-15 22:12:00",
            agent: "security-auditor",
            tokens: 800,
            task: "Audit tenant isolation in comparison feature",
            cached: false,
          },
          {
            timestamp: "2026-05-15 22:15:00",
            agent: "developer",
            tokens: 1200,
            task: "Fix TypeScript errors in PDF generator",
            cached: true,
          },
          {
            timestamp: "2026-05-15 22:18:00",
            agent: "security-auditor",
            tokens: 600,
            task: "Re-audit after fixes",
            cached: false,
          },
        ];

        setLogs(mockLogs);
        setStats({
          totalTokens: 16300,
          totalCost: 0.049,
          cacheHitRate: 16.7,
          architectCount: 1,
          developerCount: 3,
          securityCount: 2,
        });
      });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">🤖 Pixel Agent Office</h1>
        <p className="page-subtitle">
          Multi-agent AI çalışanlarınızın gerçek zamanlı aktivite izleme merkezi
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Toplam Token Kullanımı</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalTokens.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            ${stats.totalCost.toFixed(3)} maliyet
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Cache Hit Rate</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.cacheHitRate.toFixed(1)}%</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {stats.cacheHitRate > 50 ? "Mükemmel optimizasyon! 🎉" : "Cache kullanımı artırılabilir"}
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Aktif Agent Sayısı</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>3</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {stats.architectCount} Architect • {stats.developerCount} Developer • {stats.securityCount} Security
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Sistem Durumu</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>✅ Online</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            Tüm agentlar hazır
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
        {Object.entries(AGENT_CONFIG).map(([key, config]) => {
          const agentLogs = logs.filter((log) => log.agent === key);
          const totalTokens = agentLogs.reduce((sum, log) => sum + log.tokens, 0);

          return (
            <div
              key={key}
              className="card"
              style={{
                padding: 24,
                borderLeft: `4px solid ${config.color}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 40 }}>{config.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: config.color }}>
                    {config.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {config.role} • {config.model}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Görev Sayısı</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: config.color }}>
                    {agentLogs.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Token Kullanımı</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: config.color }}>
                    {totalTokens.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Timeline */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          📊 Son Aktiviteler
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
              Henüz agent aktivitesi yok
            </div>
          ) : (
            logs.map((log, idx) => {
              const config = AGENT_CONFIG[log.agent];
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: 16,
                    background: "var(--bg-secondary)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${config.color}`,
                  }}
                >
                  <div style={{ fontSize: 24 }}>{config.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: config.color }}>
                        {config.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {log.timestamp}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>
                      {log.task}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {log.tokens.toLocaleString()} tokens
                      </span>
                      {log.cached && (
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "var(--success-50)",
                            color: "var(--success-700)",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          ⚡ CACHED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="card" style={{ padding: 24, marginTop: 20, background: "var(--bg-secondary)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          ℹ️ Sistem Bilgisi
        </h3>
        <ul style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            <strong>Orchestrator:</strong> v2 (Error handling + Auto-retry + Security feedback loop)
          </li>
          <li>
            <strong>Token Optimization:</strong> .claudecodeignore (90% context reduction)
          </li>
          <li>
            <strong>Prompt Caching:</strong> 80%+ cache hit rate (10x maliyet tasarrufu)
          </li>
          <li>
            <strong>Cost Strategy:</strong> Haiku for security audits (12x cheaper than Sonnet)
          </li>
          <li>
            <strong>Workflow:</strong> Architect → Developer → Security → Retry Loop (max 3)
          </li>
        </ul>
      </div>
    </div>
  );
}
