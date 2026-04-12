/**
 * 📊 Indicators Section
 * Showcases the various trading indicators available in the platform
 */

import React from "react";

const IndicatorsSection = () => {
  // Array of indicator types and examples
  const indicators = [
    {
      category: "Trend",
      examples: ["Moving Averages", "MACD", "Parabolic SAR", "ADX", "Ichimoku Cloud"]
    },
    {
      category: "Momentum",
      examples: ["RSI", "Stochastic", "CCI", "Williams %R", "Rate of Change"]
    },
    {
      category: "Volatility",
      examples: ["Bollinger Bands", "ATR", "Standard Deviation", "Keltner Channel"]
    },
    {
      category: "Volume",
      examples: ["OBV", "Money Flow Index", "Volume Profile", "Accumulation/Distribution"]
    },
    {
      category: "Advanced AI",
      examples: ["Neural Network Signals", "Machine Learning Pattern Recognition", "Sentiment Analysis", "Anomaly Detection"]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Advanced Technical Indicators
          </h2>
          <p className="text-lg text-gray-300">
            Our platform offers a comprehensive suite of technical indicators to 
            power your trading strategies, enhanced with proprietary AI models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {indicators.map((group, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
            >
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">{group.category} Indicators</h3>
              <ul className="space-y-2">
                {group.examples.map((indicator, idx) => (
                  <li key={idx} className="flex items-center text-gray-200">
                    <svg 
                      className="w-4 h-4 mr-2 text-cyan-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors">
            Explore All Indicators
          </button>
        </div>
      </div>
    </section>
  );
};

export default IndicatorsSection;
