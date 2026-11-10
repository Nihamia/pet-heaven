import fallbackPets from '../data/pets.json';
import { waitForRemote } from './dataService.js';
import { getFirestoreClient, isFirebaseConfigured } from './firebaseClient.js';
import { getPublishedStaffPets } from './staffPetService.js';
import { petAvailabilityStatuses } from '../utils/petUtils.js';

// Load Firestore pet profiles when configured, otherwise keep the bundled JSON profiles available.
async function getBasePetRecords() {
  if (!isFirebaseConfigured) return { pets: fallbackPets, source: 'local', message: '' };

  try {
    const remoteRead = (async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      return firestoreSdk.getDocs(firestoreSdk.collection(firestore, 'pets'));
    })();
    const snapshot = await waitForRemote(remoteRead);
    if (snapshot.timedOut) {
      return {
        pets: fallbackPets,
        source: 'local',
        message: 'Firestore is taking too long to respond, so sample profiles are shown for now.',
      };
    }
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

async function getAvailability() {
  if (!isFirebaseConfigured) return new Map();
  try {
    const read = async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      return firestoreSdk.getDocs(firestoreSdk.collection(firestore, 'pet_availability'));
    };
    const snapshot = await waitForRemote(read());
    return new Map((snapshot.docs ?? []).map((item) => [item.id, item.data().status]));
  } catch {
    return new Map();
  }
}

export async function getPetAvailabilityStatus(petId) {
  if (!isFirebaseConfigured || !petId) return null;
  try {
    const read = async () => {
      const { firestore, firestoreSdk } = await getFirestoreClient();
      return firestoreSdk.getDoc(firestoreSdk.doc(firestore, 'pet_availability', petId));
    };
    const snapshot = await waitForRemote(read());
    return snapshot.timedOut ? null : snapshot.data()?.status ?? null;
  } catch {
    return null;
  }
}

export function publicStaffPet(pet) {
  return { ...pet, dateAdded: pet.createdAt, status: 'Available' };
}

export async function getPetRecords() {
  const [result, availability, staffPets] = await Promise.all([getBasePetRecords(), getAvailability(), getPublishedStaffPets()]);
  const byId = new Map(result.pets.map((pet) => [pet.id, pet]));
  for (const pet of staffPets) byId.set(pet.id, publicStaffPet(pet));
  const pets = [...byId.values()].map((pet) => {
    const status = availability.get(pet.id);
    return petAvailabilityStatuses.includes(status) ? { ...pet, status } : pet;
  });
  return { ...result, availability, pets };
}
