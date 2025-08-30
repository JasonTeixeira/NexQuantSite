import type { Metadata } from "next"
import EnhancedBlogDashboard from "@/components/admin/EnhancedBlogDashboard"

export const metadata: Metadata = {
  title: "Master Blog Control - Admin Dashboard | Nexural Trading",
  description: "Complete control over all blog posts and guest authors with revenue tracking and comprehensive management tools",
  keywords: "blog management, guest authors, revenue sharing, content moderation, admin control"
}

export default function AdminBlogPage() {
  return <EnhancedBlogDashboard />
}
