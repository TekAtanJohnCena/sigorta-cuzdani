// ============================================
// Policy Validation Schemas (Zod)
// Production-Ready Validation for B2B Enterprise
// ============================================

import { z } from "zod";
import { PolicyType, Currency, PaymentType } from "@/types/policy";

// ============================================
// CUSTOM ERROR MESSAGES (Turkish)
// ============================================

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "Bu alan metin formatında olmalıdır" };
    }
    if (issue.expected === "number") {
      return { message: "Bu alan sayısal değer olmalıdır" };
    }
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      return { message: `En az ${issue.minimum} karakter olmalıdır` };
    }
    if (issue.type === "number") {
      return { message: `Değer en az ${issue.minimum} olmalıdır` };
    }
    if (issue.type === "array") {
      return { message: `En az ${issue.minimum} öğe içermelidir` };
    }
  }
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === "string") {
      return { message: `En fazla ${issue.maximum} karakter olabilir` };
    }
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

// ============================================
// REUSABLE SCHEMAS
// ============================================

const PolicyTypeSchema = z.enum([
  "kasko",
  "trafik",
  "yangin",
  "saglik",
  "nakliyat",
  "isyeri",
  "dask",
  "ferdi_kaza",
  "sorumluluk",
  "muhendislik",
  "tarim",
  "diger",
], {
  errorMap: () => ({ message: "Geçersiz poliçe tipi seçildi" }),
});

const CurrencySchema = z.enum(["TRY", "USD", "EUR"], {
  errorMap: () => ({ message: "Geçersiz para birimi" }),
});

const PaymentTypeSchema = z.enum(["cash", "installment"], {
  errorMap: () => ({ message: "Geçersiz ödeme tipi" }),
});

// ISO 8601 date string validation with custom error
const ISODateSchema = z
  .string({ required_error: "Tarih zorunludur" })
  .regex(/^\d{4}-\d{2}-\d{2}/, "Tarih formatı geçersiz (YYYY-MM-DD olmalı)")
  .refine(
    (date) => !isNaN(new Date(date).getTime()),
    "Geçerli bir tarih giriniz"
  );

// ============================================
// SUB-SCHEMAS
// ============================================

export const PolicyPartySchema = z.object({
  unvan: z
    .string({ required_error: "Ünvan zorunludur" })
    .min(2, "Ünvan en az 2 karakter olmalıdır")
    .max(200, "Ünvan çok uzun"),
  vergiNo: z
    .string()
    .min(10, "Vergi numarası en az 10 karakter olmalıdır")
    .max(20, "Vergi numarası çok uzun")
    .optional()
    .nullable(),
  adres: z.string().max(500, "Adres çok uzun").optional().nullable(),
});

export const CoverageSchema = z.object({
  teminatAdi: z
    .string({ required_error: "Teminat adı zorunludur" })
    .min(2, "Teminat adı en az 2 karakter olmalıdır")
    .max(150, "Teminat adı çok uzun"),
  teminatTutari: z
    .number({ required_error: "Teminat tutarı zorunludur" })
    .nonnegative("Teminat tutarı negatif olamaz")
    .finite("Teminat tutarı geçerli bir sayı olmalıdır"),
  paraBirimi: CurrencySchema.default("TRY"),
  muafiyet: z.number().nonnegative().optional().nullable(),
  muafiyetTipi: z
    .enum(["yuzde", "tutar"])
    .optional()
    .nullable(),
});

export const PremiumInfoSchema = z.object({
  netPrim: z
    .number()
    .nonnegative("Net prim negatif olamaz")
    .optional()
    .nullable(),
  bsmv: z
    .number()
    .nonnegative("BSMV negatif olamaz")
    .optional()
    .nullable(),
  thgf: z
    .number()
    .nonnegative("THGF negatif olamaz")
    .optional()
    .nullable(),
  toplamPrim: z
    .number({ required_error: "Toplam prim zorunludur" })
    .positive("Toplam prim sıfırdan büyük olmalıdır")
    .finite("Toplam prim geçerli bir sayı olmalıdır"),
  paraBirimi: CurrencySchema.default("TRY"),
  odemeSekli: z.enum(["pesin", "taksitli"]).optional().nullable(),
  taksitSayisi: z
    .number()
    .int("Taksit sayısı tam sayı olmalıdır")
    .positive("Taksit sayısı en az 1 olmalıdır")
    .max(24, "Taksit sayısı en fazla 24 olabilir")
    .optional()
    .nullable(),
});

