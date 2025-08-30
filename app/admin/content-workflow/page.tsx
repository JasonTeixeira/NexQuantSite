import type { Metadata } from "next"
import ContentWorkflowClient from "@/components/admin/content-workflow-client"

export const metadata: Metadata = {
  title: "Content Workflow - Nexural Trading Admin Dashboard",
  description: "Content creation, review, and publication workflow management",
  robots: "noindex, nofollow",
}

export default function ContentWorkflowPage() {
  return <ContentWorkflowClient />
}
