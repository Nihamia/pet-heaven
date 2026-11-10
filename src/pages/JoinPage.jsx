import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import FormGuide from '../components/forms/FormGuide.jsx';
import RoleCard from '../components/forms/RoleCard.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import SubmissionHoneypot from '../components/forms/SubmissionHoneypot.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { collectRoleAnswers, initialRoleValues, roles, selectedRoleIds, validateRoleAnswers } from '../data/roles.js';
import useForm from '../hooks/useForm.js';
import useAdminSubmission from '../hooks/useAdminSubmission.js';
import usePets from '../hooks/usePets.js';
import { accountsAvailable, register } from '../services/authService.js';
import { registerMember } from '../services/memberService.js';
import {
  email as validateEmail,
  maxLength,
  minLength,
  passwordMatch,
  passwordStrength,
  required,
  singaporePhone,
} from '../utils/validators.js';

const initialProfileValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  ageConfirmed: false,
  address: '',
  dataConsent: false,
  newsletter: false,
};

function validateJoin(values, hasAccount, pets) {
  const fullName = values.fullName.trim();
  const phone = values.phone.trim();
  const address = values.address.trim();
  const errors = {
    fullName: required(fullName, 'Full name') || minLength(fullName, 2) || maxLength(fullName, 120),
    phone: required(phone, 'Phone number') || singaporePhone(phone) || maxLength(phone, 32),
    ageConfirmed: required(values.ageConfirmed, 'Please confirm you are at least 18'),
    address: required(address, 'Address') || minLength(address, 8) || maxLength(address, 240),
    dataConsent: required(values.dataConsent, 'Data consent'),
    ...validateRoleAnswers(values, pets),
  };
  if (!hasAccount) {
    errors.email = required(values.email, 'Email') || validateEmail(values.email) || maxLength(values.email.trim(), 254);
    errors.password = required(values.password, 'Password') || passwordStrength(values.password);
    errors.confirmPassword = required(values.confirmPassword, 'Password confirmation') || passwordMatch(values.confirmPassword, values.password);
  }
  return errors;
}

