import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import useForm from '../hooks/useForm.js';
import { accountsAvailable, resetPassword } from '../services/authService.js';
import { email as validateEmail, required } from '../utils/validators.js';

const initialValues = { email: '' };

function validateReset(values) {
  return { email: required(values.email, 'Email') || validateEmail(values.email) };
}

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm({ initialValues, validate: validateReset });
  const next = searchParams.get('next');
  const loginLink = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  async function submit(values) {
    await resetPassword(values.email);
    setSubmitted(true);
  }

  return (
    <FormPageShell className="account-page" eyebrow="Pet Heaven membership" title="Reset your password" description="Enter the email address you used to register.">
      <Card className="account-card" padding="large">
        {accountsAvailable ? (
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submit)}>
            {form.submitError && <Alert tone="error">{form.submitError}</Alert>}
            {submitted && <Alert tone="success">If that email has a Pet Heaven account, a password reset link will arrive in its inbox.</Alert>}
            <FormField autoComplete="email" error={form.touched.email ? form.errors.email : ''} label="Email address" name="email" onBlur={form.handleBlur} onChange={(event) => {
              setSubmitted(false);
              form.handleChange(event);
            }} required type="email" value={form.values.email} />
            <Button disabled={submitted} loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Sending…' : 'Send reset email'}</Button>
          </form>
        ) : <Alert tone="error">Accounts are unavailable right now.</Alert>}
        <div className="account-links"><Link to={loginLink}>Back to log in</Link></div>
      </Card>
    </FormPageShell>
  );
}
