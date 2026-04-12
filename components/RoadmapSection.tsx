/**
 * 🗺️ Roadmap Section
 * Displays the product roadmap and upcoming features
 */

import React from "react";

const RoadmapSection = () => {
  // Roadmap quarters with features
  const roadmapItems = [
    {
      quarter: "Q3 2025",
      status: "current",
      features: [
        "Advanced AI Signal Generation",
        "Multi-broker Integration",
        "Real-time Market Data",
        "Mobile App Release",
        "Performance Dashboard"
      ]
    },
    {
      quarter: "Q4 2025",
      status: "upcoming",
      features: [
        "Options Trading Support",
        "Custom Strategy Builder",
        "Risk Management Suite",
        "Portfolio Optimization",
        "Advanced Backtesting Engine"
      ]
    },
    {
      quarter: "Q1 2026",
      status: "planned",
      features: [
        "Multi-asset Portfolio Allocation",
        "Neural Network Customization",
        "Institutional API Access",
        "Enhanced Security Features",
        "Global Market Coverage"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Product Roadmap
          </h2>
          <p className="text-lg text-gray-300">
            Our commitment to continuous innovation and improvement
          </p>
        </div>

        <div className="relative">
          {/* Timeline connector */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 rounded-full hidden md:block" />

          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative">
                {/* Quarter indicator */}
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex justify-center">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${item.status === 'current' ? 'bg-cyan-600' : 
                      item.status === 'upcoming' ? 'bg-purple-600' : 'bg-pink-600'}
                  `}>
                    {item.quarter}
                  </div>
                </div>

                {/* Content card */}
                <div className={`
                  md:w-5/12 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6
                  ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}
                  relative md:mt-0 mt-8
                `}>
                  <h3 className={`
                    text-xl font-semibold mb-4
                    ${item.status === 'current' ? 'text-cyan-400' : 
                      item.status === 'upcoming' ? 'text-purple-400' : 'text-pink-400'}
                  `}>
                    {item.status === 'current' ? 'Current Focus' : 
                     item.status === 'upcoming' ? 'Coming Soon' : 'Future Plans'}
                  </h3>

                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-200">
                        <svg 
                          className={`
                            w-4 h-4 mr-2
                            ${item.status === 'current' ? 'text-cyan-500' : 
                              item.status === 'upcoming' ? 'text-purple-500' : 'text-pink-500'}
                          `}
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
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Have a feature suggestion? We'd love to hear from you!
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium rounded-md transition-all">
            Submit Feature Request
          </button>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
