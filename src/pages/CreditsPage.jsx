import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import FallbackImage from '../components/ui/FallbackImage.jsx';
import { imageCredits } from '../data/images.js';

const categories = [...new Set(imageCredits.map((image) => image.category))];
const creditFields = ['photographer', 'source', 'url', 'licence'];

function hasPendingCredits(image) {
  return creditFields.some((field) => !image.credit?.[field] || image.credit[field] === 'TO BE CONFIRMED');
}

function isSourceLink(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

// Generate the complete image catalogue from the same descriptors used by the site.
export default function CreditsPage() {
  return <div className="section-space legal-page"><div className="container">
    <SectionHeading as="h1" eyebrow="Creative acknowledgements" title="Image credits" description="Every image used in this fictional society's website is recorded here." />
    <Card className="credits-intro" padding="large"><h2>Stock photos, clearly acknowledged</h2>
      <p>The project owner supplied these local photos as downloads from free stock photo sites, including Unsplash, Pexels and Pixabay. Individual photographers, original source pages and licences are being confirmed.</p>
      <p>Stock photos illustrate this fictional coursework society. They do not identify actual Pet Heaven animals, adopters, facilities or staff. This catalogue records every supplied photo and the original local fallback illustration; a photo used in several places is listed once.</p>
      <p className="credits-pending-note">Credits being confirmed: an unknown value is shown as “TO BE CONFIRMED” rather than an invented attribution or licence.</p>
    </Card>
    {categories.map((category) => <section aria-labelledby={`credits-${category}`} className="credits-category" key={category}>
      <h2 id={`credits-${category}`}>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
      <div className="credits-grid">
        {imageCredits.filter((image) => image.category === category).map((image) => <Card className="credit-card" key={image.id} padding="medium">
          <FallbackImage alt={image.alt} className="credit-card__image" height={image.height} src={image.path} style={{ objectPosition: image.objectPosition }} width={image.width} />
          <Badge tone="teal">{image.placeholder ? 'Original placeholder' : 'Photo credit'}</Badge>
          {hasPendingCredits(image) && <p className="credits-pending-note">Credits being confirmed</p>}
          <h3>{image.label}</h3>
          <p><code>{image.path}</code></p>
          <dl>
            <div><dt>Filename</dt><dd>{image.path.split('/').pop()}</dd></div>
            <div><dt>Image size</dt><dd>{image.width} × {image.height} pixels</dd></div>
            <div><dt>Photographer</dt><dd>{image.credit?.photographer || 'TO BE CONFIRMED'}</dd></div>
            <div><dt>Source</dt><dd>{image.credit?.source || 'TO BE CONFIRMED'}</dd></div>
            <div><dt>Licence</dt><dd>{image.credit?.licence || 'TO BE CONFIRMED'}</dd></div>
            <div><dt>Original URL</dt><dd>{isSourceLink(image.credit?.url)
              ? <a href={image.credit.url} rel="noopener noreferrer" target="_blank">View the original image source</a>
              : image.credit?.url || 'TO BE CONFIRMED'}</dd></div>
          </dl>
        </Card>)}
      </div>
    </section>)}
  </div></div>;
}
