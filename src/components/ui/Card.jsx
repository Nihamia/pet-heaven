// Provide a flexible surface for grouping related content.
export default function Card({
  as: Element = 'article',
  children,
  interactive = false,
  padding = 'medium',
  className = '',
  ...rest
}) {
  const classes = [
    'card',
    interactive ? 'card--interactive' : '',
    `card--${padding}`,
    className,
  ].filter(Boolean).join(' ');

  return <Element {...rest} className={classes}>{children}</Element>;
}
