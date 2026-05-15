import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";
import { createShareLink } from "@/lib/firebase/firestore";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (req, { tenantId, uid }) => {
  try {
    const body = await req.json();
    const { comparisonId, policyIds } = body;

    if (!comparisonId || !Array.isArray(policyIds)) {
      return NextResponse.json(
        { success: false, error: "comparisonId ve policyIds gereklidir." },
        { status: 400 }
      );
    }

    const { token, expiresAt } = await createShareLink(tenantId, comparisonId, policyIds);

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/compare/${token}`;

    logger.audit("SHARE_LINK_CREATED", tenantId, uid, { comparisonId, token, expiresAt });

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        token,
        expiresAt,
      },
    });
  } catch (error) {
    logger.error("Share link creation failed", "api/comparisons/share", { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: "Paylaşım linki oluşturulamadı." },
      { status: 500 }
    );
  }
});
