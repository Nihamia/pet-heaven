import Button from '../components/ui/Button.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

// Give each unfinished route a clear, styled introduction and a useful next step.
export default function PlaceholderPage({ eyebrow, title, description, actionLabel, actionTo }) {
  return (
    <section aria-labelledby="page-title" className="placeholder-section">
      <div className="container placeholder-inner">
        <SectionHeading as="h1" description={description} eyebrow={eyebrow} id="page-title" title={title} />
        <Button to={actionTo}>{actionLabel} <span aria-hidden="true">→</span></Button>
      </div>
      <div aria-hidden="true" className="placeholder-paw">♡</div>
    </section>
  );
}
