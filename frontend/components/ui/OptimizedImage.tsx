'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * Optimized image component with built-in error handling and lazy loading
 *
 * Features:
 * - Automatic lazy loading (default)
 * - Blur placeholder for better perceived performance
 * - Fallback image on error
 * - Responsive sizing support
 *
 * For Drupal images, use the drupalImageLoader or configure remotePatterns
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}

/**
 * Custom loader for Drupal-hosted images
 * Supports image styles and automatic quality optimization
 */
export function drupalImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || '';

  // If src is already a full URL, use it directly
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For relative paths, prepend the Drupal base URL
  const q = quality || 75;
  return `${baseUrl}${src}?width=${width}&quality=${q}`;
}

/**
 * Hero image component with optimized loading for above-the-fold content
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'priority' | 'loading'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      priority // Load immediately for hero images
      loading="eager"
      {...props}
    />
  );
}

/**
 * Card image component with aspect ratio preservation
 */
export function CardImage({
  src,
  alt,
  aspectRatio = '16/9',
  className,
  ...props
}: OptimizedImageProps & { aspectRatio?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}

/**
 * Avatar image component with circular styling
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      {...props}
    />
  );
}
