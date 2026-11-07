import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

// Help visitors recover when they follow a link to a page that does not exist.
export default function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title" className="not-found-page">
      <div className="container not-found-page__layout">
        <Card className="not-found-card" padding="large">
          <span aria-hidden="true" className="not-found-card__number">404</span>
          <SectionHeading
            as="h1"
            description="This link may be out of date. The pets, stories, and ways to help are still close by."
            eyebrow="A small detour"
            id="not-found-title"
            title="This page wandered off."
          />
          <div className="not-found-card__actions">
            <Button to="/">Back to home <span aria-hidden="true">→</span></Button>
            <Button to="/pets" variant="outline">Browse the pets</Button>
          </div>
        </Card>
        <div aria-hidden="true" className="not-found-art">
          <span className="not-found-art__paw">♡</span>
          <span className="not-found-art__trail">····</span>
        </div>
      </div>
    </section>
  );
}
