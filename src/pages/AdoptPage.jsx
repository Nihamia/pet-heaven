import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import FormGuide from '../components/forms/FormGuide.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useForm from '../hooks/useForm.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import usePets from '../hooks/usePets.js';
import { sendAdminEmail } from '../services/emailService.js';
import { findLocalMember, saveSubmission } from '../services/dataService.js';
import { isFutureDate, makeReference } from '../utils/formUtils.js';
import { email as validateEmail, maxLength, minLength, required } from '../utils/validators.js';

function minimumFutureDate() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validateAdoption(values) {
  const errors = {
    petId: required(values.petId, 'Pet'),
    housingType: required(values.housingType, 'Housing type'),
    tenure: required(values.tenure, 'Ownership or rental status'),
    landlordPermission: values.tenure === 'rent' ? required(values.landlordPermission, 'Landlord permission confirmation') : '',
    householdMembers: required(values.householdMembers, 'Household members') || maxLength(values.householdMembers, 240),
    otherPets: maxLength(values.otherPets, 600),
    experience: required(values.experience, 'Pet care experience') || minLength(values.experience, 20) || maxLength(values.experience, 1200),
    workSchedule: required(values.workSchedule, 'Work schedule'),
    reason: required(values.reason, 'Why you would like to adopt') || minLength(values.reason, 30) || maxLength(values.reason, 1200),
    commitmentLongTerm: required(values.commitmentLongTerm, 'Long-term care commitment'),
    commitmentFinancial: required(values.commitmentFinancial, 'Care costs confirmation'),
    interviewConsent: required(values.interviewConsent, 'Interview and home visit consent'),
    preferredDate: required(values.preferredDate, 'Preferred interview date')
      || (isFutureDate(values.preferredDate) ? '' : 'Choose a date in the future.'),
    preferredTime: required(values.preferredTime, 'Preferred interview time'),
  };
  if (values.tenure === 'rent' && values.landlordPermission !== true) {
    errors.landlordPermission = 'Please confirm your landlord has agreed before continuing.';
  }
  return errors;
}

