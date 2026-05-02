# API Reference - Sigorta Cuzdani

**Version:** 1.0.0  
**Base URL:** `https://your-domain.com` (or `http://localhost:3000` for development)  
**Last Updated:** 2026-05-03

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Policies](#policies)
  - [AI Analysis](#ai-analysis)
  - [Admin](#admin)
  - [Automation](#automation)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

### Overview

The API uses **Firebase ID Token** authentication for all protected endpoints. The authentication flow is handled by the `withAuth` middleware.

### How It Works

1. **Client Login**: User authenticates with Firebase Authentication (email/password, Google, etc.)
2. **Get ID Token**: Client retrieves Firebase ID token using `getIdToken()` from Firebase SDK
3. **Send Request**: Include token in `Authorization` header for all API calls
4. **Token Verification**: Server verifies token and extracts user identity (uid, email, tenantId)
5. **Multi-Tenancy**: Each user belongs to a tenant. The `tenantId` is stored in Firestore `users` collection and cannot be spoofed by the client.

### Request Headers

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

### Authentication Response

**Success (200):**
Request proceeds with authenticated context (`tenantId`, `uid`, `email`, `role`)

**Unauthorized (401):**
```json
{
  "success": false,
  "error": "Kimlik doğrulaması gerekli.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

**Token Expired/Invalid (401):**
```json
{
  "success": false,
  "error": "Geçersiz veya süresi dolmuş oturum.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

### Token Refresh

Firebase ID tokens expire after 1 hour. The client should:
- Monitor token expiration
- Refresh token automatically using Firebase SDK
- Retry failed requests with new token

---

## Rate Limiting

### Global Rate Limit

- **Limit:** 100 requests per minute per IP
- **Window:** Rolling 60-second window
- **Scope:** All authenticated endpoints
- **Implementation:** In-memory (production should use Redis)

### Rate Limit Response (429)

```json
{
  "success": false,
  "error": "Çok fazla istek. Lütfen 1 dakika bekleyin.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

### Headers

Response includes standard rate limit headers (not implemented in current version but recommended):
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1715426400
```

---

## Endpoints

## Policies

### Create Policy

Create a new insurance policy with full validation.

**Endpoint:** `POST /api/policies`  
**Auth Required:** ✅  
**Validation:** Zod schema (strict)

#### Request Body

```typescript
{
  // Core Fields (required)
  "policeTipi": "kasko" | "trafik" | "yangin" | "saglik" | "nakliyat" | 
                "isyeri" | "dask" | "ferdi_kaza" | "sorumluluk" | 
                "muhendislik" | "tarim" | "diger",
  "policeNumarasi": string,          // 3-100 chars
  "sigortaSirketi": string,           // 2-150 chars
  
  // Optional Core Fields
  "acenteAdi"?: string,               // max 150 chars
  "acenteNo"?: string,                // max 50 chars
  
  // Dates (ISO 8601: YYYY-MM-DD)
  "baslangicTarihi": string,          // Start date
  "bitisTarihi": string,              // End date (must be > start)
  
  // Policy Holder (required)
  "sigortaEttiren": {
    "unvan": string,                  // 2-200 chars
    "vergiNo"?: string,               // 10-20 chars
    "adres"?: string                  // max 500 chars
  },
  
  // Insured Party (optional, defaults to policy holder)
  "sigortali"?: {
    "unvan": string,
    "vergiNo"?: string,
    "adres"?: string
  },
  
  // Coverages (min 1, max 50)
  "teminatlar": [
    {
      "teminatAdi": string,           // 2-150 chars
      "teminatTutari": number,        // >= 0
      "paraBirimi": "TRY" | "USD" | "EUR",
      "muafiyet"?: number,            // >= 0
      "muafiyetTipi"?: "yuzde" | "tutar"
    }
  ],
  
  // Premium Information (required)
  "primBilgileri": {
    "netPrim"?: number,               // >= 0
    "bsmv"?: number,                  // >= 0 (Banking Insurance Transaction Tax)
    "thgf"?: number,                  // >= 0 (Traffic Guarantee Fund)
    "toplamPrim": number,             // > 0, required
    "paraBirimi": "TRY" | "USD" | "EUR",
    "odemeSekli"?: "pesin" | "taksitli",
    "taksitSayisi"?: number           // 1-24, required if odemeSekli=taksitli
  },
  
  // Optional Metadata
  "ozelSartlar"?: string[],           // max 500 chars each
  "guvenScore"?: number,              // 0-100 (AI confidence)
  
  // Document Info (from upload)
  "originalPdfUrl"?: string,
  "originalPdfPath"?: string,
  "fileName"?: string,
  "fileSize"?: number,
  "modelUsed"?: string
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "documentId": "abc123xyz",
    "message": "Poliçe başarıyla kaydedildi."
  },
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Validation Error (400)

```json
{
  "success": false,
  "error": "Doğrulama hatası: Lütfen tüm zorunlu alanları doldurun.",
  "fieldErrors": [
    {
      "field": "policeNumarasi",
      "message": "Poliçe numarası en az 3 karakter olmalıdır"
    },
    {
      "field": "bitisTarihi",
      "message": "Bitiş tarihi başlangıç tarihinden sonra olmalıdır"
    }
  ],
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Error Response (500)

```json
{
  "success": false,
  "error": "Poliçe kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/policies \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "policeTipi": "kasko",
    "policeNumarasi": "KAS-2024-123456",
    "sigortaSirketi": "Anadolu Sigorta",
    "acenteAdi": "ABC Acentesi",
    "baslangicTarihi": "2024-01-01",
    "bitisTarihi": "2025-01-01",
    "sigortaEttiren": {
      "unvan": "ACME Teknoloji A.Ş.",
      "vergiNo": "1234567890",
      "adres": "İstanbul, Türkiye"
    },
    "teminatlar": [
      {
        "teminatAdi": "Kasko Teminatı",
        "teminatTutari": 500000,
        "paraBirimi": "TRY"
      }
    ],
    "primBilgileri": {
      "netPrim": 10000,
      "bsmv": 500,
      "thgf": 200,
      "toplamPrim": 10700,
      "paraBirimi": "TRY",
      "odemeSekli": "pesin"
    }
  }'
```

---

### List Policies

Retrieve paginated list of policies for authenticated tenant.

**Endpoint:** `GET /api/policies`  
**Auth Required:** ✅

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 25 | Items per page (min: 1, max: 100) |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "policy123",
      "tenantId": "tenant456",
      "policyType": "kasko",
      "policyNumber": "KAS-2024-123456",
      "insuranceCompany": "Anadolu Sigorta",
      "agencyName": "ABC Acentesi",
      "startDate": "2024-01-01",
      "endDate": "2025-01-01",
      "status": "active",
      "premium": {
        "totalPremium": 10700,
        "currency": "TRY",
        "paymentType": "cash"
      },
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "hasMore": false,
    "count": 1
  },
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Error Response (500)

```json
{
  "success": false,
  "error": "Poliçeler yüklenirken bir hata oluştu.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Example (cURL)

```bash
curl -X GET "https://your-domain.com/api/policies?page=1&limit=25" \
  -H "Authorization: Bearer <firebase-token>"
```

---

### Upload Policy PDF

Upload and extract policy data from PDF using AI (Amazon Bedrock).

**Endpoint:** `POST /api/policies/upload`  
**Auth Required:** ❌ (No auth - stateless PDF processing)  
**Timeout:** 60 seconds  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file (max 20MB) |

#### Validations

- **MIME Type:** Must be `application/pdf`
- **Size Limit:** 20MB maximum
- **Magic Bytes:** Validates PDF header (`%PDF-`)
- **Filename:** Sanitized (no path traversal)

#### Response (200)

```json
{
  "success": true,
  "data": {
    "policeTipi": "kasko",
    "policeNumarasi": "KAS-2024-123456",
    "sigortaSirketi": "Anadolu Sigorta",
    "baslangicTarihi": "2024-01-01",
    "bitisTarihi": "2025-01-01",
    "sigortaEttiren": {
      "unvan": "ACME Teknoloji A.Ş.",
      "vergiNo": "1234567890"
    },
    "teminatlar": [...],
    "primBilgileri": {...},
    "guvenScore": 95
  },
  "fileName": "policy.pdf",
  "fileSize": 245678,
  "modelUsed": "us.anthropic.claude-haiku-4-5-20251001-v1:0"
}
```

#### Error Responses

**Invalid File Type (400):**
```json
{
  "error": "Sadece PDF dosyaları kabul edilmektedir."
}
```

**File Too Large (400):**
```json
{
  "error": "Dosya boyutu 20MB sınırını aşıyor."
}
```

**Invalid PDF (400):**
```json
{
  "error": "Dosya geçerli bir PDF değil."
}
```

**Processing Error (500):**
```json
{
  "error": "PDF işlenirken bir hata oluştu. Lütfen tekrar deneyin."
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/policies/upload \
  -F "file=@policy.pdf"
```

#### Example (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/policies/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

---

## AI Analysis

### Analyze Portfolio

Comprehensive AI-powered portfolio analysis using Claude Haiku 4.5.

**Endpoint:** `POST /api/ai/analyze-portfolio`  
**Auth Required:** ❌ (Uses tenantId from request body)  
**Timeout:** 60 seconds  
**AI Model:** Amazon Bedrock Claude Haiku 4.5

#### Request Body

```json
{
  "tenantId": "string"  // max 128 chars
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "toplamPoliceSayisi": 15,
    "toplamPrimTutari": 250000,
    "enYuksekRiskler": [
      {
        "tip": "kasko",
        "risk": "Teminat limiti yetersiz",
        "oneri": "Limit artırımı önerilir"
      }
    ],
    "policeDagilimi": {
      "kasko": 5,
      "trafik": 3,
      "yangin": 7
    },
    "limitUyarilari": [
      {
        "policeTipi": "yangin",
        "mevcutLimit": 1000000,
        "onerilenLimit": 2500000,
        "aciklama": "Şirket cirosuna göre yetersiz"
      }
    ],
    "oneriler": [
      "Siber güvenlik sigortası eklenmelidir",
      "İş durması teminatı artırılmalıdır"
    ]
  }
}
```

#### Error Responses

**Unauthorized (401):**
```json
{
  "error": "Geçersiz oturum bilgisi."
}
```

**No Policies (200):**
```json
{
  "message": "Analiz edilecek poliçe bulunamadı.",
  "data": null
}
```

**Analysis Error (500):**
```json
{
  "error": "Portföy analizi sırasında bir hata oluştu."
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/ai/analyze-portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "user123"
  }'
```

---

### Analyze Single Policy

Detects "hidden mines" in policy text: exclusions, high deductibles, missing coverages.

**Endpoint:** `POST /api/analyze-policy`  
**Auth Required:** ❌  
**Timeout:** 60 seconds  
**AI Model:** Amazon Bedrock Claude Haiku 4.5

#### Request Body

```json
{
  "policyText": "string"  // min 50 chars, max 20,000 chars
}
```

#### Response (200)

```json
{
  "isSuccess": true,
  "alerts": [
    {
      "id": "uuid",
      "title": "Yüksek Tenzili Muafiyet Tespit Edildi",
      "description": "Poliçenizde %20 tenzili muafiyet bulunmaktadır. Bu, her hasarda ilk %20'yi kendinizin ödeyeceği anlamına gelir.",
      "severity": "CRITICAL",
      "financialImpact": "%20 Tenzili Muafiyet"
    },
    {
      "id": "uuid",
      "title": "Deprem İstisnası",
      "description": "Deprem kaynaklı hasarlar poliçe kapsamı dışındadır.",
      "severity": "WARNING"
    }
  ],
  "summary": "Poliçede 2 kritik risk ve 3 uyarı seviyesinde bulgu tespit edildi. Yenileme döneminde müzakere edilmesi önerilir."
}
```

#### Severity Levels

| Severity | Description |
|----------|-------------|
| `CRITICAL` | Causes claim denial or major financial loss |
| `WARNING` | Requires attention, negotiable at renewal |
| `INFO` | Informational, no immediate action required |

#### Error Responses

**Invalid Request (400):**
```json
{
  "isSuccess": false,
  "error": "Geçersiz istek formatı."
}
```

**Missing Text (400):**
```json
{
  "isSuccess": false,
  "error": "Poliçe metni (policyText) zorunludur."
}
```

**Text Too Short (400):**
```json
{
  "isSuccess": false,
  "error": "Poliçe metni çok kısa (35 karakter). Anlamlı bir analiz için en az 50 karakter gereklidir."
}
```

**Analysis Error (500):**
```json
{
  "isSuccess": false,
  "error": "Yapay zeka analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/analyze-policy \
  -H "Content-Type: application/json" \
  -d '{
    "policyText": "POLİÇE ÖZELLİKLERİ\n\nPoliçe Numarası: 123456\n..."
  }'
```

---

## Admin

### Admin Authentication

HMAC-SHA256 based admin login (replaces base64 token system).

**Endpoint:** `POST /api/admin/auth`  
**Auth Required:** ❌  
**Brute-Force Protection:** 5 attempts per 15 minutes

#### Request Body

```json
{
  "username": "string",
  "password": "string"
}
```

#### Response (200)

```json
{
  "success": true,
  "token": "v1:admin:1715426400:hmac-signature"
}
```

#### Token Details

- **Format:** Base64URL encoded `version:username:timestamp:hmac`
- **TTL:** 4 hours
- **Verification:** Timing-safe HMAC comparison
- **Storage:** Use in `X-Admin-Token` header for admin endpoints

#### Error Responses

**Invalid Credentials (401):**
```json
{
  "success": false,
  "error": "Kullanıcı adı veya şifre hatalı."
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "error": "Çok fazla başarısız deneme. 15 dakika bekleyin."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Sunucu yapılandırma hatası."
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure-password"
  }'
```

---

### Tenant Management

Create Firebase Auth users and Firestore tenant records.

**Endpoint:** `POST /api/admin/tenants`  
**Auth Required:** ✅ (Admin token via `X-Admin-Token`)

#### Request Body

```json
{
  "action": "create_user",
  "email": "string",
  "password": "string",
  "companyName": "string"
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "uid": "firebase-user-id"
  },
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Error Responses

**Unauthorized (401):**
```json
{
  "success": false,
  "error": "Yetkisiz erişim.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

**User Creation Failed (400):**
```json
{
  "success": false,
  "error": "Email already exists",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

**Admin SDK Not Configured (200):**
```json
{
  "success": false,
  "error": "Firebase Admin SDK credentials not configured. Please create user manually in Firebase Console and then add tenant record.",
  "manualSetupRequired": true,
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Example (cURL)

```bash
curl -X POST https://your-domain.com/api/admin/tenants \
  -H "X-Admin-Token: <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_user",
    "email": "company@example.com",
    "password": "SecurePassword123",
    "companyName": "ACME Corp"
  }'
```

---

## Automation

### Policy Expiration Automation

Batch update expired policies (cron job).

**Endpoint:** `GET /api/automation/policies`  
**Auth Required:** ✅ (CRON_SECRET via Bearer token)  
**Trigger:** Vercel Cron / External scheduler

#### Request Headers

```http
Authorization: Bearer <CRON_SECRET>
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  },
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Business Logic

1. Query policies where `status=active` AND `endDate < today`
2. Batch update `status=expired`
3. Use Firestore batch writes (max 500/batch)
4. Retry mechanism: 3 attempts with exponential backoff

#### Error Response (401)

```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Error Response (500)

```json
{
  "success": false,
  "error": "Poliçe güncelleme işlemi başarısız oldu.",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/automation/policies",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### Example (cURL)

```bash
curl -X GET https://your-domain.com/api/automation/policies \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

### Email Reminder Automation

Send policy expiration reminders (30, 15, 7 days before).

**Endpoint:** `GET /api/automation/reminders`  
**Auth Required:** ✅ (CRON_SECRET via Bearer token)  
**Trigger:** Daily cron (recommended: 8:00 AM)

#### Request Headers

```http
Authorization: Bearer <CRON_SECRET>
```

#### Response (200)

```json
{
  "success": true,
  "message": "12 adet hatırlatma e-postası gönderildi.",
  "skipped": 2,
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

#### Business Logic

1. Fetch all active policies
2. Calculate days until expiration
3. Send email if `daysLeft` in [30, 15, 7]
4. Respect user's `emailNotifications` preference
5. Use HTML email template with dashboard link

#### Email Template Variables

- `userName`: User's display name
- `policyType`: Policy type label (Turkish)
- `company`: Insurance company name
- `daysLeft`: Days remaining (30, 15, or 7)
- `endDate`: Formatted end date
- `dashboardUrl`: Direct link to policy details

#### Error Response (401)

```json
{
  "error": "Yetkisiz erişim."
}
```

#### Error Response (500)

```json
{
  "error": "Otomasyon işlemi başarısız oldu."
}
```

#### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/automation/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

#### Example (cURL)

```bash
curl -X GET https://your-domain.com/api/automation/reminders \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## Data Models

### Policy

```typescript
{
  id: string;
  tenantId: string;
  
  // Core
  policyType: "kasko" | "trafik" | "yangin" | "saglik" | 
              "isyeri" | "nakliyat" | "muhendislik" | 
              "sorumluluk" | "ferdi_kaza" | "dask" | "diger";
  policyNumber: string;
  insuranceCompany: string;
  agencyName: string;
  agencyCode?: string;
  
  // Dates (ISO 8601)
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Parties
  policyHolder: {
    name: string;
    taxId: string;
    address: string;
  };
  insured: {
    name: string;
    taxId: string;
    address: string;
  };
  
  // Coverage
  coverages: [
    {
      name: string;
      amount: number;
      currency: "TRY" | "USD" | "EUR";
      deductible?: number;
      deductibleType?: "percentage" | "amount";
    }
  ];
  
  // Premium
  premium: {
    netPremium: number;
    bsmv: number;
    thgf: number;
    totalPremium: number;
    currency: "TRY" | "USD" | "EUR";
    paymentType: "cash" | "installment";
    installmentCount?: number;
    installmentAmount?: number;
  };
  
  // AI
  aiExtraction: {
    confidenceScore: number;    // 0-100
    extractedAt: string;
    model: string;
    manuallyReviewed: boolean;
  };
  
  // Document
  documents: {
    originalPdf: string;
    storagePath?: string;
    pageCount: number;
    fileName: string;
    fileSize: number;           // bytes
  };
  
  // Status
  status: "active" | "expired" | "cancelled" | "pending_review";
  tags: string[];
  department?: string;
  notes?: string;
}
```

### Risk Alert

```typescript
{
  id: string;                     // UUID
  title: string;                  // max 120 chars
  description: string;            // max 800 chars
  severity: "CRITICAL" | "WARNING" | "INFO";
  financialImpact?: string;       // max 200 chars
}
```

### Auth Context

```typescript
{
  tenantId: string;               // Multi-tenant isolation
  uid: string;                    // Firebase user ID
  email: string;
  role: string;                   // "admin" | "user"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": "General validation error message",
  "fieldErrors": [
    {
      "field": "path.to.field",
      "message": "Field-specific error message"
    }
  ],
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (details hidden for security) |

### Error Messages

All error messages are in Turkish for end-user clarity. Internal errors are logged separately with full stack traces but return generic messages to clients (security best practice).

---

## Best Practices

### Security

1. **Never expose internal error details** in API responses
2. **Always validate input** with Zod schemas
3. **Use timing-safe comparisons** for sensitive data
4. **Sanitize file names** to prevent path traversal
5. **Verify magic bytes** for file uploads (don't trust MIME types)
6. **Rate limit** all endpoints to prevent abuse
7. **Audit log** sensitive operations (admin actions, auth events)

### Performance

1. **Use Firestore batch writes** for bulk operations (max 500/batch)
2. **Implement pagination** for list endpoints
3. **Cache frequently accessed data** (Redis recommended)
4. **Optimize AI prompts** to reduce token costs
5. **Use retry mechanisms** for external services

### Multi-Tenancy

1. **Always extract tenantId from JWT** (never trust client)
2. **Query Firestore with tenantId filter** for data isolation
3. **Validate tenantId length** (max 128 chars)
4. **Use tenant-scoped indexes** for performance

### AI/ML

1. **Truncate long inputs** to control costs (max 20k chars)
2. **Validate AI output** before returning to client
3. **Provide fallback responses** if AI fails
4. **Monitor confidence scores** and flag low-confidence results
5. **Use Claude Haiku** for cost-effective operations

---

## Environment Variables

Required environment variables for API functionality:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# AWS Bedrock (AI)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0

# Admin Auth
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_TOKEN_SECRET=

# Automation
CRON_SECRET=

# Email (Optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# App
NEXT_PUBLIC_APP_URL=https://app.sigortacuzdani.com
```

---

## Testing

### Example Test Scenarios

#### 1. Create Policy Flow
```bash
# Step 1: Upload PDF
UPLOAD=$(curl -X POST http://localhost:3000/api/policies/upload \
  -F "file=@sample.pdf")

# Step 2: Extract data
POLICY_DATA=$(echo $UPLOAD | jq '.data')

# Step 3: Get Firebase token
TOKEN=$(firebase auth:token)

# Step 4: Create policy
curl -X POST http://localhost:3000/api/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POLICY_DATA"
```

#### 2. Admin User Creation
```bash
# Step 1: Admin login
TOKEN=$(curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}' | jq -r '.token')

# Step 2: Create tenant
curl -X POST http://localhost:3000/api/admin/tenants \
  -H "X-Admin-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_user",
    "email": "test@example.com",
    "password": "Password123",
    "companyName": "Test Corp"
  }'
```

---

## Changelog

### Version 1.0.0 (2026-05-03)

- Initial API documentation
- All endpoints documented with request/response schemas
- Authentication flow documented
- Rate limiting details
- Error handling standards
- Best practices guide

---

## Support

For technical support or questions:

- **GitHub Issues**: [github.com/your-repo/issues]
- **Email**: support@sigortacuzdani.com
- **Documentation**: [docs.sigortacuzdani.com]

---

**Generated by:** Claude Sonnet 4.5  
**Date:** 2026-05-03
