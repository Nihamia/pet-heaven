import { useEffect, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import FavouriteButton from './FavouriteButton.jsx';
import { formatPetAge } from '../../utils/petUtils.js';

// Show a selected pet's full story, gallery, care notes, and adoption enquiry action.
export default function PetDetailModal({ pet, isFavourite, onToggleFavourite, onClose }) {
  const [activeImage, setActiveImage] = useState(pet?.image ?? '');
  const gallery = pet?.gallery?.length ? pet.gallery : pet ? [pet.image] : [];

  useEffect(() => {
    setActiveImage(pet?.image ?? '');
  }, [pet?.id, pet?.image]);

  if (!pet) return null;

  const factRows = [
    ['Species', pet.species],
    ['Breed', pet.breed],
    ['Age', formatPetAge(pet.ageYears)],
    ['Gender', pet.gender],
    ['Size', pet.size],
    ['Colour', pet.colour],
  ];

  return (
    <Modal className="pet-detail-modal" onClose={onClose} open title={`Meet ${pet.name}`}>
      <div className="pet-detail">
        <div className="pet-detail__gallery">
          <div className="pet-detail__main-image-wrap">
            <img
              alt={`${pet.name}, a ${pet.gender.toLowerCase()} ${pet.species.toLowerCase()}`}
              className="pet-detail__main-image"
              src={activeImage || pet.image}
            />
            <FavouriteButton
              isFavourite={isFavourite}
              onToggle={() => onToggleFavourite(pet.id)}
              petName={pet.name}
            />
          </div>
          <div aria-label={`${pet.name} photo gallery`} className="pet-detail__thumbnails">
            {gallery.map((image, index) => (
              <button
                aria-label={`Show ${pet.name} photo ${index + 1}`}
                aria-pressed={activeImage === image}
                className={`pet-detail__thumbnail${activeImage === image ? ' pet-detail__thumbnail--active' : ''}`}
                key={`${pet.id}-photo-${index}`}
                onClick={() => setActiveImage(image)}
                type="button"
              >
                <img alt="" loading="lazy" src={image} />
              </button>
            ))}
          </div>
        </div>

        <div className="pet-detail__body">
          <div className="pet-detail__badges">
            <Badge tone="teal">{pet.species}</Badge>
            <Badge tone={pet.status === 'Available' ? 'success' : 'warning'}>{pet.status}</Badge>
          </div>
          <p className="pet-detail__lead">{pet.story}</p>

          <dl className="pet-detail__facts">
            {factRows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>

          <div className="pet-detail__care">
            <h3>Health and care</h3>
            <p>{pet.healthNotes}</p>
            <div className="pet-detail__care-badges">
              <Badge tone={pet.vaccinated ? 'success' : 'warning'}>
                {pet.vaccinated ? 'Vaccinated' : 'Vaccinations in progress'}
              </Badge>
              <Badge tone={pet.sterilised ? 'success' : 'warning'}>
                {pet.sterilised ? 'Sterilised' : 'Not yet sterilised'}
              </Badge>
              <Badge tone={pet.goodWithKids ? 'success' : 'neutral'}>
                {pet.goodWithKids ? 'Good with children' : 'Needs an adult-focused home'}
              </Badge>
              <Badge tone={pet.goodWithPets ? 'teal' : 'neutral'}>
                {pet.goodWithPets ? 'Can live with other pets' : 'Best as the only pet'}
              </Badge>
            </div>
          </div>

          <div className="pet-detail__actions">
            <Button
              state={{ petId: pet.id }}
              to="/adopt"
              variant="primary"
            >
              Ask to adopt {pet.name}
            </Button>
            <Button onClick={onClose} variant="outline">Back to pets</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
