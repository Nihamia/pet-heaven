import { useId } from 'react';
import Breadcrumb from './Breadcrumb.jsx';
import SectionHeading from './SectionHeading.jsx';
import FallbackImage from './FallbackImage.jsx';

// Introduce an existing page with a consistently cropped local image and breadcrumb trail.
export default function PageBanner({ image, title, breadcrumb, description }) {
  const headingId = `banner-${useId().replaceAll(':', '')}`;
  return <section aria-labelledby={headingId} className="page-banner">
    <FallbackImage alt={image.alt} className="page-banner__image" height={image.height} src={image.path} style={{ objectPosition: image.objectPosition }} width={image.width} />
    <div className="container page-banner__content">
      <Breadcrumb items={[{ label: breadcrumb ?? title }]} />
      <SectionHeading as="h1" description={description} id={headingId} title={title} />
    </div>
  </section>;
}
