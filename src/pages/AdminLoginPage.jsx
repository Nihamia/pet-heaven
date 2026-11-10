import { Navigate } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import useForm from '../hooks/useForm.js';
import { signInStaff, signOutStaff, staffAccountsAvailable } from '../services/adminAuthService.js';
import { email as validateEmail, required } from '../utils/validators.js';

const initialValues = { email: '', password: '' };

function validate(values) {
  return {
    email: required(values.email, 'Email') || validateEmail(values.email),
    password: required(values.password, 'Password'),
  };
}

export default function AdminLoginPage() {
  const { user, isAdmin, loading, accessError } = useAdminAuth();
  const form = useForm({ initialValues, validate });

  const signOut = useForm({ onSubmit: signOutStaff });

  async function submit(values) {
    await signInStaff(values.email, values.password);
    form.reset();
  }

  const error = (user ? signOut.submitError : form.submitError) || accessError;

  if (isAdmin) return <Navigate replace to="/admin" />;

  return (
    <FormPageShell className="account-page" eyebrow="Pet Heaven staff" title="Staff login" description="Sign in with your authorised staff account.">
      <Card className="account-card" padding="large">
        {loading ? <Spinner label="Checking staff access" /> : (
          <>
            {error && <Alert tone="error">{error}</Alert>}
            {!staffAccountsAvailable && <Alert tone="error">Staff login is unavailable right now.</Alert>}
            {staffAccountsAvailable && (
              <form className="service-form" noValidate onSubmit={user ? signOut.handleSubmit : form.handleSubmit(submit)}>
                {user ? <Button loading={signOut.isSubmitting} type="submit">Sign out</Button> : (
                  <>
                    <FormField autoComplete="username" error={form.touched.email ? form.errors.email : ''} label="Staff email" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
                    <FormField autoComplete="current-password" error={form.touched.password ? form.errors.password : ''} label="Password" name="password" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.password} />
                    <Button loading={form.isSubmitting} type="submit">Staff sign in</Button>
                  </>
                )}
              </form>
            )}
          </>
        )}
      </Card>
    </FormPageShell>
  );
}
