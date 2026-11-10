import { useEffect, useState } from 'react';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import FormGuide from '../components/forms/FormGuide.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import SubmissionHoneypot from '../components/forms/SubmissionHoneypot.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useForm from '../hooks/useForm.js';
import useAdminSubmission from '../hooks/useAdminSubmission.js';
import { saveSubmission } from '../services/dataService.js';
import { makeReference } from '../services/referenceService.js';
import { isFutureDate } from '../utils/formUtils.js';
import {
  email as validateEmail,
  imageFile,
  maxLength,
  minLength,
  required,
  singaporePhone,
} from '../utils/validators.js';

function minimumFutureDate() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validateRelease(values) {
  const age = Number(values.petAgeYears);
  return {
    ownerName: required(values.ownerName, 'Your name') || minLength(values.ownerName, 2) || maxLength(values.ownerName, 120),
    email: required(values.email, 'Email') || validateEmail(values.email),
    phone: required(values.phone, 'Phone number') || singaporePhone(values.phone),
    petName: required(values.petName, 'Pet name') || maxLength(values.petName, 100),
    petSpecies: required(values.petSpecies, 'Species'),
    petBreed: required(values.petBreed, 'Breed or best guess') || maxLength(values.petBreed, 100),
    petAgeYears: required(values.petAgeYears, 'Pet age') || (!Number.isFinite(age) || age < 0 ? 'Enter an age of zero or more years.' : ''),
    petGender: required(values.petGender, 'Gender'),
    petSize: required(values.petSize, 'Size'),
    petColour: required(values.petColour, 'Colour') || maxLength(values.petColour, 100),
    vaccinated: required(values.vaccinated, 'Vaccination status'),
    sterilised: required(values.sterilised, 'Sterilisation status'),
    microchip: maxLength(values.microchip, 100),
    healthNotes: maxLength(values.healthNotes, 1500),
    behaviourNotes: maxLength(values.behaviourNotes, 1500),
    reason: required(values.reason, 'Reason for reaching out'),
    reasonDetails: required(values.reasonDetails, 'More about your situation') || minLength(values.reasonDetails, 20) || maxLength(values.reasonDetails, 1500),
    handoverDate: required(values.handoverDate, 'Preferred handover date')
      || (isFutureDate(values.handoverDate) ? '' : 'Choose a date in the future.'),
    petPhoto: imageFile(values.petPhoto),
    consent: required(values.consent, 'Consent to contact you'),
  };
}

const initialValues = {
  ownerName: '',
  email: '',
  phone: '',
  petName: '',
  petSpecies: '',
  petBreed: '',
  petAgeYears: '',
  petGender: '',
  petSize: '',
  petColour: '',
  vaccinated: '',
  sterilised: '',
  microchip: '',
  healthNotes: '',
  behaviourNotes: '',
  reason: '',
  reasonDetails: '',
  handoverDate: '',
  urgent: false,
  petPhoto: null,
  consent: false,
};

