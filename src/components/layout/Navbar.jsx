import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Brand from './Brand.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Button from '../ui/Button.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import SocialLinks from './SocialLinks.jsx';

const navGroups = [
  { label: 'Adopt', items: [
    { label: 'Available Pets', to: '/pets' },
    { label: 'Adoption Process', to: '/about#about-adoption-title' },
    { label: 'Release a Pet', to: '/release' },
  ] },
  { label: 'Get Involved', items: [
    { label: 'Join Us', to: '/join' },
    { label: 'Sponsor a Pet', to: '/#sponsor' },
    { label: 'Volunteer', to: '/join#support-interests' },
  ] },
  { label: 'About', items: [
    { label: 'Our Story', to: '/about#about-story-title' },
    { label: 'Facilities', to: '/about#about-facilities-title' },
    { label: 'Team', to: '/about#about-team-title' },
    { label: 'FAQ', to: '/about#about-faq-title' },
  ] },
];

// Provide sticky site navigation that collapses into an accessible mobile menu.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState('');
  const [compact, setCompact] = useState(false);
  const menuButtonRef = useRef(null);
  const location = useLocation();
  const activeGroup = location.pathname === '/about'
    ? (location.hash === '#about-adoption-title' ? 'Adopt' : 'About')
    : ['/join'].includes(location.pathname) || (location.pathname === '/' && location.hash === '#sponsor')
      ? 'Get Involved'
      : ['/pets', '/adopt', '/release'].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)) ? 'Adopt' : '';

  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup('');
  }, [location.pathname, location.hash, location.key]);

  useEffect(() => {
    function updateHeader() { setCompact(window.scrollY > 64); }
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header${compact ? ' site-header--compact' : ''}`}>
        <div className="utility-bar">
          <div className="container utility-bar__inner">
            <div className="utility-bar__contact">
              <NavLink to="/contact#contact-form"><span aria-hidden="true">☎</span> Phone enquiries</NavLink>
              <NavLink to="/contact#contact-form"><span aria-hidden="true">✉</span> hello@petheaven.example</NavLink>
            </div>
            <SocialLinks />
          </div>
        </div>
        <div className="container header-inner">
          <Brand />

          <button
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`menu-toggle${menuOpen ? ' menu-toggle--open' : ''}`}
            onClick={() => { setMenuOpen((open) => !open); setOpenGroup(''); }}
            ref={menuButtonRef}
            type="button"
          >
            <span />
            <span />
            <span className="visually-hidden">Menu</span>
          </button>

          <nav
            aria-label="Main navigation"
            className={`primary-nav${menuOpen ? ' primary-nav--open' : ''}`}
            id="primary-navigation"
          >
            <ul className="nav-list">
              <li><Link aria-current={location.pathname === '/' && !location.hash ? 'page' : undefined} className={`nav-link${location.pathname === '/' && !location.hash ? ' nav-link--active' : ''}`} to="/">Home</Link></li>
              {navGroups.map(({ label, items }) => <Dropdown active={activeGroup === label} items={items} key={label} label={label}
                onClose={() => setOpenGroup('')} onNavigate={() => { setMenuOpen(false); setOpenGroup(''); }}
                onToggle={() => setOpenGroup((current) => current === label ? '' : label)} open={openGroup === label} />)}
              <li><NavLink className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`} to="/contact">Contact</NavLink></li>
              <li className="nav-cta-item">
                <Button size="small" to="/join" variant="secondary">
                  Join
                </Button>
              </li>
              <li className="nav-theme-item"><ThemeToggle /></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
