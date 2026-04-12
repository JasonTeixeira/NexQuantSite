import type { Metadata } from "next"
import MemberDirectoryClient from "@/components/community/MemberDirectoryClient"

export const metadata: Metadata = {
  title: "Member Directory - Nexural Trading",
  description: "Discover and connect with traders, share strategies, and learn from the Nexural Trading community.",
  keywords: ["trader directory", "trading community", "social trading", "member profiles", "trader network"],
}

export default function MemberDirectoryPage() {
  return <MemberDirectoryClient />
}


