import { waitForRemote } from './dataService.js';
import { getFirestoreClient } from './firebaseClient.js';

export { accountsAvailable as staffAccountsAvailable, login as signInStaff, logout as signOutStaff, onAuthChange as onStaffAuthChange } from './authService.js';

export async function hasStaffAccess(uid) {
  const check = async () => {
    const client = await getFirestoreClient();
    if (!client) throw new Error('Staff access is unavailable.');
    const { firestore, firestoreSdk } = client;
    const record = await firestoreSdk.getDoc(firestoreSdk.doc(firestore, 'admins', uid));
    return record.exists();
  };

  const result = await waitForRemote(check());
  if (typeof result !== 'boolean') throw new Error('Staff access verification timed out.');
  return result;
}
