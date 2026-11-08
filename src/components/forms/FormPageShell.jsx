import SectionHeading from '../ui/SectionHeading.jsx';
import { useLocation } from 'react-router-dom';
import PageBanner from '../ui/PageBanner.jsx';
import { imageAssets } from '../../data/images.js';

const banners = {
  '/join': { image: 'bannerJoin', title: 'Join our community', breadcrumb: 'Join Us' },
  '/adopt': { image: 'bannerAdopt', title: 'Begin an adoption enquiry', breadcrumb: 'Adopt' },
  '/release': { image: 'bannerRelease', title: 'A kind next step', breadcrumb: 'Release a Pet' },
  '/contact': { image: 'bannerContact', title: 'Get in touch', breadcrumb: 'Contact' },
};

// Give multi-step service pages a shared introduction and centered content width.
export default function FormPageShell({ eyebrow, title, description, children, className = '' }) {
  const { pathname } = useLocation();
  const banner = banners[pathname.replace(/\/+$/, '') || '/'];
  return (
    <div className={['service-page', banner ? 'service-page--banner' : '', className].filter(Boolean).join(' ')}>
      {banner && <PageBanner breadcrumb={banner.breadcrumb} image={imageAssets[banner.image]} title={banner.title} />}
      <div className="container">
        <header className="service-page__header">
          <SectionHeading as={banner ? 'h2' : 'h1'} description={description} eyebrow={eyebrow} id="service-page-title" title={title} />
        </header>
        {children}
      </div>
    </div>
  );
}
