import { useEffect, useRef, useState } from 'react';

// Count a sample impact figure once in view, showing the final value for reduced motion.
export default function StatCounter({ label, target, suffix = '' }) {
  const [value, setValue] = useState(0);
  const numberRef = useRef(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;
    let frameId;
    let observer;
    let hasStarted = false;

    function animate() {
      if (hasStarted) return;
      hasStarted = true;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        setValue(target);
        return;
      }
      const startedAt = performance.now();
      function tick(now) {
        const progress = Math.min((now - startedAt) / 1100, 1);
        setValue(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) frameId = window.requestAnimationFrame(tick);
      }
      frameId = window.requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { observer.disconnect(); animate(); }
      }, { threshold: 0.35 });
      observer.observe(element);
    } else { animate(); }
    return () => {
      observer?.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return (
    <div className="home-stat">
      <dt>{label}</dt>
      <dd ref={numberRef}><span aria-hidden="true">{value.toLocaleString()}{suffix}</span><span className="visually-hidden">{target.toLocaleString()}{suffix}</span></dd>
    </div>
  );
}
