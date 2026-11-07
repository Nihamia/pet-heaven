import { useState } from 'react';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useForm from '../hooks/useForm.js';
import { sendAdminEmail } from '../services/emailService.js';
import { saveSubmission } from '../services/dataService.js';
import { email as validateEmail, maxLength, minLength, required, singaporePhone } from '../utils/validators.js';
import { makeReference } from '../utils/formUtils.js';

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
  const [submission, setSubmission] = useState(null);
  const [referenceId, setReferenceId] = useState(() => makeReference('PH-CON'));
  const form = useForm({ initialValues, validate: validateContact });
  const fieldError = (name) => form.touched[name] ? form.errors[name] : '';

  async function submitContact(values) {
    const record = {
      referenceId,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };
    const saved = await saveSubmission('contact_messages', record);
    const email = await sendAdminEmail({
      form_type: 'Website contact message',
      reference_id: referenceId,
      from_name: record.name,
      reply_to: record.email,
      subject: record.subject,
      message: record.message,
      details: JSON.stringify(record, null, 2),
    });
    setSubmission({ saved, email, referenceId });
    form.reset(initialValues);
    setReferenceId(makeReference('PH-CON'));
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
          <div><p className="eyebrow">Email</p><h2><a href="mailto:hello@petheaven.example">hello@petheaven.example</a></h2><p>Sample address for this project.</p></div>
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
          {submission && <SubmissionFeedback referenceId={submission.referenceId} result={submission} />}
          {submission && !submission.email.sent && (
            <Alert className="contact-page__setup-note" tone="info">
              If your question needs a quick response, contact the administrator directly after configuring the sample email service.
            </Alert>
          )}
          <form className="service-form" noValidate onSubmit={form.handleSubmit(submitContact)}>
            <FormField autoComplete="name" error={fieldError('name')} label="Your name" name="name" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.name} />
            <FormField autoComplete="email" error={fieldError('email')} label="Email address" name="email" onBlur={form.handleBlur} onChange={form.handleChange} required type="email" value={form.values.email} />
            <FormField autoComplete="tel" error={fieldError('phone')} hint="Optional. If entered, use a Singapore number." label="Phone number" name="phone" onBlur={form.handleBlur} onChange={form.handleChange} type="tel" value={form.values.phone} />
            <FormField error={fieldError('subject')} label="Subject" name="subject" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.subject} />
            <FormField error={fieldError('message')} hint="Please avoid including sensitive personal information." label="Message" name="message" onBlur={form.handleBlur} onChange={form.handleChange} required rows={6} type="textarea" value={form.values.message} />
            <Button className="service-form__submit" loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Sending…' : 'Send message'}</Button>
          </form>
        </Card>

        <aside className="contact-side">
          <Card className="contact-map-card" padding="none">
            <iframe
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Central%20Singapore&output=embed"
              title="Map showing Central Singapore, a sample project location"
            />
            <div className="contact-map-card__caption"><span className="eyebrow">Find us</span><p>Central Singapore (sample location)</p></div>
          </Card>
          <Card className="contact-social-card" padding="large">
            <p className="eyebrow">Stay connected</p>
            <h2>Follow along</h2>
            <p>Sample links below go to the social platforms. Replace them with official Pet Heaven accounts.</p>
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
