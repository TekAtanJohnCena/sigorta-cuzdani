import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

interface AgentLog {
  timestamp: string;
  agent: "architect" | "developer" | "security-auditor" | "security-auditor-2" | "tester" | "documentation" | "manager";
  tokens: number;
  task: string;
  cached: boolean;
}

export async function GET() {
  try {
    const logPath = join(process.cwd(), ".claude", "cost-tracking.log");
    const content = await readFile(logPath, "utf-8");

    const logs: AgentLog[] = content
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        // Parse: "2026-05-15 21:55:00 | Agent: architect | Tokens: 5000 | Task: Initial system setup"
        const parts = line.split(" | ");
        const timestamp = parts[0];
        const agent = parts[1]?.replace("Agent: ", "").trim() as AgentLog["agent"];
        const tokensMatch = parts[2]?.match(/Tokens: (\d+)/);
        const tokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
        const taskRaw = parts[3]?.replace("Task: ", "").trim() || "";
        const cached = taskRaw.includes("(CACHED)");
        const task = taskRaw.replace("(CACHED)", "").trim();

        return { timestamp, agent, tokens, task, cached };
      })
      .reverse(); // Most recent first

    // Calculate stats
    const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0);
    const cachedCount = logs.filter((log) => log.cached).length;
    const cacheHitRate = logs.length > 0 ? (cachedCount / logs.length) * 100 : 0;

    // Cost calculation: Sonnet 4.6 ($3/M), Sonnet 4.5 ($3/M), Haiku 4.5 ($0.25/M)
    const managerTokens = logs.filter((l) => l.agent === "manager").reduce((s, l) => s + l.tokens, 0);
    const architectTokens = logs.filter((l) => l.agent === "architect").reduce((s, l) => s + l.tokens, 0);
    const developerTokens = logs.filter((l) => l.agent === "developer").reduce((s, l) => s + l.tokens, 0);
    const securityTokens = logs.filter((l) => l.agent === "security-auditor" || l.agent === "security-auditor-2").reduce((s, l) => s + l.tokens, 0);
    const testerTokens = logs.filter((l) => l.agent === "tester").reduce((s, l) => s + l.tokens, 0);
    const documentationTokens = logs.filter((l) => l.agent === "documentation").reduce((s, l) => s + l.tokens, 0);

    const totalCost =
      (managerTokens / 1_000_000) * 3 + // Sonnet 4.5
      (architectTokens / 1_000_000) * 3 + // Sonnet 4.6
      (developerTokens / 1_000_000) * 3 + // Sonnet 4.6
      (securityTokens / 1_000_000) * 0.25 + // Haiku 4.5
      (testerTokens / 1_000_000) * 0.25 + // Haiku 4.5
      (documentationTokens / 1_000_000) * 0.25; // Haiku 4.5

    const stats = {
      totalTokens,
      totalCost,
      cacheHitRate,
      managerCount: logs.filter((l) => l.agent === "manager").length,
      architectCount: logs.filter((l) => l.agent === "architect").length,
      developerCount: logs.filter((l) => l.agent === "developer").length,
      securityCount: logs.filter((l) => l.agent === "security-auditor" || l.agent === "security-auditor-2").length,
      testerCount: logs.filter((l) => l.agent === "tester").length,
      documentationCount: logs.filter((l) => l.agent === "documentation").length,
      totalAgents: 7,
    };

    return NextResponse.json({
      success: true,
      logs: logs.slice(0, 50), // Last 50 activities
      stats,
    });
  } catch {
    // Fallback to mock data if log file doesn't exist
    const mockLogs: AgentLog[] = [
      {
        timestamp: "2026-05-15 22:00:00",
        agent: "manager",
        tokens: 800,
        task: "Haftalık ilerleme raporu hazırlandı",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:02:00",
        agent: "architect",
        tokens: 3000,
        task: "Policy Comparison Tool - Mimari tasarım",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:05:00",
        agent: "developer",
        tokens: 6500,
        task: "Comparison API route'ları implement edildi",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:10:00",
        agent: "developer",
        tokens: 4200,
        task: "UI componentleri oluşturuldu",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:12:00",
        agent: "security-auditor",
        tokens: 600,
        task: "Tenant izolasyonu kontrol edildi",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:14:00",
        agent: "security-auditor-2",
        tokens: 550,
        task: "Rate limiting güvenlik testi",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:15:00",
        agent: "developer",
        tokens: 1200,
        task: "TypeScript hataları düzeltildi",
        cached: true,
      },
      {
        timestamp: "2026-05-15 22:16:00",
        agent: "tester",
        tokens: 450,
        task: "API endpoint testleri yazıldı",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:18:00",
        agent: "security-auditor",
        tokens: 500,
        task: "Final güvenlik onayı verildi",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:20:00",
        agent: "documentation",
        tokens: 400,
        task: "API dokümantasyonu güncellendi",
        cached: false,
      },
      {
        timestamp: "2026-05-15 22:22:00",
        agent: "manager",
        tokens: 600,
        task: "Sprint tamamlandı raporu oluşturuldu",
        cached: false,
      },
    ];

    return NextResponse.json({
      success: true,
      logs: mockLogs,
      stats: {
        totalTokens: 18800,
        totalCost: 0.045,
        cacheHitRate: 9.1,
        managerCount: 2,
        architectCount: 1,
        developerCount: 3,
        securityCount: 3,
        testerCount: 1,
        documentationCount: 1,
        totalAgents: 7,
      },
    });
  }
}
