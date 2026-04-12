import type { Metadata } from "next"
import CustomerSupportAdmin from "@/components/admin/CustomerSupportAdmin"

export const metadata: Metadata = {
  title: "Customer Support Management - Admin Dashboard | Nexural Trading",
  description: "Comprehensive customer support management, ticketing system, and live chat administration.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminCustomerSupportPage() {
  return <CustomerSupportAdmin />
}


