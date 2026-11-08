import { Link } from 'react-router-dom';

const channels = [
  { name: 'Instagram', shape: <><rect height="16" rx="4" width="16" x="4" y="4" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="0.7" /></> },
  { name: 'Facebook', shape: <path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V1h-3c-4 0-5 3-5 6v2H7v4h3v8" /> },
  { name: 'YouTube', shape: <><rect height="14" rx="4" width="20" x="2" y="5" /><path d="m10 9 5 3-5 3z" /></> },
];

// Link familiar social icons to honest account information for this fictional coursework society.
export default function SocialLinks({ className = '' }) {
  return <div aria-label="Social channel information" className={`social-icons ${className}`}>
    {channels.map(({ name, shape }) => <Link aria-label={`${name} information`} key={name} to="/contact#social-channels">
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">{shape}</svg>
    </Link>)}
  </div>;
}
