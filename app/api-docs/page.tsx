import type { Metadata } from "next"
import ApiDocumentationClient from "@/components/ApiDocumentationClient"

export const metadata: Metadata = {
  title: "API Documentation - Nexural Trading",
  description: "Complete API documentation for Nexural Trading platform. Access trading signals, backtesting, and portfolio management programmatically.",
  keywords: ["API", "documentation", "trading", "REST API", "webhooks", "algorithmic trading"],
}

export default function ApiDocumentationPage() {
  return <ApiDocumentationClient />
}


