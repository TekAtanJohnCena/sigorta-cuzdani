// ============================================
// Firestore Mocks for Integration Tests
// Mocks Firebase Client SDK and Admin SDK
// ============================================

import { Timestamp } from 'firebase/firestore';

// ============================================
// Mock Data Store (in-memory)
// ============================================
const mockStore = new Map<string, Map<string, Record<string, unknown>>>();

export function resetMockStore() {
  mockStore.clear();
}

export function getMockCollection(collectionName: string): Map<string, Record<string, unknown>> {
  if (!mockStore.has(collectionName)) {
    mockStore.set(collectionName, new Map());
  }
  return mockStore.get(collectionName)!;
}

// ============================================
// Mock Firebase Client SDK
// ============================================

export const mockAddDoc = jest.fn(async (collectionRef: Record<string, unknown>, data: Record<string, unknown>) => {
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

export const mockGetDoc = jest.fn(async (docRef: Record<string, unknown>) => {
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

export const mockGetDocs = jest.fn(async (query: Record<string, unknown>) => {
  // Support both Client SDK and Admin SDK query structures
  const collectionName = query._collectionName || query._query?.path?.segments?.[0] || 'policies';

  // If this is an Admin SDK query with filters/orderBy/limit, delegate to its .get() method
  if (query._collectionName && typeof query.get === 'function') {
    return query.get();
  }

  // Otherwise, simple collection fetch (Client SDK style)
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

export const mockUpdateDoc = jest.fn(async (docRef: Record<string, unknown>, data: Record<string, unknown>) => {
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

export const mockDeleteDoc = jest.fn(async (docRef: Record<string, unknown>) => {
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
  get: jest.fn(async (docRef: Record<string, unknown>) => {
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
  set: jest.fn((docRef: Record<string, unknown>, data: Record<string, unknown>, options?: Record<string, unknown>) => {
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

export const mockRunTransaction = jest.fn(async (db: Record<string, unknown>, updateFunction: (t: typeof mockTransaction) => Promise<unknown>) => {
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
const batchOperations: Record<string, unknown>[] = [];

export const mockBatch = {
  set: jest.fn((docRef: Record<string, unknown>, data: Record<string, unknown>) => {
    batchOperations.push({ type: 'set', docRef, data });
  }),
  update: jest.fn((docRef: Record<string, unknown>, data: Record<string, unknown>) => {
    batchOperations.push({ type: 'update', docRef, data });
  }),
  delete: jest.fn((docRef: Record<string, unknown>) => {
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
// Mock Admin Firestore - Full Query Builder Support
// ============================================

interface MockFilter {
  field: string;
  op: string;
  value: unknown;
}

interface MockOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

interface MockAdminQuery {
  _collectionName: string;
  _filters: MockFilter[];
  _orderBy?: MockOrderBy;
  _limit?: number;
  where(field: string, op: string, value: unknown): MockAdminQuery;
  orderBy(field: string, direction?: 'asc' | 'desc'): MockAdminQuery;
  limit(count: number): MockAdminQuery;
  get(): Promise<unknown>;
}

function createMockAdminQuery(
  collectionName: string,
  filters: MockFilter[] = [],
  orderBy?: MockOrderBy,
  limitCount?: number
): MockAdminQuery {
  return {
    _collectionName: collectionName,
    _filters: filters,
    _orderBy: orderBy,
    _limit: limitCount,

    where(field: string, op: string, value: unknown) {
      return createMockAdminQuery(
        collectionName,
        [...this._filters, { field, op, value }],
        this._orderBy,
        this._limit
      );
    },

    orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
      return createMockAdminQuery(
        collectionName,
        this._filters,
        { field, direction },
        this._limit
      );
    },

    limit(count: number) {
      return createMockAdminQuery(
        collectionName,
        this._filters,
        this._orderBy,
        count
      );
    },

    async get() {
      const collection = getMockCollection(collectionName);
      let items = Array.from(collection.entries()).map(([id, data]) => ({ id, ...data }));

      // Apply filters
      for (const filter of this._filters) {
        items = items.filter(item => {
          const itemValue = item[filter.field];
          switch (filter.op) {
            case '==': return itemValue === filter.value;
            case '!=': return itemValue !== filter.value;
            case '<': return itemValue < filter.value;
            case '<=': return itemValue <= filter.value;
            case '>': return itemValue > filter.value;
            case '>=': return itemValue >= filter.value;
            case 'in': return Array.isArray(filter.value) && filter.value.includes(itemValue);
            case 'array-contains': return Array.isArray(itemValue) && itemValue.includes(filter.value);
            default: return true;
          }
        });
      }

      // Apply orderBy
      if (this._orderBy) {
        items.sort((a, b) => {
          const aVal = a[this._orderBy!.field];
          const bVal = b[this._orderBy!.field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return this._orderBy!.direction === 'asc' ? comparison : -comparison;
        });
      }

      // Apply limit
      if (this._limit) {
        items = items.slice(0, this._limit);
      }

      return {
        docs: items.map(item => ({
          id: item.id,
          data: () => {
            const { id: _id, ...rest } = item;
            return rest;
          },
        })),
        empty: items.length === 0,
        size: items.length,
      };
    },
  };
}

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
  async set(data: Record<string, unknown>, options?: { merge?: boolean }) {
    const collection = getMockCollection(collectionName);
    if (options?.merge) {
      const existing = collection.get(docId) || {};
      collection.set(docId, { ...existing, ...data });
    } else {
      collection.set(docId, data);
    }
  },
  async update(data: Record<string, unknown>) {
    const collection = getMockCollection(collectionName);
    const existing = collection.get(docId) || {};
    collection.set(docId, { ...existing, ...data });
  },
  async delete() {
    const collection = getMockCollection(collectionName);
    collection.delete(docId);
  },
}));

export const mockAdminCollection = jest.fn((collectionName: string) => ({
  async add(data: Record<string, unknown>) {
    const collection = getMockCollection(collectionName);
    const id = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    collection.set(id, {
      ...data,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    });
    return { id };
  },

  doc(docId: string) {
    return mockAdminDoc(collectionName, docId);
  },

  where(field: string, op: string, value: unknown) {
    return createMockAdminQuery(collectionName, [{ field, op, value }]);
  },

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    return createMockAdminQuery(collectionName, [], { field, direction });
  },

  limit(count: number) {
    return createMockAdminQuery(collectionName, [], undefined, count);
  },

  async get() {
    return createMockAdminQuery(collectionName).get();
  },
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

export function seedMockPolicy(tenantId: string, policyData: Record<string, unknown>) {
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
