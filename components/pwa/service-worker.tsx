/**
 * 🚀 PWA SERVICE WORKER
 * Component to register the service worker for PWA functionality
 */

'use client';

import { useEffect } from 'react';

export default function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
      // Register service worker
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
          });
          
          // Successfully registered
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found!');
            
            // New service worker is installing
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show notification to refresh
                console.log('New version available! Refresh to update.');
                // You could show a notification here
              }
            });
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };
      
      // Wait until the page load completes to register
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    } else if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Service Worker requires HTTPS');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
