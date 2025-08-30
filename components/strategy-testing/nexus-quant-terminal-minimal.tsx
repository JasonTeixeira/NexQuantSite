"use client"

import React from 'react'

export default function NexusQuantTerminalMinimal() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🧪 Nexus Quant Terminal</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/20">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Strategy Testing</h2>
            <p className="text-gray-300">Minimal version - Testing basic functionality</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-emerald-500/20">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">AI Analysis</h2>
            <p className="text-gray-300">AI-powered strategy analysis</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-green-400">✅ Minimal Terminal - Working!</p>
          <p className="text-sm text-gray-400 mt-2">If this loads, we can gradually add components</p>
        </div>
      </div>
    </div>
  )
}
