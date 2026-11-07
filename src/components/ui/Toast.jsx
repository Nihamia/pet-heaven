import { useEffect } from 'react';
import Alert from './Alert.jsx';

// Display a temporary, accessible notification that dismisses itself after a short delay.
export default function Toast({ tone = 'info', children, onDismiss, duration = 4500 }) {
  useEffect(() => {
    if (!duration || !onDismiss) return undefined;
    const timeoutId = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, onDismiss]);

  return (
    <div className="toast-region" aria-live={tone === 'error' ? 'assertive' : 'polite'}>
      <Alert className="toast" onDismiss={onDismiss} tone={tone}>{children}</Alert>
    </div>
  );
}
