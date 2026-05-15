import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

interface AgentLog {
  timestamp: string;
  agent: "architect" | "developer" | "security-auditor";
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

    // Cost calculation (rough estimate: $3/M input tokens for Sonnet, $0.25/M for Haiku)
    const architectTokens = logs.filter((l) => l.agent === "architect").reduce((s, l) => s + l.tokens, 0);
    const developerTokens = logs.filter((l) => l.agent === "developer").reduce((s, l) => s + l.tokens, 0);
    const securityTokens = logs.filter((l) => l.agent === "security-auditor").reduce((s, l) => s + l.tokens, 0);

    const totalCost =
      (architectTokens / 1_000_000) * 3 +
      (developerTokens / 1_000_000) * 3 +
      (securityTokens / 1_000_000) * 0.25;

    const stats = {
      totalTokens,
      totalCost,
      cacheHitRate,
      architectCount: logs.filter((l) => l.agent === "architect").length,
      developerCount: logs.filter((l) => l.agent === "developer").length,
      securityCount: logs.filter((l) => l.agent === "security-auditor").length,
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

    return NextResponse.json({
      success: true,
      logs: mockLogs,
      stats: {
        totalTokens: 16300,
        totalCost: 0.049,
        cacheHitRate: 16.7,
        architectCount: 1,
        developerCount: 3,
        securityCount: 2,
      },
    });
  }
}
