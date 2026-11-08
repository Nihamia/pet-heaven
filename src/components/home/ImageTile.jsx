import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';

// Offer a visual shortcut to an existing page or a section of the home page.
export default function ImageTile({ title, description, to, image }) {
  return (
    <Card className="image-tile" padding="none">
      <Link className="image-tile__link" to={to}>
        <FallbackImage alt={image.alt} height={image.height ?? 600} src={image.path ?? image.src} style={{ objectPosition: image.objectPosition }} width={image.width ?? 800} />
        <div className="image-tile__content">
          <h2>{title}<span aria-hidden="true">↗</span></h2>
          <p>{description}</p>
        </div>
      </Link>
    </Card>
  );
}