function makeCalendarUrl(date, time, petName) {
  const start = `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;
  const endHour = Number(time.slice(0, 2)) + 1;
  const end = `${date.replaceAll('-', '')}T${String(endHour).padStart(2, '0')}${time.slice(3)}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Pet Heaven adoption interview${petName ? ` about ${petName}` : ''}`,
    dates: `${start}/${end}`,
    ctz: 'Asia/Singapore',
    details: 'Sample interview time. Please confirm the appointment with the Pet Heaven team.',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Check local membership, review the household details, then submit an adoption enquiry.
export default function AdoptPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialPetId = location.state?.petId ?? searchParams.get('petId') ?? '';
  const { pets, message: petLoadMessage } = usePets();
  const availablePets = pets.filter((pet) => pet.status === 'Available');
  const [credentials, setCredentials] = useState({ email: '', memberId: '' });
  const [memberError, setMemberError] = useState('');
  const [verifiedMember, setVerifiedMember] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [referenceId] = useState(() => makeReference('PH-AD'));
  const baseInitialValues = useMemo(() => ({
    petId: initialPetId,
    housingType: '',
    tenure: '',
    landlordPermission: false,
    householdMembers: '',
    otherPets: '',
    experience: '',
    workSchedule: '',
    reason: '',
    commitmentLongTerm: false,
    commitmentFinancial: false,
    interviewConsent: false,
    preferredDate: '',
    preferredTime: '',
  }), [initialPetId]);
  const [draft, setDraft, removeDraft] = useLocalStorage('pet-heaven-adoption-draft', baseInitialValues);
  const initialValues = useMemo(() => ({
    ...baseInitialValues,
    ...(draft && typeof draft === 'object' && !Array.isArray(draft) ? draft : {}),
    petId: initialPetId || draft?.petId || baseInitialValues.petId,
  }), [baseInitialValues, draft, initialPetId]);
  const form = useForm({ initialValues, validate: validateAdoption });
  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';
  const chosenPet = availablePets.find((pet) => pet.id === form.values.petId);

  useEffect(() => {
    setDraft(form.values);
  }, [form.values, setDraft]);

  function verifyMember(event) {
    event.preventDefault();
    setMemberError('');
    if (!credentials.email.trim() || validateEmail(credentials.email)) {
      setMemberError('Enter the email address used for membership.');
      return;
    }
    if (!credentials.memberId.trim()) {
      setMemberError('Enter your Pet Heaven member ID.');
      return;
    }
    const member = findLocalMember(credentials.email, credentials.memberId);
    if (!member) {
      setVerifiedMember(null);
      setMemberError('We could not find that membership on this browser. Join first, then use the same browser to start your enquiry.');
      return;
    }
    setVerifiedMember(member);
  }

  async function submitAdoption(values) {
    if (!isReviewing) {
      setIsReviewing(true);
      return;
    }

    const pet = availablePets.find((item) => item.id === values.petId);
    const record = {
      referenceId,
      memberId: verifiedMember.memberId,
      applicantName: verifiedMember.fullName,
      email: verifiedMember.email,
      phone: verifiedMember.phone,
      petId: values.petId,
      petName: pet?.name ?? 'Selected pet',
      housingType: values.housingType,
      tenure: values.tenure,
      landlordPermission: values.tenure === 'rent' ? values.landlordPermission : null,
      householdMembers: values.householdMembers.trim(),
      otherPets: values.otherPets.trim(),
      experience: values.experience.trim(),
      workSchedule: values.workSchedule,
      reason: values.reason.trim(),
      commitmentLongTerm: values.commitmentLongTerm,
      commitmentFinancial: values.commitmentFinancial,
      interviewConsent: values.interviewConsent,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
    };
    const saved = await saveSubmission('adoption_requests', record);
    const email = await sendAdminEmail({
      form_type: 'Pet adoption enquiry',
      reference_id: referenceId,
      from_name: record.applicantName,
      reply_to: record.email,
      member_id: record.memberId,
      pet_name: record.petName,
      message: record.reason,
      details: JSON.stringify(record, null, 2),
    });
    removeDraft();
    setSubmission({ saved, email });
    setCompleted(true);
  }

  const handleFieldChange = (event) => {
    setIsReviewing(false);
    form.handleChange(event);
  };

  if (completed) {
    const selectedPet = pets.find((pet) => pet.id === form.values.petId);
    const calendarUrl = makeCalendarUrl(form.values.preferredDate, form.values.preferredTime, selectedPet?.name);
    return (
      <FormPageShell
        className="adopt-page"
        description="Thank you for taking time to think about the home you can offer."
        eyebrow="Enquiry received"
        title="A thoughtful match starts with a conversation."
      >
        <Card className="form-success-card" padding="large">
          <span aria-hidden="true" className="form-success-card__mark">♡</span>
          <h2>Your enquiry reference</h2>
          <p className="form-success-card__reference">{referenceId}</p>
          <p>We have recorded your preferred interview time. The team will confirm it with you before the appointment.</p>
          <SubmissionFeedback referenceId={referenceId} result={submission} />
          <div className="service-form__actions">
            <Button href={calendarUrl} rel="noreferrer" target="_blank" variant="outline">Add to calendar <span aria-hidden="true">↗</span></Button>
            <Button to="/pets">Back to pets</Button>
          </div>
        </Card>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      className="adopt-page"
      description="Adoption enquiries are open to registered members. Verify your membership, then tell us about the home you can offer."
      eyebrow="Adoption enquiry"
      title="Tell us about the home you can offer."
    >
      <div className="service-page__columns service-page__columns--form">
        <div className="service-main">
      {petLoadMessage && <Alert className="service-page__notice" tone="warning">{petLoadMessage}</Alert>}
      <Card className="member-check-card" padding="large">
        <div>
          <p className="eyebrow">Step 1 · member check</p>
          <h2>Are you a Pet Heaven member?</h2>
          <p>Enter the email and member ID from your registration. This student demo checks membership saved in the same browser.</p>
        </div>
        <form className="member-check-form" onSubmit={verifyMember}>
          <FormField autoComplete="email" label="Membership email" name="memberEmail" onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))} required type="email" value={credentials.email} />
          <FormField label="Member ID" name="memberId" onChange={(event) => setCredentials((current) => ({ ...current, memberId: event.target.value }))} required value={credentials.memberId} />
          <Button type="submit">Verify membership</Button>
        </form>
        {memberError && <Alert className="member-check-card__alert" tone="warning">{memberError} <Link to="/join">Join Pet Heaven</Link>.</Alert>}
        {verifiedMember && <Alert className="member-check-card__alert" tone="success">Welcome back, {verifiedMember.fullName}. You can continue with your enquiry.</Alert>}
      </Card>

      {verifiedMember && (
        <Card className="service-form-card adopt-application-card" padding="large">
          <SectionHeading eyebrow="Step 2 · your household" title="Let’s find a good fit." />
          {form.submitError && <SubmissionFeedback error={form.submitError} />}
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submitAdoption)}>
            <FormField error={fieldError('petId')} label="Pet you would like to meet" name="petId" onBlur={form.handleBlur} onChange={handleFieldChange} options={availablePets.map((pet) => ({ value: pet.id, label: `${pet.name} — ${pet.species}, ${pet.breed}` }))} placeholder="Choose a pet" required type="select" value={form.values.petId} />
            <div className="service-form__row">
              <FormField error={fieldError('housingType')} label="Housing type" name="housingType" onBlur={form.handleBlur} onChange={handleFieldChange} options={['HDB flat', 'Condominium', 'Landed home', 'Other'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.housingType} />
              <FormField error={fieldError('tenure')} label="Do you own or rent?" name="tenure" onBlur={form.handleBlur} onChange={handleFieldChange} options={[{ value: 'own', label: 'Own' }, { value: 'rent', label: 'Rent' }]} placeholder="Choose one" required type="select" value={form.values.tenure} />
            </div>
            {form.values.tenure === 'rent' && (
              <FormField checked={form.values.landlordPermission} error={fieldError('landlordPermission')} label="My landlord has agreed to a pet in the home." name="landlordPermission" onBlur={form.handleBlur} onChange={handleFieldChange} required type="checkbox" />
            )}
            <FormField error={fieldError('householdMembers')} hint="Include adults and children, and note any allergies or concerns." label="Who lives in your household?" name="householdMembers" onBlur={form.handleBlur} onChange={handleFieldChange} required value={form.values.householdMembers} />
            <FormField error={fieldError('otherPets')} hint="Include species and how introductions might be managed." label="Other pets in the home" name="otherPets" onBlur={form.handleBlur} onChange={handleFieldChange} value={form.values.otherPets} />
            <FormField error={fieldError('experience')} label="Your pet care experience" name="experience" onBlur={form.handleBlur} onChange={handleFieldChange} required rows={4} type="textarea" value={form.values.experience} />
            <FormField error={fieldError('workSchedule')} label="Typical work or study schedule" name="workSchedule" onBlur={form.handleBlur} onChange={handleFieldChange} options={[
              { value: 'mostly-home', label: 'Mostly at home' },
              { value: 'part-time-away', label: 'Away part of the day' },
              { value: 'full-time-away', label: 'Away most weekdays' },
              { value: 'varies', label: 'Varies week to week' },
            ]} placeholder="Choose one" required type="select" value={form.values.workSchedule} />
            <FormField error={fieldError('reason')} hint="Share what draws you to this pet and what you hope life together will look like." label="Why would you like to adopt?" name="reason" onBlur={form.handleBlur} onChange={handleFieldChange} required rows={5} type="textarea" value={form.values.reason} />

            <fieldset className="service-fieldset">
              <legend>Adoption commitments</legend>
              <FormField checked={form.values.commitmentLongTerm} error={fieldError('commitmentLongTerm')} label="I am ready to care for this pet throughout their life." name="commitmentLongTerm" onBlur={form.handleBlur} onChange={handleFieldChange} required type="checkbox" />
              <FormField checked={form.values.commitmentFinancial} error={fieldError('commitmentFinancial')} label="I can plan for everyday and unexpected care costs." name="commitmentFinancial" onBlur={form.handleBlur} onChange={handleFieldChange} required type="checkbox" />
              <FormField checked={form.values.interviewConsent} error={fieldError('interviewConsent')} label="I agree to an adoption conversation and, if needed, a home visit." name="interviewConsent" onBlur={form.handleBlur} onChange={handleFieldChange} required type="checkbox" />
            </fieldset>

            <div className="service-form__row">
              <FormField error={fieldError('preferredDate')} hint="Choose a future date; the team will confirm availability." label="Preferred interview date" min={minimumFutureDate()} name="preferredDate" onBlur={form.handleBlur} onChange={handleFieldChange} required type="date" value={form.values.preferredDate} />
              <FormField error={fieldError('preferredTime')} label="Preferred time" name="preferredTime" onBlur={form.handleBlur} onChange={handleFieldChange} options={['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.preferredTime} />
            </div>

            {isReviewing && (
              <Card className="adopt-review" padding="medium">
                <div className="adopt-review__heading"><div><p className="eyebrow">Step 3 · review</p><h3>Check your enquiry before sending.</h3></div><Button onClick={() => setIsReviewing(false)} size="small" type="button" variant="outline">Edit answers</Button></div>
                <dl>
                  <div><dt>Pet</dt><dd>{chosenPet ? `${chosenPet.name} · ${chosenPet.species}` : 'Please choose a pet'}</dd></div>
                  <div><dt>Applicant</dt><dd>{verifiedMember.fullName} · {verifiedMember.email}</dd></div>
                  <div><dt>Home</dt><dd>{form.values.housingType} · {form.values.tenure}</dd></div>
                  <div><dt>Household</dt><dd>{form.values.householdMembers}</dd></div>
                  <div><dt>Interview preference</dt><dd>{form.values.preferredDate} at {form.values.preferredTime}</dd></div>
                </dl>
              </Card>
            )}
            <div className="service-form__actions">
              <Button className="service-form__submit" loading={form.isSubmitting} type="submit">
                {form.isSubmitting ? 'Saving your enquiry…' : isReviewing ? 'Confirm and send enquiry' : 'Review my enquiry'}
              </Button>
              <Button
                onClick={() => {
                  form.reset(baseInitialValues);
                  removeDraft();
                  setIsReviewing(false);
                }}
                size="small"
                type="button"
                variant="outline"
              >
                Clear saved draft
              </Button>
            </div>
          </form>
        </Card>
      )}
      <p className="service-sample-note">Membership lookup uses this browser's saved registration. A secure cross-device member check needs an authenticated backend.</p>
        </div>
        <FormGuide
          eyebrow="A thoughtful match"
          title="Your adoption journey"
          currentStep={!verifiedMember ? 1 : isReviewing ? 3 : 2}
          steps={[
            { title: 'Verify membership', text: 'Use the email and member ID from your registration in this browser.' },
            { title: 'Share your home', text: 'Tell us about daily routines, housing, and the care you can offer.' },
            { title: 'Review your enquiry', text: 'Check your answers before sending. The confirmation includes a reference number.' },
          ]}
        >
          <p>Take your time to consider the pet's needs and ask questions before you commit.</p>
          <p>An enquiry starts a conversation. The team will confirm any meeting or interview arrangements with you.</p>
        </FormGuide>
      </div>
    </FormPageShell>
  );
}
