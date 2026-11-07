import Accordion from '../components/ui/Accordion.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

const storyMoments = [
  {
    label: 'The beginning',
    title: 'One spare room, one promise',
    text: 'Pet Heaven starts with neighbours making room for animals who have nowhere safe to go.',
  },
  {
    label: 'Growing together',
    title: 'A circle of foster homes',
    text: 'More people offer time, transport, and a quiet place to recover while each pet waits for a match.',
  },
  {
    label: 'A safer landing',
    title: 'Care built around each pet',
    text: 'The community adds veterinary support, enrichment, and a slower, more thoughtful adoption process.',
  },
  {
    label: 'Today',
    title: 'A little more hope, every day',
    text: 'The work continues through practical care and a network of people willing to show up for animals.',
  },
];

const facilities = [
  {
    icon: '⌂',
    title: 'A calm shelter',
    text: 'Clean, secure rooms give animals a predictable place to rest, eat, and get used to human company.',
    tag: 'Rest & routine',
  },
  {
    icon: '✚',
    title: 'Veterinary care',
    text: 'Health checks, treatment plans, and follow-up care help each pet feel their best before adoption.',
    tag: 'Health first',
  },
  {
    icon: '☼',
    title: 'Play and enrichment',
    text: 'Safe play areas and gentle activities help animals build confidence and show their personalities.',
    tag: 'Room to explore',
  },
  {
    icon: '◌',
    title: 'Quiet recovery space',
    text: 'New arrivals and animals needing extra care can settle at their own pace in a lower-stimulation area.',
    tag: 'Time to settle',
  },
];

const adoptionSteps = [
  { number: '01', title: 'Start with a profile', text: 'Browse available pets and think about the needs, energy, and routines that fit your household.' },
  { number: '02', title: 'Have a conversation', text: 'Share your questions and tell the team about your home, experience, and expectations.' },
  { number: '03', title: 'Meet and prepare', text: 'Spend time with a potential match and plan for supplies, introductions, and settling in.' },
  { number: '04', title: 'Welcome them home', text: 'Complete the adoption plan and stay in touch while your new companion adjusts.' },
];

const teamRoles = [
  { icon: '♡', title: 'Animal care team', text: 'Keeps daily routines, feeding, comfort, and observation centred on each pet.' },
  { icon: '✚', title: 'Veterinary partners', text: 'Support check-ups, treatment, vaccination, and practical health guidance.' },
  { icon: '⌂', title: 'Foster community', text: 'Offers temporary homes where pets can rest and practise family life.' },
  { icon: '↗', title: 'Adoption coordinators', text: 'Help people and pets meet thoughtfully, with clear expectations on both sides.' },
];

const faqItems = [
  {
    id: 'fees',
    title: 'Is there an adoption fee?',
    content: <p>Adoption fees help contribute to care such as health checks, vaccinations, and supplies. The exact fee depends on the animal and should be confirmed with the team before applying.</p>,
  },
  {
    id: 'interview',
    title: 'Why do you have an interview or home visit?',
    content: <p>It gives everyone a chance to talk through routines, safety, and expectations. It is a supportive conversation to find a good fit, not a test with trick questions.</p>,
  },
  {
    id: 'vaccination',
    title: 'Are pets vaccinated before adoption?',
    content: <p>Each profile explains the pet’s current health notes. The team will share the available records and explain any follow-up vaccinations or care that may still be needed.</p>,
  },
  {
    id: 'return',
    title: 'What if the adoption does not work out?',
    content: <p>Please contact the team as early as possible. We will listen, discuss practical support, and agree on a safe next step for the pet.</p>,
  },
];

const eligibilityItems = [
  'Be at least 18 years old and able to make a long-term care commitment.',
  'Have permission from everyone sharing the home; renters should check landlord approval.',
  'Be ready to budget for food, veterinary care, enrichment, and unexpected needs.',
  'Introduce resident pets and children gradually, following the team’s guidance.',
  'Agree to a conversation and, where helpful, a home safety check before adoption.',
];

