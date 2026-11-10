import { useEffect, useState } from 'react';
import fallbackPets from '../data/pets.json';
import { getPetRecords } from '../services/petService.js';
import { isFirebaseConfigured } from '../services/firebaseClient.js';

// Load the shared pet list from Firestore when ready and fall back to the bundled sample data.
export default function usePets() {
  const [state, setState] = useState({
    pets: fallbackPets,
    source: 'local',
    message: '',
    isLoading: isFirebaseConfigured,
  });

  useEffect(() => {
    let isCurrent = true;
    getPetRecords().then((result) => {
      if (isCurrent) setState({ ...result, isLoading: false });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return state;
}
