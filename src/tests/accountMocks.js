import { vi } from 'vitest';
import pets from '../data/pets.json';

export const mockUser = { uid: 'uid-jamie', email: 'jamie@example.com' };
export const mockMember = {
  uid: mockUser.uid,
  memberId: 'PH-2026-JA12',
  firstName: 'Jamie',
  fullName: 'Jamie Tan',
  phone: '81234567',
  address: '10 River Valley Road',
  roles: ['volunteer'],
  status: 'Active',
  ageConfirmed: true,
  dataConsent: true,
  newsletter: false,
  createdAt: '2026-11-09T02:00:00.000Z',
};

let activeUser = null;
const authListeners = new Set();
export const mockDocuments = new Map();

export function changeMockUser(user) {
  activeUser = user;
  for (const listener of authListeners) listener(user);
}

function signIn(email) {
  const user = { uid: mockUser.uid, email: email.trim().toLowerCase() };
  changeMockUser(user);
  return user;
}

export const mockAuthService = {
  accountsAvailable: true,
  register: vi.fn(async (email) => signIn(email)),
  login: vi.fn(async (email) => signIn(email)),
  logout: vi.fn(async () => changeMockUser(null)),
  resetPassword: vi.fn(async () => undefined),
  onAuthChange: vi.fn((listener) => {
    authListeners.add(listener);
    listener(activeUser);
    return () => authListeners.delete(listener);
  }),
};

const firestore = {};
export const mockFirestoreSdk = {
  doc: vi.fn((_database, collection, id) => `${collection}/${id}`),
  collection: vi.fn((_database, name) => name),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  query: vi.fn((collection, ...filters) => ({ collection, filters })),
  getDoc: vi.fn(async (path) => ({
    exists: () => mockDocuments.has(path),
    data: () => mockDocuments.get(path),
  })),
  setDoc: vi.fn(async (path, record) => {
    mockDocuments.set(path, record);
  }),
  updateDoc: vi.fn(async (path, changes) => {
    if (!mockDocuments.has(path)) throw new Error('Profile not found');
    mockDocuments.set(path, { ...mockDocuments.get(path), ...changes });
  }),
  addDoc: vi.fn(async (collection, record) => {
    const id = `record-${mockDocuments.size + 1}`;
    mockDocuments.set(`${collection}/${id}`, record);
    return { id };
  }),
  getDocs: vi.fn(async (target) => {
    if (target === 'pets') {
      return { empty: false, docs: pets.map((pet) => ({ id: pet.id, data: () => pet })) };
    }
    const { collection, filters = [] } = typeof target === 'string'
      ? { collection: target }
      : target;
    const prefix = `${collection}/`;
    const docs = [...mockDocuments.entries()]
      .filter(([path, record]) => path.startsWith(prefix)
        && filters.every(({ field, operator, value }) => operator === '==' && record[field] === value))
      .map(([path, record]) => ({ id: path.slice(prefix.length), data: () => record }));
    return { empty: docs.length === 0, docs };
  }),
};

function adminSnapshot(query) {
  const target = typeof query === 'string' ? { collection: query, constraints: [] } : query;
  const prefix = target.collection + '/';
  const ordered = target.constraints.some(({ type }) => type === 'orderBy');
  const limit = target.constraints.find(({ type }) => type === 'limit')?.count;
  return {
    metadata: { fromCache: false },
    docs: [...mockDocuments.entries()]
      .filter(([path, data]) => path.startsWith(prefix) && (!ordered || Object.hasOwn(data, 'createdAt')))
      .slice(0, limit)
      .map(([path, data]) => ({ id: path.slice(prefix.length), data: () => data })),
  };
}

function applyAdminWrite(path, data, merge) {
  const current = merge ? mockDocuments.get(path) ?? {} : {};
  const resolved = Object.fromEntries(Object.entries(data).map(([key, value]) => [
    key, value?.kind === 'arrayUnion' ? [...(current[key] ?? []), ...value.values] : value,
  ]));
  mockDocuments.set(path, { ...current, ...resolved });
}

export const mockAdminTransactions = [];

export const mockAdminFirestoreSdk = {
  doc: vi.fn((_database, collection, id) => collection + '/' + id),
  setDoc: vi.fn(async (path, data, options) => applyAdminWrite(path, data, options?.merge)),
  arrayUnion: vi.fn((...values) => ({ kind: 'arrayUnion', values })),
  runTransaction: vi.fn(async (_database, execute) => {
    const writes = [];
    const transaction = {
      get: vi.fn(async (path) => ({ exists: () => mockDocuments.has(path), data: () => mockDocuments.get(path) })),
      update: vi.fn((path, data) => { writes.push([path, data, true]); }),
      set: vi.fn((path, data, options) => { writes.push([path, data, options?.merge]); }),
    };
    mockAdminTransactions.push(transaction);
    const result = await execute(transaction);
    for (const write of writes) applyAdminWrite(...write);
    return result;
  }),
  collection: vi.fn((_database, name) => name),
  orderBy: vi.fn((field, direction) => ({ type: 'orderBy', field, direction })),
  limit: vi.fn((count) => ({ type: 'limit', count })),
  query: vi.fn((collection, ...constraints) => ({ collection, constraints })),
  onSnapshot: vi.fn((target, _options, next) => {
    next(adminSnapshot(target));
    return vi.fn();
  }),
  getDocsFromServer: vi.fn(async (target) => adminSnapshot(target)),
};

export const mockFirebaseClient = {
  isFirebaseConfigured: true,
  getFirestoreClient: vi.fn(async () => ({ firestore, firestoreSdk: mockFirestoreSdk })),
  getAdminFirestoreClient: vi.fn(async () => ({ firestore, firestoreSdk: mockAdminFirestoreSdk })),
};

export function resetAccountMocks() {
  authListeners.clear();
  activeUser = null;
  mockDocuments.clear();
  mockAdminTransactions.length = 0;
  for (const mock of Object.values(mockAuthService)) {
    if (typeof mock === 'function') mock.mockReset();
  }
  for (const mock of Object.values(mockFirestoreSdk)) mock.mockReset();
  for (const mock of Object.values(mockAdminFirestoreSdk)) mock.mockReset();
  mockFirebaseClient.getFirestoreClient.mockReset();
  mockFirebaseClient.getAdminFirestoreClient.mockReset();
}

export function seedSignedInMember() {
  mockDocuments.set(`members/${mockUser.uid}`, { ...mockMember });
  changeMockUser(mockUser);
}
