// ============================================
// Unit Tests: Policy Validation Schemas (Zod)
// Coverage Target: 100% for validation logic
// ============================================

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  PolicyCreateSchema,
  PolicyPartySchema,
  CoverageSchema,
  PremiumInfoSchema,
  FileUploadSchema,
  validatePolicyData,
} from '@/lib/validation/policySchemas';

describe('PolicyPartySchema', () => {
  it('should validate valid party data', () => {
    const validParty = {
      unvan: 'Test Şirketi A.Ş.',
      vergiNo: '1234567890',
      adres: 'Test Adres 123',
    };
    expect(() => PolicyPartySchema.parse(validParty)).not.toThrow();
  });

  it('should reject unvan shorter than 2 characters', () => {
    const invalidParty = { unvan: 'A' };
    expect(() => PolicyPartySchema.parse(invalidParty)).toThrow('Ünvan en az 2 karakter olmalıdır');
  });

  it('should reject unvan longer than 200 characters', () => {
    const invalidParty = { unvan: 'A'.repeat(201) };
    expect(() => PolicyPartySchema.parse(invalidParty)).toThrow('Ünvan çok uzun');
  });

  it('should accept optional vergiNo and adres', () => {
    const minimalParty = { unvan: 'Minimal Şirket' };
    expect(() => PolicyPartySchema.parse(minimalParty)).not.toThrow();
  });

  it('should reject vergiNo shorter than 10 characters', () => {
    const invalidParty = { unvan: 'Test', vergiNo: '123' };
    expect(() => PolicyPartySchema.parse(invalidParty)).toThrow('Vergi numarası en az 10 karakter olmalıdır');
  });
});

describe('CoverageSchema', () => {
  it('should validate valid coverage data', () => {
    const validCoverage = {
      teminatAdi: 'Kasko Tam Hasar',
      teminatTutari: 500000,
      paraBirimi: 'TRY',
    };
    expect(() => CoverageSchema.parse(validCoverage)).not.toThrow();
  });

  it('should reject negative coverage amount', () => {
    const invalidCoverage = {
      teminatAdi: 'Test',
      teminatTutari: -100,
    };
    expect(() => CoverageSchema.parse(invalidCoverage)).toThrow('Teminat tutarı negatif olamaz');
  });

  it('should default currency to TRY', () => {
    const coverage = {
      teminatAdi: 'Test Teminat',
      teminatTutari: 1000,
    };
    const parsed = CoverageSchema.parse(coverage);
    expect(parsed.paraBirimi).toBe('TRY');
  });

  it('should reject infinite coverage amount', () => {
    const invalidCoverage = {
      teminatAdi: 'Test',
      teminatTutari: Infinity,
    };
    expect(() => CoverageSchema.parse(invalidCoverage)).toThrow();
  });
});

describe('PremiumInfoSchema', () => {
  it('should validate valid premium data', () => {
    const validPremium = {
      netPrim: 10000,
      bsmv: 500,
      thgf: 200,
      toplamPrim: 10700,
      paraBirimi: 'TRY',
    };
    expect(() => PremiumInfoSchema.parse(validPremium)).not.toThrow();
  });

  it('should reject zero or negative total premium', () => {
    const invalidPremium = {
      toplamPrim: 0,
    };
    expect(() => PremiumInfoSchema.parse(invalidPremium)).toThrow('Toplam prim sıfırdan büyük olmalıdır');
  });

  it('should reject negative netPrim', () => {
    const invalidPremium = {
      netPrim: -500,
      toplamPrim: 1000,
    };
    expect(() => PremiumInfoSchema.parse(invalidPremium)).toThrow('Net prim negatif olamaz');
  });

  it('should reject installment count > 24', () => {
    const invalidPremium = {
      toplamPrim: 1000,
      taksitSayisi: 25,
    };
    expect(() => PremiumInfoSchema.parse(invalidPremium)).toThrow('Taksit sayısı en fazla 24 olabilir');
  });

  it('should reject non-integer installment count', () => {
    const invalidPremium = {
      toplamPrim: 1000,
      taksitSayisi: 4.5,
    };
    expect(() => PremiumInfoSchema.parse(invalidPremium)).toThrow('Taksit sayısı tam sayı olmalıdır');
  });
});

