import type { Metadata } from "next"
import ComprehensiveTestingAdmin from "@/components/admin/ComprehensiveTestingAdmin"

export const metadata: Metadata = {
  title: "Comprehensive Testing Suite - Admin Dashboard",
  description: "Complete testing infrastructure including unit, integration, functional, security, performance, chaos, and vulnerability testing",
}

export default function ComprehensiveTestingPage() {
  return <ComprehensiveTestingAdmin />
}


