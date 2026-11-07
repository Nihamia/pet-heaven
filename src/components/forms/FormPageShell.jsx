import SectionHeading from '../ui/SectionHeading.jsx';

// Give multi-step service pages a shared introduction and centered content width.
export default function FormPageShell({ eyebrow, title, description, children, className = '' }) {
  return (
    <div className={['service-page', className].filter(Boolean).join(' ')}>
      <div className="container">
        <header className="service-page__header">
          <SectionHeading as="h1" description={description} eyebrow={eyebrow} id="service-page-title" title={title} />
        </header>
        {children}
      </div>
    </div>
  );
}
