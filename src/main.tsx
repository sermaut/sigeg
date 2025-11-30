import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ULTRA-FAST: Register service worker async (non-blocking)
import('./pwa-register').catch(() => {});

// INSTANT: Render immediately without waiting for anything
const root = document.getElementById("root")!;
createRoot(root).render(<App />);
