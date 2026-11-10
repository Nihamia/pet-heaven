import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

// Explain the coursework site's browser storage and optional form services in plain language.
export default function PrivacyPage() {
  return (
    <div className="legal-page section-space">
      <div className="container legal-page__content">
        <SectionHeading as="h1" eyebrow="About this website" title="Privacy and your information" description="Pet Heaven is a fictional society created for ISIT207 coursework. Use sample information while exploring its forms." />
        <Card as="section" padding="large">
          <h2>Information you enter</h2>
          <p>The registration, adoption, release, contact, and newsletter forms collect the details you choose to enter. The browser stores favourites, drafts, newsletter interest and copies of submitted requests.</p>
          <h2>Accounts and connected services</h2>
          <p>Firebase Authentication handles your email and password and keeps you signed in on this browser. Firestore stores your member profile and adoption requests under your account, so you can view them after signing in on another device. When configured, Firestore also stores release and contact submissions.</p>
          <p>When EmailJS is connected, it sends the submitted details to the administrator and sends a reference and next steps to the address you provide. Registration role answers and the release urgency flag go in the administrator email. Your password is used only for Firebase Authentication.</p>
          <p>The release photo preview stays in the browser. The email includes the filename and size. Footer newsletter interest is saved in this browser.</p>
          <h2>Managing browser data</h2>
          <p>Sign out from the member menu. Clear this site's storage in your browser settings to remove local form copies, favourites and drafts. Records already sent to a connected service are managed there.</p>
          <h2>Images and outside links</h2>
          <p>Our image credits identify the assets used in the site. Following an external credit link opens a separate website with its own privacy practices. The example contact address and social-channel information belong to this fictional coursework concept.</p>
          <h2>Questions about the project</h2>
          <p>Contact the student responsible for the coursework through the channel provided with the assignment submission. The site's contact form is a demonstration and should not be used for confidential or urgent enquiries.</p>
          <Button to="/contact" variant="outline">View the contact page</Button>
        </Card>
      </div>
    </div>
  );
}
