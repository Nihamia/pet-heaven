import { dashboardTabs } from '../data/adminDashboard.js';
import { getAdminFirestoreClient } from './firebaseClient.js';

const readLimit = 500;
const allowedCollections = new Set(dashboardTabs.map((tab) => tab.collection));

function recordsFrom(snapshot) {
  return snapshot.docs.map((document) => ({ ...document.data(), id: document.id }));
}

export function subscribeToSubmissions(collectionName, onData, onError) {
  if (!allowedCollections.has(collectionName)) throw new Error('Unknown submission collection.');

  let active = true;
  let failed = false;
  let unsubscribe;
  let orderedRecords;
  let missingRecords = [];
  let missingReadFailed = false;
  const timeout = setTimeout(() => {
    if (active && !failed && !orderedRecords) onError(new Error('The server did not respond.'));
  }, 12000);

  function emit() {
    if (!active || failed || !orderedRecords) return;
    const ids = new Set(orderedRecords.map(({ id }) => id));
    onData({
      records: [...orderedRecords, ...missingRecords.filter(({ id }) => !ids.has(id))],
      missingReadFailed,
    });
  }

  function handleError(error) {
    if (!active) return;
    failed = true;
    clearTimeout(timeout);
    onError(error);
  }

  getAdminFirestoreClient().then((client) => {
    if (!active) return;
    if (!client) throw new Error('Firestore is unavailable.');
    const { firestore, firestoreSdk } = client;
    const collection = firestoreSdk.collection(firestore, collectionName);
    const orderedQuery = firestoreSdk.query(collection, firestoreSdk.orderBy('createdAt', 'desc'), firestoreSdk.limit(readLimit));

    unsubscribe = firestoreSdk.onSnapshot(orderedQuery, { includeMetadataChanges: true }, (snapshot) => {
      if (!active || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      clearTimeout(timeout);
      orderedRecords = recordsFrom(snapshot);
      // A formerly undated record is now tracked by the live query.
      const datedIds = new Set(orderedRecords.map(({ id }) => id));
      missingRecords = missingRecords.filter(({ id }) => !datedIds.has(id));
      emit();
    }, handleError);

    // Firestore orderBy excludes documents missing the field. This separate
    // bounded server read can recover undated records without another index.
    const missingQuery = firestoreSdk.query(collection, firestoreSdk.limit(readLimit));
    return firestoreSdk.getDocsFromServer(missingQuery).then((snapshot) => {
      if (!active || failed) return;
      const orderedIds = new Set((orderedRecords ?? []).map(({ id }) => id));
      missingRecords = recordsFrom(snapshot).filter((record) => !Object.hasOwn(record, 'createdAt') && !orderedIds.has(record.id));
      emit();
    }).catch(() => {
      missingReadFailed = true;
      emit();
    });
  }).catch(handleError);

  return () => {
    active = false;
    clearTimeout(timeout);
    unsubscribe?.();
  };
}
