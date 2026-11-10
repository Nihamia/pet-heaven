import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useForm from '../hooks/useForm.js';
import { hasStaffAccess } from '../services/adminAuthService.js';
import { accountsAvailable, login } from '../services/authService.js';
import { email as validateEmail, required } from '../utils/validators.js';

const initialValues = { email: '', password: '' };

function validateLogin(values) {
  return {
    email: required(values.email, 'Email') || validateEmail(values.email),
    password: required(values.password, 'Password'),
  };
}

function safeReturnPath(value) {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/member';
  const base = 'https://pet-heaven.invalid';
  try {
    const target = new URL(value, base);
    const path = target.pathname.toLowerCase().replace(/\/+$/, '');
    if (target.origin === base && !['/login', '/forgot-password'].includes(path)) {
      return `${target.pathname}${target.search}${target.hash}`;
    }
  } catch {
    return '/member';
  }
  return '/member';
}

function LoginDestination({ uid, next }) {
  const [isStaff, setIsStaff] = useState(null);

  useEffect(() => {
    let active = true;
    function finish(allowed) {
      if (active) setIsStaff(allowed);
    }
    hasStaffAccess(uid).then(finish, () => finish(false));
    return () => { active = false; };
  }, [uid]);

  if (isStaff === null) {
    return <div className="container account-loading"><Spinner label="Checking staff access" /></div>;
  }
  return <Navigate replace to={isStaff ? '/admin' : next} />;
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const { user, loading, memberError } = useAuth();
  const form = useForm({ initialValues, validate: validateLogin });
  const next = safeReturnPath(searchParams.get('next'));
  const isAdoptionLogin = next.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase() === '/adopt';
  const resetLink = next === '/member' ? '/forgot-password' : `/forgot-password?next=${encodeURIComponent(next)}`;

  async function submit(values) {
    await login(values.email, values.password);
    form.reset();
  }

  if (user) return <LoginDestination key={user.uid} next={next} uid={user.uid} />;

  return (
    <FormPageShell className="account-page" eyebrow="Pet Heaven membership" title="Log in" description="Use your email and password to open your member area.">
      <Card className="account-card" padding="large">
        {loading ? <Spinner label="Loading your account" /> : accountsAvailable ? (
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submit)}>
            {(form.submitError || memberError) && <Alert tone="error">{form.submitError || memberError}</Alert>}
            <FormField autoComplete="email" error={form.touched.email ? form.errors.email : ''} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
            <FormField autoComplete="current-password" error={form.touched.password ? form.errors.password : ''} label="Password" name="password" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.password} />
            <Button loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Logging in…' : 'Log in'}</Button>
          </form>
        ) : <Alert tone="error">Accounts are unavailable right now.</Alert>}
        <div className="account-links">
          <Link to={resetLink}>Forgot password?</Link>
          <Link to={isAdoptionLogin ? "/join?role=adopter" : "/join"}>
            {isAdoptionLogin ? "Become a member to adopt" : "Join Pet Heaven"}
          </Link>
        </div>
      </Card>
    </FormPageShell>
  );
}
