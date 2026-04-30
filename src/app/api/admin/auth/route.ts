import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";

// ============================================
// Admin Auth — HMAC-SHA256 Token
// Eski base64 sisteminin yerini alıyor
// ============================================

const TOKEN_VERSION = "v1";
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 saat

// Brute-force koruması — basit in-memory (prod'da Redis önerilir)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 dakika

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; waitMs?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) return { allowed: true };

  // Kilit süresi dolmuş mu?
  if (now - entry.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const waitMs = LOCKOUT_MS - (now - entry.firstAttempt);
    return { allowed: false, waitMs };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    loginAttempts.set(ip, { count: entry.count + 1, firstAttempt: entry.firstAttempt });
  }
}

function createToken(username: string): string {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret";
  const payload = `${TOKEN_VERSION}:${username}:${Date.now()}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

export function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    // Format: version:username:timestamp:hmac
    if (parts.length !== 4) return { valid: false };

    const [version, username, timestampStr, providedHmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Version kontrolü
    if (version !== TOKEN_VERSION) return { valid: false };

    // TTL kontrolü
    if (Date.now() - timestamp > TOKEN_TTL_MS) return { valid: false };

    // HMAC doğrulaması (timing-safe)
    const secret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret";
    const payload = `${version}:${username}:${timestampStr}`;
    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");

    const providedBuf = Buffer.from(providedHmac, "hex");
    const expectedBuf = Buffer.from(expectedHmac, "hex");

    if (providedBuf.length !== expectedBuf.length) return { valid: false };
    if (!timingSafeEqual(providedBuf, expectedBuf)) return { valid: false };

    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    const waitMin = Math.ceil((rateCheck.waitMs || 0) / 60000);
    logger.warn("Admin login rate limited", "admin/auth", { ip });
    return NextResponse.json(
      { success: false, error: `Çok fazla başarısız deneme. ${waitMin} dakika bekleyin.` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await req.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      logger.error("Admin credentials not configured", "admin/auth");
      return NextResponse.json(
        { success: false, error: "Sunucu yapılandırma hatası." },
        { status: 500 }
      );
    }

    // Timing-safe string karşılaştırması (timing attack koruması)
    const usernameMatch = timingSafeEqual(
      Buffer.from(username || ""),
      Buffer.from(adminUsername)
    );
    const passwordMatch = timingSafeEqual(
      Buffer.from(password || ""),
      Buffer.from(adminPassword)
    );

    if (!usernameMatch || !passwordMatch) {
      recordFailedAttempt(ip);
      const attempts = loginAttempts.get(ip);
      logger.warn("Admin login failed", "admin/auth", { ip, attempts: attempts?.count });

      return NextResponse.json(
        { success: false, error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    // Başarılı giriş — deneme sayacını sıfırla
    loginAttempts.delete(ip);

    const token = createToken(username);

    logger.audit("ADMIN_LOGIN_SUCCESS", "system", username, { ip });

    return NextResponse.json({ success: true, token });
  } catch {
    logger.error("Admin auth unexpected error", "admin/auth", { ip });
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
