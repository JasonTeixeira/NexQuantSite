import type { Metadata } from "next"
import AdminAIAssistantClient from "@/components/admin/admin-ai-assistant-client"

export const metadata: Metadata = {
  title: "AI Assistant - Admin Dashboard",
  description: "Advanced AI-powered system management and optimization assistant",
  robots: "noindex, nofollow",
}

export default function AdminAIAssistantPage() {
  return <AdminAIAssistantClient />
}
