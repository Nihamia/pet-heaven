const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firestore uses the web app identity, even when Storage and messaging are unused.
export const isFirebaseConfigured = [firebaseConfig.apiKey, firebaseConfig.projectId, firebaseConfig.appId]
  .every((value) => Boolean(value?.trim()));
let firebaseServicesPromise;
let firebaseAppPromise;

// Auth and Firestore share a lazily initialized app.
export function getFirebaseApp() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (!firebaseAppPromise) {
    firebaseAppPromise = import('firebase/app')
      .then(({ getApps, initializeApp }) => (
        getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(firebaseConfig)
      ))
      .catch((error) => {
        firebaseAppPromise = undefined;
        throw error;
      });
  }
  return firebaseAppPromise;
}

// Load Firebase only when configured so the public gallery keeps a small first-load bundle.
export function getFirestoreClient() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = Promise.all([getFirebaseApp(), import('firebase/firestore/lite')])
      .then(([app, firestoreSdk]) => ({ firestore: firestoreSdk.getFirestore(app), firestoreSdk }))
      .catch((error) => {
        firebaseServicesPromise = undefined;
        throw error;
      });
  }
  return firebaseServicesPromise;
}
