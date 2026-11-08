import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';

// Present an original dated update with expandable details instead of a dead article link.
export default function NewsCard({ title, date, displayDate, summary, details, image, id }) {
  return (
    <Card className="news-card" padding="none">
      <FallbackImage alt={image.alt} height={image.height ?? 600} src={image.path ?? image.src} style={{ objectPosition: image.objectPosition }} width={image.width ?? 800} />
      <div className="news-card__body">
        <div className="news-card__meta"><time dateTime={date}>{displayDate}</time><Badge tone="teal">Illustrative update</Badge></div>
        <h3>{title}</h3>
        <p>{summary}</p>
        <details className="news-card__details" id={id}>
          <summary>Read more<span className="visually-hidden"> about {title}</span></summary>
          <p>{details}</p>
        </details>
      </div>
    </Card>
  );
}
