import { Link } from 'react-router-dom';

// Show the Pet Heaven wordmark as a consistent, accessible link to the home page.
export default function Brand({ compact = false }) {
  return (
    <Link className={`brand${compact ? ' brand--compact' : ''}`} to="/" aria-label="Pet Heaven home">
      <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="12" cy="14" r="5" />
        <circle cx="24" cy="9" r="5" />
        <circle cx="36" cy="14" r="5" />
        <circle cx="8" cy="26" r="4.5" />
        <path d="M24 20c-7.2 0-13 7.4-13 14.1 0 4.4 3.2 6.9 7.1 5.5 3.8-1.4 7.9-1.4 11.8 0 3.9 1.4 7.1-1.1 7.1-5.5C37 27.4 31.2 20 24 20Z" />
        <circle cx="40" cy="26" r="4.5" />
      </svg>
      <span className="brand-copy">
        <span className="brand-name">Pet Heaven</span>
        {!compact && <span className="brand-tagline">A safe place to begin again</span>}
      </span>
    </Link>
  );
}
