import React, { useState, useEffect } from 'react';

export function SmartImage({ src, alt, className, fallbackUrl, maxRetries = 3, ...props }: any) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        const separator = src?.includes('?') ? '&' : '?';
        setCurrentSrc(`${src}${separator}retry=${retryCount + 1}`);
      }, 1000 * (retryCount + 1));
    } else if (!failed && fallbackUrl && currentSrc !== fallbackUrl) {
      setCurrentSrc(fallbackUrl);
      setFailed(true);
    } else {
      setFailed(true);
      setCurrentSrc('https://assets.tcgdex.net/univ/card/back/low.png');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${failed ? 'opacity-50 grayscale' : ''}`}
      onError={handleError}
      {...props}
    />
  );
}
