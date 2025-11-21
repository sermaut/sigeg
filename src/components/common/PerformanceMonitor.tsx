import { useEffect } from 'react';
import { useWebVitals, usePerformanceObserver } from '@/hooks/useWebVitals';

export function PerformanceMonitor() {
  // PHASE 8: Monitor Web Vitals
  useWebVitals({
    debug: import.meta.env.DEV,
    onMetric: (metric) => {
      // Log performance metrics in production
      if (!import.meta.env.DEV) {
        // Send to analytics service if configured
        console.log(`[Prod Metric] ${metric.name}: ${metric.value}`);
      }
    },
  });

  usePerformanceObserver();

  // Detect slow connection and log warning
  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
        console.warn('[Performance] Slow connection detected:', conn.effectiveType);
      }
    }
  }, []);

  return null;
}
