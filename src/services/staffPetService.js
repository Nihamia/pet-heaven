import bundledPets from '../data/pets.json';
import { buildStaffPetFields } from '../data/staffPetFields.js';
import { getAdminFirestoreClient, getFirestoreClient, isFirebaseConfigured } from './firebaseClient.js';
import { waitForRemote } from './dataService.js';

const localIds = new Set(bundledPets.map(({ id }) => id));
const suffixChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

function makePetId(name) {
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 48).replace(/-$/, '') || 'pet';
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), (byte) => suffixChars[byte % suffixChars.length]).join('');
  return slug + '-' + suffix;
}

function documents(snapshot) {
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getPublishedStaffPets() {
  if (!isFirebaseConfigured) return [];
  try {
    const read = async () => {
      const { firestore, firestoreSdk: sdk } = await getFirestoreClient();
      const query = sdk.query(sdk.collection(firestore, 'staff_pets'), sdk.where('archived', '==', false));
      return sdk.getDocs(query);
    };
    const snapshot = await waitForRemote(read());
    return snapshot.timedOut ? [] : documents(snapshot).filter((pet) => pet.archived === false);
  } catch {
    return [];
  }
}

export async function getStaffPetGallery(petId) {
  if (!isFirebaseConfigured) return [];
  const { firestore, firestoreSdk: sdk } = await getFirestoreClient();
  const snapshot = await waitForRemote(sdk.getDoc(sdk.doc(firestore, 'pet_images', petId)));
  if (snapshot.timedOut) throw new Error('Extra photos took too long to load.');
  const data = snapshot.data();
  return (data?.gallery ?? []).map((src, index) => ({ src, alt: data.alts[index] }));
}

async function staffClient() {
  const result = await getAdminFirestoreClient();
  if (!result) throw new Error('Staff pet management is unavailable.');
  return result;
}

export async function getStaffPets() {
  const { firestore, firestoreSdk: sdk } = await staffClient();
  const snapshot = await sdk.getDocsFromServer(sdk.collection(firestore, 'staff_pets'));
  return documents(snapshot);
}

export async function saveStaffPet({ values, pet, uid }) {
  const fields = buildStaffPetFields(values);
  const extras = values.photos.slice(1);
  const gallery = { gallery: extras.map(({ src }) => src), alts: extras.map(({ alt }) => alt.trim()) };
  const bytes = new TextEncoder().encode(JSON.stringify({ fields, gallery })).length;
  if (bytes > 750_000) throw new Error('The pet photos exceed the size limit. Use smaller photos.');
  const { firestore, firestoreSdk: sdk } = await staffClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = pet?.id ?? makePetId(fields.name);
    if (!pet && localIds.has(id)) continue;
    const result = await sdk.runTransaction(firestore, async (transaction) => {
      const profileRef = sdk.doc(firestore, 'staff_pets', id);
      const galleryRef = sdk.doc(firestore, 'pet_images', id);
      const current = await transaction.get(profileRef);

      if (pet) {
        if (!current.exists() || current.data().updatedAt !== pet.updatedAt) {
          throw new Error('This pet changed. Close the editor, refresh the list and try again.');
        }
      } else {
        const occupied = await Promise.all(['pets', 'pet_images', 'pet_availability'].map((name) =>
          transaction.get(sdk.doc(firestore, name, id))));
        if (current.exists() || occupied.some((snapshot) => snapshot.exists())) return null;
      }

      const now = new Date().toISOString();
      const record = {
        ...fields, id, source: 'staff', archived: pet?.archived ?? false,
        createdBy: pet?.createdBy ?? uid, createdAt: pet?.createdAt ?? now, updatedAt: now,
      };
      transaction.set(profileRef, record);
      transaction.set(galleryRef, gallery);
      return record;
    });
    if (result) return result;
  }
  throw new Error('A unique pet ID could not be created. Try publishing again.');
}

export async function setStaffPetArchived(pet, archived) {
  const { firestore, firestoreSdk: sdk } = await staffClient();
  const ref = sdk.doc(firestore, 'staff_pets', pet.id);
  return sdk.runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || snapshot.data().updatedAt !== pet.updatedAt) {
      throw new Error('This pet changed. Refresh the list and try again.');
    }
    const changes = { archived, updatedAt: new Date().toISOString() };
    transaction.update(ref, changes);
    return { ...snapshot.data(), ...changes, id: pet.id };
  });
}

export function staffPetError(error) {
  if (error?.code === 'permission-denied') return 'Permission denied. Check your staff access and the deployed Firestore rules.';
  if (error?.code) return 'The pet record could not be accessed. Check your connection and try again.';
  return error?.message || 'The pet record could not be accessed.';
}
