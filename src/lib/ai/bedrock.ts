import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
// @ts-expect-error - pdf-parse lacks TypeScript definitions
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";

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
    throw new Error("Claude yaniti JSON formatinda degil: " + clean.slice(0, 400));
  }
}

const SYSTEM_PROMPT = `Sen bir Türk sigorta poliçesi analiz uzmanısın. Sana verilen poliçe metninden yapılandırılmış veri çıkaracaksın.

KURALLAR:
1. Sadece metinde gördüğün bilgileri çıkar. Tahmin yapma.
2. Emin olmadığın alanları null olarak işaretle.
3. Para tutarlarını sayısal değer olarak ver (noktalama/TL işareti olmadan).
4. Tarihleri YYYY-MM-DD formatında ver.
5. SADECE JSON döndür, açıklama veya ek bilgi yazma.

JSON şeması:
{
  "policeTipi": "kasko | trafik | yangin | saglik | isyeri | nakliyat | muhendislik | sorumluluk | ferdi_kaza | dask | diger",
  "policeNumarasi": "string veya null",
  "sigortaSirketi": "string veya null",
  "acenteAdi": "string veya null",
  "acenteNo": "string veya null",
  "baslangicTarihi": "YYYY-MM-DD veya null",
  "bitisTarihi": "YYYY-MM-DD veya null",
  "sigortaEttiren": { "unvan": "string veya null", "vergiNo": "string veya null", "adres": "string veya null" },
  "sigortali": { "unvan": "string veya null", "vergiNo": "string veya null", "adres": "string veya null" },
  "teminatlar": [{ "teminatAdi": "string", "teminatTutari": number, "paraBirimi": "TRY"|"USD"|"EUR", "muafiyet": number|null, "muafiyetTipi": "yuzde"|"tutar"|null }],
  "primBilgileri": { "netPrim": number|null, "bsmv": number|null, "thgf": number|null, "toplamPrim": number|null, "paraBirimi": "TRY", "odemeSekli": "pesin"|"taksitli"|null, "taksitSayisi": number|null },
  "ozelSartlar": ["string"],
  "guvenScore": number
}`;

export async function extractPolicyFromPDF(pdfBuffer: Buffer): Promise<ExtractionResult> {
  try {
    // 1. PDF'i metine çevir
    console.log("[Bedrock] Extracting text from PDF...");
    const data = await pdfParse(pdfBuffer);
    const pdfText = data.text;

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("PDF metin içeriği okunamadı (taranmış görüntü olabilir veya şifreli olabilir)");
    }

    // Claude Haiku token limiti optimizasyonu (Haiku 200k tokene kadar alabilir, ama gereksiz masraf olmasın diye ilk 15000 karakteri alıyoruz, genellikle poliçe ilk sayfalarda tüm datayı taşır)
    const truncatedText = pdfText.slice(0, 15000);
    console.log(`[Bedrock] PDF parsed: ${pdfText.length} chars (sending first ${truncatedText.length} to model)`);

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aşağıdaki Türk sigorta poliçesi metnini analiz et ve JSON formatında döndür:\n\n${truncatedText}`,
        },
      ],
    };

    console.log(`[Bedrock] Calling model: ${MODEL_ID}`);
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.content?.[0]?.text ?? "";

    console.log(`[Bedrock] Response processing...`);
    const parsed = parseJsonResponse(text);
    console.log(`[Bedrock] Complete! Confidence Score: ${parsed.guvenScore}`);

    return { ...parsed, modelUsed: MODEL_ID };
  } catch (error) {
    console.error("[Bedrock] Extraction failed:", (error as Error).message);

    // ========================================
    // GRACEFUL FALLBACK: Return partial/empty data
    // Client will handle showing manual entry form
    // ========================================
    return {
      policeTipi: "diger",
      policeNumarasi: null,
      sigortaSirketi: null,
      acenteAdi: null,
      acenteNo: null,
      baslangicTarihi: null,
      bitisTarihi: null,
      sigortaEttiren: { unvan: null, vergiNo: null, adres: null },
      sigortali: { unvan: null, vergiNo: null, adres: null },
      teminatlar: [],
      primBilgileri: {
        netPrim: null,
        bsmv: null,
        thgf: null,
        toplamPrim: null,
        paraBirimi: "TRY",
        odemeSekli: null,
        taksitSayisi: null,
      },
      ozelSartlar: [],
      guvenScore: 0,
      modelUsed: "fallback-error",
    };
  }
}
