import type { Metadata } from "next"

// Disable prerendering for this page since it uses window object
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Referral Dashboard - Nexural Trading",
  description: "Track your referrals, earnings, and commission statistics.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ReferralDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Referral Dashboard</h1>
      <div className="bg-card p-6 rounded-lg">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Our referral dashboard is currently under maintenance and will be available soon.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm">
              <strong>What's coming:</strong> Track your referrals, earnings, commission statistics, and more!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


