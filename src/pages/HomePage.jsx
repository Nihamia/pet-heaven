import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageTile from '../components/home/ImageTile.jsx';
import NewsCard from '../components/home/NewsCard.jsx';
import RandomPetPhoto from '../components/home/RandomPetPhoto.jsx';
import StatCounter from '../components/home/StatCounter.jsx';
import StepCard from '../components/home/StepCard.jsx';
import StoryCard from '../components/home/StoryCard.jsx';
import PetCard from '../components/pets/PetCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import FallbackImage from '../components/ui/FallbackImage.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import usePets from '../hooks/usePets.js';
import useScrollReveal from '../hooks/useScrollReveal.js';
import { imageAssets as homeImages } from '../data/images.js';

const actionTiles = [
  { title: 'Adopt', description: 'Find a companion. Begin a new chapter.', to: '/pets', image: homeImages.tileAdopt },
  { title: 'Release', description: 'Talk through a safe next step.', to: '/release', image: homeImages.tileRelease },
  { title: 'Join', description: 'Give your time, care, or support.', to: '/join', image: homeImages.tileJoin },
  { title: 'Sponsor', description: 'Help make everyday care possible.', to: '/get-involved#donate', image: homeImages.tileSponsor },
];

const promises = [
  { number: '01', title: 'Safety comes first', text: 'A calm place to rest, gentle handling, and a care plan shaped around each animal.' },
  { number: '02', title: 'Care for the whole pet', text: 'Health, enrichment, and familiar routines help confidence grow at the pet’s own pace.' },
  { number: '03', title: 'Make thoughtful matches', text: 'Honest profiles and open conversations help households understand the commitment ahead.' },
  { number: '04', title: 'Keep the door open', text: 'Questions are welcome before adoption and while a new companion settles into home.' },
];

const impactStats = [
  { label: 'pets rehomed', target: 1240, suffix: '+' },
  { label: 'pets in care', target: 38, suffix: '' },
  { label: 'community members', target: 620, suffix: '+' },
  { label: 'active volunteers', target: 90, suffix: '+' },
];

const careSteps = [
  {
    number: '01',
    icon: '♡',
    title: 'Meet the pets',
    text: 'Browse their profiles and tell us which personalities feel right for your home.',
  },
  {
    number: '02',
    icon: '☼',
    title: 'Join and enquire',
    text: 'Register as a member, then tell us about your household and the pet you hope to meet.',
  },
  {
    number: '03',
    icon: '⌂',
    title: 'Meet with care',
    text: 'A conversation and a gentle introduction help everyone understand the next step.',
  },
  {
    number: '04',
    icon: '⌂',
    title: 'Settle in together',
    text: 'Prepare your home, establish patient routines, and ask for guidance along the way.',
  },
];

const adopterStories = [
  {
    quote: 'We were given time to learn our new companion’s pace. A year later, coming home still feels like the best part of the day.',
    title: 'A softer place to land',
    image: homeImages.storyHome1,
  },
  {
    quote: 'The team helped us understand what our companion needed before coming home. That patient start made all the difference.',
    title: 'Small routines, growing trust',
    image: homeImages.storyHome2,
  },
  {
    quote: 'We came in looking for a pet and left with a friend who fits our family in a way we never expected.',
    title: 'Room for one more',
    image: homeImages.storyHome3,
  },
];

const newsItems = [
  { id: 'news-care', title: 'A welcome space before the first hello', date: '2026-11-05', displayDate: '5 November 2026', image: homeImages.newsCare, summary: 'A few quiet preparations can make a new home feel less overwhelming.', details: 'Choose a calm resting area, agree on household routines, and check windows, gates, and stored items before the first day. Let a new companion explore gradually and offer predictable breaks. This is an illustrative update for the fictional Pet Heaven society.' },
  { id: 'news-volunteer', title: 'Good care starts with learning', date: '2026-11-02', displayDate: '2 November 2026', image: homeImages.newsVolunteer, summary: 'Volunteers can contribute through practical tasks and patient, consistent support.', details: 'Useful support can include preparing enrichment, organising supplies, and helping keep care spaces tidy. Tell us about your interests when joining so the team can discuss a suitable role. This is an illustrative update rather than an announcement of a scheduled event.' },
  { id: 'news-supplies', title: 'Small supplies, everyday comfort', date: '2026-10-28', displayDate: '28 October 2026', image: homeImages.newsSupplies, summary: 'The simple items used every day help make a care space comfortable.', details: 'Clean towels, appropriate food, litter, and safe enrichment items are useful examples of shelter supplies. Always ask which items and quantities are currently suitable before arranging a contribution. This fictional society does not collect payments through the website.' },
];

