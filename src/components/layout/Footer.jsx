import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand.jsx';
import SocialLinks from './SocialLinks.jsx';
import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';
import useForm from '../../hooks/useForm.js';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { email, required } from '../../utils/validators.js';

const linkGroups = [
  { title: 'Adopt', links: [
    { label: 'Available pets', to: '/pets' },
    { label: 'Adoption process', to: '/about#about-adoption-title' },
    { label: 'Release a pet', to: '/release' },
  ] },
  { title: 'Get involved', links: [
    { label: 'Overview', to: '/get-involved' },
    { label: 'Volunteer', to: '/get-involved#volunteer' },
    { label: 'Foster a pet', to: '/get-involved#foster' },
    { label: 'Donate and sponsor', to: '/get-involved#donate' },
    { label: 'Join us', to: '/join' },
  ] },
  { title: 'Our society', links: [
    { label: 'Our story', to: '/about#about-story-title' },
    { label: 'Facilities', to: '/about#about-facilities-title' },
    { label: 'Team', to: '/about#about-team-title' },
    { label: 'FAQ', to: '/about#about-faq-title' },
    { label: 'Contact', to: '/contact' },
  ] },
];

// Give visitors a consistent place to find key pages, contact details, and updates.
export default function Footer() {
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [, setNewsletterInterest] = useLocalStorage('pet-heaven-newsletter', null);
  const newsletter = useForm({
    initialValues: { newsletterEmail: '' },
    validate: (values) => ({ newsletterEmail: required(values.newsletterEmail, 'Email') || email(values.newsletterEmail) }),
  });

  function handleNewsletterSubmit(values) {
    setNewsletterInterest({ email: values.newsletterEmail.trim().toLowerCase(), savedAt: new Date().toISOString() });
    setNewsletterMessage('Your interest is saved in this browser for the coursework demo. No newsletter email has been sent.');
    newsletter.reset();
  }

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <section aria-labelledby="footer-intro-title" className="footer-intro">
          <Brand compact />
          <h2 className="visually-hidden" id="footer-intro-title">About Pet Heaven</h2>
          <p>Every pet deserves kind care, a safe home, and a chance to begin again.</p>
          <SocialLinks className="footer-social" />
        </section>

        {linkGroups.map((group) => (
          <nav aria-label={`Footer ${group.title.toLowerCase()}`} className="footer-links" key={group.title}>
            <h2 className="footer-heading">{group.title}</h2>
            <ul>{group.links.map(({ label, to }) => <li key={`${label}-${to}`}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>

      <div className="container footer-connect">
        <section aria-labelledby="footer-contact-title" className="footer-contact">
          <h2 className="footer-heading" id="footer-contact-title">Contact</h2>
          <p>Singapore <span className="footer-sample-label">Coursework location</span></p>
          <p><Link to="/contact#contact-form">Phone enquiries by appointment</Link><br /><Link to="/contact#contact-form">hello@petheaven.example</Link></p>
          <p>By appointment, Monday–Saturday</p>
          <Link className="footer-text-link" to="/contact">Visit our contact page <span aria-hidden="true">→</span></Link>
        </section>

        <section aria-labelledby="footer-newsletter-title" className="footer-newsletter">
          <h2 className="footer-heading" id="footer-newsletter-title">Notes from Pet Heaven</h2>
          <p>Stories and updates from the animals in our care.</p>
          <form className="newsletter-form" noValidate onSubmit={newsletter.handleSubmit(handleNewsletterSubmit)}>
            <FormField
              autoComplete="email"
              id="footer-email"
              label="Your email address"
              labelClassName="visually-hidden"
              name="newsletterEmail"
              onChange={(event) => { newsletter.handleChange(event); setNewsletterMessage(''); }}
              onBlur={newsletter.handleBlur}
              placeholder="Your email address"
              value={newsletter.values.newsletterEmail}
              error={newsletter.touched.newsletterEmail ? newsletter.errors.newsletterEmail : ''}
              type="email"
              required
              className="newsletter-field"
            />
            <Button loading={newsletter.isSubmitting} size="small" type="submit" variant="secondary">Join list</Button>
          </form>
          <p aria-live="polite" className="newsletter-message">{newsletterMessage}</p>
        </section>
      </div>

      <div className="container footer-bottom">
        <p className="footer-coursework-note">Pet Heaven is a fictional society created for ISIT207 coursework</p>
        <p>© {new Date().getFullYear()} Pet Heaven. All paws welcome.</p>
        <nav aria-label="Legal, image credits and staff access" className="footer-legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/credits">Image credits</Link><Link to="/admin/login">Staff login</Link></nav>
      </div>
    </footer>
  );
}
