import { useEffect, useId, useState } from 'react';
import { petImages } from '../../data/images.js';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';
import { Skeleton } from '../ui/Spinner.jsx';
import '../../styles/random-pet-photo.css';

const sources = {
  dog: {
    endpoint: 'https://dog.ceo/api/breeds/image/random',
    name: 'Dog CEO API',
    website: 'https://dog.ceo/dog-api/',
    fallback: petImages.milo.portrait,
  },
  cat: {
    endpoint: 'https://api.thecatapi.com/v1/images/search?limit=1',
    name: 'TheCatAPI',
    website: 'https://thecatapi.com/',
    fallback: petImages.miso.portrait,
  },
};

// Optional API photos are independent of the local adoption profiles and image catalogue.
export default function RandomPetPhoto({ species = 'dog' }) {
  const animal = species === 'cat' ? 'cat' : 'dog';
  const source = sources[animal];
  const headingId = useId();
  const [refreshCount, setRefreshCount] = useState(0);
  const [photo, setPhoto] = useState({ url: null, loading: true, error: false });
  const [paused, setPaused] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateMotion = (event) => { if (event.matches) setPaused(true); };
    document.addEventListener('visibilitychange', updateVisibility);
    motionPreference?.addEventListener?.('change', updateMotion);
    return () => {
      document.removeEventListener('visibilitychange', updateVisibility);
      motionPreference?.removeEventListener?.('change', updateMotion);
    };
  }, []);

  useEffect(() => {
    if (photo.loading || paused || !pageVisible || hovered || focused) return undefined;
    const timer = window.setTimeout(() => setRefreshCount((count) => count + 1), 20000);
    return () => window.clearTimeout(timer);
  }, [photo, paused, pageVisible, hovered, focused]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const showFallback = () => {
      if (active) setPhoto({ url: null, loading: false, error: true });
    };
    setPhoto((current) => ({ ...current, loading: true }));
    const timeout = window.setTimeout(() => {
      controller.abort();
      showFallback();
    }, 10000);

    async function loadPhoto() {
      try {
        const catKey = import.meta.env.VITE_CAT_API_KEY?.trim();
        const response = await fetch(source.endpoint, {
          signal: controller.signal,
          cache: 'no-store',
          ...(animal === 'cat' && catKey ? { headers: { 'x-api-key': catKey } } : {}),
        });
        if (!response.ok) throw new Error('Photo request failed');
        const data = await response.json();
        const url = animal === 'dog'
          ? (data?.status === 'success' ? data.message : null)
          : data?.[0]?.url;
        if (typeof url !== 'string' || new URL(url).protocol !== 'https:') {
          throw new Error('Photo response was invalid');
        }
        if (active && !controller.signal.aborted) {
          setPhoto({ url, loading: false, error: false });
        }
      } catch {
        showFallback();
      } finally {
        window.clearTimeout(timeout);
      }
    }

    loadPhoto();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [animal, source, refreshCount]);

  return (
    <Card
      aria-labelledby={headingId}
      className="random-pet-photo"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      padding="none"
    >
      <div aria-busy={photo.loading} className="random-pet-photo__media">
        {photo.loading && !photo.url && !photo.error ? <Skeleton height="100%" /> : (
          <FallbackImage
            alt={photo.error ? source.fallback.alt : `Random ${animal} photograph provided by ${source.name}`}
            height={photo.error ? source.fallback.height : 900}
            loading="lazy"
            onError={photo.error ? undefined : () => setPhoto({ url: null, loading: false, error: true })}
            src={photo.error ? source.fallback.path : photo.url}
            style={{ objectPosition: photo.error ? source.fallback.objectPosition : undefined }}
            width={photo.error ? source.fallback.width : 1200}
          />
        )}
      </div>
      <div className="random-pet-photo__body">
        <div className="random-pet-photo__heading">
          <h3 id={headingId}>A friendly {animal}</h3>
        </div>
        <div className="random-pet-photo__controls">
          <Button aria-label={`Refresh ${animal} photo`} loading={photo.loading} onClick={() => setRefreshCount((count) => count + 1)} size="small" variant="outline">Refresh</Button>
          <Button
            aria-label={`${paused ? 'Resume' : 'Pause'} ${animal} slideshow`}
            onClick={() => {
              // An explicit Resume also restarts after focus or hover paused the card.
              if (paused) { setHovered(false); setFocused(false); }
              setPaused((current) => !current);
            }}
            size="small"
            variant="outline"
          >{paused ? 'Resume' : 'Pause'}</Button>
        </div>
        <p className="random-pet-photo__status" role="status">
          {photo.loading ? `Loading a random ${animal} photo…` : photo.error
            ? `We couldn’t load a ${animal} photo. Here’s a local photo instead. Try Refresh.`
            : 'A little hello from a surprise friend.'}
        </p>
        <p className="random-pet-photo__auto-note">
          {paused ? 'Automatic updates paused.' : 'Changes every 20 seconds. Pauses while you hover or use this card.'}
        </p>
        <p className="random-pet-photo__credit">
          {photo.error && <>Local photo: <a href="/credits">credits being confirmed</a>. </>}
          Random photos: <a href={source.website}>{source.name}</a>
        </p>
      </div>
    </Card>
  );
}
