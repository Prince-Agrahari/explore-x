import { useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from '../utils/destinationImages';

const SafeImage = ({
  src,
  alt,
  className,
  fallback = FALLBACK_IMAGE,
  priority = false,
  loading,
  decoding = 'async',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : loading || 'lazy'}
      decoding={decoding}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
      {...props}
    />
  );
};

export default SafeImage;
