import { useEffect, useRef } from 'react';
import { clearAllApplicationCache, saveLastCacheClearTimestamp, LAST_CACHE_CLEAR_KEY } from '@/lib/cacheUtils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const ONE_HOUR = 60 * 60 * 1000; // 3600000ms

export function useAutoCacheClear() {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndScheduleClear = () => {
      const lastClearStr = localStorage.getItem(LAST_CACHE_CLEAR_KEY);
      const lastClear = lastClearStr ? parseInt(lastClearStr, 10) : 0;
      const now = Date.now();
      const elapsed = now - lastClear;

      // If no previous clear or more than 1 hour has passed
      if (!lastClearStr || elapsed >= ONE_HOUR) {
        // Execute clear immediately
        executeAutoClear();
      } else {
        // Schedule clear for remaining time
        const remaining = ONE_HOUR - elapsed;
        console.log(`⏰ Cache auto-clear scheduled in ${Math.round(remaining / 60000)} minutes`);
        
        timeoutRef.current = setTimeout(() => {
          executeAutoClear();
        }, remaining);
      }
    };

    const executeAutoClear = async () => {
      console.log('🔄 Executing automatic cache clear (1h)');
      
      // Show specific toast for automatic clear
      toast({
        title: "🔄 Atualizando cache automaticamente",
        description: "Limpeza programada após 1 hora de uso",
        duration: 2000,
      });

      try {
        // Clear React Query cache
        queryClient.clear();
        console.log('✅ React Query cache cleared (auto)');

        // Clear all other caches and reload
        await clearAllApplicationCache(true, true); // isAuto = true
      } catch (error) {
        console.error('❌ Error in auto cache clear:', error);
      }
    };

    // Initialize on mount
    checkAndScheduleClear();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [queryClient]);
}