// Welcome visitors, feature available pets, and make adoption and support easy to find.
export default function HomePage() {
  const [showMoreFriends, setShowMoreFriends] = useState(false);
  const pageRef = useScrollReveal();
  const { pets, message: petLoadMessage } = usePets();
  const featuredPets = useMemo(() => pets
    .filter((pet) => pet.status === 'Available')
    .sort((first, second) => new Date(second.dateAdded) - new Date(first.dateAdded))
    .slice(0, 4), [pets]);
  const [favouriteIds, setFavouriteIds] = useLocalStorage('pet-heaven-favourites', []);
  const safeFavouriteIds = Array.isArray(favouriteIds) ? favouriteIds : [];
  const favouriteSet = new Set(safeFavouriteIds);

  function toggleFavourite(petId) {
    setFavouriteIds((current) => {
      const safeCurrent = Array.isArray(current) ? current : [];
      return safeCurrent.includes(petId)
        ? safeCurrent.filter((id) => id !== petId)
        : [...safeCurrent, petId];
    });
  }

  return (
    <div className="home-page" ref={pageRef}>
      <section aria-labelledby="home-title" className="home-hero">
        <FallbackImage alt={homeImages.homeHero.alt} className="home-hero__photo" fetchPriority="high" height={homeImages.homeHero.height} loading="eager" src={homeImages.homeHero.path ?? homeImages.homeHero.src} style={{ objectPosition: homeImages.homeHero.objectPosition }} width={homeImages.homeHero.width} />
        <div className="container home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow"><span aria-hidden="true">✦</span> A little love goes a long way</p>
            <h1 id="home-title">Every pet deserves a place to call <em>home.</em></h1>
            <p className="home-hero__description">
              We care for abandoned cats and dogs while helping them find the people and places where they can feel safe again.
            </p>
            <div className="home-hero__actions">
              <Button size="large" to="/pets">Meet the pets <span aria-hidden="true">→</span></Button>
              <Button to="/join" variant="secondary">Be part of the story</Button>
            </div>
            <p className="home-hero__note"><span aria-hidden="true">♡</span> Small acts of care can lead to a lifetime of companionship.</p>
          </div>

        </div>
      </section>

      <section aria-label="Ways to make a difference" className="home-actions section-space" data-reveal>
        <div className="container home-tile-grid">
          {actionTiles.map((tile) => <ImageTile key={tile.title} {...tile} />)}
        </div>
      </section>

      <section aria-labelledby="home-impact-title" className="home-stats">
        <div className="container">
          <div className="home-stats__intro">
            <p className="eyebrow">Care grows when we share it</p>
            <h2 id="home-impact-title">A community making room for more happy endings.</h2>
          </div>
          <dl className="home-stats__grid">
            {impactStats.map((stat) => (
              <StatCounter key={stat.label} {...stat} />
            ))}
          </dl>
          <p className="home-stats__note">Illustrative figures for the fictional Pet Heaven society.</p>
        </div>
      </section>

      <section aria-labelledby="home-promise-title" className="home-promise section-space" data-reveal>
        <div className="container">
          <SectionHeading align="center" description="Every small decision should help a pet feel safer, healthier, and more ready for life with a family." eyebrow="What guides our care" id="home-promise-title" title="Our promise" />
          <div className="home-promise-grid">{promises.map((promise) => <StepCard className="home-promise-card" key={promise.number} {...promise} />)}</div>
          <Link className="text-link home-promise__link" to="/about">Get to know Pet Heaven <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section aria-labelledby="home-steps-title" className="home-section home-steps section-space" data-reveal>
        <div className="container">
          <SectionHeading
            align="center"
            description="Adoption is a relationship, not a race. We help pets and people find a thoughtful way forward together."
            eyebrow="A gentle path forward"
            id="home-steps-title"
            title="How adoption works"
          />
          <div className="home-step-grid">
            {careSteps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
          <Card as="aside" className="home-adoption-checklist" padding="large">
            <div><p className="eyebrow">Before you adopt</p><h3>Make room for a lifelong companion.</h3></div>
            <ul><li>Everyone at home is ready to welcome a pet.</li><li>Your housing allows the pet you hope to adopt.</li><li>You can plan for daily care and veterinary costs.</li><li>You have time for settling in, learning, and play.</li></ul>
            <Button to="/about#about-adoption-title" variant="outline">Explore the adoption process</Button>
          </Card>
        </div>
      </section>

      <section aria-labelledby="home-featured-title" className="home-featured section-space" data-reveal>
        <div className="container">
          {petLoadMessage && <Alert className="home-featured__alert" tone="warning">{petLoadMessage}</Alert>}
          <div className="home-section-heading-row">
            <SectionHeading
              description="Each profile is a small introduction. Take your time, save a favourite, and see who might feel like family."
              eyebrow="Meet a few hopeful hearts"
              id="home-featured-title"
              title="Looking for their person"
            />
            <Button className="home-featured__all-link" to="/pets" variant="outline">See all pets <span aria-hidden="true">→</span></Button>
          </div>
          <div className="pet-grid home-featured__grid">
            {featuredPets.map((pet) => (
              <PetCard
                isFavourite={favouriteSet.has(pet.id)}
                key={pet.id}
                onToggleFavourite={toggleFavourite}
                pet={pet}
              />
            ))}
          </div>
          <p className="home-sample-note">Stock photos illustrate fictional Pet Heaven profiles; they do not identify real animals available for adoption.</p>
        </div>
      </section>

      <section aria-labelledby="home-stories-title" className="home-stories section-space" data-reveal>
        <div className="container">
          <SectionHeading
            align="center"
            description="A good match can change everyday life for everyone in the home."
            eyebrow="Love finds its way"
            id="home-stories-title"
            title="Gone to Good Homes"
          />
          <div className="home-story-grid">
            {adopterStories.map((story) => (
              <StoryCard key={story.title} {...story} />
            ))}
          </div>
          <p className="home-sample-note">These illustrative stories show the kind of settling-in journey we hope to support.</p>
        </div>
      </section>

      <section aria-labelledby="home-news-title" className="home-news section-space" data-reveal id="latest-news">
        <div className="container">
          <SectionHeading align="center" description="Ideas for thoughtful care and ways to take part. These updates are illustrative stories for our fictional society." eyebrow="From our community" id="home-news-title" title="Latest news" />
          <div className="home-news-grid">{newsItems.map((item) => <NewsCard key={item.id} {...item} />)}</div>
        </div>
      </section>

      <section aria-labelledby="home-support-title" className="home-support section-space" data-reveal id="sponsor">
        <div className="container home-support__grid">
          <div>
            <SectionHeading description="Help make the ordinary things possible: a nourishing meal, a clean resting place, and time to play." eyebrow="Care takes a community" id="home-support-title" title="Sponsor a little everyday comfort" />
            <p>Interested in helping a pet while they wait for a home? Tell us how you would like to support their care, and we can discuss a suitable next step.</p>
            <div className="home-support__actions"><Button to="/get-involved" variant="secondary">Become a supporter</Button><Button to="/contact" variant="outline">Ask how to help</Button></div>
            <p className="home-sample-note">Information only. No payments are collected on this website.</p>
          </div>
          <Card as="aside" className="home-needs" id="things-we-need" padding="large">
            <p className="eyebrow">Practical kindness</p><h3>Things we need</h3>
            <ul><li><span aria-hidden="true">◉</span>Appropriate cat and dog food</li><li><span aria-hidden="true">▥</span>Clean towels and washable bedding</li><li><span aria-hidden="true">✦</span>Safe toys and enrichment items</li><li><span aria-hidden="true">▧</span>Litter and everyday care supplies</li></ul>
            <p>Please contact us before arranging any contribution so we can confirm what is suitable.</p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="home-random-friends-title" className="home-random-friends section-space">
        <div className="container">
          <SectionHeading
            align="center"
            description="A small moment of joy from around the web. These random photos are separate from our adoption listings."
            id="home-random-friends-title"
            title="Say hello to a random friend"
          />
          <div className="home-random-friends__grid" id="home-random-friends-grid">
            <RandomPetPhoto species="dog" />
            <RandomPetPhoto species="cat" />
            {showMoreFriends && <RandomPetPhoto key="extra-dog" species="dog" />}
            {showMoreFriends && <RandomPetPhoto key="extra-cat" species="cat" />}
          </div>
          <div className="home-random-friends__more">
            <Button aria-controls="home-random-friends-grid" aria-expanded={showMoreFriends} onClick={() => setShowMoreFriends((current) => !current)} variant="outline">
              {showMoreFriends ? 'Show fewer friends' : 'Show more friends'}
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-release-title" className="home-release">
        <div className="container home-release__inner">
          <div>
            <p className="eyebrow">A hard moment deserves kind support</p>
            <h2 id="home-release-title">Need help finding a safe next step for your pet?</h2>
            <p>Tell us what is happening. We will listen and talk through the options with care.</p>
          </div>
          <Button to="/release" variant="secondary">Talk to our team <span aria-hidden="true">→</span></Button>
        </div>
      </section>
    </div>
  );
}
