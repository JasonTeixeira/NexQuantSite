import type { Metadata } from "next"
import EnhancedUserSegmentation from "@/components/admin/enhanced-user-segmentation"

export const metadata: Metadata = {
  title: "Enhanced User Segmentation - NEXURAL Admin",
  description: "AI-powered user segmentation with advanced analytics and automation",
  robots: "noindex, nofollow",
}

export default function EnhancedSegmentationPage() {
  return <EnhancedUserSegmentation />
}
