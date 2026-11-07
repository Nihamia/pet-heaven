// Toggle a pet's saved status with a descriptive accessible label.
export default function FavouriteButton({ petName, isFavourite, onToggle, className = '' }) {
  const classes = ['favourite-button', isFavourite ? 'favourite-button--active' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      aria-label={`${isFavourite ? 'Remove' : 'Add'} ${petName} ${isFavourite ? 'from' : 'to'} favourites`}
      aria-pressed={isFavourite}
      className={classes}
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true">{isFavourite ? '♥' : '♡'}</span>
    </button>
  );
}
