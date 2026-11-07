const alertMeta = {
  info: { icon: 'i', role: 'status' },
  success: { icon: '✓', role: 'status' },
  warning: { icon: '!', role: 'alert' },
  error: { icon: '×', role: 'alert' },
};

// Communicate an inline success, error, warning, or informational message.
export default function Alert({ tone = 'info', title, children, onDismiss, className = '' }) {
  const safeTone = typeof tone === 'string' && Object.prototype.hasOwnProperty.call(alertMeta, tone) ? tone : 'info';
  const meta = alertMeta[safeTone];
  const classes = ['alert', `alert--${safeTone}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role={meta.role}>
      <span aria-hidden="true" className="alert__icon">{meta.icon}</span>
      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button aria-label="Dismiss message" className="alert__dismiss" onClick={onDismiss} type="button">
          ×
        </button>
      )}
    </div>
  );
}
