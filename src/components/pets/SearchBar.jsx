import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';

// Offer a labeled pet search field with a one-click clear action.
export default function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="pet-search">
      <FormField
        autoComplete="off"
        className="pet-search__field"
        label="Search pets"
        labelClassName="visually-hidden"
        name="pet-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, breed, or personality"
        type="search"
        value={value}
      />
      {value && (
        <Button className="pet-search__clear" onClick={onClear} size="small" type="button" variant="outline">
          Clear search
        </Button>
      )}
    </div>
  );
}
