/**
 * 🔌 Integrations Section
 * Showcases the various integrations and platforms supported by Nexural Trading
 */

import React from "react";

const IntegrationsSection = () => {
  // Array of integrations by category
  const integrations = [
    {
      category: "Brokers",
      items: [
        { name: "Interactive Brokers", logo: "🏦" },
        { name: "TD Ameritrade", logo: "🏦" },
        { name: "Alpaca", logo: "🏦" },
        { name: "Tradovate", logo: "🏦" },
        { name: "NinjaTrader", logo: "🏦" }
      ]
    },
    {
      category: "Data Providers",
      items: [
        { name: "Polygon.io", logo: "📊" },
        { name: "Alpaca Market Data", logo: "📊" },
        { name: "IEX Cloud", logo: "📊" },
        { name: "Finnhub", logo: "📊" },
        { name: "Databento", logo: "📊" }
      ]
    },
    {
      category: "Platforms",
      items: [
        { name: "TradingView", logo: "📈" },
        { name: "MetaTrader", logo: "📈" },
        { name: "cTrader", logo: "📈" },
        { name: "Sierra Chart", logo: "📈" },
        { name: "DxFeed", logo: "📈" }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Seamless Integrations
          </h2>
          <p className="text-lg text-gray-300">
            Connect your favorite platforms, brokers, and data providers with our open architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {integrations.map((group, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <h3 className="text-xl font-semibold mb-6 text-purple-400 text-center">
                {group.category}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {group.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl mb-2">{item.logo}</span>
                    <span className="text-sm text-gray-200 text-center">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Don't see your preferred integration? Let us know and we'll add it to our roadmap.
          </p>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors">
            Request Integration
          </button>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
