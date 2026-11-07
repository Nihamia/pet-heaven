import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';

const filterOptions = {
  species: ['Dog', 'Cat'],
  ageGroup: ['Baby', 'Young', 'Adult', 'Senior'],
  gender: ['Female', 'Male'],
  size: ['Small', 'Medium', 'Large'],
};

function selectOptions(values) {
  return values.map((value) => ({ value, label: value }));
}

// Gather the adoption gallery's species, age, household, vaccination, and sort filters.
export default function PetFilters({ filters, onChange, onClear }) {
  return (
    <section aria-label="Filter and sort adoptable pets" className="pet-filters">
      <div className="pet-filters__grid">
        {Object.entries(filterOptions).map(([name, options]) => (
          <FormField
            key={name}
            label={name === 'ageGroup' ? 'Age group' : name.charAt(0).toUpperCase() + name.slice(1)}
            name={name}
            onChange={(event) => onChange(name, event.target.value)}
            options={selectOptions(options)}
            placeholder="All"
            type="select"
            value={filters[name]}
          />
        ))}
        <FormField
          label="Good with children"
          name="goodWithKids"
          onChange={(event) => onChange('goodWithKids', event.target.value)}
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          placeholder="Any"
          type="select"
          value={filters.goodWithKids}
        />
        <FormField
          label="Vaccination"
          name="vaccinated"
          onChange={(event) => onChange('vaccinated', event.target.value)}
          options={[
            { value: 'true', label: 'Up to date' },
            { value: 'false', label: 'In progress' },
          ]}
          placeholder="Any"
          type="select"
          value={filters.vaccinated}
        />
        <FormField
          label="Sort by"
          name="sortBy"
          onChange={(event) => onChange('sortBy', event.target.value)}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'name', label: 'Name A to Z' },
            { value: 'youngest', label: 'Youngest first' },
            { value: 'oldest', label: 'Oldest first' },
          ]}
          type="select"
          value={filters.sortBy}
        />
      </div>

      <div className="pet-filters__footer">
        <FormField
          checked={filters.onlyFavourites}
          label="Show favourites only"
          name="onlyFavourites"
          onChange={(event) => onChange('onlyFavourites', event.target.checked)}
          type="checkbox"
        />
        <Button onClick={onClear} size="small" type="button" variant="outline">Clear all filters</Button>
      </div>
    </section>
  );
}
