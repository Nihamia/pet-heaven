// Show a small animated indicator while an operation is in progress.
export function Spinner({ label = 'Loading', size = 'medium', className = '' }) {
  const classes = ['spinner', `spinner--${size}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} role={label ? 'status' : undefined}>
      <span aria-hidden="true" className="spinner__ring" />
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

// Reserve space for text or image content while its final version is loading.
export function Skeleton({ width = '100%', height = '1rem', circle = false, className = '' }) {
  const classes = ['skeleton', circle ? 'skeleton--circle' : '', className].filter(Boolean).join(' ');
  const style = { width, height };

  return <span aria-hidden="true" className={classes} style={style} />;
}
