import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface VitalsConfig {
  onMetric?: (metric: Metric) => void;
  debug?: boolean;
}

export function useWebVitals({ onMetric, debug = false }: VitalsConfig = {}) {
  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      if (debug) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
        });
      }

      // Send to analytics or custom handler
      onMetric?.(metric);
    };

    // Register all Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric); // FID was replaced by INP in web-vitals v3
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, [onMetric, debug]);
}

// Performance observer for custom metrics
export function usePerformanceObserver() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

      return () => observer.disconnect();
    }
  }, []);
}
