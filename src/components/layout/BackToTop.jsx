import { useEffect, useState } from 'react';

// Offer a keyboard-accessible shortcut to the top after the visitor has scrolled down.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > 420);
    }

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!visible) return null;

  function handleBackToTop() {
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  }

  return (
    <button
      aria-label="Back to top"
      className="back-to-top"
      onClick={handleBackToTop}
      type="button"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
