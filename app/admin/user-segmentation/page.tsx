import type { Metadata } from "next"
import UserSegmentationClient from "@/components/admin/user-segmentation-client"

export const metadata: Metadata = {
  title: "User Segmentation - Nexural Trading Admin",
  description: "Advanced user segmentation and targeting",
}

export default function UserSegmentationPage() {
  return <UserSegmentationClient />
}
