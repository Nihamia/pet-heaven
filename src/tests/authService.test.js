import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebase = vi.hoisted(() => ({
  configured: true,
  app: { name: 'pet-heaven' },
  auth: { name: 'mock-auth' },
  persistence: { type: 'LOCAL' },
}));

vi.mock('../services/firebaseClient.js', () => ({
  get isFirebaseConfigured() { return firebase.configured; },
  getFirebaseApp: vi.fn(() => Promise.resolve(firebase.app)),
}));

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: firebase.persistence,
  getAuth: vi.fn(() => firebase.auth),
  setPersistence: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

import * as sdk from 'firebase/auth';

const member = { uid: 'firebase-uid', email: 'jamie@example.com' };
const password = 'A-Test-Password9';

function firebaseError(code) {
  return Object.assign(new Error('Raw Firebase error.'), { code });
}

beforeEach(() => {
  firebase.configured = true;
  vi.resetModules();
});

describe('Firebase account service', () => {
  it('registers and logs in with local browser persistence, then signs out', async () => {
    sdk.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: member });
    sdk.signInWithEmailAndPassword.mockResolvedValueOnce({ user: member });
    const { register, login, logout } = await import('../services/authService.js');

    await expect(register(` ${member.email} `, password)).resolves.toEqual(member);
    await expect(login(member.email, password)).resolves.toEqual(member);
    await logout();

    expect(sdk.getAuth).toHaveBeenCalledWith(firebase.app);
    expect(sdk.setPersistence).toHaveBeenCalledExactlyOnceWith(firebase.auth, sdk.browserLocalPersistence);
    expect(sdk.createUserWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, member.email, password);
    expect(sdk.signInWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, member.email, password);
    expect(sdk.signOut).toHaveBeenCalledWith(firebase.auth);
  });

  it.each([
    ['auth/invalid-credential', 'That email or password is incorrect. Please try again.'],
    ['auth/too-many-requests', 'Too many attempts. Wait a moment and try again.'],
    ['auth/network-request-failed', 'Check your internet connection and try again.'],
  ])('maps %s to a friendly login error', async (code, message) => {
    sdk.signInWithEmailAndPassword.mockRejectedValueOnce(firebaseError(code));
    const { login } = await import('../services/authService.js');

    await expect(login(member.email, password)).rejects.toThrow(message);
  });

  it('gives a duplicate registration a friendly sign-in or reset prompt', async () => {
    sdk.createUserWithEmailAndPassword.mockRejectedValueOnce(firebaseError('auth/email-already-in-use'));
    const { register } = await import('../services/authService.js');

    await expect(register(member.email, password)).rejects.toThrow(
      'An account already exists for this email. Log in or reset your password.',
    );
  });

  it('uses the same password-reset result for known and unknown email addresses', async () => {
    sdk.sendPasswordResetEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(firebaseError('auth/user-not-found'));
    const { resetPassword } = await import('../services/authService.js');

    await expect(resetPassword(member.email)).resolves.toBeUndefined();
    await expect(resetPassword('unknown@example.com')).resolves.toBeUndefined();
    expect(sdk.sendPasswordResetEmail).toHaveBeenLastCalledWith(firebase.auth, 'unknown@example.com');
  });

  it('notifies subscribers that the visitor is signed out when Firebase is unavailable', async () => {
    firebase.configured = false;
    const { accountsAvailable, login, onAuthChange } = await import('../services/authService.js');
    const handleUser = vi.fn();

    expect(accountsAvailable).toBe(false);
    expect(onAuthChange(handleUser)).toEqual(expect.any(Function));
    expect(handleUser).toHaveBeenCalledExactlyOnceWith(null);
    await expect(login(member.email, password)).rejects.toThrow('Accounts are unavailable right now.');
    expect(sdk.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
