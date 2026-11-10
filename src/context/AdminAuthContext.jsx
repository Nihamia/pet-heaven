import { createContext, useContext, useEffect, useState } from 'react';
import { hasStaffAccess, onStaffAuthChange, signOutStaff, staffAccountsAvailable } from '../services/adminAuthService.js';

import { useAuth } from './AuthContext.jsx';

const AdminAuthContext = createContext(null);
const signedOut = { user: null, isAdmin: false, loading: false };

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState({ ...signedOut, loading: staffAccountsAvailable });
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    let version = 0;

    async function checkAccess(user, currentVersion) {
      const isCurrent = () => version === currentVersion;
      let errorMessage = 'This account is not authorised.';
      try {
        const allowed = await hasStaffAccess(user.uid);
        if (!isCurrent()) return;
        if (allowed) {
          setSession({ user, isAdmin: true, loading: false });
          return;
        }
      } catch {
        errorMessage = 'We could not verify staff access. Check your connection and try again.';
      }

      if (!isCurrent()) return;
      setAccessError(errorMessage);
      try {
        await signOutStaff();
        if (isCurrent()) setSession(signedOut);
      } catch {
        if (!isCurrent()) return;
        setAccessError(errorMessage + ' Please sign out and try again.');
        setSession({ user, isAdmin: false, loading: false });
      }
    }

    const unsubscribe = onStaffAuthChange((user) => {
      const currentVersion = ++version;
      if (!user) {
        setSession(signedOut);
        return;
      }
      setAccessError('');
      setSession({ user, isAdmin: false, loading: true });
      void checkAccess(user, currentVersion);
    }, (error) => {
      version += 1;
      setAccessError(error.message);
      setSession(signedOut);
    });

    return () => {
      version += 1;
      unsubscribe();
    };
  }, []);

  return (
    <AdminAuthContext.Provider value={{ ...session, accessError }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Public controls use the staff lookup without the staff route's sign-out behaviour.
export function useAdminAuth({ publicCheck } = {}) {
  const context = useContext(AdminAuthContext);
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const uid = !context && publicCheck ? user?.uid : undefined;

  useEffect(() => {
    if (!uid) { setVerification(null); return; }
    let current = true;
    function finish(isAdmin) {
      if (current) setVerification({ uid, isAdmin });
    }
    hasStaffAccess(uid).then(finish, () => finish(false));
    return () => { current = false; };
  }, [uid]);

  if (context) return context;
  if (publicCheck === undefined) throw new Error('useAdminAuth must be used within AdminAuthProvider.');
  return { user, isAdmin: Boolean(uid && verification?.uid === uid && verification.isAdmin) };
}
