import { getFirebaseApp, isFirebaseConfigured } from './firebaseClient.js';

export const accountsAvailable = isFirebaseConfigured;
const unavailableMessage = 'Accounts are unavailable right now.';
let authClientPromise;

const invalidLoginMessage = 'That email or password is incorrect. Please try again.';
const messages = {
  'auth/email-already-in-use': 'An account already exists for this email. Log in or reset your password.',
  'auth/invalid-credential': invalidLoginMessage,
  'auth/invalid-login-credentials': invalidLoginMessage,
  'auth/wrong-password': invalidLoginMessage,
  'auth/user-not-found': invalidLoginMessage,
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Choose a stronger password and try again.',
  'auth/password-does-not-meet-requirements': 'Choose a stronger password and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Check your internet connection and try again.',
  'auth/user-disabled': 'This account is unavailable. Contact Pet Heaven for help.',
  'auth/operation-not-allowed': unavailableMessage,
  'auth/configuration-not-found': unavailableMessage,
  'auth/operation-not-supported-in-this-environment': unavailableMessage,
  'auth/web-storage-unsupported': 'Allow browser storage to use your Pet Heaven account.',
};

function friendlyError(error, fallback) {
  const message = Object.hasOwn(messages, error?.code) ? messages[error.code] : fallback;
  return new Error(accountsAvailable ? message : unavailableMessage);
}

function getAuthClient() {
  if (!accountsAvailable) return Promise.reject(new Error(unavailableMessage));
  if (!authClientPromise) {
    authClientPromise = Promise.all([getFirebaseApp(), import('firebase/auth')])
      .then(async ([app, authSdk]) => {
        const auth = authSdk.getAuth(app);
        await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);
        return { auth, authSdk };
      })
      .catch((error) => {
        authClientPromise = undefined;
        throw error;
      });
  }
  return authClientPromise;
}

async function runAuth(operation, fallback) {
  try {
    const { auth, authSdk } = await getAuthClient();
    return await operation(auth, authSdk);
  } catch (error) {
    throw friendlyError(error, fallback);
  }
}

export function register(email, password) {
  return runAuth(async (auth, sdk) => {
    const result = await sdk.createUserWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  }, 'We could not create your account. Please try again.');
}

export function login(email, password) {
  return runAuth(async (auth, sdk) => {
    const result = await sdk.signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  }, 'We could not log you in. Please try again.');
}

export function logout() {
  return runAuth((auth, sdk) => sdk.signOut(auth), 'We could not sign you out. Please try again.');
}

export function resetPassword(email) {
  return runAuth(async (auth, sdk) => {
    try {
      await sdk.sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      // Give the same result for addresses with and without accounts.
      if (error.code !== 'auth/user-not-found') throw error;
    }
  }, 'We could not send the reset email. Please try again.');
}

// The caller can unsubscribe even before Firebase finishes loading.
export function onAuthChange(next, onError) {
  if (!accountsAvailable) {
    next(null);
    return () => {};
  }

  let active = true;
  let unsubscribe;
  const report = (error) => {
    if (active) onError?.(friendlyError(error, 'We could not load your account. Please reload and try again.'));
  };
  getAuthClient().then(({ auth, authSdk }) => {
    if (active) unsubscribe = authSdk.onAuthStateChanged(auth, (user) => { if (active) next(user); }, report);
  }).catch(report);

  return () => {
    active = false;
    unsubscribe?.();
  };
}
