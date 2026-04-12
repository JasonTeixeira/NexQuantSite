import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Package, Star, TrendingUp, Shield, Zap, Download, Filter } from "lucide-react"

export const metadata: Metadata = {
  title: "Bot Marketplace - Trading Strategies & Tools | Nexural",
  description: "Discover and deploy professional trading bots, strategies, and indicators from our curated marketplace.",
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Strategy Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                Bot Marketplace
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Browse, test, and deploy professional trading strategies built by top quants 
              and verified by our team.
            </p>
          </div>

          {/* Marketplace Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Strategies</p>
                  <p className="text-2xl font-bold text-white">3,847</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">15.2K</p>
                </div>
                <Download className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg ROI</p>
                  <p className="text-2xl font-bold text-green-400">+24.7%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Top Sellers</p>
                  <p className="text-2xl font-bold text-white">127</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              All Categories
            </Button>
            <Button variant="outline" size="sm">Scalping</Button>
            <Button variant="outline" size="sm">Swing Trading</Button>
            <Button variant="outline" size="sm">Arbitrage</Button>
            <Button variant="outline" size="sm">Market Making</Button>
            <Button variant="outline" size="sm">AI/ML</Button>
          </div>

          {/* Featured Strategies */}
          <h2 className="text-2xl font-bold mb-6">Featured Strategies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Best Seller</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Neural Scalper Pro</h3>
              <p className="text-gray-400 mb-4">High-frequency scalping bot with ML-based entry signals</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Return</p>
                  <p className="text-lg font-bold text-green-400">+12.4%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-lg font-bold">78%</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Deploy Bot - $299/mo
              </Button>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">AI Powered</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Trend Master AI</h3>
              <p className="text-gray-400 mb-4">Advanced trend-following strategy with neural networks</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Return</p>
                  <p className="text-lg font-bold text-green-400">+18.2%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-lg font-bold">65%</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Deploy Bot - $499/mo
              </Button>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">Low Risk</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">4.7</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Arbitrage Hunter</h3>
              <p className="text-gray-400 mb-4">Cross-exchange arbitrage bot with risk management</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Return</p>
                  <p className="text-lg font-bold text-green-400">+8.6%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-lg font-bold">92%</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Deploy Bot - $199/mo
              </Button>
            </Card>
          </div>

          {/* Seller Program */}
          <Card className="bg-gradient-to-r from-primary/10 to-orange-600/10 border-primary/30 p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-400/30">Earn Revenue</Badge>
                <h3 className="text-2xl font-bold mb-2">Become a Strategy Seller</h3>
                <p className="text-gray-400 mb-4">Share your profitable strategies and earn passive income</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><Shield className="w-4 h-4 mr-1" /> Verified strategies only</span>
                  <span className="flex items-center"><Zap className="w-4 h-4 mr-1" /> Up to 70% revenue share</span>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4 md:mt-0">
                Apply as Seller
              </Button>
            </div>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Find Your Perfect Trading Strategy</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Browse thousands of verified strategies, backtest performance, 
              and deploy with one click.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse All Strategies
              </Button>
              <Button size="lg" variant="outline">
                Free Trial Bots
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
