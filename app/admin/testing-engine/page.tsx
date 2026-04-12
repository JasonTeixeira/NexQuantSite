import { Metadata } from "next"
import ComprehensiveTestingManager from "@/components/admin/comprehensive-testing-manager"

export const metadata: Metadata = {
  title: "Testing Engine - Nexural Trading Admin Dashboard",
  description: "Comprehensive testing and monitoring system for site reliability and performance",
}

export default function TestingEnginePage() {
  return <ComprehensiveTestingManager />
}
