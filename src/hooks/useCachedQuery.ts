import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// SIMPLIFIED: Use only React Query's native caching
// No localStorage, just aggressive staleTime/gcTime
const STALE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days
const GC_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days

export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [key],
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// For backwards compatibility - now just clears React Query cache
export function clearCache(key: string) {
  // No-op - React Query handles cache internally
  console.log(`Cache clear requested for: ${key}`);
}

export function clearAllCache() {
  // No-op - use useCacheClearer hook instead
  console.log('Use clearAllApplicationCache() from cacheUtils for full cache clear');
}