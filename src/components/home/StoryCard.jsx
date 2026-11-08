import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';

// Pair a clearly illustrative adoption story with a photo and the shared card styling.
export default function StoryCard({ title, quote, image }) {
  return (
    <Card className="home-story-card story-card" padding="none">
      <FallbackImage alt={image.alt} height={image.height ?? 600} src={image.path ?? image.src} style={{ objectPosition: image.objectPosition }} width={image.width ?? 800} />
      <div className="story-card__body">
        <Badge tone="teal">Illustrative story</Badge>
        <h3>{title}</h3>
        <blockquote>{quote}</blockquote>
      </div>
    </Card>
  );
}
