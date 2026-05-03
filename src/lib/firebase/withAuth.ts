import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps } from "firebase-admin/app";
import { cert } from "firebase-admin/app";
import type { DecodedIdToken } from "firebase-admin/auth";

interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken;
}

export function withAuth(
  handler: (
    req: AuthenticatedRequest,
    user: DecodedIdToken
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Initialize Firebase Admin if not already done
      if (!getApps().length) {
        const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
        );

        if (Object.keys(serviceAccount).length === 0) {
          return NextResponse.json(
            { success: false, error: "Firebase configuration missing" },
            { status: 500 }
          );
        }

        initializeApp({
          credential: cert(serviceAccount),
        });
      }

      const auth = getAuth();

      // Get token from Authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Missing or invalid token" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verify the token
      const decodedToken = await auth.verifyIdToken(token);

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decodedToken;

      // Call the handler with authenticated request
      return await handler(authenticatedReq, decodedToken);
    } catch (error) {
      console.error("[withAuth] Authentication error:", error);

      if (error instanceof Error && error.message.includes("Token expired")) {
        return NextResponse.json(
          { success: false, error: "Token expired" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}
