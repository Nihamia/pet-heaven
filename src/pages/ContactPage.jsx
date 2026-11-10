import { useState } from 'react';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import FormGuide from '../components/forms/FormGuide.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import SubmissionHoneypot from '../components/forms/SubmissionHoneypot.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useForm from '../hooks/useForm.js';
import useAdminSubmission from '../hooks/useAdminSubmission.js';
import { saveSubmission } from '../services/dataService.js';
import { email as validateEmail, maxLength, minLength, required, singaporePhone } from '../utils/validators.js';
import { makeReference } from '../services/referenceService.js';

const initialValues = { name: '', email: '', phone: '', subject: '', message: '' };
const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

// Validate contact details and make the sample address, hours, and social channels easy to find.
function validateContact(values) {
  return {
    name: required(values.name, 'Name') || minLength(values.name, 2) || maxLength(values.name, 120),
    email: required(values.email, 'Email') || validateEmail(values.email),
    phone: singaporePhone(values.phone),
    subject: required(values.subject, 'Subject') || maxLength(values.subject, 120),
    message: required(values.message, 'Message') || minLength(values.message, 10) || maxLength(values.message, 2000),
  };
}

// Let visitors send a question and view Pet Heaven's sample contact information.
export default function ContactPage() {
  const { submission, beginSubmission, honeypotRef, deliver, retry, isRetrying, clearSubmission } = useAdminSubmission('contact');
  const [referenceId, setReferenceId] = useState(() => makeReference('CT'));
  const form = useForm({ initialValues, validate: validateContact });
  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';

  async function submitContact(values) {
    if (isRetrying) return;
    beginSubmission();
    clearSubmission();
    const record = {
      referenceId,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };
    const saved = await saveSubmission('contact_messages', record);
    await deliver(saved, record, referenceId);
    form.reset(initialValues);
    setReferenceId(makeReference('CT'));
  }

  return (
    <FormPageShell
      className="contact-page"
      description="Ask about an adoption, membership, volunteering, or the care we provide. We will get back to you as soon as we can."
      eyebrow="We are here to help"
      title="A kind conversation can start here."
    >
      <div className="contact-info-grid">
        <Card className="contact-info-card" padding="medium">
          <span aria-hidden="true" className="contact-info-card__icon">⌖</span>
          <div><p className="eyebrow">Visit</p><h2>Central Singapore</h2><p>Visits are arranged by appointment.</p></div>
        </Card>
        <Card className="contact-info-card" padding="medium">
          <span aria-hidden="true" className="contact-info-card__icon">✉</span>
          <div><p className="eyebrow">Email</p><h2><a href="#contact-form">hello@petheaven.example</a></h2><p>Sample address for this project.</p></div>
        </Card>
        <Card className="contact-info-card" padding="medium">
          <span aria-hidden="true" className="contact-info-card__icon">◷</span>
          <div><p className="eyebrow">Opening hours</p><h2>By appointment</h2><p>Monday–Saturday, 10:00 am–6:00 pm.</p></div>
        </Card>
      </div>

      <div className="contact-content-grid">
        <Card className="service-form-card" padding="large">
          <SectionHeading eyebrow="Send a message" title="What would you like to know?" />
          {form.submitError && <SubmissionFeedback error={form.submitError} />}
          <SubmissionFeedback isRetrying={isRetrying} onRetry={form.isSubmitting ? undefined : retry} result={submission} />
          <form className="service-form" id="contact-form" noValidate onSubmit={form.handleSubmit(submitContact)}>
            <SubmissionHoneypot inputRef={honeypotRef} />
            <FormField autoComplete="name" error={fieldError('name')} label="Your name" name="name" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.name} />
            <FormField autoComplete="email" error={fieldError('email')} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
            <FormField autoComplete="tel" error={fieldError('phone')} hint="Optional. If entered, use a Singapore number." label="Phone number" name="phone" onBlur={form.handleBlur} onChange={form.handleChange} type="tel" value={form.values.phone} />
            <FormField error={fieldError('subject')} label="Subject" name="subject" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.subject} />
            <FormField error={fieldError('message')} hint="Please avoid including sensitive personal information." label="Message" name="message" onBlur={form.handleBlur} onChange={form.handleChange} required rows={6} type="textarea" value={form.values.message} />
            <Button className="service-form__submit" disabled={isRetrying} loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Sending…' : 'Send message'}</Button>
          </form>
        </Card>

        <aside className="contact-side">
          <FormGuide
            as="section"
            eyebrow="Getting in touch"
            title="A clear route to the team"
            steps={[
              { title: 'Send your question', text: 'A clear subject helps explain the information or support you need.' },
              { title: 'Keep your reference', text: 'The feedback after sending includes a reference for your message.' },
              { title: 'Follow up if needed', text: 'Use that reference if you contact the team again about the same question.' },
            ]}
          >
            <p>For a specific pet, start with their profile and the adoption enquiry so the team has the relevant details.</p>
            <Button size="small" to="/pets" variant="outline">Browse available pets</Button>
          </FormGuide>
          <Card className="contact-map-card" padding="none">
            <iframe
              height="450"
              width="600"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Central%20Singapore&output=embed"
              title="Map showing Central Singapore, a sample project location"
            />
            <div className="contact-map-card__caption"><span className="eyebrow">Find us</span><p>Central Singapore (sample location)</p></div>
          </Card>
          <Card className="contact-social-card" id="social-channels" padding="large">
            <p className="eyebrow">Stay connected</p>
            <h2>Follow along</h2>
            <p>Pet Heaven is a coursework society and has no official social accounts. These links open the platforms themselves; use the contact form for this project.</p>
            <ul>
              {socialLinks.map((social) => (
                <li key={social.label}><a href={social.href} rel="noreferrer" target="_blank">{social.label}<span aria-hidden="true">↗</span></a></li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <p className="service-sample-note">Contact information and opening hours shown here are illustrative project details.</p>
    </FormPageShell>
  );
}
