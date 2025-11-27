import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Key for storing last cache clear timestamp
export const LAST_CACHE_CLEAR_KEY = 'last_cache_clear';

/**
 * Save timestamp of last cache clear
 */
export function saveLastCacheClearTimestamp(): void {
  localStorage.setItem(LAST_CACHE_CLEAR_KEY, Date.now().toString());
}

/**
 * Clears all application caches including:
 * - localStorage (cache_ prefixed items, preserving last_cache_clear)
 * - sessionStorage
 * - Service Worker caches
 * - React Query cache
 */
export async function clearAllApplicationCache(reload: boolean = true, isAuto: boolean = false): Promise<void> {
  try {
    // Show starting toast (only for manual clears)
    if (!isAuto) {
      toast({
        title: "🔄 Iniciando limpeza...",
        description: "Removendo caches da aplicação",
        duration: 1500,
      });
    }

    // 1. Clear localStorage cache items (preserving last_cache_clear)
    const localStorageKeys = Object.keys(localStorage);
    const cacheKeysCleared = localStorageKeys.filter(key => 
      key.startsWith('cache_') && key !== LAST_CACHE_CLEAR_KEY
    );
    cacheKeysCleared.forEach(key => localStorage.removeItem(key));
    console.log('✅ localStorage cache cleared:', cacheKeysCleared.length, 'items');

    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    // 3. Clear Service Worker caches
    let swCachesCleared = 0;
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      swCachesCleared = cacheNames.length;
      console.log('✅ Service Worker caches cleared:', cacheNames);
    }

    // 4. Save new timestamp for auto-clear tracking
    saveLastCacheClearTimestamp();
    console.log('✅ Cache clear timestamp saved');

    // Show success toast with statistics
    toast({
      title: isAuto ? "🔄 Cache atualizado (1h)" : "✨ Cache limpo com sucesso!",
      description: `${cacheKeysCleared.length} itens removidos. ${reload ? 'Recarregando página...' : 'Cache atualizado.'}`,
      duration: 2000,
    });

    // 5. Reload page to fetch fresh data
    if (reload) {
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    toast({
      title: "❌ Erro ao limpar cache",
      description: "Ocorreu um erro. Tente novamente.",
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
  const [isClearing, setIsClearing] = useState(false);

  const clearCache = async () => {
    if (isClearing) return; // Prevent multiple simultaneous clears
    
    setIsClearing(true);
    
    try {
      // Clear React Query cache first
      queryClient.clear();
      console.log('✅ React Query cache cleared');

      // Then clear all other caches (manual clear, not auto)
      await clearAllApplicationCache(true, false);
    } catch (error) {
      console.error('Error clearing cache:', error);
      setIsClearing(false);
    }
    // Note: setIsClearing(false) not needed if page reloads
  };

  return { clearCache, isClearing };
}
