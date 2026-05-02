// ============================================
// Integration Tests: POST /api/policies
// Tests API endpoint with mocked Firestore & Auth
// ============================================

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/policies/route';
import {
  resetMockStore,
  seedMockUser,
  mockRunTransaction,
  mockGetAuth,
  mockGetFirestore,
  mockGetAdminApp,
  mockAddDoc,
  mockGetDocs,
  resetRateLimiter,
} from '../mocks/firestore';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  addDoc: (...args: any[]) => require('../mocks/firestore').mockAddDoc(...args),
  getDoc: (...args: any[]) => require('../mocks/firestore').mockGetDoc(...args),
  getDocs: (...args: any[]) => require('../mocks/firestore').mockGetDocs(...args),
  collection: jest.fn((db: any, name: string) => ({
    _key: { path: { segments: [name] } },
  })),
  query: jest.fn((collection: any, ...constraints: any[]) => ({
    _query: { path: collection._key.path },
    constraints,
  })),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date() }),
  },
  runTransaction: (...args: any[]) => require('../mocks/firestore').mockRunTransaction(...args),
  writeBatch: (...args: any[]) => require('../mocks/firestore').mockWriteBatch(...args),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: (...args: any[]) => require('../mocks/firestore').mockGetAuth(...args),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: (...args: any[]) => require('../mocks/firestore').mockGetFirestore(...args),
}));

jest.mock('@/lib/firebase/adminApp', () => ({
  getAdminApp: (...args: any[]) => require('../mocks/firestore').mockGetAdminApp(...args),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: { _type: 'mock-db' },
}));

// Mock logger to suppress console output
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('POST /api/policies - Integration Tests', () => {
  beforeEach(() => {
    resetMockStore();
    resetRateLimiter();
    jest.clearAllMocks();
    // Seed a test user
    seedMockUser('test-uid', 'tenant-123');
  });

  // ============================================
  // Test 1: Valid Policy Creation (200)
  // ============================================
  it('should create policy with valid data and return 200', async () => {
    const validPayload = {
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
      },
      ozelSartlar: ['Özel şart 1', 'Özel şart 2'],
      guvenScore: 95,
      modelUsed: 'test-model',
      originalPdfUrl: 'https://example.com/policy.pdf',
      originalPdfPath: '/policies/test.pdf',
      fileName: 'policy.pdf',
      fileSize: 1024000,
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.documentId).toBeDefined();
    expect(data.data.message).toContain('başarıyla kaydedildi');
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // Test 2: Missing Required Field (400)
  // ============================================
  it('should return 400 for missing policeTipi', async () => {
    const invalidPayload = {
      policeNumarasi: 'TEST-001',
      sigortaSirketi: 'Test Sigorta',
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Poliçe tipi zorunludur');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  // ============================================
  // Test 3: Invalid Policy Type (400)
  // ============================================
  it('should return 400 for invalid policy type', async () => {
    const invalidPayload = {
      policeTipi: 'invalid_type',
      policeNumarasi: 'TEST-001',
      sigortaSirketi: 'Test Sigorta',
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçersiz poliçe tipi');
  });

  // ============================================
  // Test 4: Invalid Date Format (400)
  // ============================================
  it('should return 400 for invalid date format', async () => {
    const invalidPayload = {
      policeTipi: 'kasko',
      policeNumarasi: 'TEST-001',
      sigortaSirketi: 'Test Sigorta',
      baslangicTarihi: 'invalid-date-string', // Invalid format that Date() rejects
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçersiz başlangıç tarihi');
  });

  // ============================================
  // Test 5: Unauthorized (No Token) (401)
  // ============================================
  it('should return 401 when no authorization token provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ policeTipi: 'kasko' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Kimlik doğrulaması gerekli');
  });

  // ============================================
  // Test 6: Invalid Token (401)
  // ============================================
  it('should return 401 for invalid Firebase token', async () => {
    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token',
      },
      body: JSON.stringify({ policeTipi: 'kasko' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçersiz veya süresi dolmuş oturum');
  });

  // ============================================
  // Test 7: Tenant Isolation (tenantId from token)
  // ============================================
  it('should use tenantId from authenticated token, not from request body', async () => {
    // Seed user with tenant-999
    seedMockUser('user-999', 'tenant-999');

    const payloadWithTenantId = {
      tenantId: 'tenant-spoofed', // Client attempts to spoof tenantId
      policeTipi: 'kasko',
      policeNumarasi: 'TEST-001',
      sigortaSirketi: 'Test Sigorta',
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-user-999',
      },
      body: JSON.stringify(payloadWithTenantId),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockAddDoc).toHaveBeenCalled();

    // Verify tenantId was taken from token (tenant-999), not request body
    const savedData = mockAddDoc.mock.calls[0][1];
    expect(savedData.tenantId).toBe('tenant-999');
    expect(savedData.tenantId).not.toBe('tenant-spoofed');
  });

  // ============================================
  // Test 8: Rate Limiting (429)
  // ============================================
  it('should return 429 after exceeding rate limit (100 req/min)', async () => {
    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
        'x-forwarded-for': '192.168.1.100',
      },
      body: JSON.stringify({ policeTipi: 'kasko' }),
    });

    // Simulate 101 requests from same IP
    for (let i = 0; i < 101; i++) {
      const response = await POST(req);
      if (i < 100) {
        // First 100 should go through (or fail validation, but not rate limited)
        expect(response.status).not.toBe(429);
      } else {
        // 101st request should be rate limited
        const data = await response.json();
        expect(response.status).toBe(429);
        expect(data.error).toContain('Çok fazla istek');
      }
    }
  });

  // ============================================
  // Test 9: XSS Protection (Sanitization)
  // ============================================
  it('should sanitize HTML tags in policy data', async () => {
    const maliciousPayload = {
      policeTipi: 'kasko',
      policeNumarasi: '<script>alert("XSS")</script>TEST-001',
      sigortaSirketi: 'Test<>Sigorta',
    };

    const req = new NextRequest('http://localhost:3000/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
      body: JSON.stringify(maliciousPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    const savedData = mockAddDoc.mock.calls[0][1];
    expect(savedData.policyNumber).not.toContain('<script>');
    expect(savedData.policyNumber).not.toContain('</script>');
    expect(savedData.insuranceCompany).not.toContain('<');
    expect(savedData.insuranceCompany).not.toContain('>');
  });
});

// ============================================
// GET /api/policies - Pagination Tests
// ============================================
describe('GET /api/policies - Pagination Tests', () => {
  beforeEach(() => {
    resetMockStore();
    resetRateLimiter();
    jest.clearAllMocks();
    seedMockUser('test-uid', 'tenant-123');
  });

  it('should return paginated policies with default limit', async () => {
    const req = new NextRequest('http://localhost:3000/api/policies?page=1', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer valid-token-test-uid-tenant123',
      },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(25);
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('should return 401 for GET request without auth token', async () => {
    const req = new NextRequest('http://localhost:3000/api/policies?page=1', {
      method: 'GET',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Kimlik doğrulaması gerekli');
  });

  it('should enforce tenant isolation on GET requests', async () => {
    seedMockUser('user-tenant-a', 'tenant-a');
    seedMockUser('user-tenant-b', 'tenant-b');

    const reqA = new NextRequest('http://localhost:3000/api/policies', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer valid-token-user-tenant-a-tenanta',
      },
    });

    const responseA = await GET(reqA);
    expect(responseA.status).toBe(200);
    // mockGetDocs would be called with tenant-a filter
    expect(mockGetDocs).toHaveBeenCalled();
  });
});
