import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import FavouriteButton from './FavouriteButton.jsx';
import { formatPetAge } from '../../utils/petUtils.js';

// Show a pet's key details and actions in a reusable adoption-gallery card.
export default function PetCard({ pet, isFavourite, onToggleFavourite }) {
  return (
    <Card as="article" className="pet-card" interactive padding="none">
      <div className="pet-card__image-wrap">
        <img
          alt={`${pet.name}, a ${pet.gender.toLowerCase()} ${pet.species.toLowerCase()} looking for a home`}
          className="pet-card__image"
          loading="lazy"
          src={pet.image}
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
          <h2 className="pet-card__name">{pet.name}</h2>
          <Badge tone="teal">{pet.species}</Badge>
        </div>
        <p className="pet-card__breed">{pet.breed}</p>

        <dl className="pet-card__facts">
          <div><dt>Age</dt><dd>{formatPetAge(pet.ageYears)}</dd></div>
          <div><dt>Gender</dt><dd>{pet.gender}</dd></div>
          <div><dt>Size</dt><dd>{pet.size}</dd></div>
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
