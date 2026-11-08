import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PetCard from '../components/pets/PetCard.jsx';
import PetDetailModal from '../components/pets/PetDetailModal.jsx';
import PetFilters from '../components/pets/PetFilters.jsx';
import SearchBar from '../components/pets/SearchBar.jsx';
import Alert from '../components/ui/Alert.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import usePets from '../hooks/usePets.js';
import PageBanner from '../components/ui/PageBanner.jsx';
import { imageAssets } from '../data/images.js';

const initialFilters = {
  species: '',
  ageGroup: '',
  gender: '',
  size: '',
  goodWithKids: '',
  vaccinated: '',
  hdbFriendly: '',
  onlyFavourites: false,
  sortBy: 'newest',
};

// Let visitors search, filter, sort, save, revisit, and learn about adoptable pets.
export default function PetsPage() {
  const { id: petId } = useParams();
  const navigate = useNavigate();
  const { pets, message: petLoadMessage } = usePets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [favouriteIds, setFavouriteIds] = useLocalStorage('pet-heaven-favourites', []);
  const [recentIds, setRecentIds] = useLocalStorage('pet-heaven-recently-viewed', []);

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === petId) ?? null, [petId, pets]);
  const safeFavouriteIds = Array.isArray(favouriteIds) ? favouriteIds : [];
  const safeRecentIds = Array.isArray(recentIds) ? recentIds : [];
  const favouriteSet = useMemo(() => new Set(safeFavouriteIds), [safeFavouriteIds]);

  // Debounce typing while keeping every sample image path and credit in the local catalogue.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!selectedPet) return;
    setRecentIds((current) => {
      const safeCurrent = Array.isArray(current) ? current : [];
      return [selectedPet.id, ...safeCurrent.filter((id) => id !== selectedPet.id)].slice(0, 6);
    });
  }, [selectedPet, setRecentIds]);

  const filteredPets = useMemo(() => {
    const searchMatches = (pet) => {
      if (!debouncedQuery) return true;
      const searchableText = [pet.name, pet.species, pet.breed, pet.colour, ...pet.temperament]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(debouncedQuery);
    };

    const matchesFilter = (pet, key) => {
      const value = filters[key];
      if (value === '' || value === undefined) return true;
      if (['goodWithKids', 'vaccinated', 'hdbFriendly'].includes(key)) return String(pet[key]) === value;
      return String(pet[key]).toLowerCase() === String(value).toLowerCase();
    };

    const visiblePets = pets.filter((pet) => {
      if (pet.status !== 'Available' || !searchMatches(pet)) return false;
      if (filters.onlyFavourites && !favouriteSet.has(pet.id)) return false;
      return ['species', 'ageGroup', 'gender', 'size', 'goodWithKids', 'vaccinated', 'hdbFriendly']
        .every((key) => matchesFilter(pet, key));
    });

    return visiblePets.sort((first, second) => {
      if (filters.sortBy === 'name') return first.name.localeCompare(second.name);
      if (filters.sortBy === 'youngest') return first.ageYears - second.ageYears;
      if (filters.sortBy === 'oldest') return second.ageYears - first.ageYears;
      return new Date(second.dateAdded) - new Date(first.dateAdded);
    });
  }, [debouncedQuery, filters, favouriteSet, pets]);

  const recentPets = safeRecentIds
    .map((recentId) => pets.find((pet) => pet.id === recentId))
    .filter(Boolean);

  function toggleFavourite(petIdToToggle) {
    setFavouriteIds((current) => (
      Array.isArray(current) && current.includes(petIdToToggle)
        ? current.filter((id) => id !== petIdToToggle)
        : [...(Array.isArray(current) ? current : []), petIdToToggle]
    ));
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setQuery('');
    setFilters({ ...initialFilters });
  }

  function closePetDetails() {
    navigate('/pets');
  }

  return (
    <div className="pets-page pets-page--banner">
      <PageBanner breadcrumb="Available Pets" image={imageAssets.bannerPets} title="Meet your new companion" />
      <div className="container">
        <header className="pets-page__intro">
          <SectionHeading
            as="h2"
            description="Every animal has a story and a personality of their own. Browse the profiles and find a companion whose needs and nature feel right for your home."
            eyebrow="Meet your new friend"
            id="pets-page-title"
            title="A loving home starts with a hello."
          />
          <Badge tone="teal">{pets.length} pet profiles</Badge>
          <p className="pet-housing-note">HDB-friendly labels are illustrative coursework information. Confirm housing eligibility and individual care needs before adopting.</p>
        </header>

        <Card as="section" className="pet-search-panel" padding="large">
          <SearchBar onChange={setQuery} onClear={() => setQuery('')} value={query} />
          <PetFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />
        </Card>

        {petLoadMessage && <Alert className="pets-page__alert" tone="warning">{petLoadMessage}</Alert>}

        {petId && !selectedPet && (
          <Alert className="pets-page__alert" tone="warning" title="We couldn't find that pet">
            This profile may have moved. You can browse the current adoption gallery below.
          </Alert>
        )}

        {recentPets.length > 0 && (
          <section aria-labelledby="recently-viewed-title" className="pets-page__recent">
            <SectionHeading
              as="h2"
              eyebrow="Pick up where you left off"
              id="recently-viewed-title"
              title="Recently viewed"
            />
            <div className="pet-grid pet-grid--recent">
              {recentPets.slice(0, 3).map((pet) => (
                <PetCard
                  isFavourite={favouriteSet.has(pet.id)}
                  key={pet.id}
                  onToggleFavourite={toggleFavourite}
                  pet={pet}
                />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="pet-results-title" className="pets-page__results">
          <div className="pet-results-heading">
            <div>
              <p className="eyebrow">Find a good match</p>
              <h2 id="pet-results-title">Pets looking for a home</h2>
            </div>
            <p aria-live="polite" className="pet-results-count" role="status">
              Showing <strong>{filteredPets.length}</strong> of {pets.length} pets
            </p>
          </div>

          {filteredPets.length > 0 ? (
            <div className="pet-grid">
              {filteredPets.map((pet) => (
                <PetCard
                  isFavourite={favouriteSet.has(pet.id)}
                  key={pet.id}
                  onToggleFavourite={toggleFavourite}
                  pet={pet}
                />
              ))}
            </div>
          ) : (
            <Card as="div" className="pet-empty-state" padding="large">
              <div aria-hidden="true" className="pet-empty-state__mark">♡</div>
              <SectionHeading
                as="h2"
                description="Try a different search or clear a filter to see more pets."
                title="No pets match those filters yet."
              />
              <Button onClick={clearFilters} type="button">Clear filters</Button>
            </Card>
          )}
        </section>
      </div>

      <PetDetailModal
        isFavourite={selectedPet ? favouriteSet.has(selectedPet.id) : false}
        onClose={closePetDetails}
        onToggleFavourite={toggleFavourite}
        pet={selectedPet}
      />
    </div>
  );
}
