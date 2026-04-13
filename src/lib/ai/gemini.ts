import { GoogleGenerativeAI } from "@google/generative-ai";
import { POLICY_EXTRACTION_PROMPT } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ExtractionResult {
  policeTipi: string;
  policeNumarasi: string | null;
  sigortaSirketi: string | null;
  acenteAdi: string | null;
  acenteNo: string | null;
  baslangicTarihi: string | null;
  bitisTarihi: string | null;
  sigortaEttiren: { unvan: string | null; vergiNo: string | null; adres: string | null };
  sigortali: { unvan: string | null; vergiNo: string | null; adres: string | null };
  teminatlar: Array<{
    teminatAdi: string;
    teminatTutari: number;
    paraBirimi: string;
    muafiyet: number | null;
    muafiyetTipi: string | null;
  }>;
  primBilgileri: {
    netPrim: number | null;
    bsmv: number | null;
    thgf: number | null;
    toplamPrim: number | null;
    paraBirimi: string;
    odemeSekli: string | null;
    taksitSayisi: number | null;
  };
  ozelSartlar: string[];
  guvenScore: number;
  modelUsed?: string;
}

// Models available on this API key  ordered by speed/cost
const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseJsonResponse(text: string): ExtractionResult {
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(clean) as ExtractionResult;
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as ExtractionResult;
    throw new Error("AI yaniti JSON formatinda degil: " + clean.slice(0, 300));
  }
}

export async function extractPolicyFromPDF(
  pdfBase64: string,
  mimeType: string = "application/pdf"
): Promise<ExtractionResult> {
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[Gemini] Trying: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        { inlineData: { data: pdfBase64, mimeType } },
        POLICY_EXTRACTION_PROMPT,
      ]);

      const text = result.response.text().trim();
      const parsed = parseJsonResponse(text);
      console.log(`[Gemini] OK: ${modelName} | confidence: ${parsed.guvenScore}`);
      return { ...parsed, modelUsed: modelName };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] ${modelName} failed: ${msg.slice(0, 120)}`);
      lastError = err instanceof Error ? err : new Error(msg);

      if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
        await sleep(4000);
      }
    }
  }

  throw lastError ?? new Error("Tum Gemini modelleri basarisiz oldu");
}
