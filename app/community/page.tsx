import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Users, MessageCircle, Trophy, Heart, GitBranch, Globe, Sparkles, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Trading Community - Connect & Learn | Nexural",
  description: "Join our global community of traders. Share strategies, discuss markets, and learn from experienced professionals.",
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Users className="w-4 h-4 mr-2" />
              Global Network
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Trading Community
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with thousands of traders worldwide. Share insights, discuss strategies, 
              and grow together in our vibrant trading community.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Members</p>
                  <p className="text-2xl font-bold text-white">48.2K</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Daily Discussions</p>
                  <p className="text-2xl font-bold text-white">2.3K</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Countries</p>
                  <p className="text-2xl font-bold text-white">92</p>
                </div>
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Stories</p>
                  <p className="text-2xl font-bold text-white">1.8K+</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
          </div>

          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <MessageCircle className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Discussion Forums</h3>
              <p className="text-gray-400 mb-4">Engage in deep discussions about markets, strategies, and technical analysis.</p>
              <Button variant="outline" className="w-full">Join Discussions</Button>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Trading Competitions</h3>
              <p className="text-gray-400 mb-4">Compete with traders globally and win prizes while improving your skills.</p>
              <Button variant="outline" className="w-full">View Leaderboard</Button>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
              <Heart className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Mentorship Program</h3>
              <p className="text-gray-400 mb-4">Learn from experienced traders or share your knowledge as a mentor.</p>
              <Button variant="outline" className="w-full">Find a Mentor</Button>
            </Card>
          </div>

          {/* Featured Community Event */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/30 p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <Badge className="mb-2 bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Live Event</Badge>
                <h3 className="text-2xl font-bold mb-2">Monthly Trading Championship</h3>
                <p className="text-gray-400 mb-4">Compete for $50,000 in prizes and recognition</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> 842 participants</span>
                  <span className="flex items-center"><Trophy className="w-4 h-4 mr-1" /> Ends in 5 days</span>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4 md:mt-0">
                <Sparkles className="w-5 h-5 mr-2" />
                Join Competition
              </Button>
            </div>
          </Card>

          {/* Discord Integration */}
          <Card className="bg-gray-900/50 border-gray-800 p-8 mb-12">
            <div className="text-center">
              <GitBranch className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Join Our Discord Server</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Real-time chat with traders, live market discussions, exclusive webinars, 
                and instant trading alerts.
              </p>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">12.4K</p>
                  <p className="text-gray-400 text-sm">Online Now</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">24/7</p>
                  <p className="text-gray-400 text-sm">Support</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-gray-400 text-sm">Channels</p>
                </div>
              </div>
              <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] mt-6">
                <GitBranch className="w-5 h-5 mr-2" />
                Join Discord Server
              </Button>
            </div>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect with traders worldwide, share your journey, and accelerate 
              your trading success with our supportive community.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
              <Button size="lg" variant="outline">
                Community Guidelines
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
