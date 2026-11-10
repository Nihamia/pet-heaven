import fallbackPets from '../data/pets.json';
import { waitForRemote } from './dataService.js';
import { getFirestoreClient, isFirebaseConfigured } from './firebaseClient.js';

// Load Firestore pet profiles when configured, otherwise keep the bundled JSON profiles available.
export async function getPetRecords() {
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
