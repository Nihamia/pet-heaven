import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand.jsx';
import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';

const quickLinks = [
  { label: 'About us', to: '/about' },
  { label: 'Adopt a pet', to: '/pets' },
  { label: 'Release a pet', to: '/release' },
  { label: 'Join the community', to: '/join' },
];

// Give visitors a consistent place to find key pages, contact details, and updates.
export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  function handleNewsletterSubmit(event) {
    event.preventDefault();
    setNewsletterMessage('Newsletter registration will be connected in a later phase.');
  }

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <section aria-labelledby="footer-intro-title" className="footer-intro">
          <Brand compact />
          <h2 className="visually-hidden" id="footer-intro-title">About Pet Heaven</h2>
          <p>Every pet deserves kind care, a safe home, and a chance to begin again.</p>
          <div aria-label="Social media links will be added soon" className="social-icons" role="group">
            <span aria-hidden="true">ig</span>
            <span aria-hidden="true">f</span>
            <span aria-hidden="true">▶</span>
            <span className="visually-hidden">Social media links will be added soon</span>
          </div>
        </section>

        <nav aria-label="Footer navigation" className="footer-links">
          <h2 className="footer-heading">Explore</h2>
          <ul>
            {quickLinks.map(({ label, to }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <section aria-labelledby="footer-contact-title" className="footer-contact">
          <h2 className="footer-heading" id="footer-contact-title">Contact</h2>
          <p>Central Singapore<br /><span className="footer-sample-label">Sample project location</span></p>
          <p><a href="mailto:hello@petheaven.example">hello@petheaven.example</a><br />By appointment, Monday–Saturday</p>
          <Link className="footer-text-link" to="/contact">Visit our contact page <span aria-hidden="true">→</span></Link>
        </section>

        <section aria-labelledby="footer-newsletter-title" className="footer-newsletter">
          <h2 className="footer-heading" id="footer-newsletter-title">Notes from Pet Heaven</h2>
          <p>Stories and updates from the animals in our care.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <FormField
              autoComplete="email"
              id="footer-email"
              label="Your email address"
              labelClassName="visually-hidden"
              name="email"
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="Your email address"
              value={newsletterEmail}
              type="email"
              required
              className="newsletter-field"
            />
            <Button size="small" type="submit" variant="secondary">Join list</Button>
          </form>
          <p aria-live="polite" className="newsletter-message">{newsletterMessage}</p>
        </section>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Pet Heaven. All paws welcome.</p>
        <p>
          Hero photo by{' '}
          <a href="https://www.pexels.com/photo/dogs-in-animal-shelter-12195429/" rel="noreferrer" target="_blank">Mia X on Pexels</a>.
        </p>
      </div>
    </footer>
  );
}
