import type { Metadata } from "next"
import MarketplaceManagement from "@/components/admin/marketplace-management"

export const metadata: Metadata = {
  title: "Marketplace Management - Admin Dashboard | Nexural Trading",
  description: "Complete marketplace management system with strategy approval, seller management, payout processing, dispute resolution, and fraud detection for the trading strategy marketplace.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminMarketplaceManagementPage() {
  return <MarketplaceManagement />
}
