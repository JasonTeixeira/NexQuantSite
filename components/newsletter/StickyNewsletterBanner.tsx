/**
 * 📌 Sticky Newsletter Banner
 * A banner that sticks to the bottom or top of the screen to capture newsletter signups
 */

"use client";

import React, { useState, useEffect } from "react";

interface StickyNewsletterBannerProps {
  position?: "top" | "bottom";
  source?: string;
  enabled?: boolean;
  delay?: number;
}

const StickyNewsletterBanner = ({
  position = "bottom",
  source = "default",
  enabled = true,
  delay = 3000
}: StickyNewsletterBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");

  // Show the banner after a delay
  useEffect(() => {
    if (!enabled || isDismissed) return;
    
    // Check if user has already seen the banner in this session
    const hasSeenBanner = sessionStorage.getItem("hasSeenNewsletterBanner");
    if (hasSeenBanner) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, enabled, isDismissed]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Newsletter signup from sticky banner (${source}):`, email);
    
    // In a real implementation, you'd submit to an API here
    
    // Hide banner and store in session storage
    setIsDismissed(true);
    sessionStorage.setItem("hasSeenNewsletterBanner", "true");
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem("hasSeenNewsletterBanner", "true");
  };
  
  if (!isVisible || isDismissed || !enabled) {
    return null;
  }

  return (
    <div 
      className={`
        fixed inset-x-0 ${position === "top" ? "top-0" : "bottom-0"} z-50 
        pointer-events-none transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-y-0" : position === "top" ? "-translate-y-full" : "translate-y-full"}
      `}
    >
      <div className="max-w-screen-xl mx-auto px-4 pointer-events-auto">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg rounded-t-lg p-4 border border-blue-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex items-center">
              <div className="hidden md:block text-cyan-300 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Get Weekly Trading Insights</h3>
                <p className="text-blue-200 text-sm hidden md:block">Join 10,000+ traders receiving our AI analysis</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 bg-blue-800 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto whitespace-nowrap px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-md transition-colors"
              >
                Subscribe
              </button>
            </form>
            
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-blue-300 hover:text-white"
              aria-label="Close banner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyNewsletterBanner;
