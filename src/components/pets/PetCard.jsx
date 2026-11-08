import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';
import FavouriteButton from './FavouriteButton.jsx';
import { formatPetAge } from '../../utils/petUtils.js';
import { imageCredits } from '../../data/images.js';

// Show a pet's key details and actions in a reusable adoption-gallery card.
export default function PetCard({ pet, isFavourite, onToggleFavourite }) {
  const image = imageCredits.find((asset) => asset.path === pet.image);
  return (
    <Card as="article" className="pet-card" interactive padding="none">
      <div className="pet-card__image-wrap">
        <FallbackImage
          alt={image?.alt ?? `${pet.name}, a ${pet.gender.toLowerCase()} ${pet.species.toLowerCase()} looking for a home`}
          className="pet-card__image"
          loading="lazy"
          decoding="async"
          height={image?.height ?? 720}
          width={image?.width ?? 960}
          src={pet.image}
          style={{ objectPosition: image?.objectPosition }}
        />
        <Badge className="pet-card__status" tone={pet.status === 'Available' ? 'success' : 'warning'}>
          {pet.status}
        </Badge>
        <FavouriteButton
          isFavourite={isFavourite}
          onToggle={() => onToggleFavourite(pet.id)}
          petName={pet.name}
        />
      </div>

      <div className="pet-card__content">
        <div className="pet-card__title-row">
          <h3 className="pet-card__name">{pet.name}</h3>
          <Badge tone="teal">{pet.species}</Badge>
        </div>
        <p className="pet-card__breed">{pet.breed}</p>

        <dl className="pet-card__facts">
          <div><dt>Age</dt><dd>{formatPetAge(pet.ageYears)}</dd></div>
          <div><dt>Gender</dt><dd>{pet.gender}</dd></div>
          <div><dt>Size</dt><dd>{pet.size}</dd></div>
          <div><dt>HDB-friendly</dt><dd>{typeof pet.hdbFriendly === 'boolean' ? (pet.hdbFriendly ? 'Yes' : 'No') : 'Not assessed'}</dd></div>
        </dl>

        <ul aria-label={`${pet.name}'s personality`} className="pet-card__traits">
          {pet.temperament.slice(0, 2).map((trait) => <li key={trait}>{trait}</li>)}
        </ul>

        <Button className="pet-card__details" size="small" to={`/pets/${pet.id}`} variant="outline">
          View details <span aria-hidden="true">→</span>
        </Button>
      </div>
    </Card>
  );
}
