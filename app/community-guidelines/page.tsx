import type { Metadata } from "next"
import CommunityGuidelinesClient from "@/components/CommunityGuidelinesClient"

export const metadata: Metadata = {
  title: "Community Guidelines - Nexural Trading",
  description: "Community guidelines and platform rules for Nexural Trading. Learn about acceptable behavior, content policies, and community standards.",
  keywords: ["community guidelines", "platform rules", "terms of use", "community standards", "trading community"],
}

export default function CommunityGuidelinesPage() {
  return <CommunityGuidelinesClient />
}


