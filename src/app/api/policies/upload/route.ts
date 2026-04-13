import { NextRequest, NextResponse } from "next/server";
import { extractPolicyFromPDF } from "@/lib/ai/bedrock";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    console.log("[Upload] API route started");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Dosya bulunamadi" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "Sadece PDF kabul edilir" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Dosya 20MB sinirini asiyor" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[Upload] Passing to bedrock");
    const result = await extractPolicyFromPDF(buffer);

    return NextResponse.json({
      success: true,
      data: result,
      fileName: file.name,
      fileSize: file.size,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("[Upload] Error:", error?.message || error);
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: "PDF isleme hatasi: " + message }, { status: 500 });
  }
}
