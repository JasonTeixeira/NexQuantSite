import type React from "react"
import type { ReactNode } from "react"

const HighlightBox = ({ children }: { children: ReactNode }) => (
  <div className="my-4 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
    <strong>{children}</strong>
  </div>
)

/**
 * Centralised FAQ data so it can be reused or updated
 * without touching the page component.
 */

export type QACategoryId = "all" | "risks" | "service" | "trading" | "education"

export interface QACategory {
  id: QACategoryId
  name: string
  count: number
}

export interface QAItem {
  category: QACategoryId
  question: string
  /** React node / JSX allowed for rich answers                           */
  answer: React.ReactNode
}

export const categories: QACategory[] = [
  { id: "all", name: "All Questions", count: 12 },
  { id: "risks", name: "Risks & Disclaimers", count: 4 },
  { id: "service", name: "Service & Pricing", count: 3 },
  { id: "trading", name: "Trading & Monitoring", count: 3 },
  { id: "education", name: "Education & Support", count: 2 },
]

/**
 * Only a subset shown for brevity; add the rest of your Q&A
 * following the same structure.
 */
export const qaData: QAItem[] = [
  {
    category: "risks",
    question: "Do you provide any guarantees on returns or profits?",
    answer: (
      <>
        <strong>No, we do not provide any guarantees whatsoever.</strong>
        <p className="mt-3">Here&rsquo;s what you need to understand:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Trading futures involves substantial risk of loss",
            "Past performance does not guarantee future results",
            "Market conditions can change rapidly and unpredictably",
            "No trading system or strategy can guarantee profits",
            "You may lose your entire investment or more",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "risks",
    question: "Can I lose all my money using your platform?",
    answer: (
      <>
        <strong>Yes, you can lose all your money and potentially more.</strong>
        <p className="mt-3">Futures trading carries the following risks:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Leverage can amplify both gains and losses",
            "Markets can gap against your position",
            "You may face margin calls requiring additional funds",
            "Technical failures or connectivity issues can impact trades",
            "Slippage and fees can erode profits",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">We strongly recommend:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Only trade with money you can afford to lose",
            "Start with small position sizes",
            "Use proper risk management techniques",
            "Never trade with borrowed money",
            "Maintain adequate account capitalization",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "risks",
    question: "Who is responsible for monitoring my trades?",
    answer: (
      <>
        <strong>You are 100% responsible for monitoring and managing your trades.</strong>
        <p className="mt-3">Our platform provides:</p>
        <ul className="list-none pl-6 space-y-2">
          {["Trading signals and indicators", "Educational resources", "Analysis tools"].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">However, you must:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Monitor your positions continuously",
            "Set and adjust stop losses",
            "Manage position sizes",
            "React to market changes",
            "Handle technical issues on your end",
            "Make all final trading decisions",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <HighlightBox>
          Important: We are not a managed account service. You maintain full control and responsibility for your trading
          account at all times.
        </HighlightBox>
      </>
    ),
  },
  {
    category: "risks",
    question: "What happens if your signals or indicators fail?",
    answer: (
      <>
        <strong>You bear all financial risk from trading decisions.</strong>
        <p className="mt-3">Understanding signal and indicator limitations:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "No indicator or signal is 100% accurate",
            "Market conditions can invalidate any strategy",
            "Technical failures can occur",
            "Signals are based on historical data and probabilities",
            "Unexpected events can cause significant losses",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">We are not liable for:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Trading losses from following signals",
            "Missed opportunities",
            "Technical glitches or delays",
            "Changes in market behavior",
            "Your interpretation of signals",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "service",
    question: "What exactly am I paying for with your service?",
    answer: (
      <>
        <strong>You are paying for access to trading tools and signals only.</strong>
        <p className="mt-3">Your subscription includes:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Access to proprietary trading indicators",
            "Real-time trading signals",
            "Technical analysis tools",
            "Platform access and updates",
            "Community access (Discord)",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">Your subscription does NOT include:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Guaranteed profits or returns",
            "Personal trading advice",
            "Managed account services",
            "Compensation for losses",
            "One-on-one mentoring",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <HighlightBox>
          Note: Educational content is provided free of charge. The subscription fee is solely for tool access and
          signal generation.
        </HighlightBox>
      </>
    ),
  },
  {
    category: "service",
    question: "Is the educational content free?",
    answer: (
      <>
        <strong>Yes, all educational content is completely free.</strong>
        <p className="mt-3">Free resources include:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Trading tutorials and guides",
            "Strategy explanations",
            "Risk management education",
            "Market analysis techniques",
            "Webinars and video content",
            "Blog posts and articles",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">We believe in:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Educating traders at no cost",
            "Building an informed community",
            "Transparency in trading education",
            "Helping traders make informed decisions",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">You only pay for premium features like advanced indicators and real-time signals.</p>
      </>
    ),
  },
  {
    category: "service",
    question: "Can I cancel my subscription at any time?",
    answer: (
      <>
        <strong>Yes, you can cancel your subscription at any time.</strong>
        <p className="mt-3">Cancellation policy:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Cancel anytime through your dashboard",
            "No cancellation fees",
            "Access continues until end of billing period",
            "No refunds for partial months",
            "You can resubscribe at any time",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">After cancellation:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Free educational content remains accessible",
            "Premium indicators and signals stop",
            "Historical data access may be limited",
            "Community access continues",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "trading",
    question: "Do I need to monitor my trades constantly?",
    answer: (
      <>
        <strong>Yes, active monitoring is essential for risk management.</strong>
        <p className="mt-3">Why constant monitoring matters:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Markets can move rapidly and unexpectedly",
            "News events can trigger violent price swings",
            "Technical issues may require immediate action",
            "Stop losses may need adjustment",
            "Profit targets might be reached quickly",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">Recommended monitoring practices:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Check positions at least every hour during market hours",
            "Set price alerts on your broker platform",
            "Use mobile apps for remote monitoring",
            "Have an exit plan before entering trades",
            "Know your maximum risk per trade",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <HighlightBox>
          Warning: Unmonitored positions can lead to catastrophic losses. If you cannot monitor actively, consider
          reducing position sizes or avoiding trading during those periods.
        </HighlightBox>
      </>
    ),
  },
  {
    category: "trading",
    question: "What happens during high volatility or market crashes?",
    answer: (
      <>
        <strong>Extreme market conditions can cause severe losses.</strong>
        <p className="mt-3">During high volatility:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Spreads widen significantly",
            "Slippage increases dramatically",
            "Stop losses may not execute at desired prices",
            "Margin requirements may increase",
            "Liquidity can disappear",
            "Platforms may experience outages",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">Our recommendations:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Reduce position sizes in volatile markets",
            "Widen stop losses to avoid premature exits",
            "Avoid trading major news events",
            "Keep extra margin in your account",
            "Have a backup plan for platform failures",
            "Consider staying flat during extreme conditions",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "trading",
    question: "How quickly do I need to act on trading signals?",
    answer: (
      <>
        <strong>Signal timing is critical and delays can impact performance.</strong>
        <p className="mt-3">Signal execution considerations:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Signals are time-sensitive",
            "Market conditions change rapidly",
            "Entry prices may no longer be available",
            "Risk/reward ratios can shift quickly",
            "Some signals have specific time windows",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">Best practices:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Act on signals within minutes when possible",
            "Use limit orders near signal prices",
            "Don&rsquo;t chase prices too far from signal levels",
            "Skip signals if you&rsquo;re late",
            "Have your platform ready before signals arrive",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    category: "education",
    question: "What level of trading knowledge do I need?",
    answer: (
      <>
        <strong>A solid foundation in trading basics is essential.</strong>
        <p className="mt-3">Minimum knowledge requirements:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Understanding of futures contracts",
            "Basic technical analysis",
            "Risk management principles",
            "Order types and execution",
            "Margin and leverage concepts",
            "Platform navigation skills",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">We provide free education on:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Quantitative trading basics",
            "Strategy implementation",
            "Risk management techniques",
            "Market analysis methods",
            "Platform tutorials",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <HighlightBox>
          Recommendation: Spend at least 1-2 months learning and paper trading before risking real capital. Knowledge is
          your best defense against losses.
        </HighlightBox>
      </>
    ),
  },
  {
    category: "education",
    question: "Do you provide personal mentoring or coaching?",
    answer: (
      <>
        <strong>No, we do not provide personal mentoring services.</strong>
        <p className="mt-3">What we offer:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Comprehensive educational materials",
            "Community support via Discord",
            "Group webinars and Q&A sessions",
            "Strategy documentation",
            "Video tutorials and guides",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">What we don&rsquo;t offer:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "One-on-one coaching",
            "Personal trade recommendations",
            "Account management",
            "Individual strategy development",
            "Private consultations",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">The community is a great resource for peer support and shared learning experiences.</p>
      </>
    ),
  },
  {
    category: "education",
    question: "What additional resources are available for learning?",
    answer: (
      <>
        <strong>We offer a variety of resources to enhance your learning experience.</strong>
        <p className="mt-3">Additional resources include:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Interactive trading simulations",
            "Practice trading accounts",
            "Detailed trading guides",
            "Expert interviews and podcasts",
            "Access to trading forums and discussions",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">These resources are designed to help you build your skills and confidence in trading.</p>
      </>
    ),
  },
  {
    category: "education",
    question: "How can I stay updated with the latest market trends?",
    answer: (
      <>
        <strong>Staying informed about market trends is crucial for successful trading.</strong>
        <p className="mt-3">You can stay updated by:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Subscribing to our newsletter",
            "Joining our Discord community",
            "Following our social media channels",
            "Participating in our webinars and live sessions",
            "Accessing our market analysis reports",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">These channels provide real-time insights and analysis from our team of experts.</p>
      </>
    ),
  },
  {
    category: "education",
    question: "Are there any specific courses or modules I should focus on?",
    answer: (
      <>
        <strong>We recommend focusing on our core courses to build a strong foundation.</strong>
        <p className="mt-3">Key courses include:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Futures Market Basics",
            "Technical Analysis Fundamentals",
            "Risk Management Strategies",
            "Advanced Trading Techniques",
            "Market Psychology and Trading",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">Completing these courses will equip you with the necessary skills to trade effectively.</p>
      </>
    ),
  },
  {
    category: "education",
    question: "How do I access the educational materials?",
    answer: (
      <>
        <strong>Educational materials are accessible through our website and Discord community.</strong>
        <p className="mt-3">To access the materials:</p>
        <ul className="list-none pl-6 space-y-2">
          {[
            "Visit our website&rsquo;s education section",
            "Join our Discord server for live discussions and Q&A",
            "Explore our blog for articles and guides",
            "Watch our video tutorials on YouTube",
            "Participate in our webinars for real-time insights",
          ].map((t) => (
            <li key={t} className="relative">
              <span className="absolute left-0 text-primary">▸</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3">These resources are available free of charge to all users.</p>
      </>
    ),
  },
]
