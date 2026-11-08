import { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Share one keyboard-friendly disclosure list between desktop navigation and mobile accordions.
export default function Dropdown({ label, items, open, onToggle, onClose, onNavigate, active }) {
  const listId = `dropdown-${useId().replaceAll(':', '')}`;
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    function closeOutside(event) {
      if (!containerRef.current?.contains(event.target)) onClose();
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, onClose]);

  function handleKeyDown(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      triggerRef.current?.focus();
    }
    if (event.target === triggerRef.current && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if (!open) onToggle();
      window.requestAnimationFrame(() => {
        const links = containerRef.current?.querySelectorAll('a');
        links?.[event.key === 'ArrowUp' ? links.length - 1 : 0]?.focus();
      });
    }
  }

  return (
    <li className={`nav-dropdown${open ? ' nav-dropdown--open' : ''}`} onKeyDown={handleKeyDown} ref={containerRef}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onClose(); }}>
      <button aria-controls={listId} aria-expanded={open} aria-haspopup="true" className={`nav-link dropdown-trigger${active ? ' nav-link--active' : ''}`}
        onClick={onToggle} ref={triggerRef} type="button">
        {label}<svg aria-hidden="true" className="dropdown-chevron" fill="none" focusable="false" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16" width="14">
          <path d="m3 5.5 5 5 5-5" />
        </svg>
      </button>
      <ul className="dropdown-list" hidden={!open} id={listId}>
        {items.map(({ label: itemLabel, to }) => {
          const current = `${pathname}${hash}` === to;
          return <li key={itemLabel}><Link aria-current={current ? 'location' : undefined}
            className={`dropdown-link${current ? ' dropdown-link--active' : ''}`} onClick={onNavigate} to={to}>{itemLabel}</Link></li>;
        })}
      </ul>
    </li>
  );
}
