import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { accountsAvailable, onAuthChange } from '../services/authService.js';
import { getMember } from '../services/memberService.js';

const AuthContext = createContext(null);
const emptyProfile = { member: null, error: '' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(accountsAvailable);
  const [registration, setRegistration] = useState(null);
  const activeUser = useRef(null);
  const mounted = useRef(false);
  const profileVersion = useRef(0);

  const refreshMember = useCallback(async (subject = activeUser.current?.uid) => {
    const uid = typeof subject === 'string' ? subject : subject?.uid;
    if (!uid || (activeUser.current && activeUser.current.uid !== uid)) return null;
    const version = ++profileVersion.current;
    const isCurrent = () => mounted.current && profileVersion.current === version && activeUser.current?.uid === uid;

    try {
      const member = await getMember(uid);
      if (isCurrent()) setProfile({ member, error: '' });
      return member;
    } catch (error) {
      if (isCurrent()) setProfile((previous) => ({ ...previous, error: error.message }));
      return null;
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = onAuthChange((nextUser) => {
      profileVersion.current += 1;
      activeUser.current = nextUser;
      setUser(nextUser);
      setProfile(emptyProfile);
      setRegistration((entry) => (entry?.uid === nextUser?.uid ? entry : null));
      setLoading(Boolean(nextUser));
      if (nextUser) void refreshMember(nextUser.uid);
    }, (error) => {
      profileVersion.current += 1;
      activeUser.current = null;
      setUser(null);
      setProfile({ member: null, error: error.message });
      setRegistration(null);
      setLoading(false);
    });
    return () => {
      mounted.current = false;
      profileVersion.current += 1;
      unsubscribe?.();
    };
  }, [refreshMember]);

  function setRegistrationFeedback(result, uid = user?.uid) {
    // A newly registered SDK user may reach this handoff before the observer fires.
    if (!uid || (activeUser.current?.uid !== uid && (user || activeUser.current))) return;
    if (!result) {
      setRegistration(null);
      return;
    }
    const { data, ...feedback } = result;
    setRegistration({ uid, feedback: result.email?.sent ? feedback : { ...feedback, data } });
  }

  return (
    <AuthContext.Provider value={{
      user,
      member: profile.member,
      loading,
      memberError: profile.error,
      refreshMember,
      registrationFeedback: registration?.uid === user?.uid ? registration?.feedback ?? null : null,
      setRegistrationFeedback,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
