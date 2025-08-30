import type { Metadata } from "next"
import SystemDiagnosticsClient from "@/components/admin/system-diagnostics-client"

export const metadata: Metadata = {
  title: "System Diagnostics - Nexural Trading Admin",
  description: "Advanced system diagnostics and monitoring",
}

export default function SystemDiagnosticsPage() {
  return <SystemDiagnosticsClient />
}
