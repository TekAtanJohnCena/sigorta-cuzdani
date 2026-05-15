import { NextRequest, NextResponse } from "next/server";
import { validateShareLink, getPoliciesByIds } from "@/lib/firebase/firestore";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const shareLink = await validateShareLink(token);

    if (!shareLink) {
      return NextResponse.json(
        { success: false, error: "Geçersiz veya süresi dolmuş link." },
        { status: 404 }
      );
    }

    const policies = await getPoliciesByIds(shareLink.policyIds, shareLink.tenantId);

    logger.info("Share link accessed", "api/comparisons/token", {
      token,
      tenantId: shareLink.tenantId,
      accessCount: shareLink.accessCount + 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        policies,
        expiresAt: shareLink.expiresAt,
      },
    });
  } catch (error) {
    logger.error("Share link access failed", "api/comparisons/token", { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: "Link yüklenemedi." },
      { status: 500 }
    );
  }
}
