import fallbackPets from '../data/pets.json';
import { getFirestoreClient, isFirebaseConfigured } from './firebaseClient.js';

const allowedCollections = new Set([
  'members',
  'adoption_requests',
  'release_requests',
  'contact_messages',
]);

function localStorageKey(collectionName) {
  return `pet-heaven-${collectionName}`;
}

// Keep form feedback responsive if a configured remote service does not answer quickly.
async function waitForRemote(promise, timeoutMs = 8000) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = globalThis.setTimeout(() => resolve({ timedOut: true }), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

// Read a local collection safely, returning an empty list for missing or damaged browser data.
export function readLocalCollection(collectionName) {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(localStorageKey(collectionName)) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

// Save a form record to Firestore when available and keep a browser copy as the offline fallback.
export async function saveSubmission(collectionName, record) {
  if (!allowedCollections.has(collectionName)) throw new Error('This submission type is not supported.');

  const stampedRecord = { ...record, createdAt: new Date().toISOString() };
  let remoteId = '';
  let remoteSaved = false;
  let firestorePending = false;

  if (isFirebaseConfigured) {
    const remoteWrite = (async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      const document = await firestoreSdk.addDoc(firestoreSdk.collection(firestore, collectionName), stampedRecord);
      return { id: document.id, saved: true };
    })().catch(() => ({ saved: false }));
    const remoteResult = await waitForRemote(remoteWrite);
    remoteId = remoteResult.id ?? '';
    remoteSaved = Boolean(remoteResult.saved);
    firestorePending = Boolean(remoteResult.timedOut);
  }

  const localId = record.referenceId || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const localRecords = readLocalCollection(collectionName);
    window.localStorage.setItem(
      localStorageKey(collectionName),
    JSON.stringify([
      { id: remoteId || localId, ...stampedRecord },
      ...localRecords.filter((item) => item.referenceId !== record.referenceId),
    ]),
    );
  } catch {
    if (!remoteSaved) throw new Error('We could not save this submission. Check browser storage and try again.');
  }

  return {
    id: remoteId || localId,
    storage: remoteSaved ? 'Firestore and this browser' : 'this browser',
    firestoreSaved: remoteSaved,
    firestorePending,
  };
}

// Look up a same-browser member using their email and generated member ID without storing passwords.
export function findLocalMember(email, memberId) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const normalizedMemberId = String(memberId ?? '').trim().toUpperCase();
  return readLocalCollection('members').find((member) => (
    String(member.email ?? '').trim().toLowerCase() === normalizedEmail
    && String(member.memberId ?? '').trim().toUpperCase() === normalizedMemberId
  )) ?? null;
}

// Load Firestore pet profiles when configured, otherwise keep the bundled JSON profiles available.
export async function getPetRecords() {
  if (!isFirebaseConfigured) return { pets: fallbackPets, source: 'local', message: '' };

  try {
    const remoteRead = (async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      return firestoreSdk.getDocs(firestoreSdk.collection(firestore, 'pets'));
    })();
    const readResult = await waitForRemote(remoteRead);
    if (readResult.timedOut) {
      return {
        pets: fallbackPets,
        source: 'local',
        message: 'Firestore is taking too long to respond, so sample profiles are shown for now.',
      };
    }
    const snapshot = readResult;
    if (!snapshot.empty) {
      return {
        pets: snapshot.docs.map((item) => ({ ...item.data(), id: item.id })),
        source: 'firestore',
        message: '',
      };
    }
    return {
      pets: fallbackPets,
      source: 'local',
      message: 'No Firestore pet records were found yet, so sample profiles are shown.',
    };
  } catch {
    return {
      pets: fallbackPets,
      source: 'local',
      message: 'Pet records could not be loaded from Firestore, so sample profiles are shown.',
    };
  }
}

// Seed the Firestore pets collection with the bundled sample profiles from a developer-only setup.
export async function seedPetRecords() {
  if (!isFirebaseConfigured) throw new Error('Add Firebase settings to your local environment file before seeding.');

  const { firestore, firestoreSdk } = await getFirestoreClient();
  await Promise.all(fallbackPets.map((pet) => (
    firestoreSdk.setDoc(firestoreSdk.doc(firestore, 'pets', String(pet.id)), pet)
  )));
  return fallbackPets.length;
}