// Gather release details and preview the optional photo in the browser.
export default function ReleasePage() {
  const { submission, beginSubmission, honeypotRef, deliver, retry, isRetrying } = useAdminSubmission('release');
  const [referenceId] = useState(() => makeReference('RL'));
  const [photoPreview, setPhotoPreview] = useState(null);
  const form = useForm({ initialValues, validate: validateRelease });
  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';
  const selectedPhoto = form.values.petPhoto;

  useEffect(() => {
    if (!selectedPhoto || imageFile(selectedPhoto) || typeof URL.createObjectURL !== 'function') {
      setPhotoPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(selectedPhoto);
    setPhotoPreview({ file: selectedPhoto, url });
    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto]);

  async function submitRelease(values) {
    beginSubmission();
    const photo = values.petPhoto;
    const record = {
      referenceId,
      ownerName: values.ownerName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      petName: values.petName.trim(),
      petSpecies: values.petSpecies,
      petBreed: values.petBreed.trim(),
      petAgeYears: Number(values.petAgeYears),
      petGender: values.petGender,
      petSize: values.petSize,
      petColour: values.petColour.trim(),
      vaccinated: values.vaccinated,
      sterilised: values.sterilised,
      microchip: values.microchip.trim(),
      healthNotes: values.healthNotes.trim(),
      behaviourNotes: values.behaviourNotes.trim(),
      reason: values.reason,
      reasonDetails: values.reasonDetails.trim(),
      handoverDate: values.handoverDate,
      photoFileName: photo?.name ?? '',
      photoFileType: photo?.type ?? '',
      photoFileSize: photo?.size ?? 0,
      consent: values.consent,
      urgent: values.urgent,
    };
    const saved = await saveSubmission('release_requests', record);
    await deliver(saved, record, referenceId);
    form.reset(initialValues);
  }

  if (submission) {
    const emailSent = submission.email.sent;
    return (
      <FormPageShell
        className="release-page"
        description="Thank you for trusting us with a difficult conversation."
        eyebrow={emailSent ? 'We have your request' : 'Request saved'}
        title={emailSent ? 'You and your pet deserve support.' : 'Your request is saved.'}
      >
        <Card className="form-success-card" padding="large">
          {emailSent && <span aria-hidden="true" className="form-success-card__mark">♡</span>}
          <h2>Your request reference</h2>
          <p className="form-success-card__reference">{referenceId}</p>
          <p>Keep this reference when you speak with the team. A request is the start of a conversation; it does not commit you to a handover.</p>
          <SubmissionFeedback isRetrying={isRetrying} onRetry={retry} result={submission} />
          <Button to="/contact">Contact the team <span aria-hidden="true">→</span></Button>
        </Card>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      className="release-page"
      description="If caring for your pet has become difficult, you deserve a kind conversation. Share only what you can, and we will talk through possible next steps together."
      eyebrow="Rehome a pet"
      title="Let's find a caring next step."
    >
      <div className="service-page__columns service-page__columns--form">
        <div className="service-main">
      <Alert className="service-page__notice" tone="info" title="There may be options to explore">
        Before making a decision, you can ask the team about temporary support, fostering, behaviour guidance, or other practical help. Reaching out does not commit you to releasing your pet.
      </Alert>

      <Card className="service-form-card" padding="large">
        <SectionHeading eyebrow="Private, practical, and non-judgemental" title="Tell us about you and your pet." />
        {form.submitError && <SubmissionFeedback error={form.submitError} />}
        <form className="service-form" noValidate onSubmit={form.handleSubmit(submitRelease)}>
          <SubmissionHoneypot inputRef={honeypotRef} />

          <fieldset className="service-fieldset">
            <legend>Your contact details</legend>
            <FormField autoComplete="name" error={fieldError('ownerName')} label="Your name" name="ownerName" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.ownerName} />
            <div className="service-form__row">
              <FormField autoComplete="email" error={fieldError('email')} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
              <FormField autoComplete="tel" error={fieldError('phone')} hint="8 digits beginning with 6, 8, or 9; +65 is optional." label="Phone number" name="phone" onBlur={form.handleBlur} onChange={form.handleChange} required type="tel" value={form.values.phone} />
            </div>
          </fieldset>

          <fieldset className="service-fieldset">
            <legend>About your pet</legend>
            <div className="service-form__row">
              <FormField error={fieldError('petName')} label="Pet's name" name="petName" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.petName} />
              <FormField error={fieldError('petSpecies')} label="Species" name="petSpecies" onBlur={form.handleBlur} onChange={form.handleChange} options={['Dog', 'Cat'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.petSpecies} />
            </div>
            <div className="service-form__row">
              <FormField error={fieldError('petBreed')} label="Breed or best guess" name="petBreed" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.petBreed} />
              <FormField error={fieldError('petAgeYears')} label="Age in years" min="0" name="petAgeYears" onBlur={form.handleBlur} onChange={form.handleChange} required type="number" value={form.values.petAgeYears} />
            </div>
            <div className="service-form__row service-form__row--three">
              <FormField error={fieldError('petGender')} label="Gender" name="petGender" onBlur={form.handleBlur} onChange={form.handleChange} options={['Female', 'Male', 'Unknown'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.petGender} />
              <FormField error={fieldError('petSize')} label="Size" name="petSize" onBlur={form.handleBlur} onChange={form.handleChange} options={['Small', 'Medium', 'Large'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.petSize} />
              <FormField error={fieldError('petColour')} label="Colour" name="petColour" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.petColour} />
            </div>
            <div className="service-form__row">
              <FormField error={fieldError('vaccinated')} label="Vaccinated?" name="vaccinated" onBlur={form.handleBlur} onChange={form.handleChange} options={['Yes', 'No', 'Not sure'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.vaccinated} />
              <FormField error={fieldError('sterilised')} label="Sterilised?" name="sterilised" onBlur={form.handleBlur} onChange={form.handleChange} options={['Yes', 'No', 'Not sure'].map((value) => ({ value, label: value }))} placeholder="Choose one" required type="select" value={form.values.sterilised} />
            </div>
            <FormField error={fieldError('microchip')} label="Microchip number, if known" name="microchip" onBlur={form.handleBlur} onChange={form.handleChange} value={form.values.microchip} />
            <FormField error={fieldError('healthNotes')} label="Health notes" name="healthNotes" onBlur={form.handleBlur} onChange={form.handleChange} rows={3} type="textarea" value={form.values.healthNotes} />
            <FormField error={fieldError('behaviourNotes')} label="Behaviour and daily routine" name="behaviourNotes" onBlur={form.handleBlur} onChange={form.handleChange} rows={3} type="textarea" value={form.values.behaviourNotes} />
            <FormField accept="image/*" error={fieldError('petPhoto')} hint="Optional. Choose one image under 2 MB. The email includes its filename and size." label="Pet photo (optional)" name="petPhoto" onBlur={form.handleBlur} onChange={form.handleChange} type="file" />
            {photoPreview && photoPreview.file === selectedPhoto && (
              <img alt="Selected pet photo preview" className="release-photo-preview" height="240" loading="lazy" src={photoPreview.url} width="320" />
            )}
          </fieldset>

          <fieldset className="service-fieldset">
            <legend>Your situation and possible handover</legend>
            <FormField error={fieldError('reason')} label="What is the main reason you are reaching out?" name="reason" onBlur={form.handleBlur} onChange={form.handleChange} options={[
              { value: 'housing', label: 'Housing or landlord change' },
              { value: 'financial', label: 'Financial pressure' },
              { value: 'health', label: 'Health or caregiving needs' },
              { value: 'behaviour', label: 'Behaviour support' },
              { value: 'family', label: 'Family or life change' },
              { value: 'other', label: 'Another reason' },
            ]} placeholder="Choose one" required type="select" value={form.values.reason} />
            <FormField error={fieldError('reasonDetails')} hint="Share only what you feel comfortable sharing." label="Tell us a little more" name="reasonDetails" onBlur={form.handleBlur} onChange={form.handleChange} required rows={5} type="textarea" value={form.values.reasonDetails} />
            <FormField error={fieldError('handoverDate')} hint="This is a preference only. We will confirm availability with you." label="Preferred handover date" min={minimumFutureDate()} name="handoverDate" onBlur={form.handleBlur} onChange={form.handleChange} required type="date" value={form.values.handoverDate} />
            <FormField checked={form.values.urgent} hint="Flags your request for the team." label="Mark this request as urgent" name="urgent" onChange={form.handleChange} type="checkbox" />
          </fieldset>

          <FormField checked={form.values.consent} error={fieldError('consent')} label="I agree that the Pet Heaven team may contact me about this request." name="consent" onBlur={form.handleBlur} onChange={form.handleChange} required type="checkbox" />
          <Button className="service-form__submit" loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Saving and sending…' : 'Send a support request'}</Button>
        </form>
      </Card>
        </div>
        <FormGuide
          eyebrow="One step at a time"
          title="Support without judgement"
          steps={[
            { title: 'Share what you can', text: 'Describe your pet, their routine, and the situation you would like help with.' },
            { title: 'Talk through options', text: 'A conversation can help identify practical support or a safe rehoming plan.' },
            { title: 'Agree on the next step', text: 'A preferred handover date is a request until the team confirms arrangements.' },
          ]}
        >
          <p>Your situation matters. Reaching out is a way to explore support for both you and your pet.</p>
          <p>You do not need to make a handover decision before asking for help.</p>
        </FormGuide>
      </div>
    </FormPageShell>
  );
}
