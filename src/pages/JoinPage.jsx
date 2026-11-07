import { useState } from 'react';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useForm from '../hooks/useForm.js';
import { sendAdminEmail } from '../services/emailService.js';
import { saveSubmission } from '../services/dataService.js';
import {
  email as validateEmail,
  maxLength,
  minLength,
  passwordMatch,
  passwordStrength,
  required,
  singaporePhone,
} from '../utils/validators.js';
import { makeReference } from '../utils/formUtils.js';

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  ageConfirmed: false,
  address: '',
  interestDonor: false,
  interestVolunteer: false,
  interestFoster: false,
  newsletter: false,
};

// Validate the member details and require at least one way they would like to help.
function validateJoin(values) {
  const errors = {
    fullName: required(values.fullName, 'Full name') || minLength(values.fullName, 2) || maxLength(values.fullName, 120),
    email: required(values.email, 'Email') || validateEmail(values.email),
    phone: required(values.phone, 'Phone number') || singaporePhone(values.phone),
    password: required(values.password, 'Password') || passwordStrength(values.password),
    confirmPassword: required(values.confirmPassword, 'Password confirmation') || passwordMatch(values.confirmPassword, values.password),
    ageConfirmed: required(values.ageConfirmed, 'Please confirm you are at least 18'),
    address: required(values.address, 'Address') || minLength(values.address, 8) || maxLength(values.address, 240),
  };

  if (!values.interestDonor && !values.interestVolunteer && !values.interestFoster) {
    errors.interests = 'Choose at least one way you would like to support the society.';
  }
  return errors;
}

// Collect a new supporter profile, generate a member ID, and send an administrator notice.
export default function JoinPage() {
  const [submission, setSubmission] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [complete, setComplete] = useState(false);
  const form = useForm({ initialValues, validate: validateJoin });

  async function submitJoin(values) {
    const generatedMemberId = makeReference('PH');
    const interests = [
      values.interestDonor ? 'donor' : null,
      values.interestVolunteer ? 'volunteer' : null,
      values.interestFoster ? 'foster' : null,
    ].filter(Boolean);
    // Never persist or email passwords; add Firebase Authentication before using real accounts.
    const profile = {
      memberId: generatedMemberId,
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      ageConfirmed: values.ageConfirmed,
      interests,
      newsletter: values.newsletter,
    };
    const saved = await saveSubmission('members', profile);
    const email = await sendAdminEmail({
      form_type: 'New membership registration',
      reference_id: generatedMemberId,
      member_id: generatedMemberId,
      from_name: profile.fullName,
      reply_to: profile.email,
      details: JSON.stringify(profile, null, 2),
    });

    setMemberId(generatedMemberId);
    setSubmission({ saved, email });
    setComplete(true);
  }

  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';

  if (complete) {
    return (
      <FormPageShell
        className="join-page"
        description="Thank you for standing with animals who need a safer place to land."
        eyebrow="Welcome to the community"
        title="Your kindness makes room for hope."
      >
        <Card className="form-success-card" padding="large">
          <span aria-hidden="true" className="form-success-card__mark">♡</span>
          <h2>Your member ID</h2>
          <p className="form-success-card__reference">{memberId}</p>
          <p>Keep this ID: you will need it when you start an adoption enquiry in this browser.</p>
          <SubmissionFeedback referenceId={memberId} result={submission} />
          <Button to="/pets">Meet the pets <span aria-hidden="true">→</span></Button>
        </Card>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      className="join-page"
      description="Become part of a caring community. Choose the ways you would like to help, and we will keep the next steps clear and personal."
      eyebrow="Join the community"
      title="A little support can change a whole story."
    >
      <div className="service-page__columns">
        <Card className="service-benefits" padding="large">
          <p className="eyebrow">Membership can mean</p>
          <h2>More hands, more hope.</h2>
          <ul>
            <li><span aria-hidden="true">♡</span> Help provide food, care, and a soft place to rest.</li>
            <li><span aria-hidden="true">♡</span> Share your time as a volunteer or foster carer.</li>
            <li><span aria-hidden="true">♡</span> Hear about new ways to support local animals.</li>
          </ul>
          <p className="service-benefits__note">You can update your interests later by contacting the team.</p>
        </Card>

        <Card className="service-form-card" padding="large">
          <SectionHeading eyebrow="Member registration" title="Tell us a little about yourself." />
          {form.submitError && <SubmissionFeedback error={form.submitError} />}
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submitJoin)}>
            <FormField autoComplete="name" error={fieldError('fullName')} label="Full name" name="fullName" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.fullName} />
            <FormField autoComplete="email" error={fieldError('email')} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
            <FormField autoComplete="tel" error={fieldError('phone')} hint="Singapore number, 8 digits; +65 is optional." label="Phone number" name="phone" onBlur={form.handleBlur} onChange={form.handleChange} placeholder="e.g. 8123 4567" required type="tel" value={form.values.phone} />
            <FormField autoComplete="new-password" error={fieldError('password')} hint="Use 8+ characters with uppercase, lowercase, a number, and a symbol. This demo validates the password but does not store it." label="Create a password" name="password" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.password} />
            <FormField autoComplete="new-password" error={fieldError('confirmPassword')} label="Confirm password" name="confirmPassword" onBlur={form.handleBlur} onChange={form.handleChange} required type="password" value={form.values.confirmPassword} />
            <FormField autoComplete="street-address" error={fieldError('address')} label="Home address" name="address" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.address} />

            <fieldset className="service-fieldset">
              <legend>How would you like to help?</legend>
              <p className="service-fieldset__hint">Choose one or more interests.</p>
              <div className="service-checkbox-grid">
                <FormField checked={form.values.interestDonor} label="Make a donation" name="interestDonor" onBlur={form.handleBlur} onChange={form.handleChange} type="checkbox" />
                <FormField checked={form.values.interestVolunteer} label="Volunteer" name="interestVolunteer" onBlur={form.handleBlur} onChange={form.handleChange} type="checkbox" />
                <FormField checked={form.values.interestFoster} label="Foster a pet" name="interestFoster" onBlur={form.handleBlur} onChange={form.handleChange} type="checkbox" />
              </div>
              {form.errors.interests && <p className="form-field__error" id="join-interests-error">{form.errors.interests}</p>}
            </fieldset>

            <FormField checked={form.values.ageConfirmed} error={fieldError('ageConfirmed')} label="I confirm that I am at least 18 years old." name="ageConfirmed" onBlur={form.handleBlur} onChange={form.handleChange} required type="checkbox" />
            <FormField checked={form.values.newsletter} hint="Optional. You can unsubscribe at any time." label="Send me occasional news and animal stories." name="newsletter" onChange={form.handleChange} type="checkbox" />
            <Button className="service-form__submit" loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Saving your details…' : 'Join the community'}</Button>
          </form>
        </Card>
      </div>
    </FormPageShell>
  );
}
