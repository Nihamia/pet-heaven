import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

// Set clear expectations for the fictional society and its demonstration forms.
export default function TermsPage() {
  return (
    <div className="legal-page section-space">
      <div className="container legal-page__content">
        <SectionHeading as="h1" eyebrow="About this website" title="Terms of this coursework demonstration" description="Pet Heaven is a fictional society created for ISIT207 coursework. Its pages illustrate a charity website experience." />
        <Card as="section" padding="large">
          <h2>A learning project</h2>
          <p>Pet profiles, impact figures, stories, facilities, team descriptions, and visit details are illustrative project content. They do not represent a registered society or confirm that a particular animal is available for adoption.</p>
          <h2>Forms and requests</h2>
          <p>Submitting a form demonstrates an enquiry flow. It does not confirm membership in a real society, an adoption, a handover appointment, or an interview. Reference numbers identify demonstration records only. Use sample details when testing the site.</p>
          <h2>Ways to support</h2>
          <p>Sponsor, volunteer, and wish-list sections describe ways a charity might receive support. This coursework site does not collect payments or arrange real donations. Newsletter interest is saved locally for the demonstration and does not create a real mailing-list subscription.</p>
          <h2>Care and urgent concerns</h2>
          <p>The content is general project information. It is not veterinary advice or an emergency response service. For an animal's immediate welfare needs, contact an appropriate local professional or animal-welfare organisation directly.</p>
          <h2>Credits and reuse</h2>
          <p>The credits page explains the image assets and placeholders used in the project. Any replacement photographs should be used with permission and their creator and source recorded accurately.</p>
          <Button to="/credits" variant="outline">View image credits</Button>
        </Card>
      </div>
    </div>
  );
}
