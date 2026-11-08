import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Return the page to its top whenever the visitor moves to a new route.
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      let target;
      let addedTabIndex = false;
      const frame = window.requestAnimationFrame(() => {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
        target?.closest('[data-reveal]')?.classList.add('is-visible');
        if (target && !target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          addedTabIndex = true;
        }
        target?.focus?.({ preventScroll: true });
        target?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
      });
      return () => {
        window.cancelAnimationFrame(frame);
        if (addedTabIndex) target?.removeAttribute('tabindex');
      };
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash, key]);

  return null;
}