// ============================================
// MAIN POLICY CREATION SCHEMA
// ============================================

export const PolicyCreateSchema = z
  .object({
    // Required Core Fields
    policeTipi: PolicyTypeSchema,
    policeNumarasi: z
      .string({ required_error: "Poliçe numarası zorunludur" })
      .min(3, "Poliçe numarası en az 3 karakter olmalıdır")
      .max(100, "Poliçe numarası çok uzun")
      .trim(),
    sigortaSirketi: z
      .string({ required_error: "Sigorta şirketi zorunludur" })
      .min(2, "Sigorta şirketi adı en az 2 karakter olmalıdır")
      .max(150, "Sigorta şirketi adı çok uzun")
      .trim(),

    // Optional Core Fields
    acenteAdi: z.string().max(150).optional().nullable(),
    acenteNo: z.string().max(50).optional().nullable(),

    // Dates (ISO 8601)
    baslangicTarihi: ISODateSchema,
    bitisTarihi: ISODateSchema,

    // Parties
    sigortaEttiren: PolicyPartySchema,
    sigortali: PolicyPartySchema.optional().nullable(),

    // Coverages
    teminatlar: z
      .array(CoverageSchema)
      .min(1, "En az 1 teminat eklenmelidir")
      .max(50, "Maksimum 50 teminat eklenebilir"),

    // Premium
    primBilgileri: PremiumInfoSchema,

    // Optional Metadata
    ozelSartlar: z.array(z.string().max(500)).optional().default([]),
    guvenScore: z.number().min(0).max(100).optional().default(0),

    // Document info (from upload)
    originalPdfUrl: z.string().url().optional().nullable(),
    originalPdfPath: z.string().optional().nullable(),
    fileName: z.string().max(255).optional().nullable(),
    fileSize: z.number().nonnegative().optional().nullable(),
    modelUsed: z.string().optional().nullable(),

    // Tenant (will be overridden by server)
    tenantId: z.string().optional(),
  })
  .strict() // Reject unknown keys
  .refine(
    (data) => {
      // CRITICAL: End date must be after start date
      const start = new Date(data.baslangicTarihi);
      const end = new Date(data.bitisTarihi);
      return end > start;
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      path: ["bitisTarihi"], // Error will be attached to endDate field
    }
  )
  .refine(
    (data) => {
      // If installment payment, installmentCount must be provided
      if (data.primBilgileri.odemeSekli === "taksitli") {
        return (
          data.primBilgileri.taksitSayisi != null &&
          data.primBilgileri.taksitSayisi > 0
        );
      }
      return true;
    },
    {
      message: "Taksitli ödeme seçildiğinde taksit sayısı belirtilmelidir",
      path: ["primBilgileri", "taksitSayisi"],
    }
  );

// ============================================
// FILE UPLOAD VALIDATION (Client-side)
// ============================================

export const FileUploadSchema = z
  .instanceof(File, { message: "Geçerli bir dosya seçilmelidir" })
  .refine(
    (file) => file.type === "application/pdf",
    "Sadece PDF dosyaları kabul edilmektedir"
  )
  .refine(
    (file) => file.size <= 20 * 1024 * 1024, // 20MB
    "Dosya boyutu 20MB'dan küçük olmalıdır"
  )
  .refine(
    (file) => file.name.length > 0 && file.name.length <= 255,
    "Dosya adı çok uzun"
  );

// ============================================
// TYPES (Inferred from Zod)
// ============================================

export type PolicyCreateInput = z.infer<typeof PolicyCreateSchema>;
export type PolicyPartyInput = z.infer<typeof PolicyPartySchema>;
export type CoverageInput = z.infer<typeof CoverageSchema>;
export type PremiumInfoInput = z.infer<typeof PremiumInfoSchema>;

// ============================================
// VALIDATION HELPER (Returns field-level errors)
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePolicyData(
  data: unknown
): { success: true; data: PolicyCreateInput } | { success: false; errors: ValidationError[] } {
  const result = PolicyCreateSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transform Zod errors to field-level errors
  const errors: ValidationError[] = result.error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return { success: false, errors };
}

// ============================================
// PARTIAL UPDATE SCHEMA (For editing existing policies)
// ============================================

export const PolicyUpdateSchema = PolicyCreateSchema.partial().omit({
  tenantId: true, // Cannot change tenant
});

export type PolicyUpdateInput = z.infer<typeof PolicyUpdateSchema>;
