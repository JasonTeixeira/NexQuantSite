import type { Metadata } from "next"
import SystemStatusClient from "@/components/SystemStatusClient"

export const metadata: Metadata = {
  title: "System Status - Nexural Trading",
  description: "Real-time system status, uptime monitoring, and incident reports for Nexural Trading platform.",
  keywords: ["system status", "uptime", "service health", "incidents", "monitoring"],
}

export default function SystemStatusPage() {
  return <SystemStatusClient />
}