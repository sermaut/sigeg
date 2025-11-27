import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './pwa-register'

// Performance: Preload critical resources
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Prefetch common routes
    const routes = ['/groups', '/auth'];
    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
