import { makeMemberReference } from './referenceService.js';
import { waitForRemote } from './dataService.js';
import { getFirestoreClient } from './firebaseClient.js';

async function memberOperation(uid, operation, failureMessage) {
  if (!uid) throw new Error('Log in to access your member profile.');
  try {
    const request = (async () => {
      const client = await getFirestoreClient();
      if (!client) throw new Error('Firestore is unavailable.');
      const { firestore, firestoreSdk } = client;
      return operation(firestoreSdk, firestoreSdk.doc(firestore, 'members', uid));
    })();
    const result = await waitForRemote(request);
    if (result?.timedOut) throw new Error('The member request timed out.');
    return result;
  } catch (error) {
    const friendlyError = new Error(failureMessage);
    friendlyError.code = error?.code;
    throw friendlyError;
  }
}

function editableDetails(profile) {
  const fullName = profile.fullName.trim();
  return {
    firstName: fullName.split(/\s+/, 1)[0],
    fullName,
    phone: profile.phone.trim(),
    address: profile.address.trim(),
    roles: [...new Set(profile.roles)],
  };
}

function registrationResult(member, alreadyRegistered = false) {
  return {
    member,
    saved: {
      id: member.uid,
      createdAt: member.createdAt,
      browserSaved: false,
      firestoreSaved: true,
      firestorePending: false,
      storage: 'Firestore',
      alreadyRegistered,
    },
  };
}

// A null result means the account needs a profile. Connection or permission errors are distinct.
export function getMember(uid) {
  return memberOperation(uid, async (sdk, document) => {
    const snapshot = await sdk.getDoc(document);
    return snapshot.exists() ? snapshot.data() : null;
  }, 'We could not load your member profile. Check your connection and try again.');
}

// Resume a partially completed registration with the same account and its existing profile.
export async function registerMember(user, profile) {
  const uid = user?.uid;
  const existing = await getMember(uid);
  if (existing) return registrationResult(existing, true);

  const createdAt = new Date().toISOString();
  const member = {
    uid,
    memberId: makeMemberReference(),
    ...editableDetails(profile),
    status: 'Active',
    createdAt,
    updatedAt: createdAt,
    email: user.email,
    roleDetails: profile.roleDetails,
    ageConfirmed: profile.ageConfirmed,
    dataConsent: profile.dataConsent,
    newsletter: profile.newsletter,
  };

  try {
    await memberOperation(uid, (sdk, document) => sdk.setDoc(document, member),
      'We could not save your member profile. Try saving it again when your connection is ready.');
  } catch (error) {
    // If another device completed the profile, the immutable-field rules reject this write.
    if (error.code === 'permission-denied') {
      const existingAfterWrite = await getMember(uid).catch(() => null);
      if (existingAfterWrite) return registrationResult(existingAfterWrite, true);
    }
    throw error;
  }

  return registrationResult(member);
}

// Update only the editable profile fields. Firebase rules keep the account identity and status fixed.
export function updateMember(uid, profile) {
  return memberOperation(uid, (sdk, document) => sdk.updateDoc(document, editableDetails(profile)),
    'We could not save your changes. Check your connection and try again.');
}
