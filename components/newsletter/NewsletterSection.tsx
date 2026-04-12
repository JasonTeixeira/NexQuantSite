/**
 * 📧 Newsletter Section
 * A feature-rich newsletter signup component
 */

"use client";

import React from "react";

interface NewsletterSectionProps {
  variant?: "simple" | "feature-rich";
  source?: string;
  className?: string;
}

const NewsletterSection = ({
  variant = "simple",
  source = "default",
  className = "",
}: NewsletterSectionProps) => {
  // Placeholder form submission handler
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // This would normally submit to an API endpoint
    console.log("Newsletter signup submitted from source:", source);
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {variant === "feature-rich" ? (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur rounded-2xl p-8 md:p-12 border border-blue-800/50">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Stay Ahead of the Market
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  Join thousands of traders receiving our weekly insights, trading tips, and AI strategy updates.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-cyan-400 mt-1">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Weekly AI Signal Insights</h3>
                      <p className="mt-1 text-gray-400">Get exclusive signal summaries and market analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-cyan-400 mt-1">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Trading Strategy Deep Dives</h3>
                      <p className="mt-1 text-gray-400">Advanced strategies and optimization techniques</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-cyan-400 mt-1">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">Early Access & Discounts</h3>
                      <p className="mt-1 text-gray-400">Be first to try new features and receive special offers</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-900/70 backdrop-blur p-6 rounded-xl border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Join Our Trading Community</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Your email address"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="interests" className="block text-sm font-medium text-gray-300 mb-1">Interests</label>
                      <select
                        id="interests"
                        name="interests"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                      >
                        <option value="ai-signals">AI Trading Signals</option>
                        <option value="strategies">Trading Strategies</option>
                        <option value="automated">Automated Trading</option>
                        <option value="all">All Topics</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 border-gray-700 rounded text-cyan-600 focus:ring-cyan-500 bg-gray-800"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
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
                  
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Simple version
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Get Trading Insights Delivered
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join our newsletter for the latest AI trading strategies, market analysis, and platform updates.
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors"
              >
                Subscribe
              </button>
            </form>
            
            <p className="mt-4 text-sm text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
