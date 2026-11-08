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
          <p>The registration, adoption, release, contact, and newsletter forms may collect the details you choose to enter. The coursework demonstration stores form records, newsletter interest, favourites, and drafts in your browser. Saved browser data stays on that browser and device.</p>
          <h2>Optional connected services</h2>
          <p>If configured by the project developer, form records may also be sent to Firebase Firestore and administrator notifications may be sent through EmailJS. The newsletter form currently saves interest in this browser only and does not send a subscription email. Passwords entered during registration are validated but are not included in saved member records or administrator emails.</p>
          <h2>Managing browser data</h2>
          <p>You can remove this demonstration's saved information by clearing this site's storage in your browser settings. Doing so also removes saved favourites, drafts, and the member details used for the same-browser adoption check. Clearing browser storage does not remove any records already sent to a connected service.</p>
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
