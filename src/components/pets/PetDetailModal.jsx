import { useEffect, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';
import FavouriteButton from './FavouriteButton.jsx';
import { formatPetAge } from '../../utils/petUtils.js';
import { imageCredits } from '../../data/images.js';
import { getStaffPetGallery } from '../../services/staffPetService.js';

// Show a selected pet's full story, gallery, care notes, and adoption enquiry action.
export default function PetDetailModal({ pet, isFavourite, onToggleFavourite, onClose, showJoinLink }) {
  const [activeImage, setActiveImage] = useState(pet?.image ?? '');
  const [extraPhotos, setExtraPhotos] = useState(null);
  const staffPetId = pet?.source === 'staff' ? pet.id : null;
  const gallery = staffPetId ? [pet.image, ...(extraPhotos?.id === staffPetId ? extraPhotos.photos.map(({ src }) => src) : [])]
    : pet?.gallery?.length ? pet.gallery : pet ? [pet.image] : [];

  useEffect(() => {
    setActiveImage(pet?.image ?? '');
  }, [pet?.id, pet?.image]);

  useEffect(() => {
    if (!staffPetId) return;
    let current = true;
    getStaffPetGallery(staffPetId).then((photos) => {
      if (current) setExtraPhotos({ id: staffPetId, photos });
    }, () => {
      if (current) setExtraPhotos({ id: staffPetId, photos: [], error: true });
    });
    return () => { current = false; };
  }, [staffPetId, pet?.updatedAt]);

  if (!pet) return null;
  const photoAlt = (src) => src === pet.image ? pet.imageAlt : extraPhotos?.photos.find((photo) => photo.src === src)?.alt;
  const activeAsset = imageCredits.find((image) => image.path === (activeImage || pet.image));

  const factRows = [
    ['Species', pet.species],
    ['Breed', pet.breed],
    ['Age', formatPetAge(pet.ageYears, pet.ageMonths)],
    ['Gender', pet.gender],
    ['Size', pet.size],
    ['Colour', pet.colour],
    ['HDB-friendly', typeof pet.hdbFriendly === 'boolean' ? (pet.hdbFriendly ? 'Yes' : 'No') : 'Not assessed'],
  ];

  return (
    <Modal className="pet-detail-modal" onClose={onClose} open title={`Meet ${pet.name}`}>
      <div className="pet-detail">
        <div className="pet-detail__gallery">
          <div className="pet-detail__main-image-wrap">
            <FallbackImage
              alt={photoAlt(activeImage || pet.image) || activeAsset?.alt || `${pet.name}, a ${pet.gender.toLowerCase()} ${pet.species.toLowerCase()}`}
              className="pet-detail__main-image"
              src={activeImage || pet.image}
              style={{ objectPosition: activeAsset?.objectPosition }}
              height={activeAsset?.height ?? 720}
              width={activeAsset?.width ?? 960}
            />
            <FavouriteButton
              isFavourite={isFavourite}
              onToggle={() => onToggleFavourite(pet.id)}
              petName={pet.name}
            />
          </div>
          {staffPetId && extraPhotos?.id !== staffPetId && <p role="status">Loading extra photos…</p>}
          {staffPetId && extraPhotos?.id === staffPetId && extraPhotos.error && <p>Extra photos are unavailable.</p>}
          <div aria-label={`${pet.name} photo gallery`} className="pet-detail__thumbnails">
            {gallery.map((image, index) => {
              const galleryAsset = imageCredits.find((asset) => asset.path === image);
              return (
                <button
                  aria-label={`Show ${pet.name} photo ${index + 1}`}
                  aria-pressed={activeImage === image}
                  className={`pet-detail__thumbnail${activeImage === image ? ' pet-detail__thumbnail--active' : ''}`}
                  key={`${pet.id}-photo-${index}`}
                  onClick={() => setActiveImage(image)}
                  type="button"
                >
                  <FallbackImage alt={photoAlt(image) || galleryAsset?.alt || `${pet.name} gallery thumbnail ${index + 1}`} height={galleryAsset?.height ?? 72} src={image} style={{ objectPosition: galleryAsset?.objectPosition }} width={galleryAsset?.width ?? 96} />
                </button>
              );
            })}
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
            {pet.specialNeeds && <p><strong>Special needs</strong> {pet.specialNeeds}</p>}
            {pet.energyLevel && <p><strong>Energy level</strong> {pet.energyLevel}</p>}
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
              disabled={pet.status !== 'Available'}
              to={pet.status === 'Available' ? `/adopt?${new URLSearchParams({ petId: pet.id })}` : undefined}
              variant="primary"
            >
              {pet.status === 'Available' ? 'Ask to adopt ' + pet.name : 'Not available'}
            </Button>
            {showJoinLink && pet.status === 'Available' && (
              <Button to="/join?role=adopter" variant="outline">Become a member to adopt</Button>
            )}
            <Button onClick={onClose} variant="outline">Back to pets</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
