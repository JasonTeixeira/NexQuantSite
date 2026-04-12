/**
 * 🚪 Exit Intent Capture
 * A modal that appears when a user is about to leave the page
 */

"use client";

import React, { useState, useEffect } from "react";

interface ExitIntentCaptureProps {
  source?: string;
  enabled?: boolean;
  delay?: number;
}

const ExitIntentCapture = ({
  source = "default",
  enabled = true,
  delay = 0
}: ExitIntentCaptureProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!enabled || isDismissed) return;
    
    // Check if user has already seen the modal in this session
    const hasSeenModal = sessionStorage.getItem("hasSeenExitIntentModal");
    if (hasSeenModal) return;
    
    // Add a delay before tracking exit intent
    const delayTimer = setTimeout(() => {
      // Track mouse movement to detect exit intent
      const handleMouseLeave = (e: MouseEvent) => {
        // Exit intent is triggered when mouse leaves through the top of the page
        if (e.clientY <= 0) {
          setIsVisible(true);
          document.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
      
      document.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, delay);
    
    return () => clearTimeout(delayTimer);
  }, [delay, enabled, isDismissed]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Newsletter signup from exit intent modal (${source}):`, email);
    
    // In a real implementation, you'd submit to an API here
    
    // Hide modal and store in session storage
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem("hasSeenExitIntentModal", "true");
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem("hasSeenExitIntentModal", "true");
  };
  
  if (!isVisible || isDismissed || !enabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-xl border border-blue-800 overflow-hidden">
        <div className="p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Wait, Don't Miss Out!</h2>
            <p className="text-blue-200 mt-2">
              Get exclusive AI trading signals and market insights delivered straight to your inbox.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="exit-intent-email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                id="exit-intent-email"
                type="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="exit-intent-terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 border-gray-700 rounded text-cyan-600 focus:ring-cyan-500 bg-gray-800"
                required
              />
              <label htmlFor="exit-intent-terms" className="ml-2 block text-sm text-gray-400">
                I agree to receive trading insights and newsletter emails
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-md transition-all"
            >
              Subscribe Now
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentCapture;
