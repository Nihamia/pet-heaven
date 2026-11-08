import { useEffect, useState } from 'react';
import { fallbackImage } from '../../data/images.js';

// Keep a reserved image slot usable when its source is unavailable.
export default function FallbackImage({
  src,
  alt,
  width = fallbackImage.width,
  height = fallbackImage.height,
  loading = 'lazy',
  decoding = 'async',
  onError,
  style,
  ...rest
}) {
  const [failedSource, setFailedSource] = useState(null);
  const useFallback = !src || failedSource === src;
  const displayedSource = useFallback ? fallbackImage.path : src;

  useEffect(() => {
    setFailedSource(null);
  }, [src]);

  function handleError(event) {
    onError?.(event);
    // A different src can recover; a failed fallback never starts an error loop.
    if (displayedSource !== fallbackImage.path) setFailedSource(src);
  }

  return (
    <img
      {...rest}
      alt={useFallback ? fallbackImage.alt : alt}
      decoding={decoding}
      height={height}
      loading={loading}
      onError={handleError}
      src={displayedSource}
      style={{ objectFit: 'cover', ...style }}
      width={width}
    />
  );
}
