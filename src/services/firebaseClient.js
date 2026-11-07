const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase when every web app setting is supplied in a local environment file.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
let firebaseServicesPromise;

// Load Firebase only when configured so the public gallery keeps a small first-load bundle.
export function getFirestoreClient() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = Promise.all([import('firebase/app'), import('firebase/firestore/lite')])
      .then(([appSdk, firestoreSdk]) => {
        const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
        return { firestore: firestoreSdk.getFirestore(app), firestoreSdk };
      });
  }
  return firebaseServicesPromise;
}