// Explain Pet Heaven's care approach, facilities, adoption process, people, and visit details.
export default function AboutPage() {
  return (
    <div className="about-page">
      <section aria-labelledby="about-title" className="about-hero">
        <div className="container about-hero__inner">
          <Badge tone="teal">Care with patience</Badge>
          <SectionHeading
            as="h1"
            description="Pet Heaven is a community built around a simple idea: every animal deserves safety, thoughtful care, and a real chance to belong."
            eyebrow="A place to begin again"
            id="about-title"
            title="A little care can change a whole life."
          />
          <p className="about-hero__note">We care for abandoned cats and dogs in Singapore, and help people take the next step with confidence.</p>
        </div>
      </section>

      <section aria-labelledby="about-purpose-title" className="about-purpose section-space">
        <div className="container about-purpose__grid">
          <div className="about-purpose__stamp" aria-hidden="true"><span>Care</span><b>♡</b><span>Belong</span></div>
          <div>
            <SectionHeading
              description="Our purpose is to provide a safe pause between a difficult past and a more hopeful future."
              eyebrow="Our purpose"
              id="about-purpose-title"
              title="Every animal is more than a case file."
            />
            <p>We learn what helps each pet feel secure, support their health and behaviour, and share honest information with potential adopters. We want each match to start with understanding and grow through steady care.</p>
            <div className="about-purpose__values">
              <span><b>01</b> Safety before speed</span>
              <span><b>02</b> Honest, kind guidance</span>
              <span><b>03</b> A home for every story</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-story-title" className="about-story section-space">
        <div className="container">
          <SectionHeading
            description="The details change from pet to pet. The promise stays the same: offer care, make space, and keep looking for a safe next step."
            eyebrow="Our story"
            id="about-story-title"
            title="A community that keeps showing up."
          />
          <ol className="about-timeline">
            {storyMoments.map((moment, index) => (
              <li className="about-timeline__item" key={moment.label}>
                <span aria-hidden="true" className="about-timeline__marker">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="eyebrow">{moment.label}</p>
                  <h3>{moment.title}</h3>
                  <p>{moment.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="about-facilities-title" className="about-facilities section-space">
        <div className="container">
          <SectionHeading
            align="center"
            description="A good shelter is more than a place to stay. Each space supports a different part of feeling safe and well."
            eyebrow="Room to heal and grow"
            id="about-facilities-title"
            title="Thoughtful care, in every corner."
          />
          <div className="about-facility-grid">
            {facilities.map((facility) => (
              <Card className="about-facility-card" key={facility.title} padding="large">
                <span aria-hidden="true" className="about-facility-card__icon">{facility.icon}</span>
                <Badge tone="teal">{facility.tag}</Badge>
                <h3>{facility.title}</h3>
                <p>{facility.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-adoption-title" className="about-adoption section-space">
        <div className="container">
          <SectionHeading
            description="The right match begins with open questions and a plan that works for both the pet and the household."
            eyebrow="Adoption, step by step"
            id="about-adoption-title"
            title="A thoughtful way to meet."
          />
          <div className="about-adoption__grid">
            <ol className="about-adoption-steps">
              {adoptionSteps.map((step) => (
                <li key={step.number}>
                  <span aria-hidden="true">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                </li>
              ))}
            </ol>
            <Card className="about-eligibility" padding="large">
              <p className="eyebrow">Before you enquire</p>
              <h3>Is your home ready?</h3>
              <p>These are conversation starters to help you prepare for a new companion.</p>
              <ul>
                {eligibilityItems.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
              <Button to="/pets" variant="outline">Explore available pets <span aria-hidden="true">→</span></Button>
            </Card>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-team-title" className="about-team section-space">
        <div className="container">
          <SectionHeading
            description="Good care is a team effort. Different people bring the steady hands, practical knowledge, and spare room each animal needs."
            eyebrow="People who care"
            id="about-team-title"
            title="A community behind every new beginning."
          />
          <div className="about-team-grid">
            {teamRoles.map((role, index) => (
              <Card className="about-team-card" key={role.title} padding="medium">
                <div aria-hidden="true" className={`about-team-card__avatar about-team-card__avatar--${index + 1}`}>{role.icon}</div>
                <h3>{role.title}</h3>
                <p>{role.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-faq-title" className="about-faq section-space">
        <div className="container about-faq__grid">
          <div>
            <SectionHeading
              description="Clear answers help people and pets start on the right paw."
              eyebrow="Questions are welcome"
              id="about-faq-title"
              title="A few things people ask."
            />
            <p>Still unsure? Send us a note and we will help you find the information you need.</p>
            <Button to="/contact" variant="outline">Contact the team <span aria-hidden="true">→</span></Button>
          </div>
          <Accordion items={faqItems} label="Frequently asked questions about adoption" />
        </div>
      </section>

      <section aria-labelledby="about-visit-title" className="about-visit section-space">
        <div className="container about-visit__grid">
          <div>
            <SectionHeading
              description="Visits are arranged by appointment so each animal can meet new people at a comfortable pace."
              eyebrow="Come say hello"
              id="about-visit-title"
              title="Find us in Singapore."
            />
            <p className="about-visit__sample-note">Sample project details: replace the location and hours below with verified shelter information.</p>
          </div>
          <Card className="about-visit-card" padding="large">
            <div>
              <span aria-hidden="true" className="about-visit-card__icon">⌖</span>
              <div><p className="eyebrow">Location</p><h3>Central Singapore</h3><p>Address shared when a visit is confirmed.</p></div>
            </div>
            <div>
              <span aria-hidden="true" className="about-visit-card__icon">◷</span>
              <div><p className="eyebrow">Visiting hours</p><h3>By appointment</h3><p>Monday–Saturday, 10:00 am–6:00 pm</p></div>
            </div>
            <Button to="/contact">Ask about a visit <span aria-hidden="true">→</span></Button>
          </Card>
        </div>
      </section>

      <section aria-label="Project content note" className="about-project-note">
        <div className="container"><p>This is a university project concept. Policies, care details, and visit information are illustrative and should be verified before public use.</p></div>
      </section>
    </div>
  );
}
