import type { Metadata } from "next"
import SystemMonitorClient from "@/components/admin/system-monitor-client"

export const metadata: Metadata = {
  title: "System Monitor - Nexural Trading Admin",
  description: "Real-time system monitoring and health checks",
}

export default function SystemMonitorPage() {
  return <SystemMonitorClient />
}
