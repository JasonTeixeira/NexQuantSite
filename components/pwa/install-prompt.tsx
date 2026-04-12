/**
 * 📱 PWA INSTALL PROMPT
 * Component to prompt users to install the PWA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if already installed as PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isInStandaloneMode);
      
      // Check if user previously dismissed the prompt
      const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (promptDismissed) {
        const dismissedDate = new Date(promptDismissed);
        const now = new Date();
        // Show again after 30 days
        if ((now.getTime() - dismissedDate.getTime()) < 30 * 24 * 60 * 60 * 1000) {
          setDismissed(true);
        }
      }
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the prompt after a delay
      setTimeout(() => {
        if (!dismissed && !isStandalone) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissed, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700 max-w-sm animate-slideUp">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">Install Nexural Trading</h3>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-300 mb-3">
        Install our app for a better experience with faster load times and offline access.
      </p>
      <div className="flex space-x-2">
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="text-sm flex-1"
        >
          Not now
        </Button>
        <Button
          onClick={handleInstall}
          className="text-sm flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
        >
          <Download size={16} className="mr-1" />
          Install
        </Button>
      </div>
    </div>
  );
}
