// Keep section titles, eyebrow labels, and supporting copy visually consistent.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = 'h2',
  id,
  align = 'left',
  className = '',
}) {
  const classes = ['section-heading', `section-heading--${align}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading id={id}>{title}</Heading>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  );
}
