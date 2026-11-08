import { useEffect, useRef } from 'react';

// Reveal marked sections as they enter view, leaving content visible when motion is reduced.
export default function useScrollReveal() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const elements = root.querySelectorAll('[data-reveal]');
    root.classList.add('reveal-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); root.classList.remove('reveal-ready'); };
  }, []);
  return rootRef;
}
