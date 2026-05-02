// ============================================
// Firestore Mocks for Integration Tests
// Mocks Firebase Client SDK and Admin SDK
// ============================================

import { DocumentSnapshot, Timestamp } from 'firebase/firestore';

// ============================================
// Mock Data Store (in-memory)
// ============================================
const mockStore = new Map<string, Map<string, any>>();

export function resetMockStore() {
  mockStore.clear();
}

export function getMockCollection(collectionName: string): Map<string, any> {
  if (!mockStore.has(collectionName)) {
    mockStore.set(collectionName, new Map());
  }
  return mockStore.get(collectionName)!;
}

// ============================================
// Mock Firebase Client SDK
// ============================================

export const mockAddDoc = jest.fn(async (collectionRef: any, data: any) => {
  const collectionName = collectionRef._key?.path?.segments?.[0] || 'policies';
  const collection = getMockCollection(collectionName);
  const id = `mock-doc-${Date.now()}-${Math.random()}`;

  collection.set(id, {
    ...data,
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || Timestamp.now(),
  });

  return { id };
});

export const mockGetDoc = jest.fn(async (docRef: any) => {
  const collectionName = docRef._key?.path?.segments?.[0] || 'policies';
  const docId = docRef._key?.path?.segments?.[1];
  const collection = getMockCollection(collectionName);
  const data = collection.get(docId);

  return {
    exists: () => !!data,
    id: docId,
    data: () => data,
  };
});

export const mockGetDocs = jest.fn(async (query: any) => {
  const collectionName = query._query?.path?.segments?.[0] || 'policies';
  const collection = getMockCollection(collectionName);

  const docs = Array.from(collection.entries()).map(([id, data]) => ({
    id,
    data: () => data,
  }));

  return {
    docs,
    empty: docs.length === 0,
  };
});

export const mockUpdateDoc = jest.fn(async (docRef: any, data: any) => {
  const collectionName = docRef._key?.path?.segments?.[0] || 'policies';
  const docId = docRef._key?.path?.segments?.[1];
  const collection = getMockCollection(collectionName);

  const existing = collection.get(docId) || {};
  collection.set(docId, {
    ...existing,
    ...data,
    updatedAt: Timestamp.now(),
  });
});

export const mockDeleteDoc = jest.fn(async (docRef: any) => {
  const collectionName = docRef._key?.path?.segments?.[0] || 'policies';
  const docId = docRef._key?.path?.segments?.[1];
  const collection = getMockCollection(collectionName);
  collection.delete(docId);
});

// ============================================
// Mock Transaction
// ============================================
let transactionCommitted = false;
let transactionRolledBack = false;

