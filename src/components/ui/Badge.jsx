const tones = new Set(['neutral', 'teal', 'success', 'warning', 'error']);

// Mark a short status or category with a color-coded label.
export default function Badge({ children, tone = 'neutral', className = '' }) {
  const safeTone = tones.has(tone) ? tone : 'neutral';
  const classes = ['badge', `badge--${safeTone}`, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
