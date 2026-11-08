import { useId } from 'react';
import Card from '../ui/Card.jsx';

// Explain a form's purpose and next steps without changing its fields or submission flow.
export default function FormGuide({ title, eyebrow, steps = [], currentStep, children, as = 'aside', className = '' }) {
  const headingId = `form-guide-${useId().replaceAll(':', '')}`;

  return (
    <Card aria-labelledby={headingId} as={as} className={`form-guide ${className}`} padding="large">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={headingId}>{title}</h2>
      {children && <div className="form-guide__intro">{children}</div>}
      <div className="form-guide__next">
        <h3>What happens next</h3>
        {currentStep && <p aria-live="polite" className="form-guide__progress">Step {currentStep} of {steps.length}</p>}
        <ol className="form-guide__steps">
          {steps.map((step, index) => (
            <li aria-current={currentStep === index + 1 ? 'step' : undefined} key={step.title}>
              <span aria-hidden="true" className="form-guide__step-number">{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{step.title}</strong><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
