import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Clears all application caches including:
 * - localStorage (cache_ prefixed items)
 * - sessionStorage
 * - Service Worker caches
 * - React Query cache
 */
export async function clearAllApplicationCache(reload: boolean = true): Promise<void> {
  try {
    // 1. Clear localStorage cache items
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ localStorage cache cleared');

    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    // 3. Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Service Worker caches cleared:', cacheNames);
    }

    // 4. Clear React Query cache (if available)
    // Note: This needs to be called from a component with access to queryClient
    // We'll handle this separately in the component

    toast({
      title: "Cache limpo com sucesso!",
      description: reload ? "A página será recarregada..." : "Todos os caches foram removidos.",
      duration: 2000,
    });

    // 5. Reload page to fetch fresh data
    if (reload) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    toast({
      title: "Erro ao limpar cache",
      description: "Ocorreu um erro ao tentar limpar o cache.",
      variant: "destructive",
      duration: 3000,
    });
    return Promise.reject(error);
  }
}

/**
 * Hook-based cache clearer that also clears React Query cache
 */
export function useCacheClearer() {
  const queryClient = useQueryClient();

  const clearCache = async () => {
    // Clear React Query cache first
    queryClient.clear();
    console.log('✅ React Query cache cleared');

    // Then clear all other caches
    await clearAllApplicationCache(true);
  };

  return { clearCache };
}