describe('PolicyCreateSchema', () => {
  const validPolicyData = {
    policeTipi: 'kasko',
    policeNumarasi: 'KSK-2025-12345',
    sigortaSirketi: 'Test Sigorta A.Ş.',
    acenteAdi: 'Test Acentesi',
    acenteNo: 'AC-001',
    baslangicTarihi: '2025-01-01',
    bitisTarihi: '2026-01-01',
    sigortaEttiren: {
      unvan: 'Test Şirket A.Ş.',
      vergiNo: '1234567890',
      adres: 'Test Adres',
    },
    teminatlar: [
      {
        teminatAdi: 'Kasko',
        teminatTutari: 500000,
        paraBirimi: 'TRY',
      },
    ],
    primBilgileri: {
      netPrim: 10000,
      bsmv: 500,
      thgf: 200,
      toplamPrim: 10700,
      paraBirimi: 'TRY',
    },
  };

  it('should validate complete valid policy data', () => {
    expect(() => PolicyCreateSchema.parse(validPolicyData)).not.toThrow();
  });

  it('should reject missing required field: policeTipi', () => {
    const { policeTipi, ...incomplete } = validPolicyData;
    expect(() => PolicyCreateSchema.parse(incomplete)).toThrow();
  });

  it('should reject missing required field: policeNumarasi', () => {
    const { policeNumarasi, ...incomplete } = validPolicyData;
    expect(() => PolicyCreateSchema.parse(incomplete)).toThrow();
  });

  it('should reject missing required field: sigortaSirketi', () => {
    const { sigortaSirketi, ...incomplete } = validPolicyData;
    expect(() => PolicyCreateSchema.parse(incomplete)).toThrow();
  });

  it('should reject invalid policy type', () => {
    const invalidData = { ...validPolicyData, policeTipi: 'invalid_type' };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow();
  });

  it('should reject policy number shorter than 3 characters', () => {
    const invalidData = { ...validPolicyData, policeNumarasi: 'AB' };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('Poliçe numarası en az 3 karakter olmalıdır');
  });

  it('should reject invalid date format', () => {
    const invalidData = { ...validPolicyData, baslangicTarihi: '01/01/2025' };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('Tarih formatı geçersiz');
  });

  it('should reject end date before start date', () => {
    const invalidData = {
      ...validPolicyData,
      baslangicTarihi: '2026-01-01',
      bitisTarihi: '2025-01-01',
    };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
  });

  it('should reject empty coverages array', () => {
    const invalidData = { ...validPolicyData, teminatlar: [] };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('En az 1 teminat eklenmelidir');
  });

  it('should reject more than 50 coverages', () => {
    const manyCoverages = Array(51).fill({
      teminatAdi: 'Test',
      teminatTutari: 1000,
    });
    const invalidData = { ...validPolicyData, teminatlar: manyCoverages };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('Maksimum 50 teminat eklenebilir');
  });

  it('should reject installment payment without installmentCount', () => {
    const invalidData = {
      ...validPolicyData,
      primBilgileri: {
        ...validPolicyData.primBilgileri,
        odemeSekli: 'taksitli',
        taksitSayisi: null,
      },
    };
    expect(() => PolicyCreateSchema.parse(invalidData)).toThrow('Taksitli ödeme seçildiğinde taksit sayısı belirtilmelidir');
  });

  it('should accept installment payment with valid installmentCount', () => {
    const validInstallment = {
      ...validPolicyData,
      primBilgileri: {
        ...validPolicyData.primBilgileri,
        odemeSekli: 'taksitli',
        taksitSayisi: 12,
      },
    };
    expect(() => PolicyCreateSchema.parse(validInstallment)).not.toThrow();
  });

  it('should reject unknown keys in strict mode', () => {
    const dataWithUnknownKey = {
      ...validPolicyData,
      unknownField: 'should be rejected',
    };
    expect(() => PolicyCreateSchema.parse(dataWithUnknownKey)).toThrow();
  });

  it('should accept optional fields as null', () => {
    const minimalData = {
      ...validPolicyData,
      acenteAdi: null,
      acenteNo: null,
      sigortali: null,
    };
    expect(() => PolicyCreateSchema.parse(minimalData)).not.toThrow();
  });
});

describe('FileUploadSchema', () => {
  it('should validate valid PDF file', () => {
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
    expect(() => FileUploadSchema.parse(validFile)).not.toThrow();
  });

  it('should reject non-PDF file', () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    expect(() => FileUploadSchema.parse(invalidFile)).toThrow('Sadece PDF dosyaları kabul edilmektedir');
  });

  it('should reject file larger than 20MB', () => {
    const largeFile = new File(['test'], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 }); // 21MB
    expect(() => FileUploadSchema.parse(largeFile)).toThrow('Dosya boyutu 20MB');
  });

  it('should reject file with empty name', () => {
    const noNameFile = new File(['test'], '', { type: 'application/pdf' });
    expect(() => FileUploadSchema.parse(noNameFile)).toThrow('Dosya adı');
  });
});

describe('validatePolicyData helper', () => {
  const validData = {
    policeTipi: 'kasko',
    policeNumarasi: 'TEST-001',
    sigortaSirketi: 'Test Sigorta',
    baslangicTarihi: '2025-01-01',
    bitisTarihi: '2026-01-01',
    sigortaEttiren: { unvan: 'Test Şirket' },
    teminatlar: [{ teminatAdi: 'Test', teminatTutari: 1000 }],
    primBilgileri: { toplamPrim: 1000 },
  };

  it('should return success for valid data', () => {
    const result = validatePolicyData(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
    }
  });

  it('should return field-level errors for invalid data', () => {
    const invalidData = { ...validData, policeNumarasi: 'A' };
    const result = validatePolicyData(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('policeNumarasi');
      expect(result.errors[0].message).toContain('en az 3 karakter');
    }
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const invalidData = {
      policeTipi: 'invalid',
      policeNumarasi: 'A',
      sigortaSirketi: 'T',
    };
    const result = validatePolicyData(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(1);
    }
  });
});
