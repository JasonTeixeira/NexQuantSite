/**
 * 📊 TRADING DASHBOARD PAGE
 * Page for displaying trading strategies and signals
 */

'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import StrategyDashboard from '@/components/trading/StrategyDashboard';

export default function TradingPage() {
  return (
    <SessionProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Trading Strategies</h1>
        <StrategyDashboard />
      </div>
    </SessionProvider>
  );
}
