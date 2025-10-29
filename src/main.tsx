import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './services/seedData'

async function start() {
  // Ensure MSW runs in dev and preview builds so API calls return JSON
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    try {
      // Unregister any existing service workers first to avoid conflicts
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            // Unregister all service workers (MSW will register its own)
            await registration.unregister();
          }
          if (registrations.length > 0) {
            console.log('🔄 Unregistered old service workers');
            // Wait a moment for unregistration to complete
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (e) {
          console.warn('Could not unregister service workers:', e);
        }
      }

      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { 
          url: '/mockServiceWorker.js',
          options: {
            scope: '/',
          },
        },
      });
      
      // Wait a bit for service worker to be fully ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ MSW worker started successfully');
    } catch (e) {
      console.error('⚠️ MSW worker failed to start:', e);
      console.error('Make sure mockServiceWorker.js exists in the public folder');
      console.error('Try clearing your browser cache and hard refreshing (Ctrl+Shift+R or Cmd+Shift+R)');
      // If MSW is not available, continue anyway
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
