import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      // Check localStorage cache first
      const cached = localStorage.getItem(`cache_${key}`);
      
      if (cached) {
        try {
          const { data, timestamp }: CachedData<T> = JSON.parse(cached);
          
          // Return cached data if still fresh
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
          localStorage.removeItem(`cache_${key}`);
        }
      }

      // Fetch fresh data
      const data = await queryFn();
      
      // Save to cache
      try {
        localStorage.setItem(
          `cache_${key}`,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (e) {
        // Cache storage failed, continue without caching
        console.warn('Failed to cache data:', e);
      }

      return data;
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
    ...options,
  });
}

// Clear cache for a specific key
export function clearCache(key: string) {
  localStorage.removeItem(`cache_${key}`);
}

// Clear all cached queries
export function clearAllCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
}
