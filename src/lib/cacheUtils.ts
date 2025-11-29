import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Clear all application caches including:
 * - localStorage (cache_ prefixed items and sigeg items)
 * - sessionStorage
 * - Service Worker caches
 * - IndexedDB
 */
export async function clearAllApplicationCache(reload: boolean = true): Promise<void> {
  try {
    toast({
      title: "🔄 Limpando cache...",
      description: "Aguarde um momento",
      duration: 1500,
    });

    // 1. Clear localStorage (preserve sigeg_user)
    const userBackup = localStorage.getItem('sigeg_user');
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    keys.forEach(key => {
      if (key.startsWith('cache_') || (key.startsWith('sigeg') && key !== 'sigeg_user')) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    if (userBackup) {
      localStorage.setItem('sigeg_user', userBackup);
    }

    // 2. Clear sessionStorage
    sessionStorage.clear();

    // 3. Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 4. Clear IndexedDB
    if ('indexedDB' in window && indexedDB.databases) {
      const databases = await indexedDB.databases();
      databases.forEach(db => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    }

    toast({
      title: "✨ Cache limpo!",
      description: `${clearedCount} itens removidos`,
      duration: 2000,
    });

    if (reload) {
      setTimeout(() => window.location.reload(), 800);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    if (reload) window.location.reload();
  }
}

/**
 * Hook to clear all caches including React Query
 */
export function useCacheClearer() {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);

  const clearCache = useCallback(async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      queryClient.clear();
      await clearAllApplicationCache(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
      setIsClearing(false);
    }
  }, [queryClient, isClearing]);

  return { clearCache, isClearing };
}