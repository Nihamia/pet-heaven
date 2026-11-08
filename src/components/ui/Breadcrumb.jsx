import { Link } from 'react-router-dom';

// Show a short, accessible trail back to the existing Home page and parent routes.
export default function Breadcrumb({ items = [] }) {
  const trail = [{ label: 'Home', to: '/' }, ...items];
  return <nav aria-label="Breadcrumb" className="breadcrumb"><ol>
    {trail.map(({ label, to }, index) => <li key={`${label}-${index}`}>
      {index > 0 && <span aria-hidden="true" className="breadcrumb__separator">/</span>}
      {to && index < trail.length - 1 ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
    </li>)}
  </ol></nav>;
}