export const mockTransaction = {
  get: jest.fn(async (docRef: any) => {
    const collectionName = docRef._key?.path?.segments?.[0] || 'portfolioMetadata';
    const docId = docRef._key?.path?.segments?.[1];
    const collection = getMockCollection(collectionName);
    const data = collection.get(docId);

    return {
      exists: () => !!data,
      data: () => data,
      id: docId,
    };
  }),
  set: jest.fn((docRef: any, data: any, options?: any) => {
    // Store operations for commit
    const collectionName = docRef._key?.path?.segments?.[0] || 'policies';
    const docId = docRef.id;
    const collection = getMockCollection(collectionName);

    if (options?.merge) {
      const existing = collection.get(docId) || {};
      collection.set(docId, { ...existing, ...data });
    } else {
      collection.set(docId, data);
    }
  }),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockRunTransaction = jest.fn(async (db: any, updateFunction: any) => {
  transactionCommitted = false;
  transactionRolledBack = false;

  try {
    const result = await updateFunction(mockTransaction);
    transactionCommitted = true;
    return result;
  } catch (error) {
    transactionRolledBack = true;
    throw error;
  }
});

export function wasTransactionCommitted() {
  return transactionCommitted;
}

export function wasTransactionRolledBack() {
  return transactionRolledBack;
}

// ============================================
// Mock Batch Write
// ============================================
const batchOperations: any[] = [];

export const mockBatch = {
  set: jest.fn((docRef: any, data: any) => {
    batchOperations.push({ type: 'set', docRef, data });
  }),
  update: jest.fn((docRef: any, data: any) => {
    batchOperations.push({ type: 'update', docRef, data });
  }),
  delete: jest.fn((docRef: any) => {
    batchOperations.push({ type: 'delete', docRef });
  }),
  commit: jest.fn(async () => {
    // Execute all batch operations
    for (const op of batchOperations) {
      const collectionName = op.docRef._key?.path?.segments?.[0] || 'policies';
      const docId = op.docRef.id;
      const collection = getMockCollection(collectionName);

      if (op.type === 'set') {
        collection.set(docId, op.data);
      } else if (op.type === 'update') {
        const existing = collection.get(docId) || {};
        collection.set(docId, { ...existing, ...op.data });
      } else if (op.type === 'delete') {
        collection.delete(docId);
      }
    }
    batchOperations.length = 0;
  }),
};

export const mockWriteBatch = jest.fn(() => mockBatch);

// ============================================
// Mock Firebase Admin SDK (for withAuth)
// ============================================

export const mockVerifyIdToken = jest.fn(async (token: string) => {
  if (token === 'invalid-token') {
    throw new Error('Invalid token');
  }
  if (token === 'expired-token') {
    throw new Error('auth/id-token-expired');
  }

  // Parse mock token format: "valid-token-{uid}" or "Bearer valid-token-{uid}"
  // Extract everything after "valid-token-"
  const tokenWithoutBearer = token.replace('Bearer ', '');
  const prefix = 'valid-token-';
  if (!tokenWithoutBearer.startsWith(prefix)) {
    throw new Error('Invalid token format');
  }

  const uid = tokenWithoutBearer.substring(prefix.length) || 'test-uid';
  const email = `${uid}@test.com`;

  return {
    uid,
    email,
    email_verified: true,
  };
});

export const mockAdminAuth = {
  verifyIdToken: mockVerifyIdToken,
};

export const mockGetAuth = jest.fn(() => mockAdminAuth);

// ============================================
// Mock Admin Firestore
// ============================================

export const mockAdminDoc = jest.fn((collectionName: string, docId: string) => ({
  _key: { path: { segments: [collectionName, docId] } },
  id: docId,
  async get() {
    const collection = getMockCollection(collectionName);
    const data = collection.get(docId);
    return {
      exists: !!data,
      data: () => data,
      id: docId,
    };
  },
}));

export const mockAdminCollection = jest.fn((collectionName: string) => ({
  doc: (docId: string) => mockAdminDoc(collectionName, docId),
}));

export const mockAdminDb = {
  collection: mockAdminCollection,
};

export const mockGetFirestore = jest.fn(() => mockAdminDb);

// ============================================
// Mock Admin App
// ============================================

export const mockAdminApp = {
  name: 'mock-admin-app',
};

export const mockGetAdminApp = jest.fn(() => mockAdminApp);

// ============================================
// Setup Seed Data for Tests
// ============================================

export function seedMockUser(uid: string, tenantId: string, role = 'admin') {
  const usersCollection = getMockCollection('users');
  usersCollection.set(uid, {
    tenantId,
    role,
    email: `${uid}@test.com`,
    createdAt: Timestamp.now(),
  });
}

export function seedMockPolicy(tenantId: string, policyData: any) {
  const policiesCollection = getMockCollection('policies');
  const id = `policy-${Date.now()}-${Math.random()}`;

  policiesCollection.set(id, {
    ...policyData,
    tenantId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return id;
}

// ============================================
// Mock Rate Limiter Reset (for withAuth tests)
// ============================================

export function resetRateLimiter() {
  // This would need to be implemented in withAuth.ts
  // For testing purposes, we'll mock it
  jest.clearAllMocks();
}
