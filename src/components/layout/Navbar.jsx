import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Brand from './Brand.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Button from '../ui/Button.jsx';

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'About', to: '/about' },
  { label: 'Adopt a Pet', to: '/pets' },
  { label: 'Release a Pet', to: '/release' },
  { label: 'Join Us', to: '/join' },
  { label: 'Contact', to: '/contact' },
];

// Provide sticky site navigation that collapses into an accessible mobile menu.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
      <header className="site-header">
        <div className="container header-inner">
          <Brand />

          <button
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`menu-toggle${menuOpen ? ' menu-toggle--open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
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
              {navItems.map(({ label, to, end }) => (
                <li key={to}>
                  <NavLink
                    className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                    end={end}
                    to={to}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-cta-item">
                <Button size="small" to="/join">
                  Become a member
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
