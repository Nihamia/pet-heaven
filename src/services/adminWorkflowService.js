import { recordReference, recordStatus } from '../data/adminDashboard.js';
import { callOutcomes, noteDocumentId, workflowActions } from '../data/adminWorkflow.js';
import { getAdminFirestoreClient } from './firebaseClient.js';
import { isUnavailablePetStatus, petAvailabilityStatuses } from '../utils/petUtils.js';

async function client() {
  const result = await getAdminFirestoreClient();
  if (!result) throw new Error('Firestore is unavailable.');
  return result;
}

export function subscribeToWorkflowCollection(collectionName, onData, onError) {
  if (!['admin_notes', 'pet_availability'].includes(collectionName)) throw new Error('Unknown workflow collection.');
  let active = true;
  let unsubscribe;
  const fail = (error) => { if (active) onError(error); };

  client().then(({ firestore, firestoreSdk }) => {
    if (!active) return;
    unsubscribe = firestoreSdk.onSnapshot(firestoreSdk.collection(firestore, collectionName), { includeMetadataChanges: true }, (snapshot) => {
      if (!active || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      onData(Object.fromEntries(snapshot.docs.map((document) => [document.id, document.data()])));
    }, fail);
  }).catch(fail);

  return () => {
    active = false;
    unsubscribe?.();
  };
}

function availabilityChange({ actionId, current, fromStatus, availability, manual, standalone }) {
  const reference = standalone ? '' : recordReference(current);
  const previous = availability?.status ?? 'Available';
  const holder = availability?.adoptionRef ?? '';

  if (actionId === 'change-availability') {
    if (!current.petId || (!standalone && !reference) || !petAvailabilityStatuses.includes(manual?.status)) {
      throw new Error('Choose a valid availability status for this pet.');
    }
    const expected = manual.expected;
    if (previous !== (expected?.status ?? 'Available') || holder !== (expected?.adoptionRef ?? '')
      || availability?.updatedAt !== expected?.updatedAt) {
      throw new Error('Pet availability changed. Close this dialog and review the record again.');
    }
    if (previous === manual.status) throw new Error('The pet already has that availability status.');
    const adoptionRef = standalone
      ? (isUnavailablePetStatus(previous) ? holder : '')
      : (manual.status === 'Available' ? holder : reference);
    return { status: manual.status, adoptionRef };
  }

  if (actionId === 'approve' || actionId === 'complete') {
    if (!current.petId || !reference) throw new Error('This request needs a pet ID and adoption reference.');
    if (isUnavailablePetStatus(previous) && holder !== reference) {
      const reason = previous === 'Reserved' ? 'reserved' : 'adopted';
      throw new Error('This pet is already ' + reason + (holder ? ' via ' + holder : ' without a matching request') + '.');
    }
    return { status: actionId === 'approve' ? 'Reserved' : 'Adopted', adoptionRef: reference };
  }

  if (['decline', 'decline-adopted', 'reopen'].includes(actionId) && fromStatus === 'Approved'
    && previous === 'Reserved' && reference && holder === reference) {
    return { status: 'Available', adoptionRef: holder };
  }

  return null;
}

export async function saveWorkflowAction({ tab, record, actionId, outcome = '', note = '', email, uid, manual }) {
  const { firestore, firestoreSdk: sdk } = await client();
  const target = sdk.doc(firestore, tab.collection, record.id);
  const key = noteDocumentId(tab.collection, record.id);
  const noteRef = sdk.doc(firestore, 'admin_notes', key);

  return sdk.runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (!snapshot.exists()) throw new Error('This record is no longer available.');
    const stored = snapshot.data();
    const standalone = tab.id === 'pets';
    const current = standalone ? { ...stored, petId: stored.id } : stored;
    if (standalone && actionId !== 'change-availability') throw new Error('That action is no longer available.');

    const pet = (tab.id === 'adoption' || standalone) && current.petId
      ? sdk.doc(firestore, 'pet_availability', current.petId)
      : null;
    const availability = pet ? (await transaction.get(pet)).data() : undefined;
    const fromStatus = standalone ? availability?.status ?? 'Available' : recordStatus(tab.id, current);
    if (!standalone && fromStatus !== recordStatus(tab.id, record)) throw new Error('This record changed. Reopen it and try again.');
    const action = actionId === 'change-availability' && pet
      ? { label: 'Change availability', toStatus: fromStatus }
      : workflowActions(tab.id, current, availability).find(({ id }) => id === actionId);
    if (!action) throw new Error('That action is no longer available.');
    if (actionId === 'call' && !callOutcomes.includes(outcome)) throw new Error('Choose a call outcome.');
    const text = actionId === 'call' ? note.trim() : '';
    if (text.length > 300) throw new Error('Use up to 300 characters for the call note.');

    const change = (tab.id === 'adoption' || standalone) ? availabilityChange({ actionId, current, fromStatus, availability, manual, standalone }) : null;
    const at = new Date().toISOString();
    const toStatus = standalone ? change.status : actionId === 'call' && outcome !== 'Reached' ? fromStatus : action.toStatus;
    const metadata = { updatedAt: at, updatedBy: email };
    const label = actionId === 'change-availability'
      ? action.label + ': ' + (availability?.status ?? 'Available') + ' → ' + change.status
      : action.label;
    const entry = { action: label, fromStatus, toStatus, outcome: actionId === 'call' ? outcome : '', note: text, at, by: email };
    const statusPatch = !standalone && toStatus !== fromStatus
      ? { [tab.id === 'members' ? 'staffStatus' : 'status']: toStatus, ...metadata }
      : null;
    const petPatch = change ? { ...change, updatedAt: at, updatedBy: uid } : null;

    if (statusPatch) transaction.update(target, statusPatch);
    if (petPatch) transaction.set(pet, petPatch);
    transaction.set(noteRef, { ...metadata, history: sdk.arrayUnion(entry) }, { merge: true });
    return { statusPatch, petPatch, petId: current.petId, key, entry, metadata };
  });
}

export async function saveStaffNote({ tab, record, text, email }) {
  if (text.length > 1000) throw new Error('Use up to 1,000 characters for the staff note.');
  const { firestore, firestoreSdk: sdk } = await client();
  const key = noteDocumentId(tab.collection, record.id);
  const changes = { text: text.trim(), updatedAt: new Date().toISOString(), updatedBy: email };
  await sdk.setDoc(sdk.doc(firestore, 'admin_notes', key), changes, { merge: true });
  return { key, changes };
}
