import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PetCard from '../components/pets/PetCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import usePets from '../hooks/usePets.js';

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
    title: 'Get to know each other',
    text: 'Our team will help arrange a conversation and a gentle first meeting.',
  },
  {
    number: '03',
    icon: '⌂',
    title: 'Make room for love',
    text: 'Prepare together, welcome your new companion, and keep in touch as they settle in.',
  },
];

const adopterStories = [
  {
    quote: 'We were given time to learn Luna’s pace. A year later, she still greets us at the door like it is the best day of her life.',
    name: 'A new beginning with Luna',
    detail: 'Illustrative adopter story',
  },
  {
    quote: 'The team helped us understand what Milo needed before we brought him home. That patient start made all the difference.',
    name: 'A calm start for Milo',
    detail: 'Illustrative adopter story',
  },
  {
    quote: 'We came in looking for a pet and left with a friend who fits our family in a way we never expected.',
    name: 'Room for one more',
    detail: 'Illustrative adopter story',
  },
];

// Animate a community figure once it enters view, with a reduced-motion alternative.
function CountUp({ target, suffix = '' }) {
  const [value, setValue] = useState(0);
  const numberRef = useRef(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;

    let frameId;
    let observer;
    let hasStarted = false;

    function animate() {
      if (hasStarted) return;
      hasStarted = true;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        setValue(target);
        return;
      }

      const startedAt = performance.now();
      const duration = 1100;
      function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setValue(Math.round(target * easedProgress));
        if (progress < 1) frameId = window.requestAnimationFrame(tick);
      }
      frameId = window.requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          animate();
        }
      }, { threshold: 0.35 });
      observer.observe(element);
    } else {
      animate();
    }

    return () => {
      observer?.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return <span ref={numberRef}>{value.toLocaleString()}{suffix}</span>;
}

// Welcome visitors, feature available pets, and make adoption and support easy to find.
export default function HomePage() {
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
    <div className="home-page">
      <section aria-labelledby="home-title" className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow"><span aria-hidden="true">✦</span> A little love goes a long way</p>
            <h1 id="home-title">Every pet deserves a place to call <em>home.</em></h1>
            <p className="home-hero__description">
              We care for abandoned cats and dogs while helping them find the people and places where they can feel safe again.
            </p>
            <div className="home-hero__actions">
              <Button size="large" to="/pets">Meet the pets <span aria-hidden="true">→</span></Button>
              <Button to="/join" variant="outline">Be part of the story</Button>
            </div>
            <p className="home-hero__note"><span aria-hidden="true">♡</span> Small acts of care can lead to a lifetime of companionship.</p>
          </div>

          <figure className="home-hero__media">
            <img
              alt="A group of dogs at an animal shelter, ready for a new home"
              fetchPriority="high"
              src="https://images.pexels.com/photos/12195429/pexels-photo-12195429.jpeg?auto=compress&cs=tinysrgb&w=1400"
            />
            <figcaption>
              A safe place to wait for a new beginning.
              <a href="https://www.pexels.com/photo/dogs-in-animal-shelter-12195429/" rel="noreferrer" target="_blank">Photo by Mia X on Pexels</a>
            </figcaption>
            <span aria-hidden="true" className="home-hero__sticker">Rescue<br />Rehome<br /><b>♡</b></span>
          </figure>
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
              <div className="home-stat" key={stat.label}>
                <dt>{stat.label}</dt>
                <dd><CountUp suffix={stat.suffix} target={stat.target} /></dd>
              </div>
            ))}
          </dl>
          <p className="home-stats__note">Sample figures for this student project; replace with verified organisation data.</p>
        </div>
      </section>

      <section aria-labelledby="home-steps-title" className="home-section home-steps section-space">
        <div className="container">
          <SectionHeading
            align="center"
            description="Adoption is a relationship, not a race. We help pets and people find a thoughtful way forward together."
            eyebrow="A gentle path forward"
            id="home-steps-title"
            title="How it works"
          />
          <div className="home-step-grid">
            {careSteps.map((step) => (
              <Card className="home-step-card" key={step.number} padding="large">
                <div aria-hidden="true" className="home-step-card__top">
                  <span className="home-step-card__icon">{step.icon}</span>
                  <span className="home-step-card__number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="home-featured-title" className="home-featured section-space">
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
          <p className="home-sample-note">Pet profile images are placeholders. Add credited Unsplash or Pexels photos before submission.</p>
        </div>
      </section>

      <section aria-labelledby="home-mission-title" className="home-mission section-space">
        <div className="container home-mission__grid">
          <div aria-hidden="true" className="home-mission__mark">♡</div>
          <div>
            <p className="eyebrow">Why Pet Heaven</p>
            <h2 id="home-mission-title">Care that sees the whole animal.</h2>
            <p>
              A pet needs more than a roof. We make space for veterinary care, patient routines, enrichment, and the trust it takes to begin again. Every next step is shaped around the animal in front of us.
            </p>
            <Link className="text-link" to="/about">Learn about our approach <span aria-hidden="true">→</span></Link>
          </div>
          <div className="home-mission__promise">
            <span aria-hidden="true">✦</span>
            <p>Kindness, patience, and a safe landing place.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-stories-title" className="home-stories section-space">
        <div className="container">
          <SectionHeading
            align="center"
            description="A good match can change everyday life for everyone in the home."
            eyebrow="Love finds its way"
            id="home-stories-title"
            title="Little stories, big heart"
          />
          <div className="home-story-grid">
            {adopterStories.map((story) => (
              <Card className="home-story-card" key={story.name} padding="large">
                <span aria-hidden="true" className="home-story-card__quote">“</span>
                <blockquote>{story.quote}</blockquote>
                <p className="home-story-card__name">{story.name}</p>
                <p className="home-story-card__detail">{story.detail}</p>
              </Card>
            ))}
          </div>
          <p className="home-sample-note">These example stories are illustrative project content; replace them with consented adopter stories.</p>
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
