import Accordion from '../components/ui/Accordion.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import PageBanner from '../components/ui/PageBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { imageAssets } from '../data/images.js';
import { roles } from '../data/roles.js';

const benefits = [
  { title: 'Member events', description: 'See upcoming orientations and community events in your member area.' },
  { title: 'Care guides', description: 'Find practical guidance for your first volunteer shift or foster placement.' },
  { title: 'Your membership in one place', description: 'View your member card, update your details, and check your adoption requests.' },
];

const questions = roles.flatMap((role) => role.faqs.map((faq, index) => ({ id: `${role.id}-${index}`, ...faq })));

export default function GetInvolvedPage() {
  return (
    <div className="get-involved-page">
      <PageBanner breadcrumb="Get Involved" description="Give your time, offer a temporary home, or support the care animals need every day." image={imageAssets.bannerJoin} title="Get involved" />
      <div className="container section-space get-involved-page__content">
        <section aria-labelledby="involved-intro">
          <SectionHeading description="There’s more than one way to help an animal find a safer place to land. Choose the roles that fit your time, home, and interests." eyebrow="Find your way to help" id="involved-intro" title="Small acts make room for hope." />
          <nav aria-label="Ways to help" className="get-involved-page__jump-links">
            {roles.map((role) => <Button key={role.id} size="small" to={`/get-involved#${role.anchor}`} variant="outline">{role.title}</Button>)}
          </nav>
        </section>

        {roles.map((role) => (
          <Card aria-labelledby={`${role.anchor}-heading`} as="section" className="involved-role" id={role.anchor} key={role.id} padding="large">
            <div className="involved-role__header">
              <span aria-hidden="true" className="role-icon">{role.icon}</span>
              <SectionHeading description={role.summary} id={`${role.anchor}-heading`} title={role.title} />
            </div>
            <p className="involved-role__time"><strong>Time commitment</strong> {role.timeCommitment}</p>
            <div className="involved-role__details">
              <div><h3>What you’ll need</h3><ul>{role.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>How it works</h3><ol>{role.steps.map((item) => <li key={item}>{item}</li>)}</ol></div>
            </div>
            <Button to={`/join?role=${role.id}`} variant="secondary">{role.applyLabel}</Button>
          </Card>
        ))}

        <section aria-labelledby="involved-benefits">
          <SectionHeading eyebrow="Member benefits" id="involved-benefits" title="Resources for your next step" />
          <div className="involved-benefits">
            {benefits.map(({ title, description }) => <Card key={title}><h3>{title}</h3><p>{description}</p></Card>)}
          </div>
        </section>

        <section aria-labelledby="involved-faqs">
          <SectionHeading id="involved-faqs" title="Frequently asked questions" />
          <Accordion items={questions} label="Questions about getting involved" />
        </section>

        <Card as="section" className="get-involved-page__cta" padding="large">
          <SectionHeading description="Create your member account and tell us how you’d like to help." title="Join the Pet Heaven community" />
          <Button to="/join" variant="secondary">Join us</Button>
        </Card>
      </div>
    </div>
  );
}
