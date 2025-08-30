import type { Metadata } from "next"
import ChangelogClient from "@/components/ChangelogClient"

export const metadata: Metadata = {
  title: "Changelog - Nexural Trading",
  description: "Track all updates, new features, improvements, and bug fixes to the Nexural Trading platform.",
  keywords: ["changelog", "updates", "new features", "release notes", "platform updates"],
}

export default function ChangelogPage() {
  return <ChangelogClient />
}


