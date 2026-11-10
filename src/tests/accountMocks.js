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

export const mockFirebaseClient = {
  isFirebaseConfigured: true,
  getFirestoreClient: vi.fn(async () => ({ firestore, firestoreSdk: mockFirestoreSdk })),
};

export function resetAccountMocks() {
  authListeners.clear();
  activeUser = null;
  mockDocuments.clear();
  for (const mock of Object.values(mockAuthService)) {
    if (typeof mock === 'function') mock.mockReset();
  }
  for (const mock of Object.values(mockFirestoreSdk)) mock.mockReset();
  mockFirebaseClient.getFirestoreClient.mockReset();
}

export function seedSignedInMember() {
  mockDocuments.set(`members/${mockUser.uid}`, { ...mockMember });
  changeMockUser(mockUser);
}
