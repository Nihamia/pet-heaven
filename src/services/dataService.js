import { getFirestoreClient, isFirebaseConfigured } from './firebaseClient.js';

const submissionTypes = {
  adoption_requests: 'adopt',
  release_requests: 'release',
  contact_messages: 'contact',
};

function localStorageKey(collectionName) {
  return `pet-heaven-${collectionName}`;
}

// Keep form feedback responsive if a configured remote service does not answer quickly.
export async function waitForRemote(promise, timeoutMs = 8000) {
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

// Keep one browser record per reference, even if the same record is saved again.
export function saveBrowserRecord(collectionName, record, remoteResult = {}) {
  const id = remoteResult.id ?? record.referenceId;
  let browserSaved = false;
  try {
    const localRecords = readLocalCollection(collectionName);
    window.localStorage.setItem(
      localStorageKey(collectionName),
      JSON.stringify([
        { id, ...record },
        ...localRecords.filter((item) => (
          item?.referenceId !== record.referenceId || item?.userId !== record.userId
        )),
      ]),
    );
    browserSaved = true;
  } catch {
    if (!remoteResult.saved) throw new Error('We could not save this submission. Check browser storage and try again.');
  }

  return {
    id,
    createdAt: record.createdAt,
    browserSaved,
    storage: remoteResult.saved ? (browserSaved ? 'Firestore and this browser' : 'Firestore') : 'this browser',
    firestoreSaved: Boolean(remoteResult.saved),
    firestorePending: Boolean(remoteResult.timedOut),
  };
}

// Save a request to Firestore when available and keep a browser copy for offline use.
export async function saveSubmission(collectionName, record) {
  if (!Object.hasOwn(submissionTypes, collectionName)) throw new Error('This submission type is not supported.');

  const createdAt = new Date().toISOString();
  const stampedRecord = {
    ...record,
    referenceNo: record.referenceId,
    type: submissionTypes[collectionName],
    status: collectionName === 'adoption_requests' ? 'Submitted' : 'New',
    createdAt,
    updatedAt: createdAt,
    updatedBy: '',
  };
  let remoteResult;
  if (isFirebaseConfigured) {
    const remoteWrite = (async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      const document = await firestoreSdk.addDoc(firestoreSdk.collection(firestore, collectionName), stampedRecord);
      return { id: document.id, saved: true };
    })().catch((error) => ({ saved: false, code: error?.code }));
    remoteResult = await waitForRemote(remoteWrite);
    if (collectionName === 'adoption_requests' && ['permission-denied', 'unauthenticated'].includes(remoteResult.code)) {
      throw Object.assign(
        new Error('Firestore could not accept this request for your account. Check that you are signed in and try again.'),
        { code: remoteResult.code },
      );
    }
  }
  return saveBrowserRecord(collectionName, stampedRecord, remoteResult);
}

export async function getAdoptionRequests(userId) {
  if (!userId) return { records: [], source: 'local' };

  const localRecords = readLocalCollection('adoption_requests').filter((record) => record?.userId === userId);
  const newestFirst = (first, second) => String(second.createdAt ?? '').localeCompare(String(first.createdAt ?? ''));
  if (isFirebaseConfigured) {
    const read = (async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      const collection = firestoreSdk.collection(firestore, 'adoption_requests');
      const ownRequests = firestoreSdk.query(collection, firestoreSdk.where('userId', '==', userId));
      const snapshot = await firestoreSdk.getDocs(ownRequests);
      return { records: snapshot.docs.map((document) => document.data()) };
    })().catch(() => ({}));
    const result = await waitForRemote(read);
    if (result.records) {
      const remoteRecords = result.records.filter((record) => record?.userId === userId);
      const remoteReferences = new Set(remoteRecords.map(({ referenceId }) => referenceId));
      const browserOnly = localRecords.filter(({ referenceId }) => !remoteReferences.has(referenceId));
      return {
        records: [...remoteRecords, ...browserOnly.map((record) => ({ ...record, localOnly: true }))].sort(newestFirst),
        source: 'firestore',
      };
    }
  }
  return { records: localRecords.sort(newestFirst), source: 'local' };
}
