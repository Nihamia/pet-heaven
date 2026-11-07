import { Link } from 'react-router-dom';

const variants = new Set(['primary', 'secondary', 'outline']);
const sizes = new Set(['small', 'medium', 'large']);

// Render a consistently styled button, internal link, or external link with loading support.
export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  to,
  href,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const safeVariant = variants.has(variant) ? variant : 'primary';
  const safeSize = sizes.has(size) ? size : 'medium';
  const classes = [
    'button',
    `button--${safeVariant}`,
    safeSize !== 'medium' ? `button--${safeSize}` : '',
    loading ? 'button--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  function handleClick(event) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  const content = (
    <>
      {loading && <span aria-hidden="true" className="button__spinner" />}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link
        {...rest}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={classes}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : rest.tabIndex}
        to={to}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        {...rest}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={classes}
        href={isDisabled ? undefined : href}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : rest.tabIndex}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      aria-busy={loading || undefined}
      className={classes}
      disabled={isDisabled}
      onClick={handleClick}
      type={type}
    >
      {content}
    </button>
  );
}
