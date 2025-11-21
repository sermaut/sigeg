import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP and fallback URLs
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'original') => {
    if (!originalSrc) return '';
    
    // If it's a Supabase Storage URL, keep as is
    if (originalSrc.includes('supabase')) return originalSrc;
    
    // For local assets
    const ext = originalSrc.split('.').pop();
    if (format === 'webp' && ext !== 'svg') {
      return originalSrc.replace(`.${ext}`, '.webp');
    }
    return originalSrc;
  };

  const webpSrc = getOptimizedSrc(src, 'webp');
  const fallbackSrc = src;

  return (
    <picture className={cn('relative', className)}>
      {/* WebP source */}
      {webpSrc !== fallbackSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      
      {/* Fallback image */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'hidden',
          className
        )}
        {...props}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </picture>
  );
};

