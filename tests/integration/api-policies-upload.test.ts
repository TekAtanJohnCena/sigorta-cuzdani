// ============================================
// Integration Tests: POST /api/policies/upload
// Tests PDF upload, AI extraction, and file validation
// ============================================

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/policies/upload/route';

// Mock Bedrock extraction
jest.mock('@/lib/ai/bedrock', () => ({
  extractPolicyFromPDF: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { extractPolicyFromPDF } from '@/lib/ai/bedrock';

describe('POST /api/policies/upload - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Test 1: Valid PDF Upload with Successful Extraction
  // ============================================
  it('should successfully process valid PDF and return extraction data', async () => {
    const mockExtractionResult = {
      policeTipi: 'kasko',
      policeNumarasi: 'KSK-2025-001',
      sigortaSirketi: 'Test Sigorta A.Ş.',
      acenteAdi: 'Test Acente',
      acenteNo: 'AC-001',
      baslangicTarihi: '2025-01-01',
      bitisTarihi: '2026-01-01',
      sigortaEttiren: {
        unvan: 'Test Şirket A.Ş.',
        vergiNo: '1234567890',
        adres: 'Test Adres',
      },
      sigortali: {
        unvan: 'Test Sigortalı',
        vergiNo: '9876543210',
        adres: 'Sigortalı Adres',
      },
      teminatlar: [
        {
          teminatAdi: 'Kasko Tam Hasar',
          teminatTutari: 500000,
          paraBirimi: 'TRY',
          muafiyet: 1000,
          muafiyetTipi: 'tutar',
        },
      ],
      primBilgileri: {
        netPrim: 10000,
        bsmv: 500,
        thgf: 200,
        toplamPrim: 10700,
        paraBirimi: 'TRY',
        odemeSekli: 'pesin',
        taksitSayisi: null,
      },
      ozelSartlar: ['Özel şart 1'],
      guvenScore: 95,
      modelUsed: 'bedrock-claude-haiku',
    };

    (extractPolicyFromPDF as jest.Mock).mockResolvedValue(mockExtractionResult);

    // Create PDF buffer with valid magic bytes
    const pdfBuffer = Buffer.from('%PDF-1.4\n%Test PDF content');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'test-policy.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockExtractionResult);
    expect(data.fileName).toBe('test-policy.pdf');
    expect(data.modelUsed).toBe('bedrock-claude-haiku');
    expect(extractPolicyFromPDF).toHaveBeenCalledWith(expect.any(Buffer));
  });

  // ============================================
  // Test 2: Missing File (400)
  // ============================================
  it('should return 400 when no file is provided', async () => {
    const formData = new FormData();

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Dosya bulunamadı');
    expect(extractPolicyFromPDF).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 3: Invalid MIME Type (400)
  // ============================================
  it('should return 400 for non-PDF file', async () => {
    const formData = new FormData();
    const blob = new Blob(['not a pdf'], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Sadece PDF dosyaları kabul edilmektedir');
    expect(extractPolicyFromPDF).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 4: File Size Exceeds Limit (400)
  // ============================================
  it('should return 400 for file larger than 20MB', async () => {
    const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21MB
    largeBuffer.write('%PDF-1.4'); // Add magic bytes

    const formData = new FormData();
    const blob = new Blob([largeBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'large.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('20MB sınırını aşıyor');
    expect(extractPolicyFromPDF).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 5: Invalid Filename (Path Traversal)
  // ============================================
  it('should return 400 for unsafe filename', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4\nTest content');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, '../../../etc/passwd');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçersiz dosya adı');
    expect(extractPolicyFromPDF).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 6: Invalid PDF Magic Bytes (400)
  // ============================================
  it('should return 400 when file does not have valid PDF magic bytes', async () => {
    const fakeBuffer = Buffer.from('FAKE FILE CONTENT'); // No %PDF- header
    const formData = new FormData();
    const blob = new Blob([fakeBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'fake.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Dosya geçerli bir PDF değil');
    expect(extractPolicyFromPDF).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 7: Bedrock Extraction Failure → Graceful Fallback
  // ============================================
  it('should return fallback data when Bedrock extraction fails', async () => {
    (extractPolicyFromPDF as jest.Mock).mockResolvedValue({
      policeTipi: 'diger',
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
        paraBirimi: 'TRY',
        odemeSekli: null,
        taksitSayisi: null,
      },
      ozelSartlar: [],
      guvenScore: 0,
      modelUsed: 'fallback-error',
    });

    const pdfBuffer = Buffer.from('%PDF-1.4\nScanned image PDF (no text)');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'scanned.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.guvenScore).toBe(0);
    expect(data.data.modelUsed).toBe('fallback-error');
    expect(extractPolicyFromPDF).toHaveBeenCalled();
  });

  // ============================================
  // Test 8: Extraction Timeout (500)
  // ============================================
  it('should return 500 when AI extraction times out', async () => {
    // Mock extraction to take longer than timeout (55s)
    (extractPolicyFromPDF as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            policeTipi: 'kasko',
            guvenScore: 90,
            modelUsed: 'bedrock-claude-haiku',
          });
        }, 60000); // 60 seconds - exceeds timeout
      });
    });

    const pdfBuffer = Buffer.from('%PDF-1.4\nLarge policy document');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'large-policy.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    // Use fake timers to simulate timeout
    jest.useFakeTimers();

    const responsePromise = POST(req);

    // Fast-forward time to trigger timeout
    jest.advanceTimersByTime(55000);

    const response = await responsePromise;
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('AI analizi çok uzun sürdü');

    jest.useRealTimers();
  });

  // ============================================
  // Test 9: Rate Limit Error (500)
  // ============================================
  it('should return user-friendly message for rate limit errors', async () => {
    (extractPolicyFromPDF as jest.Mock).mockRejectedValue(
      new Error('ThrottlingException: Rate limit exceeded')
    );

    const pdfBuffer = Buffer.from('%PDF-1.4\nTest PDF');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Sistem yoğun');
  });

  // ============================================
  // Test 10: Encrypted PDF Error (500)
  // ============================================
  it('should return user-friendly message for encrypted PDFs', async () => {
    (extractPolicyFromPDF as jest.Mock).mockRejectedValue(
      new Error('PDF şifreli veya taranmış görüntü')
    );

    const pdfBuffer = Buffer.from('%PDF-1.4\nEncrypted content');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'encrypted.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('metin içermiyor');
  });

  // ============================================
  // Test 11: Successful Extraction with Low Confidence
  // ============================================
  it('should still return data when confidence score is low', async () => {
    const lowConfidenceResult = {
      policeTipi: 'kasko',
      policeNumarasi: 'PARTIAL-001',
      sigortaSirketi: 'Unknown',
      acenteAdi: null,
      acenteNo: null,
      baslangicTarihi: '2025-01-01',
      bitisTarihi: null,
      sigortaEttiren: { unvan: 'Partial Name', vergiNo: null, adres: null },
      sigortali: { unvan: null, vergiNo: null, adres: null },
      teminatlar: [],
      primBilgileri: {
        netPrim: null,
        bsmv: null,
        thgf: null,
        toplamPrim: null,
        paraBirimi: 'TRY',
        odemeSekli: null,
        taksitSayisi: null,
      },
      ozelSartlar: [],
      guvenScore: 30, // Low confidence
      modelUsed: 'bedrock-claude-haiku',
    };

    (extractPolicyFromPDF as jest.Mock).mockResolvedValue(lowConfidenceResult);

    const pdfBuffer = Buffer.from('%PDF-1.4\nPartial data PDF');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'partial.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.guvenScore).toBe(30);
    expect(data.data.policeNumarasi).toBe('PARTIAL-001');
  });

  // ============================================
  // Test 12: Verify File Metadata in Response
  // ============================================
  it('should return file metadata in response', async () => {
    (extractPolicyFromPDF as jest.Mock).mockResolvedValue({
      policeTipi: 'kasko',
      guvenScore: 95,
      modelUsed: 'bedrock-claude-haiku',
    });

    const pdfBuffer = Buffer.from('%PDF-1.4\nTest content');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'policy-metadata-test.pdf');

    const req = new NextRequest('http://localhost:3000/api/policies/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fileName).toBe('policy-metadata-test.pdf');
    expect(data.fileSize).toBe(pdfBuffer.length);
    expect(data.timestamp).toBeDefined();
  });
});