// Create the sign-in first so a partially registered member can finish their profile later.
export default function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, member, loading, refreshMember, setRegistrationFeedback } = useAuth();
  const { pets } = usePets();
  const { beginSubmission, honeypotRef, deliver } = useAdminSubmission('join');
  const initialValues = { ...initialProfileValues, ...initialRoleValues(searchParams.get('role')) };
  const form = useForm({ initialValues, validate: (values) => validateJoin(values, Boolean(user), pets) });

  async function submitJoin(values) {
    beginSubmission();
    const account = user ?? await register(values.email.trim().toLowerCase(), values.password);
    const profile = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      ageConfirmed: values.ageConfirmed,
      roles: selectedRoleIds(values),
      dataConsent: values.dataConsent,
      newsletter: values.newsletter,
    };
    const { member: registeredMember, saved } = await registerMember(account, profile);
    if (!saved.alreadyRegistered) {
      const feedback = await deliver(saved, {
        ...profile,
        email: account.email,
        roleDetails: collectRoleAnswers(values, pets),
      }, registeredMember.memberId);
      setRegistrationFeedback(feedback, account.uid);
    }
    await refreshMember(account);
    form.reset(initialValues);
    navigate('/member', { replace: true });
  }

  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';

  if (!accountsAvailable || (loading && !form.isSubmitting)) {
    return (
      <FormPageShell className="join-page" title="Create your member account">
        {accountsAvailable ? <Spinner label="Loading account…" /> : (
          <Alert title="Accounts are unavailable" tone="warning">Registration is currently unavailable. You can still <Link to="/get-involved">explore ways to help</Link>.</Alert>
        )}
      </FormPageShell>
    );
  }

  if (member && !form.isSubmitting) return <Navigate replace to="/member" />;

  return (
    <FormPageShell
      className="join-page"
      description="Become part of a caring community. Choose the ways you would like to help, and we will keep the next steps clear and personal."
      eyebrow="Join the community"
      title="A little support can change a whole story."
    >
      <div className="service-page__columns service-page__columns--form">
        <Card className="service-form-card" padding="large">
          <SectionHeading eyebrow="Member registration" title={user ? 'Complete your member profile' : 'Create your member account'} />
          {form.submitError && <SubmissionFeedback error={form.submitError} />}
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submitJoin)}>
            <SubmissionHoneypot inputRef={honeypotRef} />
            <fieldset className="service-fieldset" disabled={form.isSubmitting}>
              <legend>Account</legend>
              {user ? <p>Signed in as <strong>{user.email}</strong></p> : (
                <>
                  <FormField autoComplete="email" error={fieldError('email')} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
                  <FormField autoComplete="new-password" error={fieldError('password')} hint="Use 8 or more characters with an uppercase letter, a lowercase letter, a number, and a symbol." label="Create a password" name="password" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.password} />
                  <FormField autoComplete="new-password" error={fieldError('confirmPassword')} label="Confirm password" name="confirmPassword" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.confirmPassword} />
                </>
              )}
            </fieldset>
            <fieldset className="service-fieldset" disabled={form.isSubmitting}>
              <legend>Profile</legend>
              <FormField autoComplete="name" error={fieldError('fullName')} label="Full name" name="fullName" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.fullName} />
              <FormField autoComplete="tel" error={fieldError('phone')} hint="Enter a Singapore number. The +65 prefix is optional." label="Phone number" name="phone" onBlur={form.handleBlur} onChange={form.handleChange} placeholder="e.g. 8123 4567" required type="tel" value={form.values.phone} />
              <FormField autoComplete="street-address" error={fieldError('address')} label="Home address" name="address" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.address} />
              <FormField checked={form.values.ageConfirmed} error={fieldError('ageConfirmed')} label="I confirm that I am at least 18 years old." name="ageConfirmed" onBlur={form.handleBlur} onChange={form.handleChange} required type="checkbox" />
            </fieldset>

            <fieldset aria-describedby={form.errors.interests ? 'join-interests-error' : undefined} className="service-fieldset" disabled={form.isSubmitting} id="support-interests">
              <legend>How would you like to help?</legend>
              <p className="service-fieldset__hint">Choose one or more roles and answer the questions for each.</p>
              <div className="join-role-cards">
                {roles.map((role) => <RoleCard fieldError={fieldError} key={role.id} onBlur={form.handleBlur} onChange={form.handleChange} pets={pets} role={role} values={form.values} />)}
              </div>
              {form.errors.interests && <p className="form-field__error" id="join-interests-error">{form.errors.interests}</p>}
            </fieldset>

            <FormField checked={form.values.dataConsent} disabled={form.isSubmitting} error={fieldError('dataConsent')} hint={<>Read our <Link to="/privacy">privacy notice</Link> for how we use your details.</>} label="I agree to the use of my information for my membership." name="dataConsent" onBlur={form.handleBlur} onChange={form.handleChange} required type="checkbox" />
            <FormField checked={form.values.newsletter} disabled={form.isSubmitting} hint="Optional. You can unsubscribe at any time." label="Send me occasional news and animal stories." name="newsletter" onChange={form.handleChange} type="checkbox" />
            <Button className="service-form__submit" loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Saving and sending…' : 'Join the community'}</Button>
          </form>
          {!user && <p>Already a member? <Link to="/login">Log in</Link>.</p>}
        </Card>
        <FormGuide
          className="service-benefits"
          eyebrow="Membership can mean"
          title="More hands, more hope."
          steps={[
            { title: 'Open your member area', text: 'Find your membership card, care guides, and adoption requests.' },
            { title: 'Choose a way to help', text: 'Your interests help the team understand the support you would like to offer.' },
            { title: 'Stay in touch', text: 'The team can discuss suitable opportunities using the contact details you share.' },
          ]}
        >
          <ul>
            <li><span aria-hidden="true">♡</span> Help provide food, care, and a soft place to rest.</li>
            <li><span aria-hidden="true">♡</span> Share your time as a volunteer or foster carer.</li>
            <li><span aria-hidden="true">♡</span> Hear about new ways to support local animals.</li>
          </ul>
          <p className="service-benefits__note">Update your roles and contact details in My Membership.</p>
        </FormGuide>
      </div>
    </FormPageShell>
  );
}
