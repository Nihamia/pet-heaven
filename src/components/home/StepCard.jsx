import Card from '../ui/Card.jsx';

// Display one numbered promise or adoption step using the shared card surface.
export default function StepCard({ number, icon, title, text, className = '' }) {
  return (
    <Card className={`home-step-card ${className}`} padding="large">
      <div className="home-step-card__top">
        {icon && <span aria-hidden="true" className="home-step-card__icon">{icon}</span>}
        <span aria-hidden="true" className="home-step-card__number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </Card>
  );
}
